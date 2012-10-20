var ofuda = require('../lib/ofuda.js');

/*

 */

/*
 BASED ON http://s3.amazonaws.com/doc/s3-developer-guide/RESTAuthentication.html
 */

var hmac_credentials = {
    key:'44CF9590006BF252F707',
    secret:'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV'
};

var put_request = {
    method:'PUT',
    path:'/quotes/nelson',
    headers:{
        'Content-Md5':'c8fdb181845a4ca6b8fec737b3581d76',
        'Content-Type':'text/html',
        'Date':'Thu, 17 Nov 2005 18:49:58 GMT',
        'X-Amz-Meta-Author':'foo@bar.com',
        'X-Amz-Magic':'abracadabra'
    }
};

exports['ofuda'] = {
    setUp:function (done) {
        // setup here
        done();
    },
    'authorization header should be correctly generated':function (test) {

        test.expect(1);

        ofuda.signRequest(put_request, hmac_credentials.key, hmac_credentials.secret);

        test.equal(put_request.headers['Authorization'], 'AuthHMAC 44CF9590006BF252F707:jZNOcbfWmD/A/f3hSvVzXZjM2HU=');

        test.done();
    }
};
