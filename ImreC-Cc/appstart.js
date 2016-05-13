'use strict';

var aws = require('./utils/aws');

var actionRemaining = 2; // set number of comm to bo done on start!
var callbackFunc = null;

var checkStartDone = function () {
    if (--actionRemaining < 0) {
        console.log('onStart OK.');
        callbackFunc();
    }
};

var onStart = function (callback) {
    var doSdbInit = false;
    callbackFunc = callback;

    aws.initAws(function () {
        checkStartDone();

        if (doSdbInit) sdbInit();
        else checkStartDone();
    });

    checkStartDone();
};

var sdbInit = function () {
    var params = { DomainName: aws.conf().Sdb.Domain };

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
