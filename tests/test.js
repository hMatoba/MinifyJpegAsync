Tests.minifyAsyncTestExifRemovalEvenWhenImageIsNotResizedWithImg1 = function (finish) {
    var maxLength = 300;
    var jpegData = Tests.files["img1.jpg"];
    var initialImg = new Image();
    initialImg.onload = function() {
        var btoajpegData = btoa(jpegData);
        MinifyJpegAsync.minify(jpegData, maxLength, 1, true, function(data){
            var img = new Image();
            var plainQualityRawBinaryJpegLengthWithExif = data.length;
            img.onload = function() {
                var plainQualityJpeg = btoa(data);
                console.log("Initial base64 jpeg length "+ btoajpegData.length + ", new length = " + plainQualityJpeg.length);
                console.log("new image size:" + img.width + ", " + img.height);
                var longSide = img.width > img.height ? img.width : img.height;
                phestum.assertEqual(longSide, maxLength);
                phestum.assertEqual(img.height, 158);
                MinifyJpegAsync.minify(jpegData, maxLength, 1, false, function(data){
                    var imgSansExif = new Image();
                    imgSansExif.onload = function() {
                        var plainQualityJpegWithoutExif = btoa(data);
                        var plainQualityRawBinaryJpegLengthWithoutExif = data.length;
                        console.log("Initial base64 jpeg length " + btoajpegData.length + ", plain quality jpeg length= " + plainQualityJpeg.length + ", plain quality jpeg without exif length= " + plainQualityJpegWithoutExif.length);
                        console.log("new image size:" + imgSansExif.width + ", " + imgSansExif.height);
                        var longSide = imgSansExif.width > imgSansExif.height ? imgSansExif.width : imgSansExif.height;
                        phestum.assertEqual(longSide, maxLength);
                        //Exif length is 822 + 2 (jpeg segment marker)
                        phestum.assertEqual(plainQualityRawBinaryJpegLengthWithExif,plainQualityRawBinaryJpegLengthWithoutExif + 822 + 2);
                        //Aspect ratio is kept
                        phestum.assertEqual(imgSansExif.height, 158);
                        finish();
                    }
                    imgSansExif.src = "data:image/jpeg;base64," + btoa(data);
                });
            }
            img.src = "data:image/jpeg;base64," + btoa(data);
        });
        console.log("Initial image size:" + initialImg.width + ", " + initialImg.height);
    }
    initialImg.src="data:image/jpeg;base64," + btoa(jpegData);
};

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
            phestum.assertEqual(reducedQualityJpeg.length, 2956);
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
