

app.controller("TimeLine", function ($route, $scope, $rootScope, $routeParams, $timeout) {

    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {

            for (var key in $rootScope.functionMapping) {
                Charts.CreateTimeLineFlatTime("equip-timeline-time-" + key);
            }

            var x = document.getElementsByClassName("equip-flat-usage");
            //var charts = [];
            for (var i = 0; i < x.length; i++) {
                //for (var i = 0; i < 1; i++) {
                var equip = $rootScope.equipment[x[i].id];
                if (equip != 'undefined') {
                    //charts.push(Charts.CreateTimeLineFlat(x[i].id, equip));
                    var chart = Charts.CreateTimeLineFlat(x[i].id, equip);
                    chart.group = 'tlGrp';
                }
            }
            // Link up mph & uofa
            // $timeout(function () {
            //     echarts.connect('tlGrp');
            // }, 100);

        }, 0);
    });


    $scope.$on('updateShift', function (event, data) {
        $route.reload();
    });
});