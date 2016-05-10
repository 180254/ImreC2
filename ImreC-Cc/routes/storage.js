'use strict';

var express = require('express');
var router = express.Router();

var storage = require('../utils/storage');

router.get('/new', function (req, res, next) {

    storage.newStorage(function (err, id) {
        if (err) {
            console.log(err);
            res.redirect('/');
        }
        else res.redirect('/?id=' + id);
    })
});

module.exports = router;
