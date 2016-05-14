'use strict';

var express = require('express');
var router = express.Router();

var common = require('../utils/common');
var storage = require('../ractions/storage');
var s3Form = require('../ractions/s3form');

router.get('/', function (req, res, next) {
    var id = req.query.id;

    storage.getInfo(id, function (err, isTask) {
        if (err) res.redirect('/?a=noSuchStorage');

        else {
            var renderParams = {
                id: id,
                url: common.domainUrl(req) + '/s?id=' + id,
                isTask: isTask,
                s3form: isTask ? null : s3Form.getS3Form(req, id)
            };

            res.render('storage', renderParams)
        }
    })
});

router.get('/new', function (req, res, next) {

    storage.newStorage(null, function (err, id) {
        if (err) res.redirect('/?a=error');
        else res.redirect('/s?id=' + id);
    })
});

router.get('/meta', function (req, res, next) {
    var storageId = req.query.s;
    var fileName = req.query.f;

    storage.getMeta(storageId, fileName, function (err, meta) {
        if (err) res.sendStatus(404);
        
        else {
            res.contentType('application/json');
            res.send(JSON.stringify(meta));
        }
    })
});

router.get('/file', function (req, res, next) {
    var storageId = req.query.s;

    storage.getFiles(storageId, function (err, files) {
        if (err) res.sendStatus(404);
        
        else {
            res.contentType('application/json');
            res.send(JSON.stringify(files));
        }
    })
});

router.get('/comm', function (req, res, next) {
    var storageId = req.query.s;

    storage.getComm(storageId, function (err, comm) {
        if (err) res.sendStatus(404);

        else {
            res.contentType('application/json');
            res.send(JSON.stringify(comm));
        }
    })
});

module.exports = router;
