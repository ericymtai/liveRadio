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
var sockets = [];
var scheduleList = "";
// var fileList = "";
var scheduleResults = [];
var playlist = [];

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('request', function (songMetaData) {
        io.emit('request', songMetaData);
        console.log(songMetaData);
        loadResults(songMetaData);
    });


    // socket.on('readSchedule', function ({scheduleResults}) {
    //     socket.broadcast.emit('readSchedule', {scheduleResults});
        // io.emit('readSchedule', scheduleResults);
        // function checkProperty() {
        //   console.log(scheduleResults[0]);
        // }
    //     console.log(scheduleResults[0]);
    // });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

// Start our server
server.listen(process.env.PORT || 8000, process.env.IP || "0.0.0.0", function () {
    var addr = server.address();
    console.log("Our server is listening at", addr.address + ":" + addr.port);
});


fs.readdir('./schedule', function (err, files) {
      if (err) {
        console.log(err);
        return;
      }
      scheduleList = files;
      // console.log(scheduleList);
      ParseJSON();
});

// Load the data from the playList.json
function ParseJSON() {
    // console.log(scheduleList[1]);
    for (var i = 0, length = scheduleList.length; i < length; i++) {
        //This loop will read through all of the elements of an array
        var scheduleFile = fs.readFileSync('./schedule/' + scheduleList[i] + '', 'utf-8');
        var json = checkJSON(scheduleFile);
        if (json != undefined) {
            scheduleResults.push(json);
        }
    }
    checkProperty();
}
// console.log(scheduleResults[0]);

// Try to find out which file is well JSON formated, if not pass throught and display error message
function checkJSON(json) {
  var data;
  try {
    data = JSON.parse(json)
  } catch (e) {
    // console.log(e);
  }
  return data;
}

//
function checkProperty() {
  // console.log(scheduleResults[0]);
}



// Load and combine all the files as a giant one
function loadResults(songMetaData) {
        playlist.push(songMetaData);
        saveFile();
}

// Save the remain keys and their values into a new JSON file
function saveFile() {
    // console.log(playList);
    var data = JSON.stringify(playlist);
    //console.log(data);
    //Write data to a file
    fs.writeFile('userSelect/score.json', data, function (err) {
        if (err) {
            console.log(err.message);
            return;
        }
        console.log('Saved the new playList profile.');
    });
}
