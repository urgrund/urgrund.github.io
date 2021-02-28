app.controller('Landing', function ($route, $rootScope, $scope, $timeout) {

    // Fake data for landing page
    var date = new Date();

    var dateDay = days[date.getDay()];
    var dateMonth = month[date.getMonth()];// "September";

    $scope.dateString = dateDay + ", " + date.getDate() + " " + dateMonth + " " + date.getFullYear();

    $scope.monthly = null;

    $scope.siteSummary = [];
    $scope.PrepareSiteSummarys = function () {
        if ($rootScope.siteData == null)
            return;

        //if ($rootScope.monthlyActive != null)
        //  $scope.monthly = $rootScope.monthlyActive;
        //console.log($rootScope.monthly);

        $scope.siteSummary = [];

        var noPlan = "No Plan...";// found...  (" + moment($rootScope.meta.Date).format('MMM YYYY') + ")";
        // For each site, prepare a summary to display
        for (var i = 0; i < $rootScope.siteData.length; i++) {

            $scope.siteName = $rootScope.siteData[i].name;
            var spatial = 0;
            var volume = 0;
            var tVSdt = [0, noPlan];
            var tVSmt = [0, noPlan];

            var spatialDetails = noPlan;

            if ($rootScope.monthlyActive != null) {
                var site = $rootScope.monthlyActive.sites[$scope.siteName];
                // Setup the values to display
                if (site != undefined) {
                    spatial = (site.complianceSpatial * 100).toFixed();
                    volume = (site.complianceVolumetric * 100).toFixed();

                    tVSdt[0] = ((site.averageCurrent / site.averageRequired) * 100).toFixed();
                    tVSdt[1] = String(site.averageCurrent.toFixed() + " / " + site.averageRequired.toFixed());
                    tVSmt[0] = ((site.totalMetricActual / site.totalMetricTarget) * 100).toFixed();
                    tVSmt[1] = String(site.totalMetricActual.toFixed() + " actual / " + site.totalMetricTarget.toFixed() + " plan");

                    spatialDetails = String(spatial + "% of " + site.totalMetricTarget.toFixed() + " mined");
                }
            }

            // Push a summary with the display values
            $scope.siteSummary.push(
                {
                    "Tonnes vs Daily Target": { "value": tVSdt[0], "details": tVSdt[1], "suffix": "%", "icon": "fas fa-weight-hanging" },
                    //"Tonnes vs Monthly Target": { "value": tVSmt[0], "details": tVSmt[1], "suffix": "%", "icon": "fas fa-weight-hanging" },
                    "Spatial Compliance": { "value": spatial, "details": spatialDetails, "suffix": "%", "icon": "fas fa-chart-bar" },
                    "Volumetric Compliance": { "value": volume, "value": tVSmt[0], "details": tVSmt[1], "suffix": "%", "icon": "fas fa-chart-bar" }
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

    $scope.$on('monthlySet', function () {
        //console.log("MONTHLY HAS BEEN SET");
        //console.log("ASJDJSDLK");
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