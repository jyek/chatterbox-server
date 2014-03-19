/*******************************************************************************/ 
/* ROUTING                                                                     */
/*******************************************************************************/ 
var http = require("http");
var handleRequest = require("./request-handler.js");
var httpHelpers = require('./http-helpers.js');
var url = require('url');
var port = 3000;
var ip = "127.0.0.1";

var routes = {
  '/classes/messages':handleRequest.handler,
  '/classes/room1':handleRequest.handler,
  '/classes/users':handleRequest.handler
};

var router = function(request, response){
  console.log("Serving request type "+request.method+" for url "+request.url);
  var parsedUrl = url.parse(request.url);
  var route = routes[parsedUrl.pathname];
  if( route ){
    route(request, response);
  } else {
    httpHelpers.send(response, null, 404);
  }
};

var server = http.createServer(handleRequest.handler);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);
