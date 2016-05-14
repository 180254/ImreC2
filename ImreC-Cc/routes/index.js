'use strict';

var express = require('express');
var router = express.Router();

var selfIp = require('../utils/selfIp');

router.get('/', function (req, res, next) {

    var options = {
        ip: selfIp.ip(),
        actionError: req.query.a === 'error',
        noSuchStorage: req.query.a === 'noSuchStorage'
    };

    res.render('index', options)
});

module.exports = router;
