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

```javascript
var http = require('http');
var ofuda = require('ofuda');

var ofuda = new Ofuda({headerPrefix:'Amz', hash: 'sha1', serviceLabel: 'AWS'});

var credentials = {accessKeyId: '44CF9590006BF252F707', accessKeySecret: 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV'};

http_options = {
  host: 'localhost',
  port: 8080,
  path: '/notify',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

ofuda.signRequest(credentials, http_options);

var req = http.request(http_options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));   
});

req.write('{"some":"thing"}');
req.end();
```

## Contributing
In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Mark Wolfe  
Licensed under the MIT license.
