// This function is anonymous, is executed immediately and
// the return value is assigned to QueryString!
var GetParams = function () {
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
      // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  }
    return query_string;
}();

// Backbone events
var events = _.clone(Backbone.Events);

/* Loading View */
var LoadingView = function(){
  this.loading = false;
};

LoadingView.prototype.startLoading = function(){
  if (!this.loading){
    $('.spinner').show();
    this.loading = true;
  }
};

LoadingView.prototype.stopLoading = function(){
  $('.spinner').hide();
  this.loading = false;
};

/* Friend View */
var FriendView = function(){
};

FriendView.prototype.updateFriends = function(context){
  $('.friends').empty();
  _.each(context.friends, function(v, friendname){
    var $f = $('<span class="friend-name"></span>');
    $f.text(friendname);
    $('.friends').append($f);
  });
};

/* Room View */
var RoomView = function(){
};

RoomView.prototype.refresh = function(context){
  var roomnames = context.roomnames;
  $('.chatrooms').empty();
  for (var roomname in roomnames){
    if (roomname !== ""){
      $room = $('<span class="chatroom"></span>');
      $room.text(roomname);
      $('.chatrooms').append($room);
      $('span.chatroom').on('click', function(){
        context.changeRoom( $(this).text() );
      });
    }
  }
};

RoomView.prototype.setCurrentRoom = function(roomname){
  if (roomname === ''){
    $('.chat-roomname').text('All Rooms');
  } else {
    $('.chat-roomname').text(roomname);
  }
};

/* Chat View */
var ChatView = function(){
};

ChatView.prototype.addMessage = function(msg, context){
  if (!context.roomnames.hasOwnProperty(msg.roomname)){
    context.roomnames[msg.roomname] = true;
  }

  // append results
  $msgWrap = $('<div class="msg-wrap"></div>');

  $msgText = $('<div class="msg-text"></div>');
  if (context.friends.hasOwnProperty(msg.username)){
    $msgText.attr('class', 'bold');
  }
  $msgText.text(msg.text);

  $msgUsername = $('<div class="msg-username"></div>');
  $msgUsername.text(msg.username);
  $msgUsername.on('click', function(){
    var friend = $(this).text();
    context.friends[friend] = true;
    context.friendView.updateFriends(context);
    context.fetch({data: $.proxy(context.fetchData, context) });
  });

  $msgRoomname = $('<div class="msg-roomname"></div>');
  $msgRoomname.text('(' + msg.roomname + ')');
  $msgRoomname.on('click', function(){
    var room = $(this).text().replace(/[()]/g,'');
    context.changeRoom(room);
  });

  $clearfix = $('<div class="clearfix"></div>');

  // create message
  $msgWrap.append($msgUsername);
  $msgWrap.append($msgRoomname);
  $msgWrap.append($msgText);
  $msgWrap.append($clearfix);

  // attach to document
  $chat.append($msgWrap);
};

/* App */
var App = function() {
  // RESTful API
  this.server = 'http://127.0.0.1:3000/classes/messages';

  // Current roomname
  this.roomname = '';

  // Object that contains roomnames and friends
  this.roomnames = {};
  this.friends = {};

  // Create views
  this.loadingView = new LoadingView();
  this.friendView = new FriendView();
  this.roomView = new RoomView();
  this.chatView = new ChatView();

  // Events
  events.on('fetch:success', this.displayMessages, this);
};

App.prototype.init = function(){
  var context = this;

  // get and update username
  context.username = GetParams.username;
  $('.username h4').text(this.username);

  // gets new messages
  context.changeRoom('');

  // periodically get new messages
  setInterval($.proxy(context.fetch, context, {data: $.proxy(context.fetchData, context)}), 5000);

  // return home
  $('.chat-home').on('click', function(){
    context.changeRoom('');
  });

  // handles posting new message
  $('.onclick-submit').on('click', function(){
    var msg = $('.my-message').val();
    var room = $('.my-roomname').val();
    $('.my-message').val('');
    $('.my-roomname').val('');
    context.send(msg, room);
  });
};

App.prototype.send = function(text, roomname){
  var context = this;
  var message = {
    'username': this.username,
    'text': text,
    'roomname': roomname
  };

  $.ajax({
    // always use this url
    url: this.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function() {
      console.log('chatterbox: Message sent');
      context.fetch({data: $.proxy(context.fetchData, context) });
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.log(data);
      console.error('chatterbox: Failed to send message');
    }
  });
};

App.prototype.fetchData = function(){
  console.log('fetchData this', this);
  this.loadingView.startLoading();
  var data = {};
  data['order'] = '-createdAt';
  if (this.roomname !== ''){
    data['where'] = JSON.stringify({'roomname': this.roomname});
  }
  return data;
};

App.prototype.fetch = function(options){
  var theJsonData = options.data();
  console.log(theJsonData);
  $.ajax({
    // always use this url
    url: this.server,
    type: 'GET',
    data: theJsonData,
    contentType: 'application/json',
    success: function(data){
      events.trigger('fetch:success', data);
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get message');
    }
  });
};

App.prototype.changeRoom = function(roomname){
  this.roomname = roomname;
  this.roomView.setCurrentRoom(roomname);
  this.fetch({data: $.proxy(this.fetchData, this) });
};

// takes an array of messages an displays it on chatbuilder
App.prototype.displayMessages = function(data){
  // set loading back to false
  var context = this;
  context.loadingView.stopLoading();

  // console.log('chatterbox: Message received', data);
  $chat = $('.chat');
  $chat.empty();
  _.each(data.results, function(msg){
    context.chatView.addMessage(msg, context);
  });
  context.roomView.refresh(context);
};

/* Start App */
$(document).ready(function(){
  var app = new App();
  new ChatView({app: app});
  app.init();
});
