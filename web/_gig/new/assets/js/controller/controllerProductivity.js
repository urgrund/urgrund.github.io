app.controller('Productivity', function ($routeParams, $rootScope, $route, $scope, $timeout) {

    $scope.function = $routeParams.filter;


    $scope.equipToShow = [];
    if ($routeParams.filter == 'ALL') {
        $scope.equipToShow = $rootScope.equipment;
    }
    else {
        for (var key in $rootScope.equipment) {
            var e = $rootScope.equipment[key];
            if (e.function == $routeParams.filter)
                $scope.equipToShow.push(e);
        }
    }


    //console.log($scope.equipToShow);
    //console.log($rootScope.equipment);

    $scope.createCharts = function () {
        var elements = document.getElementsByClassName("chartdivcontent");

        // Using site and equip indices as element ID
        // use this to create a chart
        for (var i = 0; i < elements.length; i++) {
            //var res = elements[i].id.split("-");
            //res[0] = parseInt(res[0]);
            //res[1] = parseInt(res[1]);
            //var equip = $scope.siteData[res[0]].equipment[res[1]];
            //Charts.CreateUofA(elements[i].id, equip);
            Charts.CreateUofA(elements[i].id, $rootScope.equipment[elements[i].id]);
        }
    }



    $scope.$watch('$viewContentLoaded', function () {

        $timeout(function () {
            $scope.createCharts();
        }, 1);
    });


    $scope.$on('updateShift', function (event, data) {
        $route.reload();
    });


});

