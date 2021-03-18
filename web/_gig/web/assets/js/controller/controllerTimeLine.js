app.controller("TimeLine", function ($route, $scope, $rootScope, $location, $timeout) {

    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {

            // Timeline time
            for (var key in $rootScope.functionMapping) {
                Charts.CreateTimeLineFlatTime("equip-timeline-time-" + key);
            }

            // Timeline charts
            var x = document.getElementsByClassName("equip-flat-usage");
            for (var i = 0; i < x.length; i++) {
                var equip = $rootScope.equipment[x[i].id];
                if (equip != 'undefined') {
                    var chart = Charts.CreateTimeLineFlat(x[i].id, equip);
                    chart.on('click', function (params) {
                        $location.path("equip/" + String(params.seriesName));
                    });
                }
            }
        }, 10);
    });


    $scope.$on('updateShift', function (event, data) {
        $route.reload();
    });
});