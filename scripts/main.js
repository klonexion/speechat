

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
  }]);