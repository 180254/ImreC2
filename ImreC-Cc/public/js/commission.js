'use strict';
/* global addToScheduledTable, ajaxError */

var getCommission = function (callback) {
    var storageId = $('#storage-id').text();
    var commUrl = '/s/comm/?s=' + encodeURIComponent(storageId);

    //noinspection NodeModulesDependencies
    $.get(commUrl, function (data) {
        callback(data);
    }).fail(ajaxError);
};

var updateSubCommissions = function (comm) {
    var domainUrl = location.protocol + '//' + location.host;

    comm.subComm.forEach(function (subComm) {
        if (subComm.task.scale !== undefined) {
            addToScheduledTable(
                subComm.task.scale,
                subComm.files,
                domainUrl + '/s?id=' + encodeURIComponent(subComm.storageId));
        }
    })
};

/* eslint-disable no-unused-vars */
var updateCommission = function () {
    /* eslint-enable no-unused-vars */

    getCommission(function (comm) {
        var $info = $('#info-comm-task');
        var $percent = $('#info-comm-percent');

        if (!comm.task) {
            $info.text('n/a');
            $percent.text('n/a');

        } else if (comm.task.scale !== undefined) {
            $info.text('scale = ' + comm.task.scale + '%');

            var hasFileLen = $('#file-table').find('tbody').children().length - 1;
            var hasPercent = hasFileLen / comm.files * 100;

            var value = hasFileLen + ' files of ' + comm.files;
            var valuePercent = $('<b/>').text((hasPercent.toFixed(0) + '%'));
            var valueFull = $('<span/>').append(value + ' (').append(valuePercent).append(')');

            $percent.text('');
            $percent.append(valueFull);
        }

        updateSubCommissions(comm);
    });
};
