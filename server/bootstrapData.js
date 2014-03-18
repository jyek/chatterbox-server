var counter = 0;
var database = {};

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

database = loadBootstrapData(5);
exports.database = database;
exports.counter = counter;
