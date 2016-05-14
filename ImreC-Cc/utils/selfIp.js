'use strict';

var eIP = require('external-ip')();
var selfIp = '?';

eIP(function (err, ip) {
    if (!err)
        selfIp = ip;
});

var ip = function () {
    return selfIp;
};

exports.ip = ip;
