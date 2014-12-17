/*
 Copyright (c) 2014 Yuichi Matsuoka <anything12new14@gmail.com>
 Licensed under the terms of the MIT license.
 See the file LICENSE for copying permissions.
 */

lamusica.directive('loadingSpinner', function() {
        'use strict';

        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            scope: {
                loading: '=loadingSpinner'
            },
            templateUrl: 'js/directives/templates/loading.html',
            link: function(scope, element, attrs) {

                var opts = {
                    lines: 20, //線の数
                    length: 30, //線の長さ
                    width: 11, //線の幅
                    radius: 16, //スピナーの内側の広さ
                    corners: 3, //角の丸み
                    rotate: 74, //向き(あんまり意味が無い・・)
                    direction: 1, //1：時計回り -1：反時計回り
                    color: '#EB6100', // 色
                    speed: 1.5, // 一秒間に回転する回数
                    trail: 71, //残像の長さ
                    shadow: true, // 影
                    hwaccel: true, // ？
                    height:10,
//                    className: 'spinner', // クラス名
//                    zIndex: 2e9, // Z-index
                    top: '20%', // relative TOP
                    left: '50%', // relative LEFT
                    opacity: .25, //透明度
                    fps: 20, //fps,
                    position: 'relative'
                };

                var spinner = new Spinner(opts).spin();
                // Stop
//                spinner.stop();
                var loadingContainer = element.find('.loading-spinner-container')[0];
                loadingContainer.appendChild(spinner.el);
            }
        };
    });