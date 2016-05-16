'use strict';

/* eslint-disable no-unused-vars */
var removeLoader = function () {
    $('#not-yet').addClass('hidden');
};

var addLoader = function () {
    $('#not-yet').removeClass('hidden');
};

var ajaxError = function (jqXHR, textStatus, errorThrown) {
    // console.log('errorThrown=' + errorThrown);
    // errorThrown is '' if ajaxError is caused by page leave
    if (errorThrown !== '') {
        alert('Something go wrong. Try reload page.');
    }
};
/* eslint-enable no-unused-vars */

$(function () {

    $('.reload').click(function () {
        location.reload();
    });

    $('.slider').bootstrapSlider({
        tooltip: 'always'
    });

    $('#files-show-hide').click(function () {
        $(this).blur();

        //noinspection JSCheckFunctionSignatures
        $('#s3form').toggle(600);

        //noinspection JSCheckFunctionSignatures
        $('#progress-bar-area').toggle(600);
        
        //noinspection JSCheckFunctionSignatures
        $('#file-table').toggle(600);
    });

});
