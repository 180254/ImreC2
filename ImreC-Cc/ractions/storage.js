'use strict';

var STORAGE_ID_LEN = 8;
var INFO_JSON = '__info.json';

var Promise = require('promise');

var aws = require('../utils/aws');
var common = require('../utils/common');
var logger = require('../utils/logger');

var getComm = function (storage, callback) {
    var params = {
        Bucket: aws.conf().S3.Name,
        Key: storage + '/' + INFO_JSON
    };

    aws.s3().getObject(params, function (err, data) {
        if (err) callback(err.stack, null);
        else callback(null, JSON.parse(data.Body.toString()));
    });
};

var newStorage = function (comm, callback) {
    var storageId = common.random2(STORAGE_ID_LEN);

    var params = {
        Bucket: aws.conf().S3.Name,
        Key: storageId + '/' + INFO_JSON,
        ACL: 'private',
        Body: JSON.stringify(comm || { task: null, files: null, parentComm: null, subComm: [] }),
        // Body: JSON.stringify({ task: { scale: 70 }, files: 10 }),
        ContentType: 'application/json'
    };

    aws.s3().upload(params, function (err) {
        if (err) {
            callback(err, null);
            logger.log(null, 'CC_R_ACTION_ERR', 'newStorage.upload', err.stack);
        }
        else callback(null, storageId);
    });

};

var getFiles = function (id, callback) {
    var params = {
        Bucket: aws.conf().S3.Name,
        Prefix: id
    };

    aws.s3().listObjectsV2(params, function (err, data) {
        if (err) callback(err, null);

        else {
            var infoFile = false;
            var files = [];

            // some = breakable foreach :D
            data.Contents.some(function (entry) {
                var fileName = entry.Key.replace(/^([a-zA-Z0-9]+\/)(.*)/, '$2');

                // block asking about too shorts id (example id = "a", prefix probably will be found)
                if ((id + '/' + fileName) !== entry.Key) {
                    infoFile = false;
                    return true;
                }

                var file = {
                    name: fileName,
                    url: aws.conf().S3.Url + '/' + id + '/' + fileName
                };

                if (file.name !== INFO_JSON) files.push(file);
                else infoFile = true;

                return false;
            });

            if (!infoFile) callback('INFO_JSON err', null);
            else callback(null, files);
        }
    });
};

var getMeta = function (storage, fileName, callback) {
    var params = {
        Bucket: aws.conf().S3.Name,
        Key: storage + '/' + fileName
    };

    aws.s3().headObject(params, function (err, data) {
        if (err) callback(err.stack, null);
        else callback(null, data.Metadata);
    });
};

/* ********************************************************************* */

var getMeta2RequestProper = function (fileNames) {
    if (!Array.isArray(fileNames)) {
        return false;
    }

    for (var i = 0; i < fileNames.length; i++) {
        var isString = typeof fileNames[i] === 'string' || fileNames[i] instanceof String;
        if (!isString) return false;
    }

    return true;
};

var getMetaPromise = function (storage, fileName) {
    var params = {
        Bucket: aws.conf().S3.Name,
        Key: storage + '/' + fileName
    };

    return new Promise(function (resolve, reject) {
        aws.s3().headObject(params, function (err, result) {
            if (err) return reject(err);
            resolve(result.Metadata);
        });
    });
};

var getMeta2 = function (storage, fileNames, callback) {
    if (!getMeta2RequestProper(fileNames)) {
        callback('400', null);
    }

    var promises = [];
    for (var i = 0; i < fileNames.length; i++) {
        promises.push(getMetaPromise(storage, fileNames[i]))
    }

    Promise.all(promises).then(function () {
        callback(null, arguments[0]);
    }, function (err) {
        callback(err, null);
    });
};

/* ********************************************************************* */


exports.INFO_JSON = INFO_JSON;
exports.newStorage = newStorage;
exports.getFiles = getFiles;
exports.getMeta = getMeta;
exports.getMeta2 = getMeta2;
exports.getComm = getComm;

