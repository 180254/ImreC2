'use strict';

var storage = require('./storage');
var logger = require('../utils/logger');
var aws = require('../utils/aws');

/*
 * comm =
 * {
 *  task: {scale:70}
 *  filesArr: [a,b,c]
 *  storageId: qwe
 * }
 */

var scheduleCheckedComm = function (comm, storageId2) {
    comm.filesArr.forEach(function (filename) {
        var message = {
            storageId1: comm.storageId,
            storageId2: storageId2,
            filename: filename,
            task: comm.task
        };

        var params = {
            MessageBody: JSON.stringify(message),
            QueueUrl: aws.conf().Sqs.Url
        };

        aws.sqs().sendMessage(params, function (err) {
            if (err) {
                logger.log(null, 'CC_R_ACTION_ERR', 'scheduleCheckedComm.sendMessage', err.stack);
                console.log(err.stack);
            }

            else console.log(params.MessageBody);
        });

        logger.log(null, 'CC_COMM_SCHEDULED', JSON.stringify(message));
    });
};

var addSubCommToStorage = function (comm, subStorageId) {
    var newSubComm = {
        task: comm.task,
        files: comm.filesArr.length,
        storageId: subStorageId
    };

    storage.getComm(comm.storageId, function (err, baseComm) {
        if (err) {
            console.log(err.stack);
            return;
        }

        baseComm.subComm.push(newSubComm);

        var params = {
            Bucket: aws.conf().S3.Name,
            Key: comm.storageId + '/' + storage.INFO_JSON,
            ACL: 'private',
            Body: JSON.stringify(baseComm),
            ContentType: 'application/json'
        };

        aws.s3().upload(params, function (err) {
            if (err) {
                logger.log(null, 'CC_R_ACTION_ERR', 'addSubCommToStorage.upload', err.stack);
                console.log(err.stack);
            }
            else console.log(params.Body);
        });
    })

};

var checkCommIsProper = function (comm, callback) {
    if (!Number.isInteger(comm.task.scale)
        || comm.task.scale > 200 || comm.task.scale < 1) {
        callback('comm.scale not in range');
    }
    else if (!Array.isArray(comm.filesArr)
        || comm.filesArr.length === 0) {
        callback('filesArr is empty');
    }
    else {
        callback(null);
    }
};

var isSubsetOfStorageFiles = function (filesArr, storageId, callback) {
    storage.getFiles(storageId, function (err, files) {
        if (err)callback(err, null);
        else {
            var fileNames = files.map(function (entry) {
                return entry.name;
            });

            var isSubset = filesArr.every(function (val) {
                return fileNames.indexOf(val) >= 0;
            });

            callback(null, isSubset);
        }
    });
};

var createStorageForComm = function (comm, callback) {
    var comm2 = {
        task: { scale: comm.task.scale },
        files: comm.filesArr.length,
        subComm: []
    };

    storage.newStorage(comm2, function (err, storageId) {
        if (err) callback(err, null);
        else callback(null, storageId);
    });
};

var scheduleComm = function (comm, callback) {
    checkCommIsProper(comm, function (err) {
        if (err) callback(err, null);

        else isSubsetOfStorageFiles(comm.filesArr, comm.storageId, function (err, isSubset) {
            if (err) callback(err, null);
            else if (!isSubset) callback('filesArr not a subset of files in storage', null);

            else createStorageForComm(comm, function (err, storageId) {
                    if (err) callback(err, null);
                    else {
                        callback(null, storageId);
                        addSubCommToStorage(comm, storageId);
                        scheduleCheckedComm(comm, storageId);
                    }
                });
        });
    });
};

exports.scheduleComm = scheduleComm;
