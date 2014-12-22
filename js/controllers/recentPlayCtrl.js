/*global lamusica, angular*/
'use strict';

/**
 * The recent play controller for the app. The recentPlayCtrl:
 * - retrieves and persists the model via the $firebase service
 * - exposes the model to the template and provides event handlers
 */
lamusica.controller('recentPlayCtrl', function(
    $scope, $q, $firebase) {

    $scope.plays = [];
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

//    $scope.$watch('plays', function () {
//        var total = 0;
//        var remaining = 0;
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
//    }, true);

    $scope.plays_add = function(){

        // firebaseから再度ロード
        $scope.fire_reload().then(function(){

            if(!$scope.plays.length && !$scope.artist){
                return false;
            }
            var exists = false;
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
});