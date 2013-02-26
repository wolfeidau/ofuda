var	express = require('express'),
	ofuda = require('../lib/ofuda');

module.exports = function(ofudaOptions, validateCallback) {
	var app = express();

	app.use(express.logger('dev'));
	app.use(express.bodyParser());

	// app.use(function(req, res, next) {
	// 	console.log(req, res);
	// 	next();
	// });

	app.use(ofuda.middleware(ofudaOptions, validateCallback));

	app.put('/quotes/nelson', function(req, res) {
	    res.send(200, 'Request Authenticated');
	});

	return app;
};