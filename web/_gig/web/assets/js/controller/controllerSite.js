
app.controller('Site', function ($scope, $routeParams, $rootScope, $timeout, $route) {

    $scope.site = null;
    $scope.shiftData = null;
    $scope.siteID = $routeParams.site;



    $scope.summary = undefined;
    $scope.summaryMaterials = undefined;

    $scope.createSiteCharts = function () {

        if ($scope.site.summary != undefined) {
            $scope.summary = [];
            for (const property in $scope.site.summary) {
                if (typeof $scope.site.summary[property] !== 'object')
                    $scope.summary.push([property, $scope.site.summary[property]]);
            }

            $scope.summaryMaterials = [];
            for (const property in $scope.site.summary.materials) {
                $scope.summaryMaterials.push([property, $scope.site.summary.materials[property]]);
            }

            console.log($scope.summaryMaterials);
            console.log($scope.summary);
        }


        // Create flat timelines
        var x = document.getElementsByClassName("equip-flat-usage");
        for (var i = 0; i < x.length; i++) {
            var equip = $rootScope.equipment[x[i].id];
            if (equip != 'undefined') {
                Charts.CreateTimeLineFlat(x[i].id, equip);
            }
        }


        // Sankey        
        if ($rootScope.siteData != null)
            ChartsMines.CreateSankey("sankey", $rootScope.siteData, $scope.siteID);

        // Bar
        if ($scope.shiftData != null)
            ChartsMines.CreateBar("siteTPH", $scope.shiftData.metricData, "");


        var x = document.getElementsByClassName("gauge");
        for (var i = 0; i < x.length; i++) {
            //console.log(x[i]);
            //console.log($scope.shiftData.assetUtilisationByFunction)
        }


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
        }, 5);


        // Setup charts 
        $timeout(function () {
            $scope.createSiteCharts();
        }, 10);
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