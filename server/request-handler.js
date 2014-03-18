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
  // random message generator from twittler @ hackreactor
  var opening = ['just', '', '', '', '', 'ask me how i', 'completely', 'nearly', 'productively', 'efficiently', 'last night i', 'the president', 'that wizard', 'a ninja', 'a seedy old man'];
  var verbs = ['drank', 'drunk', 'deployed', 'got', 'developed', 'built', 'invented', 'experienced', 'fought off', 'hardened', 'enjoyed', 'developed', 'consumed', 'debunked', 'drugged', 'doped', 'made', 'wrote', 'saw'];
  var objects = ['my', 'your', 'the', 'a', 'my', 'an entire', 'this', 'that', 'the', 'the big', 'a new form of'];
  var nouns = ['cat', 'koolaid', 'system', 'city', 'worm', 'cloud', 'potato', 'money', 'way of life', 'belief system', 'security system', 'bad decision', 'future', 'life', 'pony', 'mind'];
  var tags = ['#techlife', '#burningman', '#sf', 'but only i know how', 'for real', '#sxsw', '#ballin', '#omg', '#yolo', '#magic', '', '', '', ''];

  // utility function from twittler @ hackreactor
  var randomElement = function(array){
    var randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  };

  var randomMessage = function(){
    return [randomElement(opening), randomElement(verbs), randomElement(objects), randomElement(nouns), randomElement(tags)].join(' ');
  };
  var names = ['Fabrice','Justin','Rob','Cho','William'];
  var rooms = ['Rain','Rainbow','Moon','Sun','Stars','Comets','Planets'];
  var randomName = randomElement(names);
  var randomRoom = randomElement(rooms);
  var today = (new Date()).toISOString();

  return {
    username: randomName,
    text: randomMessage(),
    roomname: randomRoom,
    createdAt: today,
    updatedAt: today,
    objectId: inMemoryCounter++
  };
};

var loadBootstrapData = function(n){
  for(var result = [], i = 0; i < n ; result[i++] = makeBootstrapData());
  inMemoryDatabase = {results: result};
  return inMemoryDatabase;
};

loadBootstrapData(5);
/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/

exports.handler = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */

  console.log("Serving request type " + request.method + " for url " + request.url);

  var statusCode = 404;
  var result = {results:[]};
  var parsedUrl = url.parse(request.url, true);
  var thePath = parsedUrl.pathname;
  var theMethod = request.method;
  var query = parsedUrl.query;
  var returnData = inMemoryDatabase.results.slice(0);

  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "application/json";

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
  if(theMethod === 'OPTIONS'){
    statusCode = 200;
  } else if(theMethod === 'GET' && thePath === '/classes/messages'){
    statusCode = 200;
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
    result['results'] = returnData;
  } else if(theMethod === 'GET' && thePath === '/classes/room1'){
    statusCode = 200;
    result = inMemoryDatabase;
  } else if(theMethod === 'POST' && (thePath === '/classes/messages' || thePath === '/classes/room1')){
    statusCode = 201;
    var responseString = '';

    request.on('data', function(data){
      responseString += data;
    });

    request.on('end', function(){
      var aResponse = JSON.parse(responseString);
      aResponse.createdAt = (new Date()).toISOString();
      aResponse.updatedAt = aResponse.createdAt;
      aResponse.objectId = inMemoryCounter++;
      inMemoryDatabase.results.push(aResponse);
    });
    result = inMemoryDatabase;
  }
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(result));
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
