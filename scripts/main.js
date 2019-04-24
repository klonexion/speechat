

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

    $scope.accessToken = undefined;
    $scope.speech = function() {
      console.log('hola')
      speechSvc.speech('hola mundo');
    }

    $scope.checkFacebook = function() {
      FB.getLoginStatus(function(response) {
        console.log(response)
        $scope.accessToken = response.authResponse.accessToken;
      });
    }

    $scope.checkEvents = function() {
      $scope.videoId = '680520909052858'
      if ($scope.videoId) {
        var source = new EventSource("https://streaming-graph.facebook.com/" + $scope.videoId + "/live_comments?access_token=" + $scope.accessToken);
        source.onmessage = function(event) {
          console.log(event)
          var message = JSON.parse(event.data);
          speechSvc.speech(message.message);
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
      chat.on(chatConstants.EVENTS.ALL, function(hay){
        console.log(hay)
        if(hay.command==="PRIVMSG"){
          speechSvc.speech(hay.message)
        }
      });
      // Connect ...
      chat.connect().then(() => {
        // ... and then join the channel.
        chat.join(channel);
      });
    }
  }]);
  //oauth:d1yase7q8eyo4qapjczik7en9340zv