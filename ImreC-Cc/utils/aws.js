'use strict';

var tryEC2MetaFirst = true;

var CONFIG_FILE = 'config.json';
var CONF_FILE = 'conf.json';

var Client = require('node-rest-client').Client;

var common = require('./common');
var AWS = require('aws-sdk');
var s3Client = null;
var sdbClient = null;
var sqsClient = null;
var confHandler = null;

// *********************************************************************************************

var configFromJson = function (callback) {
    AWS.config.loadFromPath(CONFIG_FILE);
    callback();
};

var configFromJson2 = function (callback) {
    console.log('Unable to get credentials from ec2 metadata. '
        + CONFIG_FILE + ' will be used.');
    configFromJson(callback);
};

// *********************************************************************************************

var getRegionFromEC2 = function (callback) {
    var client = new Client();
    client.get('http://169.254.169.254/latest/meta-data/placement/availability-zone',
        function (data) {
            var region1 = data.toString().slice(0, -1);
            AWS.config.update({ region: region1 });
            callback();
        })
        .on('error', function () {
            configFromJson2(callback);
        });
};

// *********************************************************************************************

var configFromEC2Meta = function (callback) {
    AWS.config.credentials = new AWS.EC2MetadataCredentials();

    AWS.config.credentials.refresh(function (err) {
        if (err) configFromJson2(callback);
        else getRegionFromEC2(callback);
    })
};


// *********************************************************************************************

var initAws = function (callback) {
    var callbackInternal = function () {
        confHandler = common.readJson(CONF_FILE);

        s3Client = new AWS.S3();
        sdbClient = new AWS.SimpleDB();
        sqsClient = new AWS.SQS();

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

var sqs = function () {
    return sqsClient;
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
exports.sqs = sqs;
exports.conf = conf;
exports.cred = cred;
