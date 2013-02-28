var should = require('should'),
    _ = require('lodash'),
    Ofuda = require('../lib/ofuda.js');

var putRequest = {
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

var signedPutRequest = {
    method:'PUT',
    path:'/quotes/nelson',
    headers:{
        'Content-MD5':'c8fdb181845a4ca6b8fec737b3581d76',
        'Content-Type':'text/html',
        'Date':'Thu, 17 Nov 2005 18:49:58 GMT',
        'X-Amz-Meta-Author':'foo@bar.com',
        'X-Amz-Magic':'abracadabra',
        'Authorization': 'AWS 44CF9590006BF252F707:jZNOcbfWmD/A/f3hSvVzXZjM2HU='
    }
};

var unsignedPutRequest = {
    method:'PUT',
    path:'/quotes/nelson',
    headers:{
        'Content-MD5':'c8fdb181845a4ca6b8fec737b3581d76',
        'Content-Type':'text/html',
        'Date':'Thu, 17 Nov 2005 18:49:58 GMT'
    }
};

var putCanonicalString = "PUT\nc8fdb181845a4ca6b8fec737b3581d76\ntext/html\nThu, 17 Nov 2005 18:49:58 GMT\nx-amz-magic:abracadabra\nx-amz-meta-author:foo@bar.com\n/quotes/nelson";

var secret = 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV';

var credentials = {accessKeyId: '44CF9590006BF252F707', accessKeySecret: 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV'};

describe('ofuda client', function () {

    var ofuda;


    before(function () {
        ofuda = new Ofuda();
    });

    describe('options', function () {

        it('should have default options when not supplied', function () {

            should.not.exist(ofuda.options.headerPrefix);
            ofuda.options.hash.should.eql('sha1');
        });

        it('should accept and apply options', function () {

            var ofuda = new Ofuda({headerPrefix:'Amz', hash: 'sha256'});
            ofuda.options.should.have.property('headerPrefix', 'Amz');
            ofuda.options.should.have.property('hash', 'sha256');

        });

        // TODO: implement.  commenting out to prevent 1 pending test displayed in npm test
        // it('should accept option nonce');
    });

    describe('validateHeaders', function () {

        it('should match two x- headers in request', function () {

            ofuda = new Ofuda({headerPrefix:'Amz'});

            ofuda._locateHeadersByPrefix(putRequest)
                .should.eql([ 'X-Amz-Meta-Author', 'X-Amz-Magic' ]);
        });

        it('should generate a matching canonical string for given request', function(){

            ofuda.headerPrefix('Amz');

            ofuda._buildCanonicalStringFromRequest(putRequest)
                .should.eql(putCanonicalString);
        });

        it('should generate a matching signature for the given string', function(){

            ofuda = new Ofuda({headerPrefix:'Amz', debug: true});

            // accessKeyId: '44CF9590006BF252F707', accessKeySecret: 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV',
            ofuda._generateHMACSignature(credentials, putCanonicalString).should.eql('jZNOcbfWmD/A/f3hSvVzXZjM2HU=');
        });

        it('should successfully sign a request', function(){
            var ofuda = new Ofuda({headerPrefix:'Amz', hash: 'sha1', serviceLabel: 'AWS'});

            ofuda.signHttpRequest(credentials, putRequest).headers
                .should.have.property('Authorization', 'AWS 44CF9590006BF252F707:jZNOcbfWmD/A/f3hSvVzXZjM2HU=');
        });

        it('should invoke callback when passed to sign request', function(){
            var ofuda = new Ofuda({headerPrefix:'Amz', hash: 'sha1', serviceLabel: 'AWS'});

            ofuda.signHttpRequest(credentials, putRequest, function(request){

                return [request.headers['Content-Type'],'',
                    request.headers['Date'],request.path].join('\n');

            }).headers
                .should.have.property('Authorization', 'AWS 44CF9590006BF252F707:65YvMOUL28EjZg00fMoZ+YaEOPM=');

        });

        it('should provide backwards compatability to sync validate', function(){
            ofuda.validateHttpRequest(signedPutRequest, function(accessKeyId){
                return credentials;
            }).should.eql(true);
        });

        it('should validate the signature of a request', function(){
            ofuda.validateHttpRequestSync(signedPutRequest, function(accessKeyId){
                return credentials;
            }).should.eql(true);
        });

        it('should validate async and provide credentials async', function(done){
            ofuda.validateHttpRequest(signedPutRequest, function(accessKeyId, callback){
                process.nextTick(function() {
                    callback(credentials);
                });
            }, function(valid) {
                if (true !== valid) throw new Error('Not true');
                done();
            });
        });

        it('should validate async and provide credentials sync', function(done){
            ofuda.validateHttpRequest(signedPutRequest, function(accessKeyId){
                return credentials;
            }, function(valid) {
                if (true !== valid) throw new Error('Not true');
                done();
            });
        });

        it('should error if authCallback returns and async callbacks', function(){
            var noop = function(){};
            (function() {
                ofuda.validateHttpRequest(signedPutRequest, function(accessKeyId, callback){
                    callback(credentials);
                    return credentials;
                }, noop);
            }).should.throwError('credentials callback called multiple times');
        });

        it('throws an error if async callback called multiple times', function(){
            var noop = function(){};
            (function() {
                ofuda.validateHttpRequest(signedPutRequest, function(accessKeyId, callback){
                    callback(credentials);
                    callback(credentials);
                }, noop);
            }).should.throwError('credentials callback called multiple times');
        });

        it('should not bomb out if the Authorisation header is missing', function(){
            ofuda.validateHttpRequest(unsignedPutRequest, function(accessKeyId){
                return credentials;
            }).should.eql(false);
        });

        it('should not bomb out with bad Authorisation header', function(){

            var badPutRequest = unsignedPutRequest;

            badPutRequest.headers['Authorization'] = 'SomeJunk';

            ofuda.validateHttpRequest(unsignedPutRequest, function(accessKeyId){
                return credentials;
            }).should.eql(false);
        });
    });
});