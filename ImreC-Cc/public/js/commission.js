'use strict';
/* global addToScheduledTable */

var getCommission = function (callback) {
    var storageId = $('#storage-id').html();
    var commUrl = '/s/comm/?s=' + encodeURIComponent(storageId);

    //noinspection NodeModulesDependencies
    $.get(commUrl, function (data) {
        callback(data);
    }).fail(function () {
        alert('Something go wrong. Try reload page.');
    });
};

var updateSubCommissions = function (comm) {
    var domainUrl = location.protocol + '//' + location.host;

    comm.subComm.forEach(function (subComm) {
        if (subComm.task.scale !== undefined) {
            addToScheduledTable(
                subComm.task.scale,
                subComm.files,
                domainUrl + '/s?id=' + subComm.storageId);
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
            $info.html('None');
            $percent.html('-');

        } else if (comm.task.scale !== undefined) {
            $info.html('scale = ' + comm.task.scale + '%');

            var hasFileLen = $('#file-table').find('tbody').children().length - 1;
            var hasPercent = hasFileLen / comm.files * 100;
            $percent.html(hasPercent.toFixed(0) + '%')
        }

        updateSubCommissions(comm);
    });
};
