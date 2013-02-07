# ofuda

HMAC authentication module for NodeJS.

[![Build Status](https://secure.travis-ci.org/wolfeidau/ofuda.png)](http://travis-ci.org/wolfeidau/ofuda)

## Getting Started
Install the module with: `npm install ofuda`

```javascript
Ofuda = require('ofuda');

var ofuda = new Ofuda({headerPrefix:'Amz', hash: 'sha1', serviceLabel: 'AWS', accessKeyId: '44CF9590006BF252F707', accessKeySecret: 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV'});

ofuda.signHttpRequest(request); // appends a hmac authorisation header to the request
```

## Documentation
_(Coming soon)_

## Examples

Use as a client is illustrated below.

```javascript
var http = require('http');
var Ofuda = require('ofuda');

var ofuda = new Ofuda({headerPrefix:'Amz', hash: 'sha1', serviceLabel: 'AWS', debug: true});

var credentials = {accessKeyId: '44CF9590006BF252F707', accessKeySecret: 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV'};

http_options = {
    host: 'localhost',
    port: 8080,
    path: '/notify',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-MD5': 'ee930827ccb58cd846ca31af5faa3634'
    }
};

signedOptions = ofuda.signHttpRequest(credentials, http_options);

var req = http.request(signedOptions, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
});

req.write('{"some":"thing"}');
req.end();
```

Use as a server is as follows.

```javascript
var http = require('http'),
    Ofuda = require('ofuda');


var ofuda = new Ofuda({headerPrefix:'Amz', hash: 'sha1', serviceLabel: 'AWS', debug: true});

var validateCredentials = function(requestAccessKeyId){
    return {accessKeyId: requestAccessKeyId, accessKeySecret: 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV'};
}

http.createServer(function (request, response) {

    if(ofuda.validateHttpRequest(request, validateCredentials)){
        response.writeHead(200);
        response.end('Success!');
    } else {
        response.writeHead(401)
        response.end('Authorization failed!');
    }

}).listen(8080);

console.log('Server running at http://127.0.0.1:8080/');
```

## Contributing
In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Mark Wolfe  
Licensed under the MIT license.
