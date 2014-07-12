var app = angular.module('lamusica', ['ng']);

flag = false;
num = 0;
function toggle(){
    flag = !flag;
    if(flag == true){
        $('#repeat_btn').text('repeated');
        $("#repeat_btn").addClass("btn-warning");
        $("#repeat_btn").removeClass("btn-info");
    }
    else{
        $('#repeat_btn').text('repeat');
        $("#repeat_btn").addClass("btn-info");
        $("#repeat_btn").removeClass("btn-warning");
    }
}

app.run(function(){
    var tag = document.createElement('script');
    tag.src = "http://www.youtube.com/iframe_api";
    var first_tag = document.getElementsByTagName('script')[0];
    first_tag.parentNode.insertBefore(tag, first_tag);
});

app.factory('Tracks', function($http) {
    return {
        get : function(query, callback) {

            var num = angular.element('#number').val();
            $http.jsonp('http://ws.audioscrobbler.com/2.0/', {
                params : {
                    api_key : '6a6281367c3ad09f1b4a7c15dc50675b',
                    method : 'artist.getTopTracks',
                    limit : (num) ? num : 20,
                    format : 'json',
                    callback : 'JSON_CALLBACK',
                    artist : query
                }
            }).success(function(data){
                if(data.toptracks) {
                    callback(data.toptracks.track);
                }
                return [];
            });
            return [];
        }
    };
});

app.factory('ArtistInfo', function($http) {

    return {
        get : function(query, callback) {
            $http.jsonp('http://ws.audioscrobbler.com/2.0/', {
                params : {
                    api_key : '6a6281367c3ad09f1b4a7c15dc50675b',
                    method : 'artist.getinfo',
                    format : 'json',
                    callback : 'JSON_CALLBACK',
                    artist : query
                }
            }).success(function(data){

                if(data.artist) {
                    callback(data.artist);
                }
                return [];
            });
        }
    };
});

app.factory('ArtistAlbums', function($http) {

    return {
        get : function(query, callback) {
            $http.jsonp('http://ws.audioscrobbler.com/2.0/', {
                params : {
                    api_key : '6a6281367c3ad09f1b4a7c15dc50675b',
                    method : 'artist.gettopalbums',
                    format : 'json',
                    callback : 'JSON_CALLBACK',
                    artist : query,
                    limit : 10

                }
            }).success(function(data){

//                console.log(data.topalbums.album);
                return [];
            });
        }
    };
});


app.service('YouTube', function($window, $http){
    this.ready = false;
    this.player = null;
    this.play = function(track, callback) {
        var query = track.name + ' ' + track.artist.name;
        $http.jsonp('http://gdata.youtube.com/feeds/api/videos', {
            params : {
                q: query + ' -みた -コピ -カラオケ -ピアノ',
                'max-results' : 2,
                format : 5,
                alt : 'json-in-script',
                callback : 'JSON_CALLBACK'
            }
        }).success(function(data){

            if(data.feed.entry) {
                data.feed.entry.sort(function(a,b){
                    return b['favoriteCount'] - a['favoriteCount'];
                });
                var permalink = data.feed.entry[0]['id']['$t'];
                var id = permalink.match(/^.+\/(.+?)$/)[1];
                if(this.ready) {
                    this.player.clearVideo();
                    this.player.loadVideoById(id);
                }else{
                    this.player = new YT.Player('player', {
                        height: '400',
                        width: '600',
                        videoId : id,
                        playerVars: { 'autoplay': 1, 'rel': 0 },
                        events : {
                            onStateChange : function (event){
                                if(event.data == YT.PlayerState.ENDED ) {
                                    callback();
                                }
                            }
                        }
                    });
                }
            }else{
                callback();
            }
            this.ready = true;
        }).error(function(error){
            callback();
        });
    };
});

app.service('PlayList', function(){
    this.list = [];
    this.index = 0;
    this.ready = false;
    this.add = function(track){
        this.list.push(track);
    };
    this.current_track = function(){
        if (!this.ready) return;
        return this.list[this.index];
    };
    this.next = function(index){

        if(index || typeof index != 'undefined') {
            this.index = index;
        }else if(!this.ready) {
            this.index = 0;
        }else{
            if(this.index + 1 >= this.list.length ) {
                this.index = 0
            }else{
                // ループじゃない場合
                if(flag != true) this.index++;
            }
        }
        this.ready = true;
        return this.list[this.index];
    };
    this.clear = function(){
        this.list = [];
        this.ready = false;
    };
});

