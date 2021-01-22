

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

        $timeout(function () {
            if ($scope.equip == undefined)
                return;

            //$timeout(function () { mph = Charts.CreateMPH2("mph", $scope.equip, 2); }, d); d += t;
            mph = Charts.CreateMPH("mph", $scope.equip, 2);

            Charts.CreateWaterfall("tumwf", $scope.equip.shiftData[ShiftIndex()].tumTimings)
            uofa = Charts.CreateUofA("uofa", $scope.equip);

            // Create Paretos for each TUM category
            for (var i = 0; i < ServerInfo.config.TUMIndex.length; i++) {
                Charts.CreatePareto("p" + i, $scope.equip.shiftData[ShiftIndex()].tumTimings[ServerInfo.config.TUMIndex[i]]);
            }


            // Charts.CreatePareto("p0", $scope.equip.shiftData[ShiftIndex()].tumTimings['Unplanned Breakdown']);
            // Charts.CreatePareto("p1", $scope.equip.shiftData[ShiftIndex()].tumTimings['Unplanned Standby']);
            // Charts.CreatePareto("p2", $scope.equip.shiftData[ShiftIndex()].tumTimings['Secondary Operating']);
            // Charts.CreatePareto("p3", $scope.equip.shiftData[ShiftIndex()].tumTimings['Planned Maintenance']);
            // Charts.CreatePareto("p4", $scope.equip.shiftData[ShiftIndex()].tumTimings['Operating Standby']);
            // Charts.CreatePareto("p5", $scope.equip.shiftData[ShiftIndex()].tumTimings['Primary Operating']);

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

            // $timeout(function () {
            //     if (mph != undefined) {
            //         var img = new Image();
            //         img.src = mph.getDataURL({
            //             pixelRatio: 2,
            //             backgroundColor: '#fff'
            //         });
            //     }
            // }, 1500);
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