var should = require('should'),
    _ = require('lodash');


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

/**
 *
 * Setup ofuda with `options`.
 *
 *   - `headerPrefix` string to match for extra x- headers to be included in the signature.
 *
 * @param options
 * @constructor
 */
function Ofuda(options) {
    options = options || {};
    this.options = options;
    this.headerPrefix(options.headerPrefix);
}

/**
 * Header prefix for extra x- headers to be included in the signature.
 *
 * @return {Ofuda}
 * @api public
 */

Ofuda.prototype.headerPrefix = function (prefix) {
    this.options.headerPrefix = prefix;
    return this;
};

/**
 * Filters headers which match the configured headerPrefix, as pre the amazon convention everything is lower cased.
 *
 * @param request
 * @return {*}
 * @private
 */
Ofuda.prototype._locateHeadersByPrefix = function(request){
    var self = this;
    return _.filter(_.keys(request.headers), function(key){
        if (key.toLowerCase().indexOf(self.options.headerPrefix.toLowerCase()) != -1){
            return key;
        }
    });
};

Ofuda.prototype.signHttpRequest = function (request) {

};

describe('ofuda client', function () {

    var ofuda;

    before(function () {
        ofuda = new Ofuda();
    });

    describe('options', function (done) {

        it('should have default options when not supplied', function () {

            should.not.exist(ofuda.options.headerPrefix);
        });

        it('should accept option headerPrefix', function () {

            var ofuda = new Ofuda({headerPrefix:'Amz'});
            ofuda.options.should.have.property('headerPrefix', 'Amz');

        });

        it('should accept option nonce');
    });

    describe('validateHeaders', function () {

        it('should match two x- headers in request', function () {

            ofuda = new Ofuda({headerPrefix:'Amz'});

            ofuda._locateHeadersByPrefix(put_request)
                .should.eql([ 'X-Amz-Meta-Author', 'X-Amz-Magic' ]);
        });

        it('should successfully validate headers for a request.');
    });
});