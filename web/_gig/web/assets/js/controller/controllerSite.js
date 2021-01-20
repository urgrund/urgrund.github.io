
app.controller('Site', function ($scope, $routeParams, $rootScope, $timeout, $route) {

    $scope.site = null;
    $scope.shiftData = null;
    $scope.siteID = $routeParams.site;

    //$scope.FunctionMapping = FunctionMapping;

    // For the chart IDs
    //$scope.assetHaulID = "assetHaul";
    //$scope.assetLoadID = "assetLoad";
    //$scope.assetDrillID = "assetDrill";

    //$scope.assetTotals = [];
    //$scope.assetTotals[0] = [0, 0, 0];
    //$scope.assetTotals[1] = [0, 0, 0];
    //$scope.assetTotals[2] = [0, 0, 0];
    //console.log($scope.assetTotals);
    //$scope.metricProductionColour = "#007260";
    //$scope.equipByFunc = [];



    $scope.createSiteCharts = function () {

        // Create flat timelines
        var x = document.getElementsByClassName("equip-flat-usage");
        for (var i = 0; i < x.length; i++) {
            var equip = $rootScope.equipment[x[i].id];
            if (equip != 'undefined') {
                Charts.CreateTimeLineFlat(x[i].id, equip);
            }
        }

        // Asset totals
        //ChartsMines.CreateTinyPie($scope.assetHaulID, $scope.assetTotals[0]);
        //ChartsMines.CreateTinyPie($scope.assetLoadID, $scope.assetTotals[1]);
        //ChartsMines.CreateTinyPie($scope.assetDrillID, $scope.assetTotals[2]);

        // Sankey        
        if ($rootScope.siteData != null)
            ChartsMines.CreateSankey("sankey", $rootScope.siteData, $scope.siteID);

        // Bar
        if ($scope.shiftData != null)
            ChartsMines.CreateBar("siteTPH", $scope.shiftData.metricData, "");
    };





    $scope.$watch('$viewContentLoaded', function () {
        //return;
        // Prepare controller data
        $timeout(function () {
            //console.log($routeParams.site);
            $scope.siteIndex = $routeParams.site;
            if ($rootScope.siteData != null) {
                $scope.site = $rootScope.siteData[$scope.siteIndex];
                $scope.shiftData = $scope.site.shiftData[ShiftIndex()];
            }

            //$scope.prepareAssetTotals();
        }, 50);


        // Setup charts 
        $timeout(function () {
            $scope.createSiteCharts();
        }, 100);
    });




    $rootScope.$on('newSiteDataSet', function () {
        $timeout(function () {
            $scope.siteIndex = $routeParams.site;
            $scope.site = $rootScope.siteData[$scope.siteIndex];
            $scope.shiftData = $scope.site.shiftData[ShiftIndex()];
        }, 50);

        // Setup charts 
        $timeout(function () {
            $scope.createSiteCharts();
        }, 100);
    });


    $scope.$on('updateShift', function (event, data) {
        $timeout(function () {
            $scope.shiftData = $scope.site.shiftData[ShiftIndex()];
            $scope.createSiteCharts();
        }, 10);
    });

});