'use strict';
/* global initMeta, initMetaTable, initCheckboxChanges, updateCommission, removeLoader, ajaxError */

var initFileRow = function (name, url, doInitMeta) {
    var $table = $('#file-table').find('tbody');

    var $fileRow = $table.find('>:first-child').clone();
    var $cols = $fileRow.find('td');

    var $checkbox = $($cols.get(0)).find('input');
    $checkbox.attr('value', name);

    var $find = $($cols.get(3)).find('a');
    $find.attr('href', url);
    $find.text(name);

    $fileRow.removeClass('hidden');
    $table.append($fileRow);

    if (doInitMeta) initMeta($fileRow);
    initCheckboxChanges($checkbox);
};

var initFileTable = function () {
    var storageId = $('#storage-id').text();
    var metaUrl = '/s/file/?s=' + encodeURIComponent(storageId);

    //noinspection NodeModulesDependencies
    $.get(metaUrl, function (data) {
        removeLoader();
        updateCommission();

        for (var i = 0; i < data.length; i++) {
            initFileRow(data[i].name, data[i].url, false);
        }
        $('#storage-count').text(data.length);
        initMetaTable();

    }).fail(ajaxError);
};


$(function () {
    initFileTable();
});
