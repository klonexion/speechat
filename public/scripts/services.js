angular
  .module("com.speechat.services", [])
  .service("httpSvc", function($http){

    this.getCommands = function(vip){
      vip = vip ? '/vip': '';
      console.log($http)
      return $http({
        method : "GET",
          url : "commands"+vip
      }).then(function(list) {
        return list.data;
      });
    }

    this.getUsuarios = function(vip){
      return $http({
        method : "GET",
          url : "usuarios"
      }).then(function(list) {
        return list.data;
      });
    }
    
    this.getHeroes = function(vip){
      return $http({
        method : "GET",
          url : "heroes"
      }).then(function(list) {
        return list.data;
      });
    }

    this.getvideoCommands  = function(vip){
      return $http({
        method : "GET",
          url : "videoComandos"
      }).then(function(list) {
        return list.data;
      });
    }

    this.loquendo = function(texto, voz){
      
      return $http.post('loquendo', { texto: texto, voz:  voz}).then(function(list) {
        return list.data;
      });
    }

    this.keyPress = function(key){
      return $http.post('keyPress', { key: key}).then(function(list) {
       console.log(" Key pressed - "+ key);
      });
    }

    this.videoComando = function(videoComando){
      return $http.post('videoComando', { videoComando: videoComando}).then(function(list) {
        return list.data;
      });
    }

  })
  .service("speechSvc", function() {

    this.scope;

    this.speech = function(message, usuario) {
      var speechMessage = new SpeechSynthesisUtterance();
      var synth = window.speechSynthesis;

      //var voices = synth.getVoices();
      speechMessage.lang = "es-MX";
      // Set the text and voice attributes.
      speechMessage.text = message;
      //speechMessage.volume = 1;
      //speechMessage.rate = 1;
      speechMessage.pitch = this.scope.usuarios[usuario]
        ? this.scope.usuarios[usuario].pitch
        : 1;
      var numero = this.scope.usuarios[usuario]
        ? this.scope.usuarios[usuario].voz
        : window.voz;
      speechMessage.voice = this.scope.voices[numero];
      window.speechSynthesis.speak(speechMessage);
    };
  });