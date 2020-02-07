
app.controller('Site', function ($scope, $routeParams, $rootScope, $timeout, $route) {

    $scope.site = null;
    $scope.shiftData = null;

    //$scope.metricProductionColour = "#007260";

    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            //console.log($routeParams.site);
            $scope.siteIndex = $routeParams.site;
            $scope.site = $rootScope.siteData[$scope.siteIndex];

            $scope.shiftData = $scope.site.shiftData[$rootScope.shift];

            console.log($scope.shiftData);






        }, 100);
    });


    $scope.$on('updateShift', function (event, data) {
        //$route.reload();
        $scope.shiftData = $scope.site.shiftData[$rootScope.shift];
    });

});