'use strict';

var getTask = function (callback) {
    var storageId = $('#storage-id').html();
    var taskUrl = '/s/task/?s=' + encodeURIComponent(storageId);

    //noinspection NodeModulesDependencies
    $.get(taskUrl, function (data) {
        callback(JSON.parse(data));
    });
};

/* eslint-disable no-unused-vars */
var updateTaskInfo = function () {
    /* eslint-enable no-unused-vars */

    getTask(function (task) {
        var $info = $('#info-task');
        var $percent = $('#info-task-percent');

        if (task.task === null) {
            $info.html('None');
            $percent.html('-');

        } else if (task.task.scale !== undefined) {
            $info.html('scale = ' + task.task.scale + '%');

            var hasFileLen = $('#file-table').find('tbody').children().length - 1;
            var hasPercent = hasFileLen / task.files * 100;
            $percent.html(hasPercent.toFixed(0) + '%')
        }
    });
};
