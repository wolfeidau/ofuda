/*
 * ofuda
 * https://github.com/wolfeidau/ofuda
 *
 * Copyright (c) 2012 Mark Wolfe
 * Licensed under the MIT license.
 */

var crypto = require('crypto'),
    _ = require('lodash');

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

    // check required options
    this._validateRequiredOptions(options);

    this.headerPrefix(options.headerPrefix);
    this.serviceLabel(options.serviceLabel);
    this.accessKeyId(options.accessKeyId);
    this.accessKeySecret(options.accessKeySecret);
    this.hash(options.hash);
    this.debug(options.debug);
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
 * Hash function which is used in the hmac, this currently defaults to sha1
 *
 * @param hash
 * @return {*}
 */
Ofuda.prototype.hash = function (hash) {
    this.options.hash = hash ? hash : 'sha1';
    return this;
};

/**
 * Service label which is included in the Authorisation header before the accessKey and signature.
 *
 * @param serviceLabel
 */
Ofuda.prototype.serviceLabel = function (serviceLabel) {
    this.options.serviceLabel = serviceLabel ? serviceLabel : 'AuthHmac';
    return this;
}

/**
 * Access key identifier used in the Authorisation header.
 *
 * @param accessKeyId
 * @return {*}
 */
Ofuda.prototype.accessKeyId = function (accessKeyId) {
    this.options.accessKeyId = accessKeyId;
    return this;
};

/**
 * Access key secret which is used to sign the request.
 *
 * @param accessKeySecret
 * @return {*}
 */
Ofuda.prototype.accessKeySecret = function (accessKeySecret) {
    this.options.accessKeySecret = accessKeySecret;
    return this;
};

/**
 * Enable debug output.
 *
 * @param debug
 * @return {*}
 */
Ofuda.prototype.debug = function (debug) {
    this.options.debug = debug ? debug : false;
    return this;
};


/**
 * Filters headers which match the configured headerPrefix, this check IS case sensitive.
 *
 * @param request
 * @return {*}
 * @private
 */
Ofuda.prototype._locateHeadersByPrefix = function (request) {
    var self = this;
    return _.filter(_.keys(request.headers), function (key) {
        if (key.indexOf(self.options.headerPrefix) !== -1) {
            return key;
        }
    });
};

/**
 * Assemble the canonical string from a request which will be signed.
 *
 * @param request
 * @private
 */
Ofuda.prototype._buildCanonicalStringFromRequest = function (request) {

    return _.union([request.method,
        request.headers['Content-MD5'],
        request.headers['Content-Type'],
        request.headers['Date']],
        _.map(this._locateHeadersByPrefix(request),function (headerName) {
            return headerName.toLowerCase() + ':' + request.headers[headerName];
        }).sort(),
        request.path
    ).join('\n');

};

/**
 * Any required options are checked and errors raised if they are not supplied.
 *
 * @param options
 * @private
 */
Ofuda.prototype._validateRequiredOptions = function(options){

    if (typeof options.accessKeyId == "undefined"){
        throw new Error('No accessKeyId provided')
    }

    if (typeof options.accessKeySecret == "undefined"){
        throw new Error('No accessKeySecret provided')
    }

};

/**
 * Generate a HMAC signature using the supplied canonicalString.
 *
 * @param canonicalString
 * @return {*}
 * @private
 */
Ofuda.prototype._generateHMACSignature = function (canonicalString) {
    if (this.options.debug){
        console.log(JSON.stringify(canonicalString));
    }
    return crypto.createHmac(this.options.hash, this.options.accessKeySecret).update(canonicalString).digest('base64');
};

/**
 * Add a hmac authorisation header to the request supplied.
 *
 * @param request
 * @param canonicalStringCallback
 * @return {*}
 */
Ofuda.prototype.signHttpRequest = function (request, canonicalStringCallback) {

    if (canonicalStringCallback && typeof(canonicalStringCallback) === "function") {
        request.headers['Authorization'] = this.options.serviceLabel + ' ' + this.options.accessKeyId + ':' +
            this._generateHMACSignature(canonicalStringCallback(request));
    } else {
        request.headers['Authorization'] = this.options.serviceLabel + ' ' + this.options.accessKeyId + ':' +
            this._generateHMACSignature(this._buildCanonicalStringFromRequest(request));
    }

    return request;
};

exports = module.exports = Ofuda;

