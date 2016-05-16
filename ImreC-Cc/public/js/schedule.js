'use strict';
/* global removeLoader, addLoader, ajaxError */

var getSelectedFileNames = function () {
    return $.map($('.files-check:checked'), function (e) {
        return e.value
    });
};

var updateSelectedArea = function () {
    var selectedFilesNames = getSelectedFileNames().join('\n');
    var selectedFilesNames2 = selectedFilesNames || 'None, select some files using checkbox in Files table.';

    $('#schedule-button').prop('disabled', selectedFilesNames === '');
    $('#selected-area').html(selectedFilesNames2);
};

/* eslint-disable no-unused-vars */
var initCheckboxChanges = function ($checkboxDom) {
    /* eslint-enable no-unused-vars */

    $checkboxDom.change(function () {
        updateSelectedArea();
    });
};

var addToScheduledTable = function (scale, files, storageUrl) {
    var $scheduledT = $('#scheduled-t');
    var scheduledRow = $scheduledT.find('tr:first').clone();

    scheduledRow.find('span').html('scale=' + scale + '%; files=' + files);
    scheduledRow.find('a').attr('href', encodeURI(storageUrl)).html(storageUrl);
    scheduledRow.removeClass('hidden').appendTo($scheduledT);
    $('#scheduled-h').removeClass('hidden');
};

var onScheduleButton = function () {
    addLoader();

    var parseF = Number.parseInt || parseInt;
    var param = {
        task: { scale: parseF($('#scale-info').attr('value')) },
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
        addToScheduledTable(param.task.scale, param.filesArr.length, data.storageUrl);
        $('#schedule-button').blur();

        $('html, body').animate({
            scrollTop: $('#scheduled-h').offset().top - 30
        }, 300);

    }).always(function () {
        removeLoader();

    }).fail(ajaxError);
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

    updateSelectedArea();
});
