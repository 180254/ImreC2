'use strict';

var aws = require('../utils/aws');
var s3post = require('../utils/s3post');
var ip = require('../utils/ip');

var getS3Form = function (req, folder) {
    var ipCopy = ip.ip();

    var s3Policy = new s3post.Policy(aws.conf().S3.Policy);
    s3Policy.setFilenamePrefix(folder + '/');
    s3Policy.setUploader(req.ip);
    s3Policy.setCollector(ipCopy);

    var s3Form = new s3post.S3Form(s3Policy);
    var s3Fields = s3Form.getFieldsBase();
    s3Form.addS3FormFields(s3Fields);
    s3Form.addS3CredentialsFields(s3Fields, aws.cred());
    s3Form.setField(s3Fields, 'x-amz-meta-filename', '${filename}');
    s3Form.setField(s3Fields, 'x-amz-meta-uploader', req.ip);
    s3Form.setField(s3Fields, 'x-amz-meta-collector', ipCopy);
    s3Form.setField(s3Fields, 'x-amz-meta-worker', '?');

    return {
        URL: aws.conf().S3.Url,
        Fields: s3Fields,
        IP: ipCopy
    };
};

exports.getS3Form = getS3Form;
