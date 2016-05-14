'use strict';

/* eslint-disable no-unused-vars */
var initMeta = function (fileRow) {
    /* eslint-enable no-unused-vars */

    var storageId = $('#storage-id').html();

    var cols = fileRow.find('td');
    var filename = $(cols.get(3)).find('a').html();

    var metaUrl = '/s/meta/'
        + '?s=' + encodeURIComponent(storageId)
        + '&f=' + encodeURIComponent(filename);

    //noinspection NodeModulesDependencies
    $.get(metaUrl, function (meta) {
        $(cols.get(1)).html(meta.collector);
        $(cols.get(2)).html(meta.worker);

    }).fail(function () {
        alert('Something go wrong. Try reload page.');
    });
};
