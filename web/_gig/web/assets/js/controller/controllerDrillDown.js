

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

        // Fancy timing to load charts
        var t = 70;
        var d = 70;

        var mph;
        var uofa;
        var timeline;

        var shiftData = $scope.equip.shiftData[ShiftIndex()];

        $timeout(function () {
            if ($scope.equip == undefined)
                return;

            // TEST
            var g = new SimpleGaugeData();
            //var ct = shiftData.assetUtilisation.calendarTime;
            g.fontSize = 40;

            // Total Asset Availability
            g.value = shiftData.assetUtilisation.totalAU;
            g.color = 'white';
            Charts.CreateGauge("gAU", g);

            // Efficiency
            g.value = shiftData.assetUtilisation.efficiency;
            g.color = ChartStyles.TUMColors[1];
            Charts.CreateGauge("gE", g);

            // Availablity
            g.value = shiftData.assetUtilisation.availability;
            g.color = ChartStyles.TUMColors[4];
            Charts.CreateGauge("gA", g);

            g.value = shiftData.assetUtilisation.uOfa;
            g.color = ChartStyles.TUMColors[2];
            Charts.CreateGauge("gUofA", g);



            //$timeout(function () { mph = Charts.CreateMPH2("mph", $scope.equip, 2); }, d); d += t;
            mph = Charts.CreateMPH("mph", $scope.equip, 2);

            Charts.CreateWaterfall("tumwf", shiftData.assetUtilisation.tumTimings, shiftData.assetUtilisation.calendarTime)
            uofa = Charts.CreateUofA("uofa", $scope.equip);

            // Create Paretos for each TUM category
            for (var i = 0; i < ServerInfo.config.TUMIndex.length; i++) {
                Charts.CreatePareto("p" + i, shiftData.assetUtilisation.tumTimings[ServerInfo.config.TUMIndex[i]]);
            }


            timeline = Charts.CreateTimeLineFlat("timeline", $scope.equip, _includeTimeLine = true);

            // Link up mph & uofa
            $timeout(function () {

                if (mph != undefined && uofa != undefined) {
                    mph.group = 'group1';
                    uofa.group = 'group1';
                    timeline.group = 'group1';
                    echarts.connect('group1');
                }
            }, 500);

        }, 100);
    }

    //    $scope.createEquipmentData();
    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () { $scope.createEquipmentCharts(); }, 150);
    });

    // $scope.$watch('configSet', function () {
    //     $timeout(function () { $scope.createEquipmentCharts(); }, 150);
    // });


    $scope.$on('updateShift', function (event, data) {
        //$timeout(function () {
        $route.reload();
        //}, 10);
    });

});