'use strict';

var aws = require('./utils/aws');
var common = require('./utils/common');
var conf = common.readJson('conf.json');

var actionRemaining = 2; // set number of task to bo done on start!
var callbackFunc = null;

var checkStartDone = function () {
    if (--actionRemaining < 0) {
        console.log('onStart OK.');
        callbackFunc();
    }
};

var onStart = function (callback) {
    callbackFunc = callback;

    aws.initAws(function () {
        checkStartDone();
        simpleDbInit();
    });

    checkStartDone();
};

var simpleDbInit = function () {
    var params = { DomainName: conf.Sdb.Domain };

    aws.sdb().deleteDomain(params, function (err, data) {
        if (err) throw new Error(err.stack);

        else {
            aws.sdb().createDomain(params, function (err, data) {
                if (err) throw new Error(err.stack);
                else checkStartDone();
            });
        }
    });
};

exports.onStart = onStart;
