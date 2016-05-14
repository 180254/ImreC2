'use strict';
/* global removeLoader, addLoader */

var getSelectedFileNames = function () {
    return $.map($('.files-check:checked'), function (e) {
        return e.value
    });
};

var updateSelectedArea = function () {
    var selectedFilesNames = getSelectedFileNames().join('\n') || 'None';
    $('#schedule-button').prop('disabled', selectedFilesNames === 'None');
    $('#selected-area').html(selectedFilesNames);
};

/* eslint-disable no-unused-vars */
var initCheckboxChanges = function ($dom) {
    /* eslint-enable no-unused-vars */

    $dom.change(function () {
        updateSelectedArea();
    });
};

var onScheduleButton = function () {
    addLoader();

    var param = {
        task: { scale: Number.parseInt($('#scale-info').attr('value')) },
        filesArr: getSelectedFileNames(),
        storageId: $('#storage-id').html()
    };

    //noinspection JSUnusedGlobalSymbols
    $.ajax({
        url: '/c/new',
        type: 'POST',
        data: JSON.stringify(param),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'

    }).done(function (data) {
        var storageUrl = data.storageUrl;
        var $scheduledT = $('#scheduled-t');
        var scheduledRow = $scheduledT.find('tr:first').clone();

        scheduledRow.find('span').html('scale=' + param.task.scale + '%; files=' + param.filesArr.length);
        scheduledRow.find('a').attr('href', storageUrl).html(encodeURI(storageUrl));
        scheduledRow.removeClass('hidden').appendTo($scheduledT);
        $('#schedule-button').blur();

    }).fail(function () {
        alert('Something go wrong. Try reload page.');

    }).always(function () {
        removeLoader();
    });
};

$(function () {
    $('input[type="checkbox"]').prop('checked', false);

    $('#files-check-all').change(function () {
        var checked = $('#files-check-all').is(':checked');
        $('.files-check').slice(1).prop('checked', checked);
        updateSelectedArea();
    });

    $('#schedule-button').click(
        onScheduleButton
    );
});
