var app = angular.module('lamusica', ['ng']);

var flag = false;
var num = 0;
var left_disp = false;

function toggle(){
    flag = !flag;
    if(flag == true){
        $("#repeat_btn").addClass("btn-warning");
        $("#repeat_btn").removeClass("btn-info");
    }
    else{
        $("#repeat_btn").addClass("btn btn-default");
        $("#repeat_btn").removeClass("btn-warning");
    }
}

$(function(){
//    $('#left_btn').hover(function(){
//        $('#left_btn').stop().animate({width: 100}, {duration:100,
//            complete: function () {
//                $('#left_btn').css("width", "140px").css("background","url(images/trend_on.png)");
//            }
//        });
//
//    }, function(){
//
//        $('#left_btn').stop().animate({width: 100}, {duration:100,
//            complete: function () {
//                $('#left_btn').css("background","url(images/trend_off.png)");
//            }
//        });
//    });
});


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

app.factory('ChartTopArtists', function($http) {

    return {
        get : function(query, callback) {

            // 急上昇かトップアーティストどちらか
            var methods = ['chart.getHypedArtists', 'chart.getTopArtists'];
            var select_method = methods[ Math.random() * methods.length >> 0 ];

            $http.jsonp('http://ws.audioscrobbler.com/2.0/', {
                params : {
                    api_key : '6a6281367c3ad09f1b4a7c15dc50675b',
                    method : select_method,
                    period : '1month',
                    format : 'json',
                    limit  : 100,
                    callback : 'JSON_CALLBACK'
                }
            }).success(function(data){

                    if(data.artists.artist) {
                        callback(data.artists.artist);
                    }
                    return [];
                });
        }
    };
});


app.service('YouTube', function($window, $http){
    this.ready = false;
    this.player = null;
    this.play = function(track, callback, song) {

        if(song) {
            var query = song + ' ' + track.artist.name;
        }else{
            var query = track.name + ' ' + track.artist.name;
        }

        $http.jsonp('http://gdata.youtube.com/feeds/api/videos', {
            params : {
                q: query + ' -みた -コピ -カラオケ -ピアノ -弾き語り -カバー -ヒトカラ',
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

app.controller('controller', function($scope, $location, Tracks, YouTube, PlayList, ArtistInfo, ChartTopArtists, $http) {
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

    $scope.play = function(index, song){

        if(song && !index){
            // index search
            index = _.indexOf(_.pluck(PlayList.list, 'name'), song);
        }
        YouTube.play(PlayList.next(index), $scope.play, song);
        var track = PlayList.current_track();
        if(track) {
            $scope.title = track.name + ' by ' + track.artist.name + ' - lamusica #lamusicafree';
            // params set
            $location.search('song', track.name);

            $("#tweetButtonWrapper").html(
                '<a href="https://twitter.com/share" data-url="' + location.href + '" class="twitter-share-button"  data-text="'+ $scope.title + '" data-lang="en">Tweet</a>'
            );
            twttr.widgets.load();
            $scope.playing = true;
        }
    };

    $scope.trend_artist = function(){

        $scope.top_artists = [];
        left_disp = !left_disp;
        if(left_disp == true){

            ChartTopArtists.get('', function(artists){
                angular.forEach(artists, function(row, i){
                    this.push(row);
                }, $scope.top_artists);

                // ランダム表示
                $scope.top_artists = $scope.top_artists.map(function(a){return {weight:Math.random(), value:a}})
                    .sort(function(a, b){return a.weight - b.weight})
                    .map(function(a){return a.value});
            });

            $(".l_col_fix").animate( { opacity: 'show'}, { duration: 1000, easing: 'swing' } );
        }
        else{
            $(".l_col_fix").animate( { opacity: 'hide'}, { duration: 2000, easing: 'swing' } );
        }
    };
    $scope.trend_artist();

    $scope.submit = function(autoplay, query){

        // 一つ前のArtist取得
        $scope.prev_artist = $location.search().q;
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
                // Artist名、変更した場合
                if($location.search().q != $scope.prev_artist){
                    $scope.song = false;
                    // params set
                    $location.search('song', '');
                }
                $scope.play(undefined, $scope.song);
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
    // urlからの場合
    if($location.search().q) {
        $scope.artist = $location.search().q;
        $scope.song = $location.search().song;
        $scope.submit(true);
    }else{
        angular.element('#list-intro').fadeIn();
    }
});