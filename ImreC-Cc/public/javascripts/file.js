'use strict';
/* global initMeta, initCheckboxChanges */

var removeLoader = function () {
    $('#not-yet').remove();
};

var initFile = function (name, url) {
    var $table = $('#file-table').find('tbody');

    var $fileRow = $table.find('>:first-child').clone();
    var $cols = $fileRow.find('td');

    var $checkbox = $($cols.get(0)).find('input');
    $checkbox.attr('value', name);

    var $find = $($cols.get(3)).find('a');
    $find.attr('href', encodeURI(url));
    $find.html(name);

    $fileRow.removeClass('hidden');
    $table.append($fileRow);

    initMeta($fileRow);
    initCheckboxChanges($checkbox);
};

var initFiles = function () {
    var storageId = $('#storage-id').html();
    var metaUrl = '/s/file/?s=' + encodeURIComponent(storageId);

    //noinspection NodeModulesDependencies
    $.get(metaUrl, function (data) {
        removeLoader();

        data.forEach(function (file) {
            initFile(file.name, file.url);
        });
    });
};


$(function () {
    initFiles();
});
