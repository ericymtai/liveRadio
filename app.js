// Include our libraries
var fs = require('fs');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var express = require('express');
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

// Use router to point requests to the 'client' folder
router.use(express.static(path.resolve(__dirname, 'client')));

// Variables to hold the messages and the sockets
// var messages = [];
var sockets = [];
var fileList = "";
var playlist = [];

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('request', function (songMeta) {
      io.emit('request', songMeta);
       console.log(songMeta);
      // console.log("the song name is:" + songInfo[2]);
      //console.log("the song name is: %j" + songInfo);



      loadResults(songMeta);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});
// Start our server
server.listen(process.env.PORT || 8000, process.env.IP || "0.0.0.0", function () {
    var addr = server.address();
    console.log("Our server is listening at", addr.address + ":" + addr.port);
});



// Load and combine all the files as a giant one
function loadResults(songMeta) {
    console.log("the song name is: " + songMeta.title);
    console.log("the song image url is: " + songMeta.imgSrc);
    console.log("the song ID is: " + songMeta.songId);

    var fileList = JSON.stringify(songMeta);
    console.log(fileList);

      // fileList = songJson;


        for (var i = 0, length = fileList.length; i < length; i++) {
            //This loop will read through all of the elements of an array
            var myFile = fs.readFileSync(fileList);
            myFile = JSON.parse(myFile);
            playList.push(myFile);
        }
        // saveFile();
        // console.log("playList");
}

// Save the remain keys and their values into a new JSON file
function saveFile() {
      // console.log(voterResults);
      var data = JSON.stringify(playList);

      //Write data to a file
      fs.writeFile('schedule/playList.json', data, function (err) {
          if (err) {
          console.log(err.message);
          return;
          }
          // console.log('Saved the ' + voterResults[0].name + ' profile.');
          console.log('Saved the new voterResults profile.');
      });
}
