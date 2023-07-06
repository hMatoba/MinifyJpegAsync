/* To minify a jpeg image without loosing EXIF.
 * TESTED(24/01/2013): FireFox, GoogleChrome, IE10, Opera
 * Copyright (c) 2013 hMatoba
 * Released under the MIT license
 */

var MinifyJpegAsync = (function () {
    "use strict";
    var that = {};

    /**
     *
     * @param image - jpeg data(DataURL string or binary string)
     * @param new_size - int value of new image's long side length
     * @param quality A float between 0 and 1 depending of the picture quality you want. 1 is the best quality available from source.
     * @param keepExif true if you want to keep exif data
     * @param callback - callback function will be done with resized jpeg data(binary string) as argument.
     */
    that.minify = function (image, new_size, quality, keepExif, callback) {
        var imageObj = new Image(),
          rawImage = [],
          imageStr = "";

        if (typeof (image) === "string") {
            if (image.match("data:image/jpeg;base64,")) {
                rawImage = that.decode64(image.replace("data:image/jpeg;base64,", ""));
                imageStr = image;
            } else if (image.match("\xff\xd8")) {
                for (var p=0; p<image.length; p++) {
                    rawImage[p] = image.charCodeAt(p);
                }
                imageStr = "data:image/jpeg;base64," + btoa(image);
            } else {
                throw "MinifyJpeg.minify got a not JPEG data";
            }
        } else {
            throw "First argument must be 'string'.";
        }

        imageObj.onload = function () {
            var segments = slice2Segments(rawImage),
              size = imageSizeFromSegments(segments),
              chouhen = (size[0] >= size[1]) ? size[0] : size[1];
            var exif,
              resized,
              newImage;

            if (chouhen <= new_size) {
                exif = getExif(segments);
                resized = resize(imageObj, size[0], size[1], chouhen, quality);
                if (exif.length > 0 && keepExif) {
                    newImage = insertExif(resized, exif);
                } else {
                    newImage = atob(resized.replace("data:image/jpeg;base64,", ""));
                }
            } else {
                exif = getExif(segments);
                resized = resize(imageObj, size[0], size[1], new_size, quality);
                if (exif.length > 0 && keepExif) {
                    newImage = insertExif(resized, exif);
                } else {
                    newImage = atob(resized.replace("data:image/jpeg;base64,", ""));
                }
            }
            callback(newImage);
        };
        imageObj.src = imageStr;

    };

    that.decode64 = function (input) {
        var binStr = atob(input);
        var buf = [];
        for (var p=0; p<binStr.length; p++) {
            buf[p] = binStr.charCodeAt(p);
        }
        return buf;
    };

    /**
     * @param seg segments of the jpeg image. Markers delimited
     * @return {*[ width, height ]}
     */
    var imageSizeFromSegments = function (seg) {
        var SOF = [192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207];
        for (var x = 0; x < seg.length; x++) {
            if (SOF.indexOf(seg[x][1]) >= 0) {
                return [
                  seg[x][7] * 256 + seg[x][8] /*width*/,
                  seg[x][5] * 256 + seg[x][6] /*height*/
                ];
            }
        }
    };


    var slice2Segments = function (rawImageArray) {
        var
          head = 0,
          segments = [],
          length,
          endPoint;
        while (1) {
            if (rawImageArray[head] === 255 && rawImageArray[head + 1] === 218) { //SOS: Start of Scan
                break;
            }
            if (rawImageArray[head] === 255 && rawImageArray[head + 1] === 217) { //EOI: End of image
                break;
            }
            if (rawImageArray[head] === 255 && rawImageArray[head + 1] === 216) { //SOI: Start of image
                head += 2;
            } else {
                length = rawImageArray[head + 2] * 256 + rawImageArray[head + 3];
                endPoint = head + length + 2;
                segments.push(rawImageArray.slice(head, endPoint));
                head = endPoint;
            }
            if (head > rawImageArray.length) {
                break;
            }
        }

        return segments;
    };


    var resize = function (img, oldWidth, oldHeight, new_size, quality) {
        var chouhen = (oldWidth >= oldHeight) ? oldWidth : oldHeight,
          scale = new_size/ chouhen,
          newWidth = new_size / chouhen * oldWidth,
          newHeight = new_size / chouhen * oldHeight;
        var canvas,
          ctx,
          srcImg,
          newCanvas,
          newCtx,
          destImg;

        var dpr = window.devicePixelRatio;
        canvas = document.createElement('canvas');
        canvas.width = oldWidth * dpr;
        canvas.height = oldHeight * dpr;
        ctx = canvas.getContext("2d", {alpha: false, desynchronized: true, depth: false, stencil: false, antialias: true});
        ctx.imageSmoothingEnabled = true;
        ctx.scale(dpr,dpr);
        ctx.drawImage(img, 0, 0);
        srcImg = ctx.getImageData(0, 0, oldWidth, oldHeight);

        newCanvas = document.createElement('canvas');
        newCanvas.width = newWidth * dpr;
        newCanvas.height = newHeight * dpr;
        newCtx = newCanvas.getContext("2d", {alpha: false, desynchronized: true, depth: false, stencil: false, antialias: true});
        newCtx.imageSmoothingEnabled = true;
        newCtx.scale(dpr,dpr);
        destImg = newCtx.createImageData(newWidth, newHeight);
        if (scale < 1) {
            bilinear(srcImg, destImg, scale);
            newCtx.putImageData(destImg, 0, 0);
        } else {
            newCtx.putImageData(srcImg, 0, 0);
        }
        return newCanvas.toDataURL("image/jpeg", quality);
    };


    var getExif = function (seg) {
        for (var x = 0; x < seg.length; x++) {
            if (seg[x][0] === 255 && seg[x][1] === 225) //(ff e1: Exif Marker)
            {
                return seg[x];
            }
        }
        return [];
    };


    var insertExif = function (imageStr, exifArray) {
        var buf = that.decode64(imageStr.replace("data:image/jpeg;base64,", ""));
        if (buf[2] !== 255 || buf[3] !== 224) {
            throw "Couldn't find APP0 marker from resized image data.";
        }
        var newImage = [255,216,255,224,0,16].concat(buf.slice(6, 6 + 12), [0,0]/*reset thumbnail sizes*/, buf.slice(6+12, buf.length-2),exifArray, [255,217] /*EOI*/);
        var jpegData = "";
        for (var p=0; p<newImage.length; p++) {
            jpegData += String.fromCharCode(newImage[p]);
        }
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
        for (i = 0; i < destImg.height; i++) {
            iyv = (i + 0.5) / scale - 0.5;
            iy0 = Math.floor(iyv);
            iy1 = (Math.ceil(iyv) > (srcHeight - 1) ? (srcHeight - 1) : Math.ceil(iyv));
            for (j = 0; j < destImg.width; j++) {
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