angular
  .module("com.speechat", ["ngMaterial", "ngMessages", "com.speechat.services"])

  .controller("speechCtrl", [
    "$scope",
    "speechSvc",
    "httpSvc",
    "$filter",
    function ($scope, speechSvc, httpSvc, $filter) {
      $scope.videoId = undefined;
      $scope.messagesListChat = [];
      $scope.accessToken = undefined;
      $scope.heroes = [];

      var silence = ["heroessharebot", "nightbot"];

      let comandosVIP, comandos;

      let comandosInteractivos = [
        "pero-bueno",
        "di",
        "di2",
        "juntame",
        "jugadores",
        "votoMVP",
        "sal",
        "muteame",
        "desmuteame",
        "rapex",
        "rhots",
        "comandos",
        "comandosVIP"
      ];

      let videoComandos = [];

      httpSvc.getHeroes().then(function (result) {
        $scope.heroes = result;
      });

      httpSvc.getCommands("vip").then(function (result) {
        comandosVIP = result;
      });

      httpSvc.getCommands().then(function (result) {
        comandos = result;
      });

      httpSvc.getvideoCommands().then(function (result) {
        videoComandos = result;
      });

      var rangos = ["subscriber", "vip", "moderator", "premium"];

      httpSvc.getUsuarios().then(function (result) {

        $scope.usuarios = result;
        console.log("ejecute esto?", $scope.usuarios)
      });

      window.speechSynthesis.onvoiceschanged = function () {
        $scope.voices = window.speechSynthesis.getVoices();
        $scope.voz = $scope.voices[3];
      };
      speechSvc.scope = $scope;

      //functions
      {
        function addElementToChatBox(message, usernameText) {
          var div = document.createElement("DIV");
          var username = document.createElement("SPAN");
          username.appendChild(document.createTextNode(usernameText + " : "));
          div.appendChild(username);
          var mensaje = document.createElement("SPAN");
          mensaje.appendChild(document.createTextNode(message));

          div.appendChild(mensaje);
          document.getElementById("chatBox").appendChild(div);
        }

        function processToChat(message, username) {
          addElementToChatBox(message, username);
          console.log(
            $scope.listaMuteados.indexOf(username),
            $scope.listaMuteados,
            username
          );
          if (!$scope.muted && $scope.listaMuteados.indexOf(username) === -1) {
            //todo
            if ($scope.usuarios[username] && $scope.usuarios[username].special) {

              httpSvc.loquendo(message, $scope.usuarios[username].vozLoquendo).then(function () {
                console.log('hola')
              });
            }
            else {
              speechSvc.speech(message, username);
            }
          }
        }

        function processVIP(badges) {
          return rangos.some(function (badge) {
            return badges.indexOf(badge) !== -1;
          });
        }

        function processSoundCommand(message, badges, username) {
          var commando = message.split(" ");
          var nombreComando = commando[0].replace("!", "");
          var rutaAudios = "audios/";
          var isVIP = false;
          //process VIP
          console.log(commando);
          badges = Object.keys(badges);
          isVIP = processVIP(badges);
          if (comandosVIP.indexOf(nombreComando) !== -1 || videoComandos.indexOf(nombreComando) !== -1) {
            if (!isVIP) {
              return;
            }
            rutaAudios = "audios/vip/";
          }

          if (comandosInteractivos.indexOf(nombreComando) !== -1) {
            switch (nombreComando) {
              case "pero-bueno":
                var numero = Math.floor(Math.random() * 14) + 1;
                var rutaAudio = "audios/pero-bueno/pero-bueno";
                var audio = new Audio(rutaAudio + numero + ".mp3");
                audio.play();
                break;
              case "di":
                if (!isVIP) return;
                message = message.replace("!di", "");
                httpSvc.loquendo(message, "Castilian Spanish male voice :: Jorge 16000 L").then(function () {
                  console.log("ya quedo");
                });
                break;
              case "di2":
                message = message.replace("!di2", "");
                httpSvc.loquendo(message, "American Spanish male voice :: Carlos 44100 L").then(function () {
                  console.log("ya quedo");
                });
              case "juntame":
                if ($scope.players.indexOf(commando[1]) === -1) {
                  $scope.players.push(commando[1]);
                }
                break;
              case "votoMVP":
                let nombrePlayerVotar = commando[1];
                let playerVoto = $scope.playersFull.filter((player) => {
                  return (
                    player.name.toLowerCase() ===
                    nombrePlayerVotar.toLowerCase()
                  );
                })[0];
                if (playerVoto) {
                  playerVoto.votos++;
                  $scope.playersFull = $filter("orderBy")(
                    $scope.playersFull,
                    "-votos"
                  );
                  if (commando[2]) {
                    let mensaje = commando.splice(0, 2);
                    playerVoto.votosMensajes.push(commando.join(" "));
                  }
                }
                break;
              case "jugadores":
                let lista = $scope.generaListaChat().join(", ");
                $scope.twitchJs.chat.say($scope.channel, lista);
                break;

              case "sal":
                let nombreSal = commando[1];
                processSoundCommand("!sal1", { subscriber: true });
                setTimeout(function () {
                  processSoundCommand("!di " + nombreSal, {
                    subscriber: true,
                  });
                }, 3000);
                setTimeout(function () {
                  processSoundCommand("!sal2", { subscriber: true });
                }, 5500);
                break;
              case "muteame":
                $scope.listaMuteados.push(username);
                break;
              case "desmuteame":
                $scope.listaMuteados.splice(
                  $scope.listaMuteados.indexOf(username),
                  1
                );
                break;

              case "rapex":
                httpSvc.keyPress('f12').then(function () {
                  console.log(true);
                });
                break;
              case "rhots":
                httpSvc.keyPress('f9').then(function () {
                  console.log(true);
                });
                break;
              case "comandos":
                console.log('estoy entrando')
                $scope.twitchJs.chat.say("hola hijos de perra");
                break;
            }
          }
          else if (videoComandos.indexOf(nombreComando) !== -1) {
            var socket = io.connect('http://localhost/');
            socket.emit('messages', nombreComando);
          }
          else if (comandos.indexOf(nombreComando) !== -1 || isVIP) {
            var audio = new Audio(rutaAudios + nombreComando + ".mp3");
            audio.play();
            //   $scope.otherWindow.postMessage(nombreComando  , '*');

            var sayPerra = commando[0].replace("!" + nombreComando, "").trim();
            if (sayPerra) {
              var time = setTimeout(function () {
                processToChat("command -> " + comando + ": " + sayPerra);
              }, 1500);
            }
          }
        }
      }

      $scope.generaListaChat = function () {
        return $scope.playersFull.map(function (player) {
          return player.name + `( ${player.pick || ""} )`;
        });
      };

      $scope.checkFacebook = function () {
        FB.getLoginStatus(function (response) {
          console.log(response.authResponse.accessToken);
          $scope.accessToken = response.authResponse.accessToken;
        });
      };
      $scope.after = "";
      $scope.hora = 1;
      $scope.players = [];
      $scope.equipoA = [];
      $scope.equipoB = [];
      $scope.playersFull = [];
      $scope.listaMuteados = [];
      $scope.muted = false;
      $scope.checkEvents = function () {
        if ($scope.videoId) {
          /* make the API call */
          /* make the API call */
          /* make the API call */
          var eventSourceInitDict = { withCredentials: false };

          var source = new EventSource(
            "https://streaming-graph.facebook.com/" +
            $scope.videoId +
            "/live_comments?access_token=" +
            $scope.accessToken,
            eventSourceInitDict
          );
          console.log(source);
          source.onmessage = function (event) {
            console.log(event);
            var message = JSON.parse(event.data);
            if (message && message.message.startsWith("!")) {
              processSoundCommand(message.message, [], "");
            } else {
              processToChat(message.message, []);
              // Do something with event.message for example
            }
          };
        }
      };

      $scope.initFacebook = function () {
        FB.init({
          appId: "2259098627641805",
          cookie: true,
          xfbml: true,
          version: "v5.0",
        });

        FB.AppEvents.logPageView();

        FB.getLoginStatus(function (response) {
          console.log(response);
          // $scope.accessToken = response.authResponse.accessToken;
        });
        FB.login(
          function (response) {
            // handle the response
            console.log(response);
            $scope.accessToken = response.authResponse.accessToken;
            FB.api(
              "/1555077074638998/live_videos?fields=title,video&limit=1",
              "GET",
              {},
              function (response) {
                console.log(response.data[0].video.id);
                $scope.videoId = response.data[0].video.id;
              }
            );
          },
          { scope: "manage_pages" }
        );
      };

      $scope.startTwitch = function () {
        // Provide your token, username and channel. You can generate a token
        // here: https://twitchapps.com/tmi/
        const token =
          $scope.tokenTwitch || "oauth:d1yase7q8eyo4qapjczik7en9340zv";
        const username = $scope.usernameTwitch || "kloneetv";
        $scope.channel = $scope.channelTwitch || "kloneetv";
        // Instantiate clients.
        $scope.twitchJs = new TwitchJs({ token, username });
        // Get featured streams.
        
        // Listen to all events.
        const log = (msg) => console.log(msg);
        $scope.twitchJs.chat.on(TwitchJs.Chat.Events.ALL, function (hay) {
          console.log(hay);
          if (
            hay.command === "PRIVMSG" &&
            hay.message.indexOf("loots.com") === -1 &&
            hay.message.indexOf("heroesshare.com") === -1 &&
            hay.message.indexOf(".com") === -1 &&
            hay.message.indexOf("https:") === -1 &&
            silence.indexOf(hay.username.toLowerCase()) === -1
          ) {
            $scope.twitchJs.chat.say('asdsada');
            //TODO: investigar si se pueden cachar mensajes con msgId personalizados
            if (
              hay.tags.badges &&
              hay.tags.msgId
            )
              console.log("evento", hay)
            if (hay.tags.msgId === "highlighted-message") {
              hay.message = "!di2 " + hay.message;
            }
            if (hay.message && !hay.message.startsWith("!")) {
              processToChat(hay.message, hay.username);

            } else {
              processSoundCommand(hay.message, hay.tags.badges, hay.username);
            }
          }
        });
        // Connect ...
        $scope.twitchJs.chat.connect().then(() => {
          // ... and then join the channel.
          $scope.twitchJs.chat.join($scope.channel);
          $scope.twitchJs.chat.say('me conecte perras');
        });
      };

      // Chrome - 2
      // Edge - 13
      window.voz = 13;

      $scope.startLoots = function () {
        setInterval(function () {
          processSoundCommand("!loots", []);
        }, 1200000);
      };

      $scope.hacerLista = function () {
        for (let index = 0; index < 10; index++) {
          var randomIndex = Math.floor(Math.random() * $scope.players.length);
          const element = $scope.players[randomIndex];
          let toDelete = $scope.players.indexOf(element);
          $scope.players.splice(toDelete, 1);
          if (index > 4) {
            $scope.equipoB.push(element);
          } else {
            $scope.equipoA.push(element);
          }
        }
        let listaFull = $scope.equipoA.concat($scope.equipoB);
        $scope.playersFull = listaFull.map(function (player) {
          return {
            name: player,
            votos: 0,
            votosMensajes: [],
          };
        });
      };

      $scope.borraDeLista = function (lista, index) {
        lista.splice(index, 1);
      };

      $scope.agregaUnoMas = function (lista) {
        var randomIndex = Math.floor(Math.random() * $scope.players.length);
        const element = $scope.players[randomIndex];
        let toDelete = $scope.players.indexOf(element);
        $scope.players.splice(toDelete, 1);
        lista.push(element);
      };

      $scope.limpiarLista = function () {
        $scope.playersFull = [];
        $scope.equipoB = [];
        $scope.equipoA = [];
      };

      $scope.setVoz = function () {
        window.voz = $scope.voz;
      };

      $scope.getMVP = function (index) {
        return lista[index];
      };

      $scope.startTwitch();

      $scope.startLoots();

      var commands2 = {
        "que triste": function () {
          processSoundCommand("!sad", { subscriber: true });
        },
      };

      var commands3 = {
        "maldito friki": function () {
          processSoundCommand("!hey", { subscriber: true });
        },
      };

      /*   annyang.setLanguage("es-MX");
      
      annyang.start({ autoRestart: true, continuous: true });
      annyang.addCommands(commands2, true);
      annyang.addCommands(commands3, true);*/
    },
  ]);
//oauth:d1yase7q8eyo4qapjczik7en9340zv
