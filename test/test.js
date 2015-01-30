/*global describe, it */
'use strict';
var assert = require('assert');
var sazParser = require('../');

describe('SAZ Parser', function () {
    it('must parse a one session .saz file', function (done) {
        sazParser('./test/simple.saz', function (err, parsed) {
            var session = parsed['1'];

            // Request
            var request = session.request;
            var reqHeaders = request.headers;
            assert.strictEqual(reqHeaders['Accept'], 'application/json');
            assert.strictEqual(reqHeaders['Pragma'], 'no-cache');
            assert.strictEqual(request.content, '{"request":"test"}');

            // Response
            var response = session.response;
            var respHeaders = response.headers;
            assert.strictEqual(respHeaders['Cache-Control'], 'no-cache');
            assert.strictEqual(respHeaders['Transfer-Encoding'], 'chunked');
            assert.strictEqual(respHeaders['Content-Type'], 'application/xml; charset=utf-8');
            assert.strictEqual(respHeaders['Date'], 'Tue, 10 Jan 2015 10:10:10 GMT');

            assert.strictEqual(response.content, '{"result":"ok"}');
            done();
        });
    });

    it('must return an error when trying to parse a bad .saz file', function (done) {
        sazParser('./test/notASazFile.saz', function (err, parsed) {
            console.log(err);
            assert.ok(err);
            done();
        });
    });
});
