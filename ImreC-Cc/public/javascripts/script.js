'use strict';

// https://www.designedbyaturtle.co.uk/2015/direct-upload-to-s3-using-aws-signature-v4-php/
$(document).ready(function () {

    // Assigned to variable for later use.
    var form = $('.direct-upload');
    var filesUploaded = [];

    // Place any uploads within the descending folders
    // so ['test1', 'test2'] would become /test1/test2/filename
    var folders = [];

    form.fileupload({
        url: form.attr('action'),
        type: form.attr('method'),
        dataType: 'json',
        add: function (event, data) {
            console.log(data.files);
            // Give the file which is being uploaded it's current content-type (It doesn't retain it otherwise)
            // and give it a unique name (so it won't overwrite anything already on s3).
            var file = data.files[0];
            var filename = file.name;
            form.find('input[name="Content-Type"]').val(file.type);

            var $key = form.find('input[name="key"]');
            var newKeyVal = $key.val().replace(/^([a-zA-Z0-9]+\/).*/, '$1' + filename);
            $key.val(newKeyVal);

            // Actually submit to form to S3.
            data.submit();

            // Show the progress bar
            // Uses the file size as a unique identifier
            var bar = $('<div class="progress" data-mod="' + file.size + '"><div class="bar"></div></div>');
            $('.progress-bar-area').append(bar);
            bar.slideDown('slow');
        },
        progress: function (e, data) {
            var percent = Math.round((data.loaded / data.total) * 100);
            $('.progress[data-mod="' + data.files[0].size + '"] .bar').css('width', percent + '%').html(percent + '%');
        },

        fail: function (e, data) {
            $('.progress[data-mod="' + data.files[0].size + '"] .bar').css('width', '100%').addClass('red').html('');
        },

        done: function (event, data) {
            $('.progress[data-mod="' + data.files[0].size + '"]').slideUp('slow');

            // Upload Complete, show information about the upload in a textarea
            // from here you can do what you want as the file is on S3
            // e.g. save reference to your server using another ajax call or log it, etc.
            var original = data.files[0];
            var s3Result = data.result.documentElement.children;
            filesUploaded.push({
                "original_name": original.name,
                "s3_name": s3Result[2].innerHTML,
                "size": original.size,
                "url": s3Result[0].innerHTML
            });
            $('#uploaded').html(JSON.stringify(filesUploaded, null, 2));
        }
    });
});
