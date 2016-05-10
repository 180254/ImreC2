'use strict';

var express = require('express');
var router = express.Router();

var storage = require('../ractions/storage');

router.get('/new', function (req, res, next) {

    storage.newStorage(function (err, id) {

        if (err) {
            console.log(err);
            res.redirect('/?a=error');
        }
        else res.redirect('/s?id=' + id);
    })
});

module.exports = router;
