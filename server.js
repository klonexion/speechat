var express = require("express");
var http = require("http");
var fs = require("fs");
var cors = require("cors");
var request = require("request");
const path = require("path");
var nrc = require("node-run-cmd");
var ks = require('node-key-sender');
ks.setOption('globalDelayPressMillisec', 700);

var app = express();
let commandosVideo = [];
const _app_folder = "./";

app.use(cors());

app.use(express.urlencoded());
app.use(express.json()); // if needed

app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.redirect("index.html");
});

app.get("/obs", function (req, res) {
  res.sendFile(path.join(__dirname + '/public/obs.html'));
});

app.get("/logo", function (req, res) {
  res.sendFile(path.join(__dirname + '/public/logo.html'));
});

app.get("/commands/:vip?", function (req, res) {
  //joining path of directory
  let vip = req.params.vip ? "vip" : "";
  const directoryPath = path.join(__dirname, "./public/audios/" + vip);
  //passsing directoryPath and callback function
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    let result = files.map((file) => file.replace(".mp3", ""));
    res.json(result);
  });
});

app.get("/videoComandos", function (req, res) {
  const directoryPath = path.join(__dirname, "./public/videos/" );
  //passsing directoryPath and callback function
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    let result = files.map((file) => file.replace(".mp4", ""));
    res.json(result);
  });
});

app.get("/usuarios", function (req, res) {
  res.json(require(path.join(__dirname, "./public/scripts/usuariosConf.json")));
});

app.get("/heroes", function (req, res) {
  res.json(require(path.join(__dirname, "./public/scripts/recursos/heroes.json")));
});


app.post("/loquendo", function (req, res) {
  nrc.run('tts.exe -t "' + req.body.texto + '" -n "' + req.body.voz + '"');
  res.json(true);
});

app.post("/keyPress", function (req, res) {
  
  ks.sendKey(req.body.key);
  
  res.json(true);
});

app.post("/videoComando", function (req, res) {
  commandosVideo.push(req.body.videoComando)
  res.json(true);
});

app.get("/videoComando", function (req, res) {
  if (commandosVideo.length > 0) {
    res.send('window.videoComando = \'' + commandosVideo.shift() + "\'");
  }
  else
    res.json(false);
});



var server = http.createServer(
  /* {
     key: fs.readFileSync("./speechat.key"),
     cert: fs.readFileSync("./speechat.crt"),
     dhparam: fs.readFileSync("./speechat.pem"),
   },*/
  app
);


/*server.listen(80, function () {
  console.log(
    "Example app listening on port 3000! Go to https://localhost:443/"
  );
});

*/
var io = require('socket.io')(server);
io.on('connection', function (socket) {
  socket.on('messages', function (data) {
    io.sockets.emit('comando', data);
  });
  
});



server.listen(80, function () {
  console.log('Example app listening on port 3000!');
});


