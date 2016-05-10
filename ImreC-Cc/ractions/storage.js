'use strict';

var aws = require('../utils/aws');
var common = require('../utils/common');

var newStorage = function (callback) {

    var id = common.random2(8);

    var params = {
        Bucket: aws.conf().S3.Name,
        Key: id + '/__info.json',
        ACL: 'private',
        Body: JSON.stringify({ Files: [] }),
        ContentType: 'application/json'
    };

    aws.s3().upload(params, function (err, data) {
        if (err) callback(err);
        else callback(null, id);
    });

};

exports.newStorage = newStorage;
