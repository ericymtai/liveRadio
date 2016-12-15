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

var scheduleResults = [];
var playlist = [];

io.on('connection', function (socket) {
    console.log('a user connected');
    //Emit the playlist to a user when they connect to the server
    io.emit('clientHandshake', playlist);
    // console.log(playlist);

    //This socket receives new song requests from the connected clients
    socket.on('songRequest', function (songMetaData) {
        // This emit sends the new song to all connected clients
        io.emit('updatePlaylist', songMetaData);
        // console.log(songMetaData);
        loadResults(songMetaData);
    });

    //This socket remove a song from the playlist
    socket.on('removeRequest', function (songMetaData) {
        // This emit sends the new song to all connected clients
        io.emit('removePlaylist', songMetaData);
        // console.log("Remove emit:", songMetaData);
        removeResults(songMetaData);
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

// From here to line 86, I do not understand why you have this code?
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
            playlist = json;
        }
    }
}

// Try to find out which file is well JSON formated, if not pass throught and display error message
function checkJSON(json) {
    var data;
    try {
        data = JSON.parse(json)
    } catch (e) {
        // console.log(e);
    }
    // console.log(data);
    return data;
}

// Load and combine all the files as a giant one
function loadResults(songMetaData) {
    playlist.unshift(songMetaData);
    // console.log(playlist);
    saveFile();
}

// Remove a song from the playlist after played
function removeResults(songMetaData) {
    playlist.shift(songMetaData);
    // console.log(playlist);
    saveFile();
}

// Save the remain keys and their values into a new JSON file
function saveFile() {
    // console.log(playList);
    var data = JSON.stringify(playlist);

    // console.log("The data being weritting is" + data);
    console.log("The data being weritting!" );

    //Write data to a file
    fs.writeFile('schedule/playList.json', data, function (err) {
        if (err) {
            console.log(err.message);
            return;
        }
        console.log('Saved the new playList profile.');
    });
}