app.controller('controller', function($scope, $location, Tracks, YouTube, PlayList, ArtistInfo, ArtistAlbums, $http) {
    $scope.playing = false;
    $scope.title = 'lamusica';
    $scope.number = '';

    $('#form .typeahead').typeahead({
        name : 'artist',
        remote : {
            url: 'http://ws.audioscrobbler.com/2.0/?api_key=6a6281367c3ad09f1b4a7c15dc50675b'
                + '&method=artist.search&limit=5&artist=%QUERY&format=json',
            dataType : 'jsonp',
            template: '<p><strong>{{name}}</strong></p>',
            filter : function(res){
                var results = [];
                if(res.results.artistmatches) {
                    var artists = res.results.artistmatches.artist;
                    $.each(artists, function(){
                        results.push(this.name);
                    });
                }
                return results;
            }
        }
    }).on('typeahead:selected typeahead:autocompleted', function (e, datum) {
        $scope.artist = datum.value;
        $scope.submit(true);
    });

    $scope.play = function(index){

        YouTube.play(PlayList.next(index), $scope.play);
        var track = PlayList.current_track();
        if(track) {
            $scope.title = track.name + ' by ' + track.artist.name + ' - lamusica';
            $("#tweetButtonWrapper").html(
                '<a href="https://twitter.com/share" data-url="' + location.href + '" class="twitter-share-button"  data-text="'+ $scope.title + '" data-lang="en">Tweet</a>'
            );
            twttr.widgets.load();
            $scope.playing = true;
        }
    };
    $scope.submit = function(autoplay, query){

        $scope.artist = query || angular.element('.tt-query').val() || $location.search().q;

        if (!$scope.artist || typeof $scope.artist == 'undefined') return;
        if (!$scope.playing) angular.element('#form .typeahead').typeahead('setQuery', $scope.artist);
        PlayList.clear();
        $location.search('q', $scope.artist);

        $scope.title = $scope.artist + ' - lamusica';

        Tracks.get($scope.artist, function(tracks){
            angular.element('#list-intro').remove();
            angular.forEach(tracks, function(row, i){
                PlayList.add(row);
            });
            $scope.tracks = tracks;
            if(autoplay) {
                $scope.play();
            }
            angular.element('.tt-dropdown-menu').hide();
        });

        ArtistInfo.get($scope.artist, function(artist_info){
            // TODO apply to Angular
            $('#artist_info').html(artist_info.bio.content);
            $scope.similar_artists = [];
            angular.forEach(artist_info.similar.artist, function(row, i){
                this.push(row);
            }, $scope.similar_artists);
        });

        ArtistAlbums.get($scope.artist, function(artist_albums){

            // TODO apply to Angular
            // $('#artist_info').html(artist_info.bio.content);
            // $scope.similar_artists = [];
            // angular.forEach(artist_info.similar.artist, function(row, i){
            //     this.push(row);
            // }, $scope.similar_artists);
        });

        $scope.errors = [];
        $scope.item_data = [];

        // remove all error messages
        $scope.errors.splice(0, $scope.errors.length);
        $scope.item_data.splice(0, $scope.item_data.length);
        $('.amz_link li').remove();

        // amazon Product Advertising API
        $http.post('http://amz-api.appspot.com/', {'keywords': $scope.artist}
        ).success(function(data, status, headers, config) {

                // Data Get Success
                if (data != ''){
                    angular.forEach(data, function(row, i){
                        $('.amz_link').append(row);
                    });
                }
                // Failure
                else{
//                    $scope.errors.push(data.error);
                }
            }).error(function(data, status) { // called asynchronously if an error occurs
                // or server returns response with an error status.
                $scope.errors.push(status);
            });

        // はじめ非表示を表示状態に
        $('.after_view').css("display", "block");
    };
    $scope.click = function(index){
        $scope.play(index);
    };
    // TODO
    $scope.similar = function(name){
        $scope.artist = name;
        angular.element('.tt-query').val(name);
        $scope.submit(true, name);
    };
    $scope.active_class = function(index){
        if($scope.playing && PlayList.index == index) return 'list-active';
    };
    if($location.search().q) {
        $scope.artist = $location.search().q;
        $scope.submit(true);
    }else{
        angular.element('#list-intro').fadeIn();
    }

});

