'use strict';

var express = require('express');
var router = express.Router();

var common = require('../utils/common');
var storage = require('../ractions/storage');
var s3Form = require('../ractions/s3form');

router.get('/new', function (req, res, next) {
    storage.newStorage(function (err, id) {

        if (err) {
            console.log(err);
            res.redirect('/?a=error');
        }
        else res.redirect('/s?id=' + id);
    })
});

router.get('/', function (req, res, next) {
    var id = req.query.id;

    storage.getFiles(id, function (err, files) {

        if (err) {
            console.log(err);
            res.redirect('/?a=error');
        }

        else {
            var renderParams = {
                Files: files,
                ID: id,
                URL: common.fullUrl(req),
                S3Form: s3Form.getS3Form(req, id)
            };
            res.render('storage', renderParams)
        }
    })
});

module.exports = router;
