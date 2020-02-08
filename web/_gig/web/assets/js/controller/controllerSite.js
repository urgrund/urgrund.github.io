
app.controller('Site', function ($scope, $routeParams, $rootScope, $timeout, $route) {

    $scope.site = null;
    $scope.shiftData = null;

    // For the chart IDs
    $scope.assetHaulID = "assetHaul";
    $scope.assetLoadID = "assetLoad";
    $scope.assetDrillID = "assetDrill";

    $scope.assetTotals = [];
    $scope.assetTotals[0] = [0, 0, 0];
    $scope.assetTotals[1] = [0, 0, 0];
    $scope.assetTotals[2] = [0, 0, 0];
    //console.log($scope.assetTotals);
    //$scope.metricProductionColour = "#007260";


    $scope.prepareAssetTotals = function () {
        if ($scope.site != undefined) {

            $scope.sumTotalsForFunctionType($scope.site.equipmentByFunction.LOADING, 0);
            $scope.sumTotalsForFunctionType($scope.site.equipmentByFunction.HAULING, 1);
            $scope.sumTotalsForFunctionType($scope.site.equipmentByFunction.P, 2);
            $scope.sumTotalsForFunctionType($scope.site.equipmentByFunction.D, 2);

            //console.log($scope.assetTotals);
        }
    };

    $scope.sumTotalsForFunctionType = function (_equipList, _totalsIndex) {
        if ($scope.site != undefined) {
            for (var i = 0; i < _equipList.length; i++) {
                var equip = $rootScope.equipment[_equipList[i].ID]
                var shiftData = equip.shiftData[$rootScope.shift];
                $scope.assetTotals[_totalsIndex][0] += shiftData.timeExOperating;
                $scope.assetTotals[_totalsIndex][1] += shiftData.timeExIdle;
                $scope.assetTotals[_totalsIndex][2] += shiftData.timeExDown;
            }
        }
    };

    $scope.$watch('$viewContentLoaded', function () {

        // Prepare controller data
        $timeout(function () {
            //console.log($routeParams.site);
            $scope.siteIndex = $routeParams.site;
            $scope.site = $rootScope.siteData[$scope.siteIndex];
            $scope.shiftData = $scope.site.shiftData[$rootScope.shift];

            $scope.prepareAssetTotals();
        }, 1);


        // Setup charts 
        $timeout(function () {
            $scope.createSiteCharts();
        }, 10);
    });

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
        ChartsMines.CreateTinyPie($scope.assetHaulID, $scope.assetTotals[0]);
        ChartsMines.CreateTinyPie($scope.assetLoadID, $scope.assetTotals[1]);
        ChartsMines.CreateTinyPie($scope.assetDrillID, $scope.assetTotals[2]);

        // Sankey
        //var allSites = $rootScope.siteData.slice(0, 1);
        //ChartsMines.CreateSankey("bla", allSites, 0);

        var barChartData = $scope.shiftData.productionTonnes;
        ChartsMines.CreateBar("bla", barChartData, "");

    };


    $scope.$on('updateShift', function (event, data) {
        //$route.reload();
        $scope.shiftData = $scope.site.shiftData[$rootScope.shift];
        $scope.prepareAssetTotals();
        $scope.createSiteCharts();
    });

});