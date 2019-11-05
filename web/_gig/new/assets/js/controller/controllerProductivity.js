app.controller('Productivity', function ($routeParams, $rootScope, $scope, $timeout) {

    $scope.function = $routeParams.filter;



    // Filter out duplicates (as 1 equip can exists in different sites)
    // to display in an associative array
    $scope.equipToShow = [];
    for (var i = 0; i < $rootScope.siteData.length; i++) {
        for (var j = 0; j < $rootScope.siteData[i].equipment.length; j++) {
            // Check function matches filter
            if ($rootScope.siteData[i].equipment[j].function == $routeParams.filter) {
                // Check doesn't exist in the array already
                if (!$scope.equipToShow.includes($rootScope.siteData[i].equipment[j].id)) {
                    $scope.equipToShow[$rootScope.siteData[i].equipment[j].id] = $rootScope.siteData[i].equipment[j];
                }
            }
        }
    }

    console.log($scope.equipToShow);




    $scope.$watch('$viewContentLoaded', function () {

        $timeout(function () {
            var elements = document.getElementsByClassName("chartdivcontent");

            // Using site and equip indices as element ID
            // use this to create a chart
            for (var i = 0; i < elements.length; i++) {
                var res = elements[i].id.split("-");
                res[0] = parseInt(res[0]);
                res[1] = parseInt(res[1]);
                var equip = $scope.siteData[res[0]].equipment[res[1]];
                Charts.CreateUofA(elements[i].id, equip);
            }
        }, 100);
    });
});

