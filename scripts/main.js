

angular.module('com.speechat', ['ngMaterial', 'ngMessages'])
  .service('speechSvc', function () {

    this.speech = function (message) {
      var speechMessage = new SpeechSynthesisUtterance();

      speechMessage.lang = 'es-Es'
      // Set the text and voice attributes.
      speechMessage.text = message;
      speechMessage.volume = 1;
      speechMessage.rate = 1;
      speechMessage.pitch = 1;

      window.speechSynthesis.speak(speechMessage);
    }
  }).controller('speechCtrl', ['$scope', 'speechSvc', function ($scope, speechSvc) {

    $scope.accessToken = undefined;
    $scope.speech = function () {
      console.log('hola')
      speechSvc.speech('hola mundo');
    }

    $scope.checkFacebook = function(){
      FB.getLoginStatus(function(response) {
        console.log(response)
        $scope.accessToken  = response.authResponse.accessToken;
     });
    }

    $scope.initFacebook = function () {
      FB.init({
        appId: '2259098627641805',
        status: true,
        cookie: true,
        xfbml: true,
        
        version    : 'v3.2'
      });
      FB.AppEvents.logPageView();   
      $scope.checkFacebook();
    };
  }]);