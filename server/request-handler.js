/*******************************************************************************/
/* REQUEST HANDLER */
/*******************************************************************************/
var _ = require('underscore');
var memory = require('./bootstrap-data.js');
var httpHelpers = require('./http-helpers.js')
var url = require('url');

var respondGET = function(request, response){
  var query = url.parse(request.url, true).query;
  var data = memory.filter(query) ; 
  httpHelpers.send(response, data); 
};

var respondPOST = function(request, response){
  // Listen for chunks and assemble them
  httpHelpers.collectData(request, function(data){
    memory.add(JSON.parse(data));
    httpHelpers.send(response, null, 201);
  });
};

var respondOPTIONS = function(request, response){
  httpHelpers.send(response);
};

var actions = {
  'GET':respondGET,
  'POST':respondPOST,
  'OPTIONS':respondOPTIONS
};

exports.handler = function(request, response) {
  var action = actions[request.method];
  if(action){
    action(request, response);
  } else {
    httpHelpers.send(response, null, 404);
  }
};
