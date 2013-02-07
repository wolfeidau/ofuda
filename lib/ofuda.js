/*
 * ofuda
 * https://github.com/wolfeidau/ofuda
 *
 * Copyright (c) 2012 Mark Wolfe
 * Licensed under the MIT license.
 */

var crypto = require('crypto'),
    cryptiles = require('cryptiles'),
    _ = require('lodash');


/**
 *
 * Setup ofuda with `options`.
 *
 *   - `headerPrefix` string to match for extra x- headers to be included in the signature.
 *   - `serviceLabel` string used in the Authorisation header to indicate the authenticating service.
 *   - `serviceLabel` string which dictates which hash to use, defaults to sha.
 *   - `debug` boolean which enables debug mode.
 *
 * @param options
 * @constructor
 */
function Ofuda(options) {
    options = options || {};
    this.options = options;

    this.headerPrefix(options.headerPrefix);
    this.serviceLabel(options.serviceLabel);
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
 * Locate a the value of a header via a case insensitive search, this is designed to
 * enable different clients I have observed using a either proper case or lower case
 * for header names.
 *
 * @param request
 * @param headerName
 * @return {*}
 * @private
 */
Ofuda.prototype._locateHeader = function (request, headerName) {
    var header = _.filter(_.keys(request.headers), function (key) {
        if (headerName.toLowerCase() === key.toLowerCase()) {
            return key;
        }
    }) || headerName; // this will either locate the header in the list OR just return the headerName
    return request.headers[header];
};

/**
 * Assemble the canonical string from a request which will be signed.
 *
 * @param request
 * @private
 */
Ofuda.prototype._buildCanonicalStringFromRequest = function (request) {

    return _.union([request.method,
        this._locateHeader(request, 'Content-MD5'),
        this._locateHeader(request, 'Content-Type'),
        this._locateHeader(request, 'Date')],
        _.map(this._locateHeadersByPrefix(request),function (headerName) {
            return headerName.toLowerCase() + ':' + request.headers[headerName];
        }).sort(),
        request.path || request.url //caters for node http client or server use
    ).join('\n');

};

/**
 * Any required options are checked and errors raised if they are not supplied.
 *
 * @param credentials object containing accessKeyId and accessKeySecret
 * @private
 */
Ofuda.prototype._validateRequiredOptions = function (credentials) {

    if (typeof credentials.accessKeyId == "undefined") {
        throw new Error('No accessKeyId was provided');
    }

    if (typeof credentials.accessKeySecret == "undefined") {
        throw new Error('No accessKeySecret was provided');
    }

};

/**
 * Generate a HMAC signature using the supplied canonicalString.
 *
 * @param canonicalString
 * @param credentials object containing accessKeyId and accessKeySecret
 * @return {*}
 * @private
 */
Ofuda.prototype._generateHMACSignature = function (credentials, canonicalString) {
    if (this.options.debug) {
        console.log('accessKeyId = ' + credentials.accessKeyId);
        console.log('canonicalString = ' + JSON.stringify(canonicalString));
    }
    return crypto.createHmac(this.options.hash, credentials.accessKeySecret).update(canonicalString).digest('base64');
};

/**
 * Add a hmac authorisation header to the request supplied.
 *
 * @param request
 * @param credentials object containing accessKeyId and accessKeySecret
 * @param canonicalStringCallback
 * @return {*}
 */
Ofuda.prototype.signHttpRequest = function (credentials, request, canonicalStringCallback) {

    // check required options
    this._validateRequiredOptions(credentials);

    if (canonicalStringCallback && typeof(canonicalStringCallback) === "function") {
        request.headers['Authorization'] = this.options.serviceLabel + ' ' + credentials.accessKeyId + ':' +
            this._generateHMACSignature(credentials, canonicalStringCallback(request));
    } else {
        request.headers['Authorization'] = this.options.serviceLabel + ' ' + credentials.accessKeyId + ':' +
            this._generateHMACSignature(credentials, this._buildCanonicalStringFromRequest(request));
    }

    return request;
};

/**
 * Validate the hmac authorisation header in the supplied request using the auth callback to retrieve the credentials.
 *
 * @param request
 * @param authCallback
 * @return {Boolean}
 */
Ofuda.prototype.validateHttpRequest = function (request, authCallback) {

    var authorization = this._locateHeader(request, 'Authorization');

    if (this.options.debug) {
        console.log('authorization = ' + authorization);
    }

    if (_.isString(authorization)) {

        var tokens = authorization.split(' ');

        if (tokens.length == 2) {

            var accessKeyTokens = tokens[1].split(':');

            if (accessKeyTokens.length == 2) {

                var accessKeyId = accessKeyTokens[0],
                    suppliedSignature = accessKeyTokens[1];

                var credentials = authCallback(accessKeyId);

                if (_.isObject(credentials)) {

                    var generatedSignature = this._generateHMACSignature(credentials, this._buildCanonicalStringFromRequest(request));

                    if (cryptiles.fixedTimeComparison(suppliedSignature, generatedSignature)) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
};

exports = module.exports = Ofuda;

