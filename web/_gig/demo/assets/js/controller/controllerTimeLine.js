

app.controller("TimeLine", function ($route, $scope, $rootScope, $routeParams, $timeout) {

    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {

            // Create flat timelines

            //Charts.CreateTimeLineFlatTime("equip-timeline-time");

            for (var key in $rootScope.functionMapping) {
                Charts.CreateTimeLineFlatTime("equip-timeline-time-" + key);
            }

            var x = document.getElementsByClassName("equip-flat-usage");
            for (var i = 0; i < x.length; i++) {
                var equip = $rootScope.equipment[x[i].id];
                if (equip != 'undefined') {
                    Charts.CreateTimeLineFlat(x[i].id, equip);
                }
            }
        }, 0);
    });


    $scope.$on('updateShift', function (event, data) {
        $route.reload();
    });
});