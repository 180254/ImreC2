'use strict';

var common = require('./common');
var selfIp = require('./selfIp');
var aws = require('./aws');

var ip = function (req) {
    if (!req) return '?';
    return req.ip;
};

var log = function (req, action) {
    var attributes = [];

    attributes.push({ Name: 'aApp', Value: 'Cc' });
    attributes.push({ Name: 'bAppInstance', Value: selfIp.ip() });
    attributes.push({ Name: 'cDate', Value: currentDateFormatted() });
    attributes.push({ Name: 'dReqIP', Value: ip(req) });
    attributes.push({ Name: 'eAction', Value: action });

    var SDB_LENGTH_LIMIT = 1024;

    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++) {
            if (arguments[i].length <= SDB_LENGTH_LIMIT) {
                attributes.push({ Name: 'fArg_' + (i - 2), Value: arguments[i] });

            } else {
                var chunk = common.chunkString(arguments[i], SDB_LENGTH_LIMIT);
                for (var c = 0; c < chunk.length; c++) {
                    attributes.push({ Name: 'fArg_' + (i - 2) + '_' + c, Value: chunk[c] });
                }
            }
        }
    }

    var uniqueName = common.random2(16);
    var simpleDbParams = {
        DomainName: aws.conf().Sdb.Domain,
        ItemName: aws.conf().Sdb.LogItemPrefix + uniqueName,
        Attributes: attributes
    };

    aws.sdb().putAttributes(simpleDbParams, function (err) {
        if (err) console.log(err.stack);
    });
};

var currentDateFormatted = function () {
    var date = new Date();

    return date.getUTCFullYear()
        + '-'
        + common.pad(date.getUTCMonth() + 1, 2)
        + '-'
        + common.pad(date.getUTCDate(), 2)
        + ' '
        + common.pad(date.getUTCHours(), 2)
        + ':'
        + common.pad(date.getUTCMinutes(), 2)
        + ':'
        + common.pad(date.getUTCSeconds(), 2);
};

exports.log = log;
