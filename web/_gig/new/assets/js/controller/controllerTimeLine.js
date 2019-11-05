

app.controller("TimeLine", function ($route, $scope, $rootScope, $routeParams, $timeout) {

    //console.log($routeParams.cupShift);
    //$scope.siteData = allData;




    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {

            // Create flat timelines
            var x = document.getElementsByClassName("equip-flat-usage");


            Charts.CreateTimeLineFlatTime("equip-timeline-time");
            console.log(x[0]);

            // Start at i=1 because 0 is the timeline bar
            for (var i = 1; i < x.length; i++) {
                var s = x[i].id.split('-');
                if (s[1] != "") {
                    var equip = $scope.siteData[s[0]].equipment[s[1]];
                    //console.log(equip);
                    if (equip != 'undefined') {
                        Charts.CreateTimeLineFlat(x[i].id, equip);
                    }
                }
            }
        }, 0);
    });


    $scope.$on('updateShift', function (event, data) {
        $route.reload();
    });
});