'use strict';

var express = require('express');
var router = express.Router();

var common = require('../utils/common');
var logger = require('../utils/logger');
var comm = require('../ractions/comm');

router.post('/new', function (req, res) {

    comm.scheduleComm(req.body, function (err, storageId) {
        if (err) res.sendStatus(400);

        else {
            res.contentType('application/json');
            var storageUrl = common.domainUrl(req) + '/s?id=' + storageId;
            res.send(JSON.stringify({ 'storageUrl': storageUrl }));

            logger.log(req, 'CC_REQ_COMM_NEW', common.fullUrl(req), JSON.stringify(req.body), storageId);
        }
    });
});

module.exports = router;
