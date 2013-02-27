var Ofuda = require('./ofuda');

var defaults = {
		headerPrefix: 'Ofuda', 
		hash: 'sha1', 
		serviceLabel: 'HMAC', 
		debug: process.env.NODE_ENV == 'development'
	};

function simpleOptsExtend (originalOptions, passedOptions) {
	for (var opt in passedOptions) {
		if (typeof(originalOptions[opt]) != 'undefined') {
			originalOptions[opt] = passedOptions[opt];
		}
	}
}

module.exports = function (options, validateCredentialsFn) {
	if (typeof(options) == 'function') validateCredentialsFn = options, options = null;

	var config = defaults,
		ofuda;
	if (options) simpleOptsExtend(config, options);

	ofuda = new Ofuda(config);

    return function (req, res, next) {
			ofuda.validateHttpRequest(req, validateCredentialsFn, function(valid) {
				if (true === valid) {
					return next();
				} else {
					return next(401);
				}
			});
    };
};