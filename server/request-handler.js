var url = require('url');
var _ = require('underscore');
/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */

/*****************************************************************************
 Database
*****************************************************************************/
var inMemoryCounter = 0;
var inMemoryDatabase = {};
var makeBootstrapData = function(){
  var name = ['Fabrice','Justin','Rob','Cho','William'];
  var randomName = Math.floor(name.length * Math.random());
  function makeid(n){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < n; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;}
  var today = (new Date()).toISOString();
  return {
    username: name[randomName],
    text: makeid(20),
    roomname: name[randomName],
    createdAt: today,
    updatedAt: today,
    objectId: inMemoryCounter++
  };
};

var loadBoostrapData = function(n){
  for(var result=[], i = 0 ; i < n ; result[i++] = makeBootstrapData());
  inMemoryDatabase = {results: result};
  return inMemoryDatabase;
};

loadBoostrapData(2);
/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/

module.exports.handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */

  console.log("Serving request type " + request.method + " for url " + request.url);

  var statusCode = 200;

  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "application/json";

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
  var parsedUrl = url.parse(request.url, true);
  var isValidPath = parsedUrl.pathname === '/1/classes/chatterbox';
  if(request.method === 'OPTIONS'){
    /* .writeHead() tells our server what HTTP status code to send back */
    response.writeHead(statusCode, headers);
    response.end();
  } else if(request.method === 'GET' && isValidPath){
    var returnData = inMemoryDatabase.results.slice(0);
    var query = parsedUrl.query;
    if (query.order === '-createdAt'){
      returnData.reverse();
    }

    if (query.hasOwnProperty('where')){
      var where = JSON.parse(query.where);
      returnData = _.filter(returnData, function(message){
        var isEqual = true;
        for (var key in where){
          isEqual = isEqual && message[key] === where[key];
        }
        return isEqual;
      });
    }

    response.writeHead(statusCode, headers);
    response.end(JSON.stringify({results: returnData}));
  } else if(request.method === 'POST' && isValidPath){
    response.writeHead(statusCode, headers);
    var responseString = '';

    request.on('data', function(data){
      console.log(data);
      responseString += data;
    });

    request.on('end', function(){
      var aResponse = JSON.parse(responseString);
      aResponse.createdAt = (new Date()).toISOString();
      aResponse.updatedAt = aResponse.createdAt;
      aResponse.objectId = inMemoryCounter++;
      inMemoryDatabase.results.push(aResponse);
    });
    response.end(JSON.stringify({}));

  } else {
    console.log('I am in the else statuement!!'+isValidPath+request.method);
    response.end("not a good request");
  }
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
