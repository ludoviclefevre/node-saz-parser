'use strict';

var unzip = require('unzip');
var fs = require('fs');
var _ = require('lodash');

module.exports = parser;

var filenameRegexPattern = /^raw\/([0-9]+)_([cs])\.txt$/;
var lineBreak = '\r\n';

function parser(filePath, callback) {
    var sessions = {};

    fs.createReadStream(filePath)
        .pipe(unzip.Parse())
        .on('entry', parseFile)
        .on('error', callback)
        .on('close', function () {
            callback(null, sessions);
        });

    function parseFile(entry) {
        var fileName = entry.path;

        var matches = filenameRegexPattern.exec(fileName);
        if (!matches || matches.length !== 3) {
            entry.autodrain();
            return;
        }

        var sessionId = matches[1];
        var type = matches[2];

        var responseString = '';
        entry.on('data', function (chunk) {
            responseString += chunk.toString('utf8');
        })
            .on('end', function () {
                parseContent(sessionId, type, responseString);
                entry.autodrain();
            });
    }

    function parseContent(sessionId, type, responseString) {
        var splittedResponse = responseString.split(lineBreak + lineBreak);
        var splittedHeaders = splittedResponse[0].split(lineBreak);
        var headersWithoutStatus = _.rest(splittedHeaders);
        var headersArray = headersWithoutStatus.map(headerSplit);
        var headers = _.zipObject(headersArray);
        var body = splittedResponse[1];

        if (!(sessionId in sessions)) {
            sessions[sessionId] = {
                "request": {},
                "response": {}
            }
        }

        if (type === 'c') {
            sessions[sessionId].request.headers = headers;
            sessions[sessionId].request.content = body;
        }
        else if (type === 's') {
            sessions[sessionId].response.headers = headers;
            sessions[sessionId].response.content = body;
        }
    }

    function headerSplit(header) {
        return header.split(': ');
    }
}
