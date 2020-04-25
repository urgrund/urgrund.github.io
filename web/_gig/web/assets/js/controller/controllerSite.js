
app.controller('Site', function ($scope, $routeParams, $rootScope, $timeout, $route) {

    $scope.site = null;
    $scope.shiftData = null;
    $scope.siteID = $routeParams.site;

    //$scope.FunctionMapping = FunctionMapping;

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
    $scope.equipByFunc = [];



    $scope.prepareSankey = function () {
        var matMoveData = [];
        matMoveData[0] = $rootScope.siteData[0];
        matMoveData[1] = $rootScope.siteData[1];
        matMoveData[2] = $rootScope.siteData[2];

        // This should be done in PHP
        for (var i = 0; i < $rootScope.siteData.length; i++) {
            var asLocations = { "Left": [], "Middle": [], "Middle2": [], "Right": [] };
            var uniqueLocations = [];

            var _d = $rootScope.siteData[i].materialMovement;

            // 2 = NameFrom
            // 4 = NameTo
            for (var x = 0; x < _d.length; x++) {

                if (!(_d[x][2] in uniqueLocations)) {
                    uniqueLocations[_d[x][2]] = _d[x][9];
                    // Push Start Location with the Site Index
                    asLocations[_d[x][9]].push([_d[x][2], i]);
                }

                if (!(_d[x][4] in uniqueLocations)) {
                    //console.log(_d[x][10]);
                    uniqueLocations[_d[x][4]] = _d[x][10];
                    asLocations[_d[x][10]].push([_d[x][4], i]);
                }
            }
            $rootScope.siteData[i].asLocations = asLocations;
            $rootScope.siteData[i].uniqueLocations = uniqueLocations;
        }
    };


    $scope.prepareAssetTotals = function () {
        if ($scope.site != undefined) {

            $scope.sumTotalsForFunctionType($scope.site.equipmentByFunction.LOADING, 0);
            $scope.sumTotalsForFunctionType($scope.site.equipmentByFunction.HAULING, 1);
            $scope.sumTotalsForFunctionType($scope.site.equipmentByFunction.P, 2);
            $scope.sumTotalsForFunctionType($scope.site.equipmentByFunction.D, 2);

            $scope.prepareSankey();
        }
    };


    $scope.sumTotalsForFunctionType = function (_equipList, _totalsIndex) {
        if ($scope.site != undefined) {
            for (var i = 0; i < _equipList.length; i++) {
                var equip = $rootScope.equipment[_equipList[i]]
                var shiftData = equip.shiftData[$rootScope.shift];
                $scope.assetTotals[_totalsIndex][0] += shiftData.timeExOperating;
                $scope.assetTotals[_totalsIndex][1] += shiftData.timeExIdle;
                $scope.assetTotals[_totalsIndex][2] += shiftData.timeExDown;
            }
        }
    };


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
        ChartsMines.CreateSankey("sankey", $rootScope.siteData, $scope.siteID);

        var barChartData = $scope.shiftData.productionTonnes;
        ChartsMines.CreateBar("siteTPH", barChartData, "");
    };





    $scope.$watch('$viewContentLoaded', function () {
        //return;
        // Prepare controller data
        $timeout(function () {
            //console.log($routeParams.site);
            $scope.siteIndex = $routeParams.site;
            $scope.site = $rootScope.siteData[$scope.siteIndex];
            $scope.shiftData = $scope.site.shiftData[$rootScope.shift];

            $scope.prepareAssetTotals();
        }, 5);


        // Setup charts 
        $timeout(function () {
            $scope.createSiteCharts();
        }, 10);
    });




    $rootScope.$on('newSiteDataSet', function () {
        //
        //
        //        
    });


    $scope.$on('updateShift', function (event, data) {
        //$route.reload();
        $scope.shiftData = $scope.site.shiftData[$rootScope.shift];
        $scope.prepareAssetTotals();
        $scope.createSiteCharts();
    });

});