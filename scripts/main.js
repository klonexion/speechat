

angular.module('com.speechat', ['ngMaterial', 'ngMessages'])
  .service('speechSvc', function() {

    this.speech = function(message) {
      var speechMessage = new SpeechSynthesisUtterance();

      speechMessage.lang = 'es-Es'
      // Set the text and voice attributes.
      speechMessage.text = message;
      speechMessage.volume = 1;
      speechMessage.rate = 1;
      speechMessage.pitch = 1;

      window.speechSynthesis.speak(speechMessage);
    }
  }).controller('speechCtrl', ['$scope', 'speechSvc', function($scope, speechSvc) {
    $scope.videoId = undefined;
    $scope.messagesListChat = [];

    $scope.accessToken = undefined;
    //functions
    {

      function addElementToChatBox(message){
        var div = document.createElement("DIV");                       // Create a <p> node
        var text = document.createTextNode(message);      // Create a text node
        div.appendChild(text);                                          // Append the text to <p>
        document.getElementById("chatBox").appendChild(para);
      }

      function processToChat(message) {
        addElementToChatBox(message)
        speechSvc.speech(message);
      }
    }
    //functions
    $scope.speech = function() {
      console.log('hola')
      speechSvc.speech('hola mundo');
    }

    $scope.checkFacebook = function() {
      FB.getLoginStatus(function(response) {
        $scope.accessToken = response.authResponse.accessToken;
      });
    }

    $scope.checkEvents = function() {
      if ($scope.videoId) {
        var source = new EventSource("https://streaming-graph.facebook.com/" + $scope.videoId + "/live_comments?access_token=" + $scope.accessToken);
        source.onmessage = function(event) {
          console.log(event)
          var message = JSON.parse(event.data);
          processToChat(message.message);
          // Do something with event.message for example
        };
      }
    }

    $scope.initFacebook = function() {
      FB.init({
        appId: '2259098627641805',
        status: true,
        cookie: true,
        xfbml: true,

        version: 'v3.2'
      });
      FB.AppEvents.logPageView();
      $scope.checkFacebook();

    };

    $scope.startTwitch = function() {
      // Provide your token, username and channel. You can generate a token
      // here: https://twitchapps.com/tmi/
      const token = 'oauth:d1yase7q8eyo4qapjczik7en9340zv';
      const username = 'kloneetv';
      const channel = 'kloneetv';
      // Instantiate clients.
      const { api, chat, chatConstants } = new TwitchJs({ token, username });
      // Get featured streams.
      api.get('streams/featured').then(response => {
        console.log(response);
        // Do stuff ...
      });
      // Listen to all events.
      const log = msg => console.log(msg);
      chat.on(chatConstants.EVENTS.ALL, function(hay) {
        if (hay.command === "PRIVMSG") {
          if (hay.message && !hay.message.startsWith('!')) {
            if (hay.username !== 'nightbot') {
              processToChat(hay.message)
            }
          } else {
            if (hay.message.startsWith('!perra')) {

              var audio = new Audio('audios/perra.mp3');
              audio.play();
              var sayPerra = hay.message.replace('!perra', '').trim();
              if (sayPerra) {
                var time = setTimeout(function() {

                  processToChat('command -> sayPerra: ' + sayPerra);

                }, 1500);

              }
            }
          }

        }
      });
      // Connect ...
      chat.connect().then(() => {
        // ... and then join the channel.
        chat.join(channel);
      });
    }

    $scope.startTwitch()
  }]);
  //oauth:d1yase7q8eyo4qapjczik7en9340zv