'use strict';
/* global ajaxError */

/* eslint-disable no-unused-vars */
var initMeta = function (fileRow) {
    /* eslint-enable no-unused-vars */

    var storageId = $('#storage-id').text();

    var cols = fileRow.find('td');
    var filename = $(cols.get(3)).find('a').text();

    var metaUrl = '/s/meta1/'
        + '?s=' + encodeURIComponent(storageId)
        + '&f=' + encodeURIComponent(filename);

    //noinspection NodeModulesDependencies
    $.get(metaUrl, function (meta) {
        $(cols.get(1)).text(meta.collector);
        $(cols.get(2)).text(meta.worker);
    }).fail(ajaxError);

};

/* eslint-disable no-unused-vars */
var initMetaTable = function () {
    /* eslint-enable no-unused-vars */

    var storageId = $('#storage-id').text();
    var $fileRows = $('#file-table').find('tr.file-item:not(.hidden)');

    var metaUrl = '/s/meta2?s=' + encodeURIComponent(storageId);
    var fileNames = $.map($fileRows, function (fileRow) {
        return $($(fileRow).find('td').get(3)).find('a').text()
    });

    $.ajax({
        url: metaUrl,
        type: 'POST',
        data: JSON.stringify(fileNames),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'

    }).done(function (meta2) {
        for (var i = 0; i < meta2.length; i++) {
            var cols = $($fileRows.get(i)).find('td');
            $(cols.get(1)).text(meta2[i].collector);
            $(cols.get(2)).text(meta2[i].worker);
        }
    }).fail(ajaxError);
};
