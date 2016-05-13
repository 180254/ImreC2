'use strict';

var getComm = function (callback) {
    var storageId = $('#storage-id').html();
    var taskUrl = '/s/comm/?s=' + encodeURIComponent(storageId);

    //noinspection NodeModulesDependencies
    $.get(taskUrl, function (data) {
        callback(JSON.parse(data));
    }).fail(function () {
        alert('Something go wrong. Try reload page.');
    });
};

/* eslint-disable no-unused-vars */
var updateComm = function () {
    /* eslint-enable no-unused-vars */

    getComm(function (comm) {
        var $info = $('#info-comm-comm');
        var $percent = $('#info-comm-percent');

        if (comm.task === null) {
            $info.html('None');
            $percent.html('-');

        } else if (comm.task.scale !== undefined) {
            $info.html('scale = ' + comm.task.scale + '%');

            var hasFileLen = $('#file-table').find('tbody').children().length - 1;
            var hasPercent = hasFileLen / comm.files * 100;
            $percent.html(hasPercent.toFixed(0) + '%')
        }
    });
};
