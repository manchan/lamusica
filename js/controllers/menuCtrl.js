/*global lamusica, angular*/
'use strict';

/**
 * The menu controller for the app. The menuCtrl:
 */
lamusica.controller('menuCtrl', function(
    $scope, $modal, $aside, $location, $anchorScroll) {

    // Show a How To Modal from a controller
    var modalHow = $modal({
        title: 'modal title',
        content: 'this is content',
        animation: 'am-flip-x',
        placement: 'center',
        show: false,
        template: "template/modal/howtouse.html"
    });
    $scope.modalHow = function() {
        modalHow.$promise.then(function() {
            modalHow.show();
        });
    };

    // Modal Default
    $scope.modal = {
        "title": "Title",
        "content": "Hello Modal<br />This is a multiline message!"
    };

    // Show a Recent aside from a controller
    var recentPlay = $aside({
        title: '<b><i class="fa fa-heart"></i> Recent Play List</b>',
        content: '',
        scope: $scope,
        show: false,
        template: "template/aside/recentplay.html"
    });
    $scope.recentPlay = function() {
        recentPlay.$promise.then(function() {
            recentPlay.show();
        });
    };

    // Show a Trend aside from a controller
    var asideTrend = $aside({
        title: '<b><i class="fa fa-headphones"></i> Trend</b>',
        content: '',
        animation: 'am-fade-and-slide-left',
        placement: 'left',
        scope: $scope.$parent,
        show: false,
        template: "template/aside/trend.html"
    });
    $scope.asideTrend = function() {
        asideTrend.$promise.then(function() {
            asideTrend.show();
        });
    };

    $scope.scrollTo = function(id) {
        $location.hash(id);
        $anchorScroll();
    }
});
