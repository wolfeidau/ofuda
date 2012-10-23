var should = require('should'),
    Ofuda = require('../lib/ofuda.js');




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

var putCanonicalString = "PUT\nc8fdb181845a4ca6b8fec737b3581d76\ntext/html\nThu, 17 Nov 2005 18:49:58 GMT\nx-amz-magic:abracadabra\nx-amz-meta-author:foo@bar.com\n/quotes/nelson";

var secret = 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV';

describe('ofuda client', function () {

    var ofuda;

    before(function () {
        ofuda = new Ofuda();
    });

    describe('options', function (done) {

        it('should have default options when not supplied', function () {

            should.not.exist(ofuda.options.headerPrefix);
            ofuda.options.hash.should.eql('sha1');
        });

        it('should accept and apply options', function () {

            var ofuda = new Ofuda({headerPrefix:'Amz', hash: 'sha256', accessKeyId: '1234', accessKeySecret: '5678'});
            ofuda.options.should.have.property('headerPrefix', 'Amz');
            ofuda.options.should.have.property('hash', 'sha256');
            ofuda.options.should.have.property('accessKeyId', '1234');
            ofuda.options.should.have.property('accessKeySecret', '5678');

        });

        it('should accept option nonce');
    });

    describe('validateHeaders', function () {

        it('should match two x- headers in request', function () {

            ofuda = new Ofuda({headerPrefix:'Amz'});

            ofuda._locateHeadersByPrefix(put_request)
                .should.eql([ 'X-Amz-Meta-Author', 'X-Amz-Magic' ]);
        });

        it('should generate a matching canonical string for given request', function(){

            ofuda.headerPrefix('Amz');

            ofuda._buildCanonicalStringFromRequest(put_request)
                .should.eql(putCanonicalString);
        });

        it('should generate a matching signature for the given string', function(){
            ofuda.headerPrefix('Amz');
            ofuda.accessKeySecret('OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV');
            ofuda._generateHMACSignature(putCanonicalString).should.eql('jZNOcbfWmD/A/f3hSvVzXZjM2HU=');
        });

        it('should successfully sign a request', function(){
            var ofuda = new Ofuda({headerPrefix:'Amz', hash: 'sha1', serviceLabel: 'AWS', accessKeyId: '44CF9590006BF252F707', accessKeySecret: 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV'});

            ofuda.signHttpRequest(put_request).headers
                .should.have.property('Authorization', 'AWS 44CF9590006BF252F707:jZNOcbfWmD/A/f3hSvVzXZjM2HU=')
        });
    });
});