'use strict';

/**
 * base credits radamus @ github
 * https://github.com/amgnet-weeia/awslab4
 */

var crypto = require('crypto');

// encode(obj, 'base64')
var encode = function (obj, encoding) {
    var stringifyObj = JSON.stringify(obj);
    return new Buffer(stringifyObj).toString(encoding);
};

// hmac('sha1', key, text, 'base64');
var hmac = function (algorithm, key, text, encoding) {
    var hmac = crypto.createHmac(algorithm, key);
    return hmac.update(new Buffer(text)).digest(encoding);
};

exports.encode = encode;
exports.hmac = hmac;