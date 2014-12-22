/*global lamusica, angular*/
'use strict';

/**
 * The trend artist controller for the app. The trendArtistCtrl:
 */
lamusica.controller('trendArtistCtrl', function(
    $scope, $q, ChartTopArtists) {

    $scope.trend_artist = function(){

        $scope.viewLoading = true;
        $scope.top_artists = [];
        ChartTopArtists.get('', function(artists){
            angular.forEach(artists, function(row, i){
                this.push(row);
            }, $scope.top_artists);

            // ランダム表示
            $scope.top_artists = $scope.top_artists.map(function(a){return {weight:Math.random(), value:a}})
                .sort(function(a, b){return a.weight - b.weight})
                .map(function(a){return a.value});

            $(".l_col_fix").animate( { opacity: 'show'}, { duration: 1000, easing: 'swing' } );
            $scope.viewLoading = false;
        });
    };
    $scope.trend_artist();
});
