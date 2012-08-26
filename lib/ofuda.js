/*
 * ofuda
 * https://github.com/wolfeidau/ofuda
 *
 * Copyright (c) 2012 Mark Wolfe
 * Licensed under the MIT license.
 */

/*
 h = hmac.new("OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV",
 "PUT\nc8fdb181845a4ca6b8fec737b3581d76\ntext/html\nThu, 17 Nov 2005 18:49:58 GMT\nx-amz-magic:abracadabra\nx-amz-meta-author:foo@bar.com\n/quotes/nelson",
 sha)
 */

var crypto = require('crypto');

///--- Globals

///--- Helpers

function reduceHeaders(headers, headers_to_omit) {
    var filtered_keys = [];
    var res = {};

    // Separate keys and filter them
    for (var k in headers){
        if (headers_to_omit.indexOf(k) === -1) {
            filtered_keys.push(k);
        }
    }

    for (var i in filtered_keys.sort()) {
        res[filtered_keys[i]] = headers[filtered_keys[i]];
    }
    return res;
}

function signRequest(request, key, secret){

    var headers_to_omit = ['Content-Md5', 'Content-Type', 'Date'];

    var mac = crypto.createHmac('sha1', secret);

    mac.update(request.method + '\n')
        .update(request.headers['Content-Md5'] + '\n')// get the Content-MD5 header if it exists.
        .update(request.headers['Content-Type'] + '\n')// get the Content-Type header if it exists.
        .update(request.headers['Date'] + '\n'); // get the Date header if it exists.

    var filtered_headers = reduceHeaders(request.headers, headers_to_omit);

    for (var header in filtered_headers) {
        mac.update(header.toLowerCase() + ':' + filtered_headers[header] + '\n');
    }

    mac.update(request.path);

    // update the Authorization header
    request.headers['Authorization'] = 'AuthHMAC ' + key + ':' +   mac.digest('base64');
}

exports.signRequest = signRequest;

