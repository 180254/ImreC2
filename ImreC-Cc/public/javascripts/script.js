'use strict';

$(function () {

    $('.slider').bootstrapSlider({
        tooltip: 'always'
    });

    /* ****************************************************************************** */

    var initHideAble = function ($elem) {
        $elem.click(function () {
            $elem.slideUp('slow');
        })
    };

    if ($('#file-list').find('tr').length === 0) {
        $('#file-table').addClass('hidden')
    }

    var $form = $('#s3form');
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

        done: function (event, data, x) {
            data.files.forEach(function (file) {
                $('.progress[data-file="' + file.name + '"]').slideUp('slow');

                var $fileList = $('#file-list');
                if ($fileList.find('a:contains("' + file.name + '")').length !== 0)
                    return;

                var $fileTable = $('#file-table');
                if ($fileTable.hasClass('hidden'))
                    $fileTable.removeClass('hidden');

                var url = $form.attr('action');
                var key = $form.find("input[name='key']");
                var fullUrl = url + '/' + key;

                var $input = $('<input/>', {
                    type: 'checkbox',
                    'name': 'files',
                    value: file.name
                });
                var $url = $('<a/>', {
                    href: encodeURI(fullUrl)
                }).html(file.name);

                var $tr = $('<tr/>').append(
                    $('<td/>').append($input)
                ).append(
                    $('<td/>').append($('<span/>').html('?'))
                ).append(
                    $('<td/>').append($('<span/>').html('?'))
                ).append(
                    $('<td/>').append($url)
                );

                $fileList.append($tr);
            });
        }
    });
});
