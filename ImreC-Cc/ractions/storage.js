'use strict';

var STORAGE_ID_LEN = 8;
var INFO_JSON = '__info.json';

var aws = require('../utils/aws');
var common = require('../utils/common');

// *********************************************************************************************

var newStorage = function (callback) {

    var id = common.random2(STORAGE_ID_LEN);

    var params = {
        Bucket: aws.conf().S3.Name,
        Key: id + '/' + INFO_JSON,
        ACL: 'private',
        Body: JSON.stringify({
            Files: [{ Name: 'a', URL: 'google.pl' }, { Name: 'a', URL: 'google.pl' }, {
                Name: 'a',
                URL: 'google.pl'
            }, { Name: 'a', URL: 'google.pl' }]
        }),
        ContentType: 'application/json'
    };

    aws.s3().upload(params, function (err, data) {
        if (err) callback(err);
        else callback(null, id);
    });

};

// *********************************************************************************************

var getFiles = function (id, callback) {

    var params = {
        Bucket: aws.conf().S3.Name,
        Key: id + '/' + INFO_JSON
    };

    aws.s3().getObject(params, function (err, data) {
        if (err) callback(err);
        else callback(null, JSON.parse(data.Body).Files);
    });
};

// *********************************************************************************************

exports.newStorage = newStorage;
exports.getFiles = getFiles;
