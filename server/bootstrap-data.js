var counter = 0;
var database = {};
var _ = require('underscore');

makeBootstrapData = function(){
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
    objectId: counter++
  };
};

loadBootstrapData = function(n){
  for(var result = [], i = 0; i < n ; result[i++] = makeBootstrapData());
  return {results: result};
};

filters = {
  'where':function(query, theDatabase){
    var results = theDatabase.results || database.results;
    results = _.filter(results.slice(0), function(message){
      var isEqual = true;
      for (var key in query){
        isEqual = isEqual && message[key] === query[key];
      }
      return isEqual;
    });
    return {results:results};
  },
  'order':function(query, theDatabase){
    var results = theDatabase.results || database.results;
    results = results.slice(0);
    if(query === '-createdAt'){
      results.reverse();
    }
    return {results:results};
  }
};

var filter = function(query){
  var data = database ;
  if(query.where){
    data = filters['where'](JSON.parse(query.where), data);
  }
  if(query.order){
    data = filters['order'](query.order, data);
  }
  return data;
};

var add = function(data){
  data.createdAt = (new Date()).toISOString();
  data.updatedAt = data.createdAt;
  data.objectId = counter++;
  database.results.push(data);
  return data;
};

database = loadBootstrapData(5);
exports.database = database;
exports.counter = counter;
exports.filter = filter ;
exports.add = add;
