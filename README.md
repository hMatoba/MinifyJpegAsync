JavaScript-MinifyJpegAsync
==========================
[![Build Status](https://travis-ci.org/hMatoba/JavaScript-MinifyJpegAsync.svg)](https://travis-ci.org/hMatoba/JavaScript-MinifyJpegAsync)

To minify JPEG images without losing EXIF.


Demo
----
Copy this project on desktop and open example.html


Environment
-----------
TESTED(24/01/2013): FireFox, GoogleChrome, IE10, Opera.  
PhantomJS


Function
--------
    minify(image, sideLength, callback) - Resizes jpeg image propotionally. If desired size is bigger than input, 'minify' doesn't resize image.
        image - jpeg data(DataURL string or binary string)
        sideLength - int value of new image's long side length
        callback - callback function will be done with resized jpeg data(binary string) as argument.


How to Use
----------
    <input type="file" id="files" name="files[]" multiple />
    <script source="/js/MinifyJpegAsync.js" />
    <script>
    function post(data) {
        var array = [];
        for (var p=0; p<data.length; p++) {
            array[p] = data.charCodeAt(p);
        }
        var u8array = new Uint8Array(array);

        var req = new XMLHttpRequest();
        req.open("POST", "/resize", false);
        req.setRequestHeader('Content-Type', 'image/jpeg');
        req.send(u8array.buffer);
    }

    function handleFileSelect(evt) {
        var files = evt.target.files;

        for (var i = 0, f; f = files[i]; i++){
            var reader = new FileReader();
            reader.onloadend = function(e){
                MinifyJpegAsync.minify(e.target.result, 1280, post);
            };
            reader.readAsDataURL(f);
        }
    }

    document.getElementById('files').addEventListener('change', handleFileSelect, false);
    </script>


License
-------
This software is released under the MIT License, see LICENSE.txt.
