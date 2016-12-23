const http = require('http');
var queryString = require('querystring');
//const http = require('http');
var options = {
    //host: "nominatim.openstreetmap.org",
    //path: "/reverse?format=json&lat=29.1309476&lon=75.7239509&address=1",
    host:"www.mapquestapi.com",
    path:"/geocoding/v1/reverse?key=WCXiZ8vMVyYe5SqGMG6xOkxcDiCad3TY&location=29.149188,75.721653",
    method: 'GET',
    port:80
};
var req = http.request(options, function(res)  {
    //res.setEncoding('utf');
    var data=''
    res.on('data', function(chunk)  {
        data += chunk;
    });
    res.on('end', function()  {
        console.log('location..' + data);
    })
});



req.on('error', function (e) {
    console.log("error..........." + e.stack);
    console.error(e);
});
//req.write("hey nitya");
req.end()

//navigator.geolocation.getCurrentPosition(function(position){console.log(">>>>>>>>>",position)