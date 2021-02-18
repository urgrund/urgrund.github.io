

app.controller('DrillDown', function ($scope, $rootScope, $routeParams, $timeout, $route) {

    $scope.routeID = $routeParams.id;

    if ($rootScope.equipment == undefined) {
        return;
    }
    else {
        $scope.equip = $rootScope.equipment[$routeParams.id];
        if ($scope.equip == undefined)
            return;
    }

    $scope.lastEvent = $rootScope.getEquipmentLastEvent($scope.equip);
    $scope.equipMetric = "";
    for (var key in $scope.equip.shiftData[$rootScope.shift].metric) {
        $scope.equipMetric = $scope.equip.shiftData[$rootScope.shift].metric[key].name + " Per Hour";
    }




    $scope.createEquipmentData = function () {
        $scope.routeID = $routeParams.id;
        $scope.equip = $rootScope.equipment[$routeParams.id];

        if ($scope.equip == undefined)
            return;

        $scope.lastEvent = $rootScope.getEquipmentLastEvent($scope.equip);
        $scope.equipMetric = "";
        for (var key in $scope.equip.shiftData[$rootScope.shift].metric) {
            $scope.equipMetric = $scope.equip.shiftData[$rootScope.shift].metric[key].name + " Per Hour";
        }
    };




    $scope.createEquipmentCharts = function () {

        ClearAllCharts();
        if ($scope.equip == undefined)
            return;


        // Fancy timing to load charts
        var t = 70;
        var d = 70;

        var mph;
        var uofa;
        var timeline;

        var shiftData = $scope.equip.shiftData[ShiftIndex()];


        // Trailing week bar chart
        var week = Charts.CreateMPHRange("week", $scope.equip, $rootScope.cachedData);

        // Link it to load up the site data for that day
        week.on('click', function (params) {
            console.log($rootScope.cachedData[params.dataIndex]);
            var index = $rootScope.cachedData.length - params.dataIndex - 1;
            $rootScope.setNewSiteData($rootScope.cachedData[index]);
        });



        //var t0 = performance.now()
        timeline = Charts.CreateTimeLineFlat("timeline", $scope.equip, _includeTimeLine = true);
        //var t1 = performance.now()
        //console.log("CreateTimeLineFlat took " + (t1 - t0) + " milliseconds.")

        var g = new SimpleGaugeData();
        g.fontSize = 20;
        g.maxRadius = 160;
        g.radiusThickness = 30;
        g.center[1] = 88;
        g.titleBottom = 15;
        g.subTextLineHeight = -10;
        //for (var x in $scope.site.equipmentByFunction) {
        var assetUtilisation = shiftData.assetUtilisation;

        // Total Asset Availability
        g.value = assetUtilisation.totalAU;
        g.color = 'white';
        g.subText = "Utilisation";
        Charts.CreateGauge("_gAU", g);

        // Efficiency
        g.value = assetUtilisation.efficiency;
        g.color = ChartStyles.TUMColors[5];
        g.subText = "Efficiency";
        Charts.CreateGauge("_gE", g);

        // Availablity
        g.value = assetUtilisation.availability;
        g.color = ChartStyles.TUMColors[0];
        g.subText = "Availabilty";
        Charts.CreateGauge("_gA", g);

        g.value = assetUtilisation.uOfa;
        g.color = ChartStyles.TUMColors[2];
        g.subText = "U of A";
        Charts.CreateGauge("_gUofA", g);
        //}






        //$timeout(function () { mph = Charts.CreateMPH2("mph", $scope.equip, 2); }, d); d += t;
        mph = Charts.CreateMPH("mph", $scope.equip, 2);

        Charts.CreateWaterfall("tumwf", shiftData.assetUtilisation.tumTimings, shiftData.assetUtilisation.calendarTime)
        uofa = Charts.CreateUofA("uofa", $scope.equip);

        // Create Paretos for each TUM category
        for (var i = 0; i < ServerInfo.config.TUMIndex.length; i++) {
            Charts.CreatePareto("p" + i, shiftData.assetUtilisation.tumTimings[ServerInfo.config.TUMIndex[i]]);
        }


        // Link up mph & uofa
        $timeout(function () {

            if (mph != undefined && uofa != undefined) {
                mph.group = 'group1';
                uofa.group = 'group1';
                timeline.group = 'group1';
                echarts.connect('group1');
            }
        }, 500);

    }

    //    $scope.createEquipmentData();
    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () { $scope.createEquipmentCharts(); }, 150);
    });

    // $scope.$watch('configSet', function () {
    //     $timeout(function () { $scope.createEquipmentCharts(); }, 150);
    // });


    $scope.$on('updateShift', function (event, data) {
        $route.reload();
    });

});