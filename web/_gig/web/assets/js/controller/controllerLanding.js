app.controller('Landing', function ($route, $rootScope, $scope, $timeout) {

    // Fake data for landing page
    var date = new Date();

    var dateDay = days[date.getDay()];
    var dateMonth = month[date.getMonth()];// "September";

    $scope.dateString = dateDay + ", " + date.getDate() + " " + dateMonth + " " + date.getFullYear();



    $scope.siteSummary = [];
    $scope.PrepareSiteSummarys = function () {
        if ($rootScope.siteData == null)
            return;

        $scope.siteSummary = [];
        for (var i = 0; i < $rootScope.siteData.length; i++) {
            $scope.siteSummary.push(
                {
                    "Tonnes vs Daily Target": { "value": 40, "details": 12345, "suffix": "%", "icon": "fas fa-weight-hanging" },
                    "Tonnes vs Monthly Target": { "value": 40, "details": 12345, "suffix": "%", "icon": "fas fa-weight-hanging" },
                    "Spatial Compliance": { "value": 40, "details": 12345, "suffix": "%", "icon": "fas fa-chart-bar" },
                    "Volumetric Compliance": { "value": 40, "details": 12345, "suffix": "%", "icon": "fas fa-chart-bar" }
                }
            );
        }


        //console.log($scope.siteSummary);
    }




    $rootScope.$on('newSiteDataSet', function () {
        $scope.PrepareSiteSummarys();

    });



    $scope.$watch('$viewContentLoaded', function () {
        $scope.PrepareSiteSummarys();
    });



    // Clock counter
    $scope.clock = Date.now(); // initialise the time variable
    $scope.tickInterval = 1000 //ms

    var tick = function () {
        $scope.clock = Date.now() // get the current time
        $timeout(tick, $scope.tickInterval); // reset the timer
    }

    // Start the timer
    $timeout(tick, $scope.tickInterval);
});