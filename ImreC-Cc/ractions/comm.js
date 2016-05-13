'use strict';

var storage = require('./storage');

/*
 * comm =
 * {
 *  task: {scale:70}
 *  filesArr: [a,b,c]
 *  storageId: qwe
 * }
 */

var scheduleCheckedComm = function (comm, storageId) {
    console.log('Executing ' + JSON.stringify(comm) + '/' + storageId);
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
        files: comm.filesArr.length
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
                        scheduleCheckedComm(comm, storageId);
                    }
                });
        });
    });
};

exports.scheduleComm = scheduleComm;
