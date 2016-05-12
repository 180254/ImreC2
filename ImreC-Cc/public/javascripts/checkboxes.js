'use strict';

$(function () {
    $('input[type="checkbox"]').prop('checked', false);

    $('#files-check-all').change(function () {
        var checked = $('#files-check-all').is(':checked');
        $('.files-check').prop('checked', checked);

        var $selectedFiles = $('.files-check:checked');
        var selectedFilesNames =
            $.map($selectedFiles, function (e) {
                return e.value
            }).join('\n') || 'None';

        $('#scale-images').html(selectedFilesNames);
    });
});
