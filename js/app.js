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
lamusica.service('YouTube', function($window, $http){
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
