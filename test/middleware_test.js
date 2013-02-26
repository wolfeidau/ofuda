var should = require('should'),
    _ = require('lodash'),
    http = require('http'),
    Ofuda = require('../lib/ofuda');

var credentials = {accessKeyId: '44CF9590006BF252F707', accessKeySecret: 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV'};

var putRequest = {
    hostname: 'localhost',
    port: 10112,
    method:'PUT',
    path:'/quotes/nelson',
    headers:{
        'Content-MD5':'c8fdb181845a4ca6b8fec737b3581d76',
        'Content-Type':'text/html',
        'Date':'Thu, 17 Nov 2005 18:49:58 GMT',
        'X-Amz-Meta-Author':'foo@bar.com',
        'X-Amz-Magic':'abracadabra'
    }
};

var unsignedPutRequest = {
    hostname: 'localhost',
    port: 10112,
    method:'PUT',
    path:'/quotes/nelson',
    headers:{
        'Content-MD5':'c8fdb181845a4ca6b8fec737b3581d76',
        'Content-Type':'text/html',
        'Date':'Thu, 17 Nov 2005 18:49:58 GMT'
    }
};

var ofudaOptions = {
    headerPrefix: 'Amz', 
    hash: 'sha1', 
    serviceLabel: 'AWS', 
    debug: true
};

var app = require('./middleware_server')(ofudaOptions, function validateCredentials (requestAccessKeyId) {
    return credentials;
});

http.createServer(app).listen(10112, function(){
    console.log('Express test server listening on port ' + 10112);
});

describe('ofuda middleware', function () {

    describe('/quotes/nelson', function () {
        it('should reject invalid signatures', function (done) {
            var req = http.request(unsignedPutRequest, function(res) {
                res.on('end', function() {
                    res.statusCode.should.equal(401);
                    done();
                });              
            });

            req.end();
        });

        it('should validate and accept properly signed requests', function (done) {

            var ofuda = new Ofuda(ofudaOptions),
                signedRequest = ofuda.signHttpRequest(credentials, putRequest);
            // console.log('signedRequest', signedRequest);

            var req = http.request(signedRequest, function(res) {
                var body = '';
                res.on('data', function (chunk) {
                    body += chunk;
                });

                res.on('end', function() {
                    // console.log('Response', res.statusCode, body);
                    res.statusCode.should.equal(200);
                    body.should.include('Request Authenticated');
                    done();
                });              
            });

            req.end();
        });

    });

});