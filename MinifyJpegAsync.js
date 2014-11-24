/* To minify a jpeg image without loosing EXIF.
 * TESTED(24/01/2013): FireFox, GoogleChrome, IE10, Opera
 * Copyright (c) 2013 hMatoba
 * Released under the MIT license
 *
 * To minify jpeg image:
 *     minified = MinifyJpeg.minify(image, length);
 *     xhr.send(minified.buffer);
 *     enc = "data:image/jpeg;base64," + MinifyJpeg.encode64(minified);
 *     html = '<img src="' + enc + '">';
 * MinifyJpeg.minify(image, length, callback)
 *   image - image base64encoded, it can be obtained "FileReader().readAsDataURL(f)"
 *   length - the long side length of the rectangle
 *   callback - callback function will be given resized jpeg data(Uint8Array)
 * MinifyJpeg.encode64() - convert array to base64encoded string
 */

var MinifyJpegAsync = (function () {
    "use strict";
    var that = {};

    var KEY_STR = "ABCDEFGHIJKLMNOP" +
        "QRSTUVWXYZabcdef" +
        "ghijklmnopqrstuv" +
        "wxyz0123456789+/" +
        "=";
    var SOF = [192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207];

    that.minify = function (image, new_size, callback) {
        var imageObj = new Image(),
            rawImage = [],
            imageStr = "";

        if (image instanceof ArrayBuffer) {
            if (image[0] == 255 && image[1] == 216) {
                for (var i = 0; i < image.byteLength; i++) {
                    rawImage[i] = image[i];
                }
                imageStr = "data:image/jpeg;base64," + that.encode64(rawImage);
            } else {
                throw "MinifyJpeg.minify got a not JPEG data";
            }
        } else if (typeof (image) == "string") {
            if (!image.match("data:image/jpeg;base64,")) {
                throw "MinifyJpeg.minify got a not JPEG data";
            } else {
                rawImage = that.decode64(image.replace("data:image/jpeg;base64,", ""));
                imageStr = image;
            }
        } else {
            throw "First argument must be 'DataURL string' or ArrayBuffer.";
        }

        imageObj.onload = function () {
            var segments = slice2Segments(rawImage),
                NEW_SIZE = parseInt(new_size),
                size = imageSizeFromSegments(segments),
                chouhen = (size[0] >= size[1]) ? size[0] : size[1];
            var exif,
                resized,
                newImage;
            
            if (chouhen < NEW_SIZE) {
                return new Uint8Array(rawImage);
            }

            exif = getExif(segments);
            resized = resize(imageObj, segments, NEW_SIZE);

            if (exif.length) {
                newImage = insertExif(resized, exif);
            } else {
                newImage = new Uint8Array(that.decode64(resized.replace("data:image/jpeg;base64,", "")));
            }

            callback(newImage);
        };
        imageObj.src = imageStr;

    };


    that.encode64 = function (input) {
        var output = "",
            chr1, chr2, chr3 = "",
            enc1, enc2, enc3, enc4 = "",
            i = 0;

        do {
            chr1 = input[i++];
            chr2 = input[i++];
            chr3 = input[i++];

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output += KEY_STR.charAt(enc1) +
                KEY_STR.charAt(enc2) +
                KEY_STR.charAt(enc3) +
                KEY_STR.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);
        return output;
    };

    that.decode64 = function (input) {
        var output = "",
            chr1, chr2, chr3 = "",
            enc1, enc2, enc3, enc4 = "",
            i = 0,
            buf = [];

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = KEY_STR.indexOf(input.charAt(i++));
            enc2 = KEY_STR.indexOf(input.charAt(i++));
            enc3 = KEY_STR.indexOf(input.charAt(i++));
            enc4 = KEY_STR.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            buf.push(chr1);

            if (enc3 != 64) {
                buf.push(chr2);
            }
            if (enc4 != 64) {
                buf.push(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return buf;
    };

    
    var imageSizeFromSegments = function (segments) {
        var seg,
            width,
            height;
        for (var x = 0; x < segments.length; x++) {
            seg = segments[x];
            if (SOF.indexOf(seg[1]) >= 0) {
                height = seg[5] * 256 + seg[6];
                width = seg[7] * 256 + seg[8];
                break;
            }
        }
        return [width, height];
    };


    var getImageSize = function (imageArray) {
        var segments = slice2Segments(imageArray);
        return imageSizeFromSegments(segments);
    };


    var slice2Segments = function (rawImageArray) {
        var head = 0,
            segments = [];
        var length,
            endPoint,
            seg;
        
        while (1) {
            if (rawImageArray[head] == 255 && rawImageArray[head + 1] == 218) {
                break;
            }
            if (rawImageArray[head] == 255 && rawImageArray[head + 1] == 216) {
                head += 2;
            } else {
                length = rawImageArray[head + 2] * 256 + rawImageArray[head + 3];
                endPoint = head + length + 2;
                seg = rawImageArray.slice(head, endPoint);
                segments.push(seg);
                head = endPoint;
            }
            if (head > rawImageArray.length) {
                break;
            }
        }

        return segments;
    };


    var resize = function (img, segments, NEW_SIZE) {
        var size = imageSizeFromSegments(segments),
            width = size[0],
            height = size[1],
            chouhen = (width >= height) ? width : height,
            newSize = NEW_SIZE,
            scale = parseFloat(newSize) / chouhen,
            newWidth = parseInt(parseFloat(newSize) / chouhen * width),
            newHeight = parseInt(parseFloat(newSize) / chouhen * height);
        var canvas,
            ctx,
            srcImg,
            newCanvas,
            newCtx,
            destImg;
        
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        srcImg = ctx.getImageData(0, 0, width, height);

        newCanvas = document.createElement('canvas');
        newCanvas.width = newWidth;
        newCanvas.height = newHeight;
        newCtx = newCanvas.getContext("2d");
        destImg = newCtx.createImageData(newWidth, newHeight);
        bilinear(srcImg, destImg, scale);

        newCtx.putImageData(destImg, 0, 0);
        return newCanvas.toDataURL("image/jpeg");
    };


    var getExif = function (segments) {
        var seg;
        for (var x = 0; x < segments.length; x++) {
            seg = segments[x];
            if (seg[0] == 255 && seg[1] == 225) //(ff e1)
            {
                return seg;
            }
        }
        return [];
    };


    var insertExif = function (imageStr, exifArray) {
        var buf = that.decode64(imageStr.replace("data:image/jpeg;base64,", ""));
        if (buf[2] != 255 || buf[3] != 224) {
            throw "Couldn't find APP0 marker from resized image data.";
        }
        var app0_length = buf[4] * 256 + buf[5];
        var newImage = [255, 216].concat(exifArray, buf.slice(4 + app0_length));
        var jpegData = new Uint8Array(newImage);
        return jpegData;
    };


    // compute vector index from matrix one
    var ivect = function (ix, iy, w) {
        // byte array, r,g,b,a
        return ((ix + w * iy) * 4);
    };


    var inner = function (f00, f10, f01, f11, x, y) {
        var un_x = 1.0 - x;
        var un_y = 1.0 - y;
        return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y);
    };


    var bilinear = function (srcImg, destImg, scale) {
        // taking the unit square
        var srcWidth = srcImg.width;
        var srcHeight = srcImg.height;
        var srcData = srcImg.data;
        var dstData = destImg.data;
        var i, j;
        var iyv, iy0, iy1, ixv, ix0, ix1;
        var idxD, idxS00, idxS10, idxS01, idxS11;
        var dx, dy;
        var r, g, b, a;
        for (i = 0; i < destImg.height; ++i) {
            iyv = (i + 0.5) / scale - 0.5;
            iy0 = Math.floor(iyv);
            iy1 = (Math.ceil(iyv) > (srcHeight - 1) ? (srcHeight - 1) : Math.ceil(iyv));
            for (j = 0; j < destImg.width; ++j) {
                ixv = (j + 0.5) / scale - 0.5;
                ix0 = Math.floor(ixv);
                ix1 = (Math.ceil(ixv) > (srcWidth - 1) ? (srcWidth - 1) : Math.ceil(ixv));
                idxD = ivect(j, i, destImg.width);
                idxS00 = ivect(ix0, iy0, srcWidth);
                idxS10 = ivect(ix1, iy0, srcWidth);
                idxS01 = ivect(ix0, iy1, srcWidth);
                idxS11 = ivect(ix1, iy1, srcWidth);

                dx = ixv - ix0;
                dy = iyv - iy0;

                //r
                dstData[idxD] = inner(srcData[idxS00], srcData[idxS10],
                    srcData[idxS01], srcData[idxS11], dx, dy);

                //g
                dstData[idxD + 1] = inner(srcData[idxS00 + 1], srcData[idxS10 + 1],
                    srcData[idxS01 + 1], srcData[idxS11 + 1], dx, dy);

                //b
                dstData[idxD + 2] = inner(srcData[idxS00 + 2], srcData[idxS10 + 2],
                    srcData[idxS01 + 2], srcData[idxS11 + 2], dx, dy);

                //a
                dstData[idxD + 3] = inner(srcData[idxS00 + 3], srcData[idxS10 + 3],
                    srcData[idxS01 + 3], srcData[idxS11 + 3], dx, dy);

            }
        }
    };


    return that;
})();