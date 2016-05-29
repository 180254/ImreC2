'use strict';
/* global initFileRow */

var LIMIT_UPLOADING_IN_SAME_TIME = 5;

var initHideAble = function ($elem) {
    $elem.click(function () {
        $elem.slideUp('slow', function () {
            $elem.remove();
        });
    })
};

// credits: friends @ stackoverflow
// http://stackoverflow.com/a/14811679
// license: https://creativecommons.org/licenses/by-sa/3.0/
var waitFor = function (test, expectedValue, msec, count, source, callback) {
    //noinspection LoopStatementThatDoesntLoopJS
    while (test() !== expectedValue) {
        count++;
        setTimeout(function () {
            waitFor(test, expectedValue, msec, count, source, callback);
        }, msec);
        return;
    }
    // Condition finally met. callback() can be executed.
    // console.log(source + ': ' + test() + ', expected: ' + expectedValue + ', ' + count + ' loops.');
    callback();
};

var updateUploadQueue = function (uploadQueue) {
    $('#upload-queue').text(uploadQueue);
};

$(function () {
    var $form = $('#s3form');
    var uploading = 0;
    var uploadQueue = 0;

    var _isBusy = function () {
        return uploading >= LIMIT_UPLOADING_IN_SAME_TIME;
    };

    //noinspection JSUnusedGlobalSymbols
    $form.fileupload({
        url: $form.attr('action'),
        type: $form.attr('method'),
        dataType: 'json',

        add: function (event, data) {
            updateUploadQueue(uploadQueue += data.files.length);

            data.files.forEach(function (file) {
                waitFor(_isBusy, false, 1200, 0, file.name, function () {
                    uploading++;

                    if ($('.bar[data-file="' + file.name + '"]').length !== 0) {
                        uploading--;
                        updateUploadQueue(uploadQueue -= 1);
                        return;
                    }

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
            });
        },

        progress: function (e, data) {
            data.files.forEach(function (file) {
                var percent = Math.round((data.loaded / data.total) * 100);
                $('.bar[data-file="' + file.name + '"]')
                    .css('width', percent + '%')
                    .text(percent + '%');
            });

        },

        fail: function (e, data) {
            data.files.forEach(function (file) {
                $('.bar[data-file="' + file.name + '"]')
                    .css('width', '100%')
                    .addClass('red')
                    .text('Upload fail: ' + file.name);

                initHideAble($('.progress[data-file="' + file.name + '"]'));
            });

            uploading--;
            updateUploadQueue(uploadQueue -= data.files.length);
        },

        done: function (event, data) {
            data.files.forEach(function (file) {
                var $progress = $('.progress[data-file="' + file.name + '"]');
                $progress.slideUp('slow', function () {
                    $progress.remove();
                });

                var $fileList = $('#file-list');
                if ($fileList.find('a:contains("' + file.name + '")').length !== 0)
                    return;

                var storageId = $('#storage-id').text();
                var url = $form.attr('action');
                var fullUrl = url
                    + '/' + encodeURIComponent(storageId)
                    + '/' + encodeURIComponent(file.name);

                initFileRow(file.name, fullUrl, true);

                // /s/file/uploaded?s=STORAGE_ID&f=FILE_ID
                var fileUploadedUrl = '/s/file/uploaded/?s='
                    + encodeURIComponent(storageId)
                    + '&f=' + encodeURIComponent(file.name);

                //noinspection NodeModulesDependencies
                $.get(fileUploadedUrl);
            });

            var hasFileLen = $('#file-table').find('tbody').children().length - 1;
            $('#storage-count').text(hasFileLen);

            uploading--;
            updateUploadQueue(uploadQueue -= data.files.length);
        }
    });
});
