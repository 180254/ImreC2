'use strict';

var express = require('express');
var router = express.Router();

var common = require('../utils/common');
var logger = require('../utils/logger');
var aws = require('../utils/aws');

router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    var params = {
        SelectExpression: 'select * from ' + aws.conf().Sdb.Domain
        + ' where cDate like "%"'
        + ' order by cDate desc'
    };

    aws.sdb().select(params, function (err, data) {
        if (err) res.send(JSON.stringify(err.stack, null, ' '));
        else {
            sortAttributesInResult(data);
            res.send(JSON.stringify(data, null, ' '));
        }
    });

    logger.log(req, 'CC_REQ_SDB', common.fullUrl(req))
});

var sortAttributesInResult = function (data) {
    if (data.Items) {
        for (var i = 0; i < data.Items.length; i++) {
            data.Items[i].Attributes.sort(function (a, b) {
                return a.Name.localeCompare(b.Name);
            });
        }
    }
};

module.exports = router;
