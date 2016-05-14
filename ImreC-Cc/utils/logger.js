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

    attributes.push({ Name: 'aSource', Value: 'Cc/' + selfIp.ip() });
    attributes.push({ Name: 'bDate', Value: currentDateFormatted() });
    attributes.push({ Name: 'cReqIP', Value: ip(req) });
    attributes.push({ Name: 'dAction', Value: action });

    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++) {
            attributes.push({ Name: 'eArg_' + (i - 2), Value: arguments[i] });
        }
    }

    var uniqueName = common.random2(16);
    var simpleDbParams = {
        DomainName: aws().conf.Sdb.Domain,
        ItemName: aws().conf.Sdb.LogItemPrefix + uniqueName,
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
