'use strict';

var express = require('express');
var router = express.Router();

var common = require('../utils/common');
var logger = require('../utils/logger');
var storage = require('../ractions/storage');
var s3Form = require('../ractions/s3form');

router.get('/', function (req, res) {
    var id = req.query.id;

    storage.getComm(id, function (err, comm) {
        if (err) res.redirect('/?a=noSuchStorage');

        else {
            var renderParams = {
                id: id,
                url: common.domainUrl(req) + '/s?id=' + id,

                parentId: comm.parentComm || 'None',
                parentUrl: comm.parentComm !== null
                    ? common.domainUrl(req) + '/s?id=' + comm.parentComm
                    : null,

                isTask: comm.task !== null,
                s3form: comm.task !== null
                    ? null
                    : s3Form.getS3Form(req, id)
            };

            res.render('storage', renderParams);
            logger.log(req, 'CC_REQ_STORAGE', common.fullUrl(req), JSON.stringify(req.query));
        }
    });
});

router.get('/new', function (req, res) {

    storage.newStorage(null, function (err, id) {
        if (err) res.redirect('/?a=error');

        else {
            res.redirect('/s?id=' + id);
            logger.log(req, 'CC_REQ_STORAGE_NEW', common.fullUrl(req), id);
        }
    });
});

router.get('/meta1', function (req, res) {
    var storageId = req.query.s;
    var fileName = req.query.f;

    storage.getMeta(storageId, fileName, function (err, meta) {
        if (err) res.sendStatus(404);

        else {
            res.contentType('application/json');
            res.send(JSON.stringify(meta));

            logger.log(req, 'CC_REQ_STORAGE_META1', common.fullUrl(req), JSON.stringify(req.query));
        }
    });
});

router.post('/meta2', function (req, res) {
    var storageId = req.query.s;
    var fileNames = req.body;

    storage.getMeta2(storageId, fileNames, function (err, meta2) {
        if (err && err === '400')res.sendStatus(400);
        else if (err) res.sendStatus(404);

        else {
            res.contentType('application/json');
            res.send(JSON.stringify(meta2));

            logger.log(req, 'CC_REQ_STORAGE_META2', common.fullUrl(req),
                JSON.stringify(req.query), JSON.stringify(req.body));
        }
    });
});

router.get('/file', function (req, res) {
    var storageId = req.query.s;

    storage.getFiles(storageId, function (err, files) {
        if (err) res.sendStatus(404);

        else {
            res.contentType('application/json');
            res.send(JSON.stringify(files));

            logger.log(req, 'CC_REQ_STORAGE_FILE', common.fullUrl(req), JSON.stringify(req.query));
        }
    });
});

router.get('/comm', function (req, res) {
    var storageId = req.query.s;

    storage.getComm(storageId, function (err, comm) {
        if (err) res.sendStatus(404);

        else {
            res.contentType('application/json');
            res.send(JSON.stringify(comm));

            logger.log(req, 'CC_REQ_STORAGE_COMM', common.fullUrl(req), JSON.stringify(req.query));
        }
    });
});

router.get('/file/uploaded', function (req, res) {
    res.sendStatus(202);

    var storageId = req.query.s;
    var fileName = req.query.f;

    storage.getMeta(storageId, fileName, function (err) {
        if (!err) {
            logger.log(req, 'CC_FILE_UPLOADED', common.fullUrl(req), JSON.stringify(req.query));
        }
    });
});

module.exports = router;
