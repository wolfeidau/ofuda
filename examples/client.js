var http = require('http');
var Ofuda = require('../lib/ofuda');

var ofuda = new Ofuda({headerPrefix: 'Amz', hash: 'sha1', serviceLabel: 'AWS', debug: true});

var credentials = {accessKeyId: '44CF9590006BF252F707', accessKeySecret: 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV'};

http_options = {
    host: 'localhost',
    port: 8080,
    path: '/notify',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-MD5': 'ee930827ccb58cd846ca31af5faa3634',
        'date': 'Thu, 07 Feb 2013 20:53:04 GMT'
    }
};

signedOptions = ofuda.signHttpRequest(credentials, http_options);

var req = http.request(signedOptions, function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
});

req.write('{"some":"thing"}');
req.end();