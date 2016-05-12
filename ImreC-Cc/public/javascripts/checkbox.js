'use strict';

var updateSelectedFileNames = function () {
    var $selectedFiles = $('.files-check:checked');

    var selectedFilesNames =
        $.map($selectedFiles, function (e) {
            return e.value
        }).join('\n') || 'None';

    $('#scale-images').html(selectedFilesNames);
};

/* eslint-disable no-unused-vars */
var initCheckboxChanges = function ($dom) {
    /* eslint-enable no-unused-vars */

    $dom.change(function () {
        updateSelectedFileNames();
    });
};

$(function () {
    $('input[type="checkbox"]').prop('checked', false);

    $('#files-check-all').change(function () {
        var checked = $('#files-check-all').is(':checked');
        $('.files-check').slice(1).prop('checked', checked);
        updateSelectedFileNames();
    });
});
