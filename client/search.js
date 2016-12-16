var player;
var socket = io();
var albumArt = $('#album-art');
var searchField = $('#search-field');

// Set the ballot variables to zero before getting started
var voteBallots = 0;
var ballot = 0;

// Your use of the YouTube API must comply with the Terms of Service:
// https://developers.google.com/youtube/terms
// Display search results on search field when user ehters.
function showResponse(response) {
    // Convert the data to strings from YouTube API
    JSON.stringify(response, '', 2);

    // console.log(response);

    for (result in response.items) {

        // console.log(response.items[result].snippet.title)
        var searchItem = document.createElement('div');

        var itemTitle = document.createElement('h4');
        itemTitle.innerHTML = response.items[result].snippet.title.substring(0, 50);

        var itemThumbnail = document.createElement('img');
        itemThumbnail.src = response.items[result].snippet.thumbnails.high.url;

        var itemQueueButton = document.createElement('img');
        itemQueueButton.src = '/img/sign.svg';
        itemQueueButton.className += 'add-button';
        itemQueueButton.alt = response.items[result].id.videoId;

        $('#search-container').append(searchItem);
        searchItem.appendChild(itemThumbnail);
        searchItem.appendChild(itemQueueButton);
        searchItem.appendChild(itemTitle);

        itemQueueButton.onclick = function () {
            queueSong(this.parentNode.childNodes);
        };
    }
}

// Disply results when user clicks the plus sign beside the song the user likes to play next
function queueSong(songInfo) {
    // console.log(songInfo);

    // Display message at status if no record ID is found, else display thumbnail and title at current playlist and vote field
    if (songInfo[1].alt == 'undefined') {
        console.error('Song has no ID and will not be queued');

        var errorItem = document.createElement('div');

        var itemTitle = document.createElement('h4');
        itemTitle.innerHTML = songInfo[2].innerHTML;
        var noId = document.createElement('p');
        noId.innerHTML = "This song has no ID and cannot be played!";

        $('#warning-container').css("display", "block");

        $('#warning').append(errorItem);
        errorItem.appendChild(itemTitle);
        errorItem.appendChild(noId);

    } else {

        // Clear the search result list if a record ID is found
        $('#search-container').empty();

        //console.log(songInfo);
        //console.log("the song name is: " + songInfo[2].innerHTML);
        //console.log("the song ID is: " + songInfo[1].alt);
        //console.log("the song thumbnail is: " + songInfo[0].src);

        // Clear the no Id message when a record ID is found
        $('#warning').empty();
        $('#warning-container').css("display", "none");

        // Set key names and their values from YouTube data for saving into JSON file purpose
        var songMetaData = {
            imgSrc: songInfo[0].src,
            songId: songInfo[1].alt,
            title: songInfo[2].innerHTML,
            vote: ballot++
        };

        // Display the search results and an add button to vote section
        var queueItem = document.createElement('div');

        var itemTitle = document.createElement('h4');
        itemTitle.innerHTML = songMetaData.title;

        var itemThumbnail = document.createElement('img');
        itemThumbnail.src = songMetaData.imgSrc;

        var itemButtonPlus = document.createElement('img');
        itemButtonPlus.src = '/img/sign.svg',
        itemButtonPlus.className += 'Plus-button';

        voteBallots = (voteBallots + 3)*3;

        var score = document.createElement('p');
        score.innerHTML = voteBallots + " ballots";

        queueItem.id = songMetaData.songId;

        $('#queue').append(queueItem);
        queueItem.appendChild(itemThumbnail);
        queueItem.appendChild(itemTitle);
        queueItem.appendChild(itemButtonPlus);
        queueItem.appendChild(score);

        socket.emit('songRequest', songMetaData);

        itemButtonPlus.onclick = function () {
            $('#queue').empty();
        };
    }
}

// Called automatically when JavaScript client library is loaded.
function onClientLoad() {
    gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}

// Called automatically when YouTube API interface is loaded.
function onYouTubeApiLoad() {
    // This API key is intended for use only in this lesson.
    // See http://goo.gl/PdPA1 to get a key for your own applications.
    gapi.client.setApiKey('AIzaSyAAPxhFYK8tdg7CUHBKKVZ26qDg6IgojgE');

    createPlayer();
}

// Use the JavaScript client library to create a search.list() API call.
function search() {
    // Clear search results when user types in a new name
    $('#search-container').empty();

    // Search this text field's value after user types in and hits return
    var q = $('#search-field').val();

    var request = gapi.client.youtube.search.list({
        q: q,
        part: 'snippet'
    });
    // Send the request to the API server,
    // and invoke onSearchRepsonse() with the response.
    request.execute(onSearchResponse);
}

// Called automatically with the response of the YouTube API request.
function onSearchResponse(response) {
    showResponse(response);
}

// Create a player
function createPlayer() {
    player = new YT.Player('video-placeholder', {
        events: {
          'onReady': checkQueue,
          'onStateChange': onStateChange
        }
    });
}

// Check the song is playing or ending
function onStateChange(e){
  // console.log(e.data);
  if(e.data == YT.PlayerState.ENDED){
    socket.emit('removeRequest', e);
    console.log("play end:" , e);
    checkQueue();
  }
}

// Change to next song from playlist after the song has been completed to play
function getId(){
  var current = $('#playback-bar').children()[0];
  var id = current.id;
  console.warn(id);
  current.remove();
  if(id == "current-title"){
    id = getId();
  }
  return id;
}

// check the playlist to find songs to play and then animate the record disc and needle
function checkQueue() {
  player.cueVideoById(getId());
  player.playVideo();
  setTimeout(function () {
       swap();
  }, 1000);
}

// Animate the record disc and needle
function swap() {
    $('#record-container').removeClass('spin');
    $('#record-container').addClass('swap');
    $('#needle').addClass('needleIn');
    setTimeout(function () {
        $('#record-container').removeClass('swap');
        $('#record-container').addClass('spin');
    }, 1400);
}

function skip() {
    player.seekTo(player.getDuration - 5);
}

// Prevent the form submit's default
$("form").on('submit', function (e) {
    search();
    searchField.val('');
    //stop page refresh
    e.preventDefault();
});


// This socket listens for the initial handshake between the client / server. It receives the current playlist from the server
socket.on('clientHandshake', function (playlist) {

      // Create a function to populate the playlist on in the browser window
      function populatePlaylist() {

          for (i in playlist) {
              // Display the search results and an add button to vote section
              var playlistContainer = document.createElement('div');
              playlistContainer.className = "current";

              var playlistTitle = document.createElement('h4');
              playlistTitle.innerHTML = playlist[i].title;

              var playlistThumbnail = document.createElement('img');
              playlistThumbnail.src = playlist[i].imgSrc;

              $('#playback-bar').append(playlistContainer);
              playlistContainer.append(playlistThumbnail);
              playlistContainer.append(playlistTitle);

              playlistContainer.id = playlist[i].songId;

              // console.log(playlistContainer.id);
          }
      }
        populatePlaylist();
});


// This socket listens for messages from the server...knows when a new song has been added
socket.on('updatePlaylist', function (songMetaData) {
    console.log("New Song Added");

    // Display the search results and an add button to vote section
    var newContainer = document.createElement('div');

    var newTitle = document.createElement('h4');
    newTitle.innerHTML = songMetaData.title;

    var newThumbnail = document.createElement('img');
    newThumbnail.src = songMetaData.imgSrc;

    $('#playback-bar').append(newContainer);
    newContainer.appendChild(newThumbnail);
    newContainer.appendChild(newTitle);
    newContainer.id = songMetaData.songId;

});
