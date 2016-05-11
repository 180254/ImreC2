'use strict';

var tryEC2MetaFirst = false;

var CONFIG_FILE = 'config.json';
var CONF_FILE = 'conf.json';

var common = require('./common');
var AWS = require('aws-sdk');
var s3Client = null;
var sdbClient = null;
var confHandler = null;


// *********************************************************************************************

var configFromEC2Meta = function (callback) {
    var EC2MCred = new AWS.EC2MetadataCredentials();

    EC2MCred.refresh(function (err) {
        if (err) {
            console.log('Unable to get credentials from ec2 metadata. '
                + CONFIG_FILE + ' will be used.');
            configFromJson(callback);
        }
        else callback(err);
    })
};

// *********************************************************************************************

var configFromJson = function (callback) {
    AWS.config.loadFromPath(CONFIG_FILE);
    callback();
};

// *********************************************************************************************

var initAws = function (callback) {
    var callbackInternal = function () {
        confHandler = common.readJson(CONF_FILE);

        s3Client = new AWS.S3();
        sdbClient = new AWS.SimpleDB();
        callback();
    };

    var configFunction = tryEC2MetaFirst
        ? configFromEC2Meta
        : configFromJson;

    configFunction(callbackInternal);
};

// *********************************************************************************************

var s3 = function () {
    return s3Client;
};

var sdb = function () {
    return sdbClient;
};

var conf = function () {
    return confHandler;
};

var cred = function () {
    return AWS.config.credentials;
};

// *********************************************************************************************

exports.initAws = initAws;
exports.s3 = s3;
exports.sdb = sdb;
exports.conf = conf;
exports.cred = cred;

