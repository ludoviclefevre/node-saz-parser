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
            assert.strictEqual(reqHeaders.Accept, 'application/json');
            assert.strictEqual(reqHeaders.Pragma, 'no-cache');
            assert.strictEqual(request.content, '{"request":"test"}');

            // Response
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
