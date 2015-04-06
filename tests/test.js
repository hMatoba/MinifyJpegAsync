Tests.minifyAsyncTest1 = function (finish) {
    var maxLength = 100;
    var jpegData = "data:image/jpeg;base64," + btoa(Tests.files["img1.jpg"]);
    MinifyJpegAsync.minify(jpegData, maxLength, function(data){
        var img = new Image();
        img.onload = function() {
            console.log("new image size:" + img.width + ", " + img.height);
            var longSide = img.width > img.height ? img.width : img.height;
            phestum.assertEqual(longSide, maxLength);
            finish();
        };
        var array = [];
        for (var p=0; p<data.byteLength; p++) {
            array[p] = data[p];
        }
        img.src = "data:image/jpeg;base64," + MinifyJpegAsync.encode64(array);
    });
};


Tests.minifyAsyncTest2 = function (finish) {
    var maxLength = 100;
    var jpegData = "data:image/jpeg;base64," + btoa(Tests.files["img2.jpg"]);
    MinifyJpegAsync.minify(jpegData, maxLength, function(data){
        var img = new Image();
        img.onload = function() {
            console.log("new image size:" + img.width + ", " + img.height);
            var longSide = img.width > img.height ? img.width : img.height;
            phestum.assertEqual(longSide, maxLength);
            finish();
        };
        var array = [];
        for (var p=0; p<data.byteLength; p++) {
            array[p] = data[p];
        }
        img.src = "data:image/jpeg;base64," + MinifyJpegAsync.encode64(array);
    });
};
