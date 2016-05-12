'use strict';

var express = require('express');
var router = express.Router();

var common = require('../utils/common');
var storage = require('../ractions/storage');
var s3Form = require('../ractions/s3form');

router.get('/', function (req, res, next) {
    var id = req.query.id;

    storage.getFiles(id, function (err, files) {
        if (err) res.redirect('/?a=noSuchStorage');

        else {
            var renderParams = {
                files: files,
                id: id,
                url: common.domainUrl(req) + '/s?id=' + id,
                s3form: s3Form.getS3Form(req, id)
            };
            res.render('storage', renderParams)
        }
    })
});

router.get('/new', function (req, res, next) {
    storage.newStorage(function (err, id) {

        if (err) {
            console.log(err);
            res.redirect('/?a=error');
        }
        else res.redirect('/s?id=' + id);
    })
});

router.get('/meta', function (req, res, next) {
    var storageId = req.query.s;
    var fileName = req.query.f;

    storage.getMeta(storageId, fileName, function (err, meta) {
        if (err) {
            res.status(404);
            res.send('');
        }
        else {
            res.contentType('application/json');
            res.send(JSON.stringify(meta));
        }
    })
});

module.exports = router;
