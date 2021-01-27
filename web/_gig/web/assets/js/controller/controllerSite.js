
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

            //console.log($scope.summaryMaterials);
            //console.log($scope.summary);
        }


        // Create flat timelines
        var x = document.getElementsByClassName("equip-flat-usage");
        for (var i = 0; i < x.length; i++) {
            var equip = $rootScope.equipment[x[i].id];
            if (equip != 'undefined') {
                //Charts.CreateTimeLineFlat(x[i].id, equip);
            }
        }


        // Sankey        
        if ($rootScope.siteData != null)
            ChartsMines.CreateSankey("sankey", $rootScope.siteData, $scope.siteID);

        // Bar
        if ($scope.shiftData != null)
            ChartsMines.CreateBar("siteTPH", $scope.shiftData.metricData, "");


        // var g = new SimpleGaugeData();
        // var ct = shiftData.assetUtilisation.calendarTime;
        // g.fontSize = 40;

        // // Total Asset Availability
        // g.value = shiftData.assetUtilisation.totalAU;
        // g.color = 'white';
        // Charts.CreateGauge("gAU", g);

        // // Efficiency
        // g.value = shiftData.assetUtilisation.efficiency;
        // g.color = ChartStyles.TUMColors[1];
        // Charts.CreateGauge("gE", g);

        // // Availablity
        // g.value = shiftData.assetUtilisation.availability;
        // g.color = ChartStyles.TUMColors[5];
        // Charts.CreateGauge("gA", g);

        // g.value = shiftData.assetUtilisation.uOfa;
        // g.color = ChartStyles.TUMColors[2];
        // Charts.CreateGauge("gUofA", g);

        //var x = document.getElementsByClassName("gauge");
        //for (var i = 0; i < x.length; i++) {
        //console.log(x[i]);
        //console.log($scope.shiftData.assetUtilisationByFunction)
        //}

        var g = new SimpleGaugeData();
        g.fontSize = 15;
        //var ct = shiftData.assetUtilisation.calendarTime;
        //return;
        for (var x in $scope.site.equipmentByFunction) {
            var assetUtilisation = $scope.shiftData.assetUtilisationByFunction[x];

            //console.log("________________________________");
            //console.log(x);
            //console.log(assetUtilisation);

            // Total Asset Availability
            g.value = assetUtilisation.totalAU;
            g.color = 'white';
            Charts.CreateGauge(x + "_gAU", g);

            // Efficiency
            g.value = assetUtilisation.efficiency;
            g.color = ChartStyles.TUMColors[1];
            Charts.CreateGauge(x + "_gE", g);

            // Availablity
            g.value = assetUtilisation.availability;
            g.color = ChartStyles.TUMColors[4];
            Charts.CreateGauge(x + "_gA", g);

            g.value = assetUtilisation.uOfa;
            g.color = ChartStyles.TUMColors[2];
            Charts.CreateGauge(x + "_gUofA", g);
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
            $scope.createSiteCharts();
        }, 50);
    });


    $scope.$on('updateShift', function (event, data) {
        $timeout(function () {
            $scope.siteIndex = $routeParams.site;

            //console.log($scope.siteIndex);
            //console.log($rootScope.siteData);

            $scope.site = $rootScope.siteData[$scope.siteIndex];
            $scope.shiftData = $scope.site.shiftData[ShiftIndex()];
            //console.log($scope.shiftData);
            $scope.createSiteCharts();
        }, 10);
    });

});