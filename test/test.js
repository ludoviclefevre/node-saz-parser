/*global describe, it */
'use strict';
var assert = require('assert'),
    sazParser = require('../'),
    _ = require('lodash');

describe('SAZ Parser', function () {
    it('must parse a one session .saz file', function (done) {
        sazParser('./test/simple.saz', function (err, parsed) {
            var session = parsed['1'],
                request = session.request,
                reqHeaders = request.headers,
                response = session.response,
                respHeaders = response.headers;

            // Request

            // Url data
            assert.strictEqual(request.url, 'http://localhost:9000/test');
            assert.strictEqual(request.type, 'GET');
            assert.strictEqual(request.protocol, 'HTTP/1.1');

            assert.strictEqual(reqHeaders.Accept, 'application/json');
            assert.strictEqual(reqHeaders.Pragma, 'no-cache');
            assert.strictEqual(request.content, '{"request":"test"}');

            // Response

            // Url data
            assert.strictEqual(response.status, 'OK');
            assert.strictEqual(response.statusCode, '200');
            assert.strictEqual(response.protocol, 'HTTP/1.1');

            assert.strictEqual(respHeaders['Cache-Control'], 'no-cache');
            assert.strictEqual(respHeaders['Transfer-Encoding'], 'chunked');
            assert.strictEqual(respHeaders['Content-Type'], 'application/xml; charset=utf-8');
            assert.strictEqual(respHeaders.Date, 'Tue, 10 Jan 2015 10:10:10 GMT');

            assert.strictEqual(response.content, '{"result":"ok"}');
            done();
        });
    });

    it('must return an error when trying to parse a bad .saz file', function (done) {
        sazParser('./test/notASazFile.saz', function (err) {
            assert.ok(err);
            done();
        });
    });

    it('must return an error when trying to parse an inexistent file', function (done) {
        sazParser('./test/doesNotExistFile.saz', function (err) {
            assert.ok(err);
            done();
        });
    });

    it('must parse a multi-sessions .saz file', function (done) {
        sazParser('./test/multipleSessions.saz', function (err, sessions) {
            _.forEach(sessions, function (session, sessionId) {
                var request = session.request,
                    reqHeaders = request.headers,
                    response = session.response,
                    respHeaders = response.headers;

                // Request
                assert.strictEqual(reqHeaders.CUSTOM_REQUEST_HEADER, sessionId);
                assert.strictEqual(request.content, '{"request":"Request ' + sessionId + '"}');

                // Response
                assert.strictEqual(respHeaders.CUSTOM_RESPONSE_HEADER, sessionId);
                assert.strictEqual(response.content, '{"result":"Response ' + sessionId + '"}');
            });
            done();
        });
    });
});
