'use strict';

var STORAGE_ID_LEN = 8;
var INFO_JSON = '__info.json';

var aws = require('../utils/aws');
var common = require('../utils/common');

// *********************************************************************************************

var newStorage = function (callback) {
    var storageId = common.random2(STORAGE_ID_LEN);

    var params = {
        Bucket: aws.conf().S3.Name,
        Key: storageId + '/' + INFO_JSON,
        ACL: 'private',
        Body: JSON.stringify({ '_': INFO_JSON }),
        ContentType: 'application/json'
    };

    aws.s3().upload(params, function (err, data) {
        if (err) callback(err);
        else callback(null, storageId);
    });

};

// *********************************************************************************************

var getFiles = function (id, callback) {
    var params = {
        Bucket: aws.conf().S3.Name,
        Prefix: id
    };

    aws.s3().listObjectsV2(params, function (err, data) {
        if (err) callback(err);

        else {
            var infoFile = false;
            var files = [];

            data.Contents.forEach(function (entry) {
                var fileName = entry.Key.replace(/^([a-zA-Z0-9]+\/)(.*)/, '$2');

                var file = {
                    name: fileName,
                    url: aws.conf().S3.Url + '/' + id + '/' + fileName
                };

                if (file.name !== INFO_JSON) files.push(file);
                else infoFile = true;
            });

            if (!infoFile) callback('no such bucket with INFO_JSON file');
            else callback(null, files);
        }
    });
};

// *********************************************************************************************

var getMeta = function (bucket, key, callback) {
    var params = {
        Bucket: bucket,
        Key: key
    };

    aws.s3().headObject(params, function (err, data) {
        if (err) callback(err.stack);
        else callback(data.Metadata);
    });
};

// *********************************************************************************************

exports.newStorage = newStorage;
exports.getFiles = getFiles;
