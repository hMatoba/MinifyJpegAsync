var fs = require("fs");
var img1 = fs.read("images/img1.txt");
var img2 = fs.read("images/img2.txt");
var maxLength = 100;
var test1 = null;
var test2 = null;
eval(fs.read('MinifyJpegAsync.js'));

MinifyJpegAsync.minify(img1, maxLength, function(data){
    var img = new Image();
    img.onload = function() {
        var longSide = img.width > img.height ? img.width : img.height;
        if (longSide != maxLength) {
            console.log("Failed test1");
            test1 = false;
        } else {
            test1 = true;
        }
    };
    var array = [];
    for (var p=0; p<data.byteLength; p++) {
        array[p] = data[p];
    }
    img.src = "data:image/jpeg;base64," + MinifyJpegAsync.encode64(array);
});

MinifyJpegAsync.minify(img2, maxLength, function(data){
    var img = new Image();
    img.onload = function() {
        var longSide = img.width > img.height ? img.width : img.height;
        if (longSide != maxLength) {
            console.log("Failed test2");
            test2 = false;
        } else {
            test2 = true;
        }
    };
    var array = [];
    for (var p=0; p<data.byteLength; p++) {
        array[p] = data[p];
    }
    img.src = "data:image/jpeg;base64," + MinifyJpegAsync.encode64(array);
});

setInterval(function() {
    if (test1 == null || test2 == null){
        // pass
    } else if (test1 == false || test2 == false){
        console.log("Failed.");
        phantom.exit(1);
    } else {
        console.log("Passed all tests.");
        phantom.exit();
    }
}, 3000);
