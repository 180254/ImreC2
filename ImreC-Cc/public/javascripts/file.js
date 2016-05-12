'use strict';

var removeLoader = function () {
    $('#not-yet').remove();
};

var initFile = function (name, url) {
    var table = $('#file-table').find('tbody');

    var fileRow = table.find('>:first-child').clone();
    var cols = fileRow.find('td');

    $(cols.get(0)).find('input').attr('value', name);

    var find = $(cols.get(3)).find('a');
    find.attr('href', encodeURI(url));
    find.html(name);

    fileRow.removeClass('hidden');
    table.append(fileRow);

    //noinspection Eslint
    initMeta(fileRow);
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
