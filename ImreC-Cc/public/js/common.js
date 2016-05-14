'use strict';

/* eslint-disable no-unused-vars */
var removeLoader = function () {
    $('#not-yet').addClass('hidden');
};

var addLoader = function () {
    $('#not-yet').removeClass('hidden');
};
/* eslint-disable no-unused-vars */


$(function () {

    $('.reload').click(function () {
        location.reload();
    });

    $('.slider').bootstrapSlider({
        tooltip: 'always'
    });

});
