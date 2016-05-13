'use strict';

/* eslint-disable no-unused-vars */
var removeLoader = function () {
    /* eslint-enable no-unused-vars */

    $('#not-yet').addClass('hidden');
};

/* eslint-disable no-unused-vars */
var addLoader = function () {
    /* eslint-enable no-unused-vars */

    $('#not-yet').removeClass('hidden');
};

$(function () {

    $('.reload').click(function () {
        location.reload();
    });

    $('.slider').bootstrapSlider({
        tooltip: 'always'
    });

});
