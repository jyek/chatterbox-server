var express = require('express');
var server = express(); 
server.configure(function(){
  var httpServerRoot = __dirname + '/../client/';
  console.log(httpServerRoot);
  server.use('/', express.static(httpServerRoot));
});

server.listen(8000);
