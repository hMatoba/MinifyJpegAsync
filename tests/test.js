Tests.minifyAsyncTest1 = function (finish) {
    var maxLength = 100;
    var jpegData = Tests.files["img1.jpg"];
    MinifyJpegAsync.minify(jpegData, maxLength, function(data){
        var img = new Image();
        img.onload = function() {
            console.log("new image size:" + img.width + ", " + img.height);
            var longSide = img.width > img.height ? img.width : img.height;
            phestum.assertEqual(longSide, maxLength);
            finish();
        };
        img.src = "data:image/jpeg;base64," + btoa(data);
    });
};


Tests.minifyAsyncTest2 = function (finish) {
    var maxLength = 100;
    var jpegData = Tests.files["img2.jpg"];
    MinifyJpegAsync.minify(jpegData, maxLength, function(data){
        var img = new Image();
        img.onload = function() {
            console.log("new image size:" + img.width + ", " + img.height);
            var longSide = img.width > img.height ? img.width : img.height;
            phestum.assertEqual(longSide, maxLength);
            finish();
        };
        img.src = "data:image/jpeg;base64," + btoa(data);
    });
};
