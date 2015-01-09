/*global lamusica, angular*/
'use strict';

/**
 * The trend artist controller for the app. The trendArtistCtrl:
 */
lamusica.controller('trendArtistCtrl', function(
    $scope, $q, ChartTopArtists) {

    $scope.trend_artist = function(){

        var deferred = $q.defer();
        $scope.viewLoading = true;
        var rows = [];
        ChartTopArtists.get('', function(artists){

            angular.forEach(artists, function(row, i){
                this.push(row);
            }, rows);

            // ランダム表示
            rows = rows.map(function(a){return {weight:Math.random(), value:a}})
                .sort(function(a, b){return a.weight - b.weight})
                .map(function(a){return a.value});

            $(".l_col_fix").animate( { opacity: 'show'}, { duration: 1000, easing: 'swing' } );
            $scope.viewLoading = false;
            deferred.resolve(rows);
        });

        return deferred.promise;
    };

    $scope.refresh = function(){
        var promise = $scope.trend_artist();
        promise.then().then(function(row){
            $scope.trends = {
                rows: row
            };
        }).finally(function(){});
    };

    $scope.clickPlay = function(artist_name){
        $scope.onclickArtist(artist_name);
        $scope.$hide();
    };
    $scope.refresh();
});

// React generate virtual DOM faster than ng-repeat
var TrendArtist = React.createClass( {

    propTypes: {
        trends: React.PropTypes.object.isRequired,
        play  : React.PropTypes.func.isRequired
    },
    getDefaultProps: function() {
        return { trends: {} };
    },
    render: function() {
        var playExec = this.props.play;
        var clickHandler = function(ev){
            console.log("Still in reactJs");
            // TODO
            playExec($(ev.target.parentNode).find("p").text());
        };

        if(typeof this.props.trends == "undefined" ||
            typeof this.props.trends.rows == "undefined") {
            return React.DOM.ul( null, []);
        }

        var cols = this.props.trends.rows.map( function( col, i ) {
            var p    = React.DOM.p( {className:'pull-left trend_text'}, col.name );
            var img  = React.DOM.img( { key: i, className:'pull-left trend_img', src:col.image[1]['#text'] });
            var name = React.DOM.a( {
                className:'clearfix',
                onClick  : clickHandler
            },  [p, img]);
            return React.DOM.li( { key: i, className:'artist_img' }, name);
        } );
        return React.DOM.ul( null, [cols] );
    }
} );

lamusica.value( "TrendArtist", TrendArtist );
lamusica.directive( 'trendArtist', function( reactDirective ) {
    return reactDirective( TrendArtist );
} );