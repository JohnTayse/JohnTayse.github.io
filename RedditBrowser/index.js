var subreddit = 0;
var subredditList = [];
var favorites = [];

$(function()
{
    $('#homeButton').click(function(){
        subreddit = '';
        $('#subredditInput').val('');
        $('#subredditButton').remove();
        history.pushState("", document.title, window.location.pathname + window.location.search);
        $('#entersubreddit').show();
        $('#browseList').hide();
        $('#browseItem').hide();
    })

    $('#browseButton').click(function(){
        browse();
    })

    $('#entersubreddit').hide();
    $('#browseList').hide();
    $('#browseItem').hide();

    loadFavorites();

    subreddit = window.location.hash;
    if(subreddit.length === 0){
        $('#entersubreddit').show();
    }
    else{
        $('#browseList').show();
        subreddit = subreddit.substring(1, subreddit.length);
        getSubredditList();
    }
});

function browse(){
    subreddit = $('#subredditInput').val();
    if(subreddit !== ''){
        $('#entersubreddit').hide();
        $('#browseList').show();
        window.location.hash = subreddit;
        getSubredditList();
    }
}

function getSubredditList(){
    $('#browseList').html('');
    $.mobile.loading('show');
    var url= 'https://www.reddit.com/r/' + subreddit + '.rss';
    feednami.load(url)
    .then(feed => {
        subredditList = feed.entries;
        displayList();
    })
}

function getNextList(guid){
    $.mobile.loading('show');
    var url= 'https://www.reddit.com/r/' + subreddit + '.rss?after=' + guid;
    feednami.load(url)
    .then(feed => {
        subredditList = subredditList.concat(feed.entries);
        displayList();
    })
}

function getNextItemList(guid){
    $.mobile.loading('show');
    var url= 'https://www.reddit.com/r/' + subreddit + '.rss?after=' + guid;
    feednami.load(url)
    .then(feed => {
        var nextGuid = feed.entries[0].guid;
        subredditList = subredditList.concat(feed.entries);
        displayItem(nextGuid);
    })
}

function displayList(){
    var browseList = ''
    var isFavorite = favorites.find(function(ele){return ele === subreddit});
    if(isFavorite !== undefined){
        browseList += '<button id="favoriteButton" onclick="removeFavorite()" class="ui-btn ui-corner-all ui-btn-inline">' + subreddit + ' &#9733</button></br>';
    }
    else {
        browseList += '<button id="favoriteButton" onclick="addFavorite()" class="ui-btn ui-corner-all ui-btn-inline">' + subreddit + ' &#9734</button></br>';
    }
    

    $.each(subredditList, function(i){
        var content = $.parseHTML(this.description);
        var imgs = $(content).find('img');
        if(imgs.length > 0){
            browseList += '<a id="' + this.guid + '" class="item ui-bar ui-bar-a">'
            browseList += '<p class="title">' + this.title + '</p>';
            browseList += imgs[0].outerHTML;
            browseList += '</a>'
        }
    })
    browseList += '<br/><a href="#" id="nextButton" class="ui-btn ui-corner-all ui-btn-inline">Next</a>';
    $('#browseList').attr('class', 'ui-grid-c');
    $('#browseList').html(browseList).trigger('create');
    $.mobile.loading('hide');

    $('#nextButton').click(function(){
        getNextList(subredditList[subredditList.length - 1].guid);
    })
    $('.item').click(function(){
        $('#browseList').hide();
        displayItem(this.id);
    })
}

function displayItem(id){
    var index = -1;
    var item = subredditList.find(function(ele, i){
        index = i;
        return ele.guid == id;
    });
    var content = $.parseHTML(item.description);
    var links = $(content).find('a')
    var image = links[2];

    $('#subredditButton').remove();
    $('#header').append('<a href="#" id="subredditButton" class="ui-btn ui-corner-all ui-btn-inline">r/' + subreddit + '</a>').trigger('create');

    var postAge = getAge(item.date);

    var browseItem = '';
    
    browseItem += '<p class="title">' + item.title + '<br/>';
    browseItem += 'by <a href="https://reddit.com' + item.author + '" target="_blank">' + item.author + '</a>&nbsp;' + postAge + '</p><br/>';
    if(index > 0){
        browseItem += '<a href="#" id="backItem" class="ui-btn ui-corner-all ui-btn-inline"><</a>';
    }
    browseItem += '<a href="#" id="nextItem" class="ui-btn ui-corner-all ui-btn-inline">Next</a><br/>';

    if(image.hostname === 'v.redd.it'){
        browseItem += '<video muted preload="auto" class="itemImage" controls><source src="' + image.href + '/HLSPlaylist.m3u8" type="application/vnd.apple.mpegURL"></video>';
    }
    else if(image.hostname === 'i.redd.it' || image.hostname === 'i.imgur.com'){
        browseItem += '<img class="itemImage" src="' + image.href + '"/>';
    }
    else{
        browseItem += '<iframe class="itemImage" height="512" width="100%" scrolling="no" src="' + image.href + '" allowfullscreen="" style="overflow: hidden; width: 100%; margin: 0px auto;"></iframe>';
    }

    $('#browseItem').show();
    $('#browseItem').html(browseItem).trigger('create');

    $.mobile.loading('hide');

    $('#subredditButton').click(function(){
        $('#browseItem').hide();
        $('#browseList').show();
        $('#subredditButton').remove();
        displayList();
    })

    $('#backItem').click(function(){
        var guid = subredditList[index - 1].guid;
        displayItem(guid);
    })

    $('#nextItem').click(function(){
        if(index + 1 >= subredditList.length){
            getNextItemList(id);
        }
        else{
            var guid = subredditList[index + 1].guid;
            displayItem(guid);
        }
    })
}

function getAge(timestamp){
    var d = new Date(timestamp);
    var now = new Date();
    var diff = now - d;

    var seconds = diff / 1000;
    if(seconds < 61){
        return Math.floor(seconds) + ' second' + (seconds == 1 ? '' : 's')
    }
    var minutes = seconds / 60;
    if(minutes < 61){
        return Math.floor(minutes) + ' minute' + (minutes == 1 ? '' : 's')
    }
    var hours = minutes / 60;
    if(hours < 25){
        return Math.floor(hours) + ' hour' + (hours == 1 ? '' : 's')
    }
    var days = hours / 24;
    if(days < 32){
        return Math.floor(days) + ' day' + (days == 1 ? '' : 's')
    }
    return d.toLocaleDateString();
}

function loadFavorites(){
    if (typeof (Storage) !== "undefined") {
        if(localStorage.getItem("favorites") !== null){
            favorites = JSON.parse(localStorage.getItem("favorites"));
            displayFavorites();
        }
    } else {
        if (localstoragealerted !== true) {
            alert('Local storage not available. Sessions will not be saved.');
            localstoragealerted = true;
        }
    }
}

function addFavorite(){
    favorites.push(subreddit);

    if (typeof (Storage) !== "undefined") {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    } else {
        if (localstoragealerted !== true) {
            alert('Local storage not available. Sessions will not be saved!');
            localstoragealerted = true;
        }
    }

    $('#favoriteButton').html(subreddit + ' &#9733');
    $('#favoriteButton').attr('onclick', 'removeFavorite()');
    displayFavorites();
}

function removeFavorite(){
    favorites = favorites.filter(x => x !== subreddit);

    if (typeof (Storage) !== "undefined") {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    } else {
        if (localstoragealerted !== true) {
            alert('Local storage not available. Sessions will not be saved!');
            localstoragealerted = true;
        }
    }

    $('#favoriteButton').html(subreddit + ' &#9734');
    $('#favoriteButton').attr('onclick', 'addFavorite()');
    displayFavorites();
}

function displayFavorites(){
    var favoritesHtml = '';
    $.each(favorites, function(){
        favoritesHtml += '<button onclick="$(\'#subredditInput\').val(\'' + this + '\'); browse();" class="ui-btn ui-btn-corner-all ui-btn-inline">' + this + '</button><br/>';
    })
    $('#favorites').html(favoritesHtml).trigger('create');
}