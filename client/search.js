var player;
var iframeReady = false;
var dataReady = false;
var socket = io();
var albumArt = $('#album-art');
var searchField = $('#search-field');


// Your use of the YouTube API must comply with the Terms of Service:
// https://developers.google.com/youtube/terms

// console.log('search loaded');

// Helper function to display JavaScript value on HTML page.
function showResponse(response){
    var responseString = JSON.stringify(response, '', 2);

    // console.log(response);

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

  console.log(songInfo);

    if (songInfo[1].alt == 'undefined'){
        console.error('Song has no ID and will not be queued');

        var errorItem = document.createElement('div');

        var itemTitle = document.createElement('h4');
        itemTitle.innerHTML = songInfo[2].innerHTML;

        var noId = document.createElement('p');
        noId.innerHTML = "This song has no ID and cannot be played!";

        $('#chat').append(errorItem);
        errorItem.appendChild(itemTitle);
        errorItem.appendChild(noId);

    } else {
        //console.log(songInfo);
        //console.log("the song name is: " + songInfo[2].innerHTML);
        //console.log("the song ID is: " + songInfo[1].alt);
        //console.log("the song thumbnail is: " + songInfo[0].src);

        $('#chat').empty();

        var songMetaData = {
            imgSrc: songInfo[0].src
          , songId: songInfo[1].alt
          ,  title: songInfo[2].innerHTML
        };

        var queueItem = document.createElement('div');

        var itemTitle = document.createElement('h4');
        itemTitle.innerHTML = songMetaData.title;

        var itemThumbnail = document.createElement('img');
        itemThumbnail.src = songMetaData.imgSrc;

        var itemButtonPlus = document.createElement('img');
        itemButtonPlus.src = '/img/sign.svg',
        itemButtonPlus.className += 'Plus-button';

        var itemButtonMinus = document.createElement('img');
        itemButtonMinus.src = '/img/signMinus.svg'
        itemButtonMinus.className += 'Minus-button';

        var score = document.createElement('p');
        score.innerHTML = "xx ballots";

        queueItem.id = songMetaData.songId;

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

        // socket.emit('request', songInfo[0].src);
        socket.emit('request', songMetaData);
    }
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
    // console.log('api loaded');
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

function onYouTubeIframeAPIReady() {
    iframeReady = true;
    if (iframeReady == true && dataReady == true){
        createPlayer();
    } else {
        console.warn(iframeReady + ', ' + dataReady);
    }
}

function createPlayer(){
    player = new YT.Player('video-placeholder', {
        width: 600,
        height: 400,
        // videoId: '217JOBWTolg',
        playerVars: {
            color: 'white'
        },
        events: {
            onReady: initialize()
        }
    });
}

function initialize(){
  setTimeout(function(){
      // console.log(player);
      player.playVideo();
  }, 3500);
}

function checkQueue (){
    setTimeout(function(){
        var current;
        // console.log('checking queue');
        // console.log($('#queue').children()[0].id);

        if (player.getCurrentTime() >= (player.getDuration() - 5)){
            current = $('#queue').children()[0];
            console.warn($('#queue').children()[0]);
            player.cueVideoById(current.id);
            setTimeout(function(){
                if ($('#queue').children()[0].id == current.id) {
                  current.remove();
                }
            }, 2500)
            player.playVideo();
            setTimeout(function(){
                swap();
            },100)
        } else {
            console.log(player.getCurrentTime() + ', ' + player.getDuration());
        }
        checkQueue();
    }, 2500)
}


function swap (){
    $('#record-container').removeClass('spin');
    $('#record-container').addClass('swap');
    setTimeout(function() {
        $('#record-container').removeClass('swap');
        $('#record-container').addClass('spin');
    }, 4000);
}

function skip (){
    player.seekTo(player.getDuration - 5);
}


$("form").on('submit', function (e) {
    search();
    searchField.val('');
    //stop page refresh
    e.preventDefault();
});
