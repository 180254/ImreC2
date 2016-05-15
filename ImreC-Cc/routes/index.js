'use strict';

var express = require('express');
var router = express.Router();

var selfIp = require('../utils/selfIp');
var common = require('../utils/common');
var logger = require('../utils/logger');

router.get('/', function (req, res) {

    var options = {
        selfIp: selfIp.ip(),
        actionError: req.query.a === 'error',
        noSuchStorage: req.query.a === 'noSuchStorage'
    };

    res.render('index', options);

    logger.log(req, 'CC_REQ_INDEX', common.fullUrl(req))
});

module.exports = router;
