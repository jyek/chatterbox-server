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
// app.use(express.logger({stream: logfile}));;

console.log("Listening on http://" + ip + ":" + port);

/*******************************************************************************/ 
/* ROUTING                                                                     */
/*******************************************************************************/ 
app.get('/classes/messages', handleRequest.handler );
app.get('/classes/room1', handleRequest.handler );
app.get('/classes/users', handleRequest.handler );
