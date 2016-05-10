'use strict';

var fs = require('fs');
var crypto = require('crypto');
var url = require('url');

// credits radamus @ github
// https://github.com/amgnet-weeia/awslab4
var readJson = function (fileName) {
    if (!fs.existsSync(fileName)) {
        throw new Error('unable to open file: ' + fileName);
    }

    var data = fs.readFileSync(fileName, { encoding: 'utf8' });
    return JSON.parse(data);
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/posts/2117523/revisions
var uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
var random2 = function (bytes) {
    return crypto.randomBytes(bytes).toString('hex');
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
var clone = function (obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null === obj || 'object' !== typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
var fullUrl = function (req) {
    if (!req) return null;
    return url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    });
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
var pad = function (n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

exports.readJson = readJson;
exports.uuid = uuid;
exports.random2 = random2;
exports.clone = clone;
exports.fullUrl = fullUrl;
exports.pad = pad;

