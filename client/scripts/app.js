/***********************************************
 Backbone
***********************************************/

var events = window.events;
events = _.clone(Backbone.Events);

/***********************************************
 Spinner / Loading View (top-right corner)
***********************************************/

var LoadingView = Backbone.View.extend({
  initialize: function(options) {
    this.loading = false;
    events.on('loadingStart', this.startLoading, this);
    events.on('loadingStop', this.stopLoading, this);
  },

  startLoading: function(){
    if (!this.loading){
      this.$el.show();
      this.loading = true;
    }
  },

  stopLoading: function(){
    this.$el.hide();
    this.loading = false;
  }
});

/***********************************************
 Friend View (left sidebar)
***********************************************/

var FriendView = Backbone.View.extend({
  initialize: function(options) {
    events.on('friendviewUpdate', this.updateFriends, this);
  },

  updateFriends: function(){
    var context = this;
    context.$el.empty();
    _.each(context.collection.friends, function(v, friendname){
      var $f = $('<span class="friend-name"></span>');
      $f.text(friendname);
      context.$el.append($f);
    });
  }
});

/***********************************************
 Room View (left sidebar)
***********************************************/

var RoomView = Backbone.View.extend({
  initialize: function(options){
    events.on('changeRoom', this.changeRoom, this);
    events.on('addRoomname', this.updateRoomnames, this);
    events.on('roomviewRefresh', this.refresh, this);
  },

  changeRoom: function(roomname){
    this.collection.roomname = roomname;
    this.setCurrentRoom(roomname);
    events.trigger('fetchMessages');
  },

  refresh: function(){
    var context = this;
    var roomnames = context.collection.roomnames;
    context.$el.empty();
    for (var roomname in roomnames){
      if (roomname !== ""){
        var $room = $('<span class="chatroom"></span>');
        $room.text(roomname);
        context.$el.append($room);
        $room.on('click', function(){
          events.trigger('changeRoom', $(this).text());
        });
      }
    }
  },

  setCurrentRoom: function(roomname){
    if (roomname === ''){
      $('.chat-roomname').text('All Rooms');
    } else {
      $('.chat-roomname').text(roomname);
    }
  },

  updateRoomnames: function(roomname){
    if (!this.collection.roomnames.hasOwnProperty(roomname)){
      this.collection.roomnames[roomname] = true;
    }
  }
});

/***********************************************
 Chat View (right column)
***********************************************/

var ChatView = Backbone.View.extend({
  initialize: function(options){
    events.on('fetchSuccess', this.displayMessages, this);
  },

  // takes an array of messages an displays it on chatbuilder
  displayMessages: function(data){
    var context = this;

    // set loading back to false
    events.trigger('loadingStop');

    context.$el.empty();

    _.each(data.results, function(msg){
      context.addMessage(msg);
    });

    events.trigger('roomviewRefresh');
  },

  addMessage: function(msg){
    var context = this;
    var collection = context.collection;

    events.trigger('addRoomname', msg.roomname);

    // append results
    $msgWrap = $('<div class="msg-wrap"></div>');

    $msgText = $('<div class="msg-text"></div>');
    if (collection.friends.hasOwnProperty(msg.username)){
      $msgText.attr('class', 'bold');
    }
    $msgText.text(msg.text);

    $msgUsername = $('<div class="msg-username"></div>');
    $msgUsername.text(msg.username);
    $msgUsername.on('click', function(){
      var friend = $(this).text();
      collection.friends[friend] = true;
      events.trigger('friendviewUpdate');
      events.trigger('fetchMessages');
    });

    $msgRoomname = $('<div class="msg-roomname"></div>');
    $msgRoomname.text('(' + msg.roomname + ')');
    $msgRoomname.on('click', function(){
      var room = $(this).text().replace(/[()]/g,'');
      events.trigger('changeRoom', room);
    });

    $clearfix = $('<div class="clearfix"></div>');

    // create message
    $msgWrap.append($msgUsername);
    $msgWrap.append($msgRoomname);
    $msgWrap.append($msgText);
    $msgWrap.append($clearfix);

    // attach to document
    this.$el.append($msgWrap);
  }
});

/***********************************************
 Models
***********************************************/

var SendMessage = Backbone.Model.extend({
  url: 'https://api.parse.com/1/classes/chatterbox'
});

var FetchMessages = Backbone.Model.extend({
  url: 'https://api.parse.com/1/classes/chatterbox?order=-createdAt'
});

/***********************************************
 App
***********************************************/

var App = Backbone.View.extend({
  initialize: function(){
    var context = this;

    // Current roomname
    context.roomname = '';

    // Object that contains roomnames and friends
    context.roomnames = {};
    context.friends = {};

    // create views
    context.loadingView = new LoadingView({ el: $('.spinner'), collection:context });
    context.friendView = new FriendView({ el: $('.friends'), collection:context });
    context.roomView = new RoomView({ el: $('.chatrooms'), collection:context });
    context.chatView = new ChatView({ el: $('.chat'), collection:context });

    // register events listeners
    events.on('fetchMessages', context.fetch, context);

    // initial setup
    context.displayUsername();
    context.createHomeButton();
    context.createSubmitMessageButton();

    // enters default room and gets new messages
    events.trigger('changeRoom', '');

    // periodically refreshes new messages
    setInterval(function(){
      events.trigger('fetchMessages');
    }, 5000);
  },

  // sends message
  send: function(text, roomname){
    var message = {
      'username': this.username,
      'text': text,
      'roomname': roomname
    };

    // make AJAX request
    var sendMessage = new SendMessage();
    sendMessage.save( message, {success: function (data) {
      console.log('chatterbox: Message sent');
      events.trigger('fetchMessages');
    }});
  },

  // retrieves messages
  fetch: function(){
    events.trigger('loadingStart');

    // specifies roomname in query
    var data = '';
    if (this.roomname !== ''){
      data = encodeURIComponent('where={"roomname":' + JSON.stringify(this.roomname) + '}');
    }

    // make AJAX request
    var fetchMessages = new FetchMessages();
    fetchMessages.fetch({data: data, success: function(model, data){
      events.trigger('fetchSuccess', data);
    }});
  },

  // displays username
  displayUsername: function(){
    var context = this;
    context.username = GetParams.username;
    $('.username h4').text(context.username);
  },

  // click to load messages from all rooms
  createHomeButton: function(){
    $('.chat-home').on('click', function(){
      events.trigger('changeRoom', '');
    });
  },

  // handles posting new message
  createSubmitMessageButton: function(){
    var context = this;
    $('.onclick-submit').on('click', function(){
      var msg = $('.my-message').val();
      var room = $('.my-roomname').val();
      $('.my-message').val('');
      $('.my-roomname').val('');
      context.send(msg, room);
    });
  }
});

/***********************************************
 Start app
***********************************************/

$(document).ready(function(){
  var app = window.app;
  app = new App();
});