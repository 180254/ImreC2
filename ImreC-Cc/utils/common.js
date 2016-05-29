'use strict';

var fs = require('fs');
var crypto = require('crypto');

// credits radamus @ github
// https://github.com/amgnet-weeia/awslab4
// license: unknown
var readJson = function (fileName) {
    if (!fs.existsSync(fileName)) {
        throw new Error('unable to open file: ' + fileName);
    }

    var data = fs.readFileSync(fileName, { encoding: 'utf8' });
    return JSON.parse(data);
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/a/2117523
// license: https://creativecommons.org/licenses/by-sa/3.0/
var uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/a/27747377
// license: https://creativecommons.org/licenses/by-sa/3.0/
var random2 = function (bytes) {
    return crypto.randomBytes(bytes).toString('hex');
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/a/728694
// license: https://creativecommons.org/licenses/by-sa/3.0/
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
// http://stackoverflow.com/a/10185427
// license: https://creativecommons.org/licenses/by-sa/3.0/
var fullUrl = function (req) {
    if (!req) return null;
    return req.protocol + '://' + req.get('host') + req.originalUrl;
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/a/10185427
// license: https://creativecommons.org/licenses/by-sa/3.0/
var domainUrl = function (req) {
    if (!req) return null;
    return req.protocol + '://' + req.get('host')
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/a/10073788
// license: https://creativecommons.org/licenses/by-sa/3.0/
var pad = function (n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/a/7033662
// license: https://creativecommons.org/licenses/by-sa/3.0/
var chunkString = function (str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
};

exports.readJson = readJson;
exports.uuid = uuid;
exports.random2 = random2;
exports.clone = clone;
exports.fullUrl = fullUrl;
exports.domainUrl = domainUrl;
exports.pad = pad;
exports.chunkString = chunkString;

