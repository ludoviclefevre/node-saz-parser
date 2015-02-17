'use strict';

var unzip = require('unzip'),
    fs = require('fs'),
    _ = require('lodash'),
    filenameRegexPattern = /^raw\/([0-9]+)_([cs])\.txt$/,
    lineBreak = '\r\n';

function parser(filePath, callback) {
    var sessions = {};

    function parseFile(entry) {
        var fileName = entry.path,
            matches = filenameRegexPattern.exec(fileName),
            sessionId = '',
            type = '',
            responseString = '';

        if (!matches || matches.length !== 3) {
            entry.autodrain();
            return;
        }

        sessionId = matches[1];
        type = matches[2];
        responseString = '';

        entry.on('data', function (chunk) {
            responseString += chunk.toString('utf8');
        })
            .on('end', function () {
                parseContent(sessionId, type, responseString);
                entry.autodrain();
            });
    }

    fs.createReadStream(filePath)
        .pipe(unzip.Parse())
        .on('entry', parseFile)
        .on('error', callback)
        .on('close', function () {
            callback(null, sessions);
        });

    function parseContent(sessionId, type, responseString) {
        var splittedResponse = responseString.split(lineBreak + lineBreak),
            splittedHeaders = splittedResponse[0].split(lineBreak),
            headersWithoutStatus = _.rest(splittedHeaders),
            headersArray = headersWithoutStatus.map(headerSplit),
            headers = _.zipObject(headersArray),
            body = splittedResponse[1];

        if (!(sessionId in sessions)) {
            sessions[sessionId] = {
                "request": {},
                "response": {}
            };
        }

        if (type === 'c') {
            sessions[sessionId].request.headers = headers;
            sessions[sessionId].request.content = body;
        } else if (type === 's') {
            sessions[sessionId].response.headers = headers;
            sessions[sessionId].response.content = body;
        }
    }

    function headerSplit(header) {
        return header.split(': ');
    }
}

module.exports = parser;
