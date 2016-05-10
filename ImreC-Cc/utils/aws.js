'use strict';

var CONFIG_FILE = 'config.json';
var confHandler = null;

var AWS = require('aws-sdk');
var s3Client = null;
var sdbClient = null;

var common = require('./common');


var initAws = function (callback) {
    confHandler = common.readJson('conf.json');
    var EC2MCred = new AWS.EC2MetadataCredentials();

    EC2MCred.refresh(function (err) {
        if (err) {
            console.log('Unable to find credentials in instance metadata.');
            AWS.config.loadFromPath(CONFIG_FILE);
        }

        s3Client = new AWS.S3();
        sdbClient = new AWS.SimpleDB();

        callback();
    });
};

var s3 = function () {
    return s3Client;
};

var sdb = function () {
    return sdbClient;
};

var conf = function () {
    return confHandler;
};

exports.initAws = initAws;
exports.s3 = s3;
exports.sdb = sdb;
exports.conf = conf;

