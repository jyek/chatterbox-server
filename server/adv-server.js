var http = require("http");
var handleRequest = require("./request-handler.js");
var httpHelpers = require('./http-helpers.js');
var url = require('url');
var fs = require('fs');
var express = require('express');
/*******************************************************************************/ 

/*******************************************************************************/ 
var app = express();
var port = 3000;
var ip = "127.0.0.1"; // <-----------
app.listen(port, ip);

var logfile = fs.createWriteStream('./some-log.log', {flags:'a'});

console.log("Listening on http://" + ip + ":" + port);

/*******************************************************************************/ 
/* CONFIG */
/*******************************************************************************/ 
var allowCrossDomain = function(req, res, next){
  res.header("access-control-allow-origin", "*");
  res.header("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("access-control-allow-headers", "content-type, accept");
  res.header("access-control-max-age", 10); // Seconds.
  res.header("Content-Type", "application/json");
  next();
}

app.configure(function(){
  app.use(express.logger({stream: logfile}));
  app.use(allowCrossDomain);
});

/*******************************************************************************/ 
/* ROUTING                                                                     */
/*******************************************************************************/ 
app.get('/classes/messages', handleRequest.handler );
app.get('/classes/room1', handleRequest.handler );
app.get('/classes/users', handleRequest.handler );
app.post('/classes/messages', handleRequest.handler);
app.post('/classes/room1', handleRequest.handler);
