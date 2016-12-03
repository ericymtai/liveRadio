

// Your use of the YouTube API must comply with the Terms of Service:
// https://developers.google.com/youtube/terms

console.log('search loaded');

// Helper function to display JavaScript value on HTML page.
function showResponse(response){
    var responseString = JSON.stringify(response, '', 2);

    // document.getElementById('response').innerHTML += responseString;
    for (result in response.items){

        // console.log(response.items[result].snippet.title)
        var searchItem = document.createElement('div');
        var itemTitle = document.createElement('h4');
        itemTitle.innerHTML = response.items[result].snippet.title.substring(0,50);

        // var itemDescription = document.createElement('h4');
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

        itemQueueButton.onclick=function(){
            queueSong(this.parentNode.childNodes);
        };
    }
    // console.log(response.items);
}

function queueSong (songInfo){
    if (songInfo[1].alt == 'undefined'){
        console.error('Video has no ID and will not be queued');
    } else {
        // console.log(songInfo[1].alt);
        console.log("the song name is:" + songInfo[2].innerHTML);
        console.log("the song thumbnail is:" + songInfo[0].src);

        var queueItem = document.createElement('div');

        var itemTitle = document.createElement('h4');
        itemTitle.innerHTML = songInfo[2].innerHTML;

        var itemThumbnail = document.createElement('img');
        itemThumbnail.src = songInfo[0].src;

        var itemButtonPlus = document.createElement('img');
        itemButtonPlus.src = '/img/sign.svg',
        itemButtonPlus.className += 'Plus-button';

        var itemButtonMinus = document.createElement('img');
        itemButtonMinus.src = '/img/signMinus.svg'
        itemButtonMinus.className += 'Minus-button';

        var score = document.createElement('p');
        score.innerHTML = "xx ballots";

        queueItem.id = songInfo[1].alt;



        $('#queue').append(queueItem);
        queueItem.appendChild(itemThumbnail);
        queueItem.appendChild(itemTitle);
        queueItem.appendChild(itemButtonMinus);
        queueItem.appendChild(itemButtonPlus);
        queueItem.appendChild(score);


        var c = $(queueItem).clone(true);

        $('#playback-bar').append(c);
        queueItem.appendChild(itemThumbnail);
        queueItem.appendChild(itemTitle);

        checkQueue();

        socket.emit('request', songInfo[0].src);

        // loadResults();
    }
}

var fs = require('fs');
var fileList = "";
var playList = [];


// Load and combine all the files as a giant one
function loadResults() {

      fileList = songInfo;
        // console.log(fileList[0]);
        for (var i = 0, i < 2; i+2) {
            //This loop will read through all of the elements of an array
            var myFile = fs.readFileSync(songInfo[i] );
            myFile = JSON.parse(songInfo);
            playList.push(myFile);
        }
        // saveFile();
        console.log(playList);
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

// Called automatically when JavaScript client library is loaded.
function onClientLoad(){
    gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}

// Called automatically when YouTube API interface is loaded (see line 9).
function onYouTubeApiLoad(){
    // This API key is intended for use only in this lesson.
    // See http://goo.gl/PdPA1 to get a key for your own applications.
    gapi.client.setApiKey('AIzaSyAAPxhFYK8tdg7CUHBKKVZ26qDg6IgojgE');
    console.log('api loaded');
    // search();
    dataReady = true;
    if (iframeReady == true && dataReady == true){
        createPlayer();
    }
}

function search(){
    $('#search-container').empty();
    // Use the JavaScript client library to create a search.list() API call.
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
function onSearchResponse(response){
	   showResponse(response);
}

var socket = io();
var albumArt = $('#album-art');
var searchField = $('#search-field');

$("form").on('submit', function (e) {
    search();
    searchField.val('');
    //stop page refresh
    e.preventDefault();
});

function onYouTubeIframeAPIReady(){
    if (iframeReady == true && dataReady == true){
        player = new YT.Player('video-placeholder', {
            width: 600,
            height: 400,
            videoId: 'Xa0Q0J5tOP0',
            playerVars: {
                color: 'white',
                playlist: 'taJ60kskkns,FG0fTKAqZ5g'
            },
            events: {
                onReady: initialize()
            }
        });
    }
}

function createPlayer(){

}

function initialize(){
    player.playVideo();
}
