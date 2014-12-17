/**
 * アーティストの楽曲取得 default 20件
 */
lamusica.factory('Tracks', function($http) {
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

/**
 * アーティスト情報取得
 */
lamusica.factory('ArtistInfo', function($http) {

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


/**
 * Trendアーティスト取得
 */
lamusica.factory('ChartTopArtists', function($http) {

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


/**
 * Tooltip AngularStrap $tooltip
 */
lamusica.factory('Tooltip', function($tooltip) {

    return {
//        getTrend : function() {
//            return $tooltip(
//                angular.element($('#left_btn')),
//                {
//                    title:'急上昇中<br/> or<br/> TOPアーティスト',
//                    placement: 'bottom',
//                    animation: 'am-fade-and-scale'
//                });
//        },

        getDefaults : function(){
            return {
                setnumber: '曲数の設定<br/>デフォルト:20',
                repeat   : '1曲リピートOFF',
                recent   : '最近聞かれているアーティストリストの表示',
                artist   : 'アーティスト名を入力',
                biography: 'アーティストの遍歴と紹介',
                similar  : '似ているアーティストの紹介',
                album    : 'アルバムの紹介',
                checked  : false}
        }
    };
});

/**
 * Aside AngularStrap $aside
 */
lamusica.factory('Aside', function($scope, $aside) {


    return {
        getRecentPlay : function() {
            // Show a basic aside from a controller
            var recentPlay = $aside({
                title: '<b><i class="fa fa-heart"></i> Recent Play List</b>',
                content: 'this is content',
                scope: $scope,
                show: false,
                template: "template/aside/recentplay.html"
            });

            return recentPlay.$promise.then(function() {
                recentPlay.show();
            });
        }
    };
});