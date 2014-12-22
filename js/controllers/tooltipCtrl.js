/*global lamusica, angular*/
'use strict';

/**
 * The tooltip controller for the app. The tooltipCtrl:
 */
lamusica.controller('tooltipCtrl', function($scope, Tooltip){
    // Get Tooltip Default Message
    $scope.tooltip = Tooltip.getDefaults();

    $scope.button = {
        "repeat": true
    };
    // Repeat Play Button
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
});
