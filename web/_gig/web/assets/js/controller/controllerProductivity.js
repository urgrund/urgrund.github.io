app.controller('Productivity', function ($routeParams, $rootScope, $route, $scope, $timeout, $interval) {

    // Equip function to filter by
    $scope.function = $routeParams.filter;

    // Set the view choice in the root so its 
    // persistent with page reloads and equip filter
    if ($rootScope.productivityViewAsCompact == undefined) {
        $rootScope.productivityViewAsCompact = true;
    }


    // $scope.foo = function () {
    //     console.log("CONTROLLER SKDASDL");
    // }



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


    $scope.createCharts = function () {
        var elements = document.getElementsByClassName("chartdivcontent");
        for (var i = 0; i < elements.length; i++) {
            //Charts.CreateUofA(elements[i].id, $rootScope.equipment[elements[i].id]);
            Charts.CreateMPH(elements[i].id, $rootScope.equipment[elements[i].id], 2);
            ///Charts.CreateUofA(elements[i].id, $rootScope.equipment[elements[i].id]);
        }
        // var i = 0;
        // $interval(function () {
        //     Charts.CreateUofA(elements[i].id, $rootScope.equipment[elements[i].id]);
        //     i++;
        // }, 500, elements.length);
    }


    $scope.switchView = function (_state) {
        $rootScope.productivityViewAsCompact = _state;
        if (_state == false) {
            $timeout(function () {
                $scope.createCharts();
            }, 10);
        }
        else
            ClearAllCharts();
    }


    $scope.$watch('$viewContentLoaded', function () {
        if (!$rootScope.productivityViewAsCompact) {
            $timeout(function () {
                $scope.createCharts();
            }, 1);
        }
    });


    $scope.$on('updateShift', function (event, data) {
        $route.reload();
    });


});

