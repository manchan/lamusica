/*global lamusica, angular, Firebase */
'use strict';

var repeat_flag = false;
var left_disp = false;

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the $firebase service
 * - exposes the model to the template and provides event handlers
 */
lamusica.controller('controller', function(
    $scope, $location, Tracks, YouTube, PlayList, ArtistInfo, ChartTopArtists,
    $http, $aside, $firebase, $q, Tooltip) {

    $scope.playing = false;
    $scope.plays = [];
    $scope.title = 'lamusica';
    $scope.number = '';
    // Firebase
    var url = 'https://luminous-heat-9275.firebaseio.com/lamusica/plays/';
    var fireRef = new Firebase(url);
    // 最新100件
    var sync = $firebase(fireRef.orderByChild("date").limitToLast(100));
    $scope.plays = sync.$asArray();
    $scope.fire_reload = function(){

        var deferred = $q.defer();
        var notifyObj = "firebaseから取得開始";
        var rejectObj = "firebaseから取得失敗";
        deferred.notify(notifyObj);
        // obj取得終わり次第
        $scope.plays.$loaded().then(function(){
            deferred.resolve($scope.plays);
        }).catch(function(rejectObj){
                deferred.reject(rejectObj);
            });
        return deferred.promise;
    };

    $scope.$watch('plays', function () {
        var total = 0;
        var remaining = 0;
//        $scope.plays.$getIndex().forEach(function (index) {
//            var play = $scope.plays[index];
//            // Skip invalid entries so they don't break the entire app.
//            if (!play || !$scope.plays) {
//                return;
//            }
//            total++;
////            if (play.completed === false) {
////                remaining++;
////            }
//        });
    }, true);

    $scope.plays_add = function(){
        var exists = false;
        // firebaseから再度ロード
        $scope.fire_reload().then(function(){

            if(!$scope.plays.length && !$scope.artist){
                return false;
            }
            angular.forEach($scope.plays, function(play, i){

                if($scope.artist == play.name) {
                    var row = $scope.plays.$getRecord($scope.plays[i].$id);
                    $scope.plays[i].count++;
                    $scope.plays[i].date = new Date().getTime();
                    $scope.plays.$save(row);
                    exists = true;
                }
            });
            if(!exists) {
                $scope.plays.$add({
                    "name":$scope.artist,
                    "count": 1,
                    "date": new Date().getTime()
                });
            }
        });
    };

    $scope.plays_all_remove = function(){
            angular.forEach($scope.plays, function(play, i){
                    var row = $scope.plays.$getRecord($scope.plays[i].$id);
                    $scope.plays.$remove(row);
            });
    };

    // Show a basic aside from a controller
    var recentPlay = $aside({title: 'Recent Play List',
        content: 'this is content',
        scope: $scope,
        show: false,
        template: "template/aside/recentplay.html"
    });
    $scope.recentPlay = function() {
        recentPlay.$promise.then(function() {
            recentPlay.show();
        });
    };

    // trend tooltip
    $scope.trendTooltip = Tooltip.getTrend();
    // tooltip
    $scope.tooltip = Tooltip.getDefaults();

    // How to Use
    $scope.modal = {
        "title": "Title",
        "content": "Hello Modal<br />This is a multiline message!"
    };

    $scope.button = {
        "repeat": true
    };
    // repeat button
    $scope.repeatSwitch = function(){

        if($scope.button.repeat == true){
            $("#repeat_btn").addClass("btn-warning").removeClass("btn-info");
            $scope.tooltip.repeat = '1曲リピートON';
            repeat_flag = true;
        }
        else{
            $("#repeat_btn").addClass("btn btn-default").removeClass("btn-warning");
            $scope.tooltip.repeat = '1曲リピートOFF';
            repeat_flag = false;
        }
    };

    // Artist予測表示
    $scope.getArtist= function(viewValue) {

        var params = {
            'artist': viewValue,
            'format': 'json',
            'limit': '5',
            'method': 'artist.search'};

        return $http.get(
            'http://ws.audioscrobbler.com/2.0/?api_key=6a6281367c3ad09f1b4a7c15dc50675b',
            {params: params}
        ).then(function(res) {
                if(res.data.results.artistmatches) {
                    var artists = res.data.results.artistmatches;
                    return artists.artist;
                }
            });
    };
    // 候補選択後
    $scope.$on('$typeahead.select', function(e,data){
        $scope.artist = data;
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
            $scope.title = "Lamusicaで " +
                track.name + ' by ' + track.artist.name +
                ' を聞いています♪ #lamusicafree';
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
    $scope.recent_plays_artist_play = function(name){
        angular.element('.artist_input').val(name);
        $scope.submit(true, name);
    };
    $scope.submit = function(autoplay, query){

        // 一つ前のArtist取得
        $scope.prev_artist = $location.search().q;
        $scope.artist = query || angular.element('.artist_input').val() || $location.search().q;

        if (!$scope.artist || typeof $scope.artist == 'undefined') return;
        if (!$scope.playing) angular.element('#form .typeahead').typeahead('setQuery', $scope.artist);
        PlayList.clear();
        $location.search('q', $scope.artist);
        $scope.title = $scope.artist + ' - lamusica';

        $scope.plays_add();
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