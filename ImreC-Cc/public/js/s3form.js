'use strict';
/* global initFileRow */

var initHideAble = function ($elem) {
    $elem.click(function () {
        $elem.slideUp('slow');
    })
};

$(function () {
    var $form = $('#s3form');

    //noinspection JSUnusedGlobalSymbols
    $form.fileupload({
        url: $form.attr('action'),
        type: $form.attr('method'),
        dataType: 'json',

        add: function (event, data) {
            data.files.forEach(function (file) {
                $form.find('input[name="Content-Type"]').val(file.type);

                var $key = $form.find('input[name="key"]');
                var newKeyVal = $key.val().replace(/^([a-zA-Z0-9]+\/).*/, '$1' + file.name);
                $key.val(newKeyVal);

                var $progress = $('<div/>', {
                    class: 'progress',
                    'data-mod': file.size,
                    'data-file': file.name
                });

                var $bar = $('<div/>', {
                    class: 'bar',
                    'data-file': file.name
                });
                $bar.css('width', '0%');
                $progress.append($bar);

                $('.progress-bar-area').append($progress);
                $progress.slideDown('slow');

                data.submit();
            });
        },

        progress: function (e, data) {
            data.files.forEach(function (file) {
                var percent = Math.round((data.loaded / data.total) * 100);
                $('.bar[data-file="' + file.name + '"]')
                    .css('width', percent + '%')
                    .html(percent + '%');
            });

        },

        fail: function (e, data) {
            data.files.forEach(function (file) {
                $('.bar[data-file="' + file.name + '"]')
                    .css('width', '100%')
                    .addClass('red')
                    .html('Upload fail: ' + file.name);

                initHideAble($('.progress[data-file="' + file.name + '"]'));
            });
        },

        done: function (event, data) {
            data.files.forEach(function (file) {
                $('.progress[data-file="' + file.name + '"]').slideUp('slow');

                var $fileList = $('#file-list');
                if ($fileList.find('a:contains("' + file.name + '")').length !== 0)
                    return;

                var url = $form.attr('action');
                var key = $form.find("input[name='key']").attr('value');
                var fullUrl = url + '/' + key;

                initFileRow(file.name, fullUrl);

                // /s/file/uploaded?s=STORAGE_ID&f=FILE_ID
                var storageId = $('#storage-id').html();
                var fileUploadedUrl = '/s/file/uploaded/?s='
                    + encodeURIComponent(storageId)
                    + '&f=' + encodeURIComponent(file.name);

                //noinspection NodeModulesDependencies
                $.get(fileUploadedUrl);
            });
        }
    });
});
