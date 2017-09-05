var msg = 'Hello World';
console.log(msg);

const key = '...'; // API Key
const secret = '...'; // API Private Key
// const KrakenClient = require('kraken-api');
// const kraken = new KrakenClient(key, secret);


var http = require("http");
var https = require("https");

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
getJSON = function (options, onResult) {
  console.log("rest::getJSON");

  var port = options.port == 443 ? https : http;
  var req = port.request(options, function (res) {
    var output = '';
    console.log(options.host + ':' + res.statusCode);
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      output += chunk;
    });

    res.on('end', function () {
      var obj = JSON.parse(output);
      onResult(res.statusCode, obj);
    });

    req.on('error', function (err) {
      res.send('error: ' + err.message);
    });
  });


  req.end();
};

var options = {
  host: 'api.kraken.com',
  port: 443,
  path: '/0/public/Spread',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

getJSON(options, function (statusCode, result) {
  // I could work with the result html/json here.  I could also just return it
  console.log("onResult: (" + statusCode + ")" + JSON.stringify(result));
});

