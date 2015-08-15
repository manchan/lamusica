/**
 * アーティストの楽曲取得 default 20件
 */
lamusica.factory('Tracks', function($http) {
    return {
        get : function(query, callback) {
            var num = angular.element('#number').val();
			var limi = (num) ? num : '20';
			var requesturl = 'http://ws.audioscrobbler.com/2.0/?api_key=6a6281367c3ad09f1b4a7c15dc50675b&' +
				'method=artist.getTopTracks&' +
				'limit=' + limi +
				'callback=JSON_CALLBACK&' +
				'artist=' + query + '&' +
				'format=json';
			$http.get(encodeURI(requesturl)).then(function(data){
				if(data.data.toptracks) {
					callback(data.data.toptracks.track);
				}
				return [];
			});
			return [];

//            $http.jsonp(encodeURI(requesturl)).success(function(data){
//					console.dir(data);
//                    if(data.toptracks) {
//                        callback(data.toptracks.track);
//                    }
//                    return [];
//                });
//            return [];
        }
    };
});

/**
 * アーティスト情報取得
 */
lamusica.factory('ArtistInfo', function($http) {

    return {
        get : function(query, callback) {
			var requesturl = 'http://ws.audioscrobbler.com/2.0/?api_key=6a6281367c3ad09f1b4a7c15dc50675b&' +
				'method=artist.getinfo&' +
				'callback=JSON_CALLBACK&' +
				'artist=' + query + '&' +
				'format=json';
			$http.get(encodeURI(requesturl)).then(function(data){
				if(data.data.artist) {
					callback(data.data.artist);
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

/**
 * Generic Services
 */
lamusica.factory("genericServices", function(YT_ENV_VALUES) {

	var getYtKey = function(){
		var key = _.filter(YT_ENV_VALUES, function(v){
//			var str_url = url.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			var reg = new RegExp('(' + v.url +'.*?)');
			var matches = location.href.match(reg);
			if(matches){
				return v.api_key;
			}
		});
		return key[0].api_key;
	};

	return {
		getYtKey: getYtKey
	}
});
