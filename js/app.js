///*global angular */
///*jshint unused:false */
//'use strict';


/**
 * The main lamusica app module
 *
 * @type {angular.Module}
 */
var lamusica = angular.module('lamusica',
    ['ng', 'ngAnimate', 'mgcrea.ngStrap', 'ngRoute', 'firebase', 'react']);

lamusica.value('ENV_URL',
	[
		{
			'api_key':'AIzaSyBi7rXyIQLEmBL8dypJ2SEm-MMtNydVJUk',
			'url': "http:\/\/localhost"
		},
		{
			'api_key':'AIzaSyAsD4O3_C9b-k_Zie0VadjoRWnhl0O7tiA',
			'url': "http:\/\/manchan\.github\.io"
		}
	]);

lamusica.run(function(){
    var tag = document.createElement('script');
    tag.src = "http://www.youtube.com/iframe_api";
    var first_tag = document.getElementsByTagName('script')[0];
    first_tag.parentNode.insertBefore(tag, first_tag);
});

/**
 * Modal default setting
 */
lamusica.config(function($modalProvider) {
    angular.extend($modalProvider.defaults, {
        animation: 'am-flip-x',
        html: true
    });
});

/**
 * Tooltip default setting
 */
lamusica.config(function($tooltipProvider) {
    angular.extend($tooltipProvider.defaults, {
        html: true,
        animation: 'am-flip-x'
    });
});

/**
 * Aside default setting
 */
lamusica.config(function($asideProvider) {
    angular.extend($asideProvider.defaults, {
        html: true
    });
});

/**
 * YouTube Player generator
 */
lamusica.service('YouTube', function($window, $http, ENV_URL){
    this.ready = false;
    this.player = null;
    this.play = function(track, callback, song) {

        if(song) {
            var query = song + ' ' + track.artist.name;
        }else{
            var query = track.name + ' ' + track.artist.name;
        }

		var key = _.map(ENV_URL, function(v){
//			var str_url = url.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			var reg = new RegExp('(' + v.url +'.*?)');
			var matches = location.href.match(reg);
			console.log(matches);
			if(matches){
				return v.api_key;
			}
		});

//		https://www.googleapis.com/youtube/v3/videos?id=PqJNc9KVIZE&key=AIzaSyDUrhoHVRCb_dzCS50GgnqRhVGOTadMmLo&fields=items(id,snippet(channelTitle,title,thumbnails),statistics)&part=snippet,contentDetails,statistics
        $http.jsonp('https://www.googleapis.com/youtube/v3/search', {
//			&fields=items(id,snippet(channelTitle,title,thumbnails),statistics)&part=snippet,contentDetails,statistics
            params : {
				key: key,
				part: 'id,snippet',
                q: query + ' -みた -コピ -カラオケ -ピアノ -弾き語り -カバー -ヒトカラ',
				order: 'viewCount',
                'max-results' : 2,
                format : 5,
                callback : 'JSON_CALLBACK'
            }
        }).success(function(data){

				console.log(data);

                if(data.items[0]) {
//					data.items.sort(function(a,b){
//                        return b['favoriteCount'] - a['favoriteCount'];
//                    });
                    var id = data.items[0]['id']['videoId'];
//                    var id = permalink.match(/^.+\/(.+?)$/)[1];
                    if(this.ready) {
                        this.player.clearVideo();
                        this.player.loadVideoById(id);
                    }else{
                        this.player = new YT.Player('player', {
//                            height: '400',
//                            width: '600',
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


/**
 * YouTube Playlist Control
 */
lamusica.service('PlayList', function(){
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
                if(repeat_flag != true) {
                    this.index++;
                }
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

// resize header on scroll
$(window).resize(function() {
    if($(window).width() > 1000){
        $('#social-buttons').css('top', '15px');
    }else{
        $('#social-buttons').css('top', '37px');
    }
});
