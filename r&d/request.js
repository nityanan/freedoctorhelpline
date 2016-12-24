/**
 * Created by nitya on 24/12/16.
 */
var request = require('request');
request('http://104.211.244.9/', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML page.
    }
})