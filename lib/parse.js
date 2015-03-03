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

    function parseContent(sessionId, type, responseString) {
        var splittedResponse = responseString.split(lineBreak + lineBreak),
            splittedHeaders = splittedResponse[0].split(lineBreak),
            urlData,
            headersWithoutStatus = _.rest(splittedHeaders),
            headersArray = headersWithoutStatus.map(headerSplit),
            headers = _.zipObject(headersArray),
            body = splittedResponse[1],
            session;

        if (!(sessionId in sessions)) {
            sessions[sessionId] = {
                "request": {},
                "response": {}
            };
        }

        session = sessions[sessionId];
        if (type === 'c') {
            urlData = parseRequestUrlData(_.first(splittedHeaders));
            _.merge(session.request, urlData);
            session.request.headers = headers;
            session.request.content = body;
        } else if (type === 's') {
            urlData = parseResponseUrlData(_.first(splittedHeaders));
            _.merge(session.response, urlData);
            session.response.headers = headers;
            session.response.content = body;
        }
    }

    function headerSplit(header) {
        return header.split(': ');
    }

    function parseRequestUrlData(urlData) {
        var arr = urlData.split(' ');
        return {
            method: arr[0],
            url: arr[1],
            protocol: arr[2]
        };
    }

    function parseResponseUrlData(urlData) {
        var arr = urlData.split(' ');
        return {
            protocol: arr[0],
            statusCode: arr[1],
            status: arr[2]
        };
    }

    fs.stat(filePath, function (err) {
        if (err) {
            return callback(err);
        }

        fs.createReadStream(filePath)
            .pipe(unzip.Parse())
            .on('error', callback)
            .on('entry', parseFile)
            .on('close', function () {
                callback(null, sessions);
            });
    });
}

module.exports = parser;
