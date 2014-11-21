JavaScript-MinifyJpegAsync
=====================

To minify JPEG images without losing EXIF.


Demo
----
    Copy this project on desktop and open example.html


Functions
---------
    minify(image, sideLength, callback) - Resizes propotionally. Returns resized jpeg data as Uint8Array.
          If desired size is bigger than input, no manipulation is done.
        image - jpeg data(DataURL string or ArrayBuffer)
        sideLength - int value of new image's long side length
        callback - callback function will be done with resized jpeg data as argument(Uint8Array)
    encode64(data) - Convert Array to DataURL string


How to Use
----------
    <input type="file" id="files" name="files[]" multiple />
    <script source="/js/MinifyJpegAsync.js" />
    <script>
    function post(data) {
        req.open("POST", "/jpeg", false);
        req.setRequestHeader('Content-Type', 'image\/jpeg');
        req.send(data.buffer);
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
