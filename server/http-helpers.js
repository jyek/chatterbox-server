exports.send = function(response, object, httpStatusCode){
  httpStatusCode = httpStatusCode || 200;
  response.end(JSON.stringify(object));
};

exports.collectData = function(request, callback){
  var data = "";
  request.on('data', function(chunk){
    data += chunk;
  });
  request.on('end', function(){
    callback(data);
  });
};


