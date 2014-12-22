/*global lamusica, angular, Firebase */
'use strict';

var repeat_flag = false;
var left_disp = false;

/**
 * The main controller for the app. The mainCtrl:
 */
lamusica.controller('mainCtrl', function(
    $scope, $location, Tracks, YouTube, PlayList, ArtistInfo,
    $http, $q, $controller) {

    $scope.playing = false;
    $scope.title = 'lamusica';
    $scope.number = '';

    // Artist予測表示
    $scope.getArtist= function(viewValue) {

        var params = {
            'artist': viewValue,
            'format': 'json',
            'limit': '5',
            'method': 'artist.search'};

        return $http.get(
            'http://ws.audioscrobbler.com/2.0/?api_key=6a6281367c3ad09f1b4a7c15dc50675b',
            { params: params }
        ).then(function(res) {
                if(typeof( res.data.results) != 'undefined' && res.data.results.artistmatches) {
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

    $scope.recent_plays_artist_play = function(name){
        angular.element('.artist_input').val(name);
        $scope.submit(true, name);
    };
    $scope.similar = function(name){
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

        Tracks.get($scope.artist, function(tracks){

            angular.element('#list-intro').remove();
            angular.forEach(tracks, function(row, i){ PlayList.add(row); });
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
                    angular.forEach(data, function(row, i){ $('.amz_link').append(row);});
                }
            }).error(function(data, status) {
                $scope.errors.push(status);
            });

        // はじめ非表示を表示状態に
        $('.after_view').css("display", "block");

        // Controller 継承
        $controller('recentPlayCtrl', {$scope: $scope});
        // TODO 履歴カウントUP
        $scope.plays_add();
//        $rootScope.$broadcast('playsAdd');
    };
    $scope.click = function(index){ $scope.play(index); };
    $scope.active_class = function(index){
        if($scope.playing && PlayList.index == index) return 'list-active';
    };
    // urlからの場合
    if($location.search().q) {
        $scope.artist = $location.search().q;
        angular.element('.artist_input').val($location.search().q);
        $scope.song = $location.search().song;
        $scope.submit(true);
    }else{
        angular.element('#list-intro').fadeIn();
    }
});