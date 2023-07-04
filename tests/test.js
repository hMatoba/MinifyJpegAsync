Tests.minifyAsyncTestCroppingDoneAndAspectRatioIsOkWithImg1 = function (finish) {
    var maxLength = 100;
    var jpegData = Tests.files["img1.jpg"];
    var initialImg = new Image();
    initialImg.onload = function() {
        var btoajpegData = btoa(jpegData);
        MinifyJpegAsync.minify(jpegData, maxLength, 1, true, function(data){
            var img = new Image();
            img.onload = function() {
                var plainQualityJpeg = btoa(data);
                console.log("Initial base64 jpeg length "+ btoajpegData.length + ", new length = " + plainQualityJpeg.length);
                console.log("new image size:" + img.width + ", " + img.height);
                var longSide = img.width > img.height ? img.width : img.height;
                phestum.assertEqual(longSide, maxLength);
                //Aspect ratio is kept
                phestum.assertEqual(img.height, Math.round(initialImg.height/initialImg.width*longSide) - 1);
                finish();
            };
            img.src = "data:image/jpeg;base64," + btoa(data);
        });
    }
    initialImg.src="data:image/jpeg;base64," + btoa(jpegData);
};


Tests.minifyAsyncTestCroppingDoneAndAspectRatioIsOkWithImg2 = function (finish) {
    var maxLength = 100;
    var jpegData = Tests.files["img2.jpg"];
    var btoajpegData = btoa(jpegData);
    MinifyJpegAsync.minify(jpegData, maxLength, 1, true, function(data){
        var img = new Image();
        img.onload = function() {
            var plainQualityJpeg = btoa(data);
            console.log("Initial base64 jpeg length "+ btoajpegData.length + ", new length = " + plainQualityJpeg.length);
            console.log("new image size:" + img.width + ", " + img.height);
            var longSide = img.width > img.height ? img.width : img.height;
            phestum.assertEqual(btoajpegData.length, 2764);
            phestum.assertEqual(plainQualityJpeg.length, 1100);
            phestum.assertEqual(longSide, maxLength);
            finish();
        };
        img.src = "data:image/jpeg;base64," + btoa(data);
    });
};

Tests.minifyAsyncTestMaxQualityHasSameSizeGainThanJustCropping = function (finish) {
    var maxLength = 100;
    var jpegData = Tests.files["img2.jpg"];
    var btoajpegData = btoa(jpegData);
    MinifyJpegAsync.minify(jpegData, maxLength, 1, true, function(data){
        var img = new Image();
        img.onload = function() {
            var plainQualityJpeg = btoa(data);
            console.log("Initial base64 jpeg length "+ btoajpegData.length + ", new length = " + plainQualityJpeg.length);
            console.log("new image size:" + img.width + ", " + img.height);
            var longSide = img.width > img.height ? img.width : img.height;
            phestum.assertEqual(btoajpegData.length, 2764);
            phestum.assertEqual(plainQualityJpeg.length, 1100);
            phestum.assertEqual(longSide, maxLength)
            finish();
        };
        img.src = "data:image/jpeg;base64," + btoa(data);
    });
};

Tests.minifyAsyncTestHalfQualityOnBlackImageHasNoSizeGainThanJustCropping  = function (finish) {
    var maxLength = 100;
    var jpegData = Tests.files["img2.jpg"];
    var btoajpegData = btoa(jpegData);
    MinifyJpegAsync.minify(jpegData, maxLength, 0.5, true, function(data){
        var img = new Image();
        img.onload = function() {
            var reducedQualityJpeg = btoa(data);
            console.log("Initial base64 jpeg length "+ btoajpegData.length + ", new length = " + reducedQualityJpeg.length);
            console.log("new image size:" + img.width + ", " + img.height);
            var longSide = img.width > img.height ? img.width : img.height;
            phestum.assertEqual(btoajpegData.length, 2764);
            phestum.assertEqual(reducedQualityJpeg.length, 1100);
            phestum.assertEqual(longSide, maxLength)
            finish();
        };
        img.src = "data:image/jpeg;base64," + btoa(data);
    });
};

Tests.minifyAsyncTestHalfQualityOnComplexImageHasGreatSizeGainAgainstJustCropping = function (finish) {
    var maxLength = 100;
    var jpegData = Tests.files["img1.jpg"];
    var btoajpegData = btoa(jpegData);
    MinifyJpegAsync.minify(jpegData, maxLength, 0.5, true, function(data){
        var img = new Image();
        img.onload = function() {
            var reducedQualityJpeg = btoa(data);
            console.log("Initial base64 jpeg length "+ btoajpegData.length + ", new length = " + reducedQualityJpeg.length);
            console.log("new image size:" + img.width + ", " + img.height);
            var longSide = img.width > img.height ? img.width : img.height;
            phestum.assertEqual(btoajpegData.length, 40192);
            phestum.assertEqual(reducedQualityJpeg.length, 2928);
            phestum.assertTrue(reducedQualityJpeg.length + (0.5*7868) < 7868);
            phestum.assertEqual(longSide, maxLength)
            finish();
        };
        img.src = "data:image/jpeg;base64," + btoa(data);
    });
};

Tests.minifyAsyncTestHalfQualityAndExifSuppressionOnComplexImageHasGreatestSizeGainAgainstJustCroppingAndQualityDowngrading = function (finish) {
    var maxLength = 100;
    var jpegData = Tests.files["img1.jpg"];
    var btoajpegData = btoa(jpegData);
    MinifyJpegAsync.minify(jpegData, maxLength, 0.5, false, function(data){
        var img = new Image();
        img.onload = function() {
            var reducedQualityJpeg = btoa(data);
            console.log("Initial base64 jpeg length "+ btoajpegData.length + ", new length = " + reducedQualityJpeg.length);
            console.log("new image size:" + img.width + ", " + img.height);
            var longSide = img.width > img.height ? img.width : img.height;
            phestum.assertEqual(btoajpegData.length, 40192);
            phestum.assertEqual(reducedQualityJpeg.length, 1856);
            phestum.assertTrue(reducedQualityJpeg.length + (0.5*7868) < 7868);
            phestum.assertEqual(longSide, maxLength)
            finish();
        };
        img.src = "data:image/jpeg;base64," + btoa(data);
    });
};
