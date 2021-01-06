

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
            mph = Charts.CreateMPH2("mph", $scope.equip, 2);

            //$timeout(function () { Charts.CreateUofAPie("tus", $scope.equip); }, d); d += t;
            //Charts.CreateUofAPie("tus", $scope.equip);
            //$timeout(function () { uofa = Charts.CreateUofA("uofa", $scope.equip); }, d); d += t;
            $scope.createWaterfall();
            uofa = Charts.CreateUofA("uofa", $scope.equip);

            //Primary Operating

            //Charts.CreatePareto("p1", $scope.equip.shiftData[shift].eventBreakDown.OPERATING, 4);


            // <drill-down-chart name="Planned Breakdown" chart="p1"></drill-down-chart>
            // <drill-down-chart name="Unplanned Standy" chart="p2"></drill-down-chart>
            // <drill-down-chart name="Secondary Operating" chart="p3"></drill-down-chart>

            // <drill-down-chart name="Planned Maintenance" chart="p4"></drill-down-chart>
            // <drill-down-chart name="Operating Standby" chart="p5"></drill-down-chart>
            // <drill-down-chart name="Primary Operating" chart="p6"></drill-down-chart>

            Charts.CreatePareto("p1", $scope.equip.shiftData[ShiftIndex()].tumTimings['Unplanned Breakdown']);
            Charts.CreatePareto("p2", $scope.equip.shiftData[ShiftIndex()].tumTimings['Unplanned Standby']);
            Charts.CreatePareto("p3", $scope.equip.shiftData[ShiftIndex()].tumTimings['Secondary Operating']);
            Charts.CreatePareto("p4", $scope.equip.shiftData[ShiftIndex()].tumTimings['Planned Maintenance']);
            Charts.CreatePareto("p5", $scope.equip.shiftData[ShiftIndex()].tumTimings['Operating Standby']);
            Charts.CreatePareto("p6", $scope.equip.shiftData[ShiftIndex()].tumTimings['Primary Operating']);

            //Charts.CreatePareto("p2", $scope.equip.shiftData[shift].eventBreakDown.IDLE, 1);
            //Charts.CreatePareto("p3", $scope.equip.shiftData[shift].eventBreakDown.DOWN, 0);

            //$timeout(function () { timeline = Charts.CreateTimeLine("timeline", $scope.equip); }, d); d += t;
            //timeline = Charts.CreateTimeLine("timeline", $scope.equip);
            timeline = Charts.CreateTimeLineFlat("timeline", $scope.equip);

            // Link up mph & uofa
            $timeout(function () {
                if (mph != undefined && uofa != undefined) {
                    mph.group = 'group1';
                    uofa.group = 'group1';
                    timeline.group = 'group1';
                    echarts.connect('group1');
                }
            }, 1500);
        }, 100);
    }

    $scope.createWaterfall = function () {


        var tumTimings = $scope.equip.shiftData[ShiftIndex()].tumTimings;

        // tumTimings['Unplanned Breakdown']);
        //     tumTimings['Unplanned Standby']);
        //     tumTimings['Secondary Operating']);
        //     tumTimings['Planned Maintenance']);
        //    tumTimings['Operating Standby']);
        //    tumTimings['Primary Operating']);

        var waterFall = [];

        waterFall.push({ 'name': 'Calendar Time', 'value': null });
        waterFall.push({ 'name': tumTimings['Unplanned Breakdown'], 'value': tumTimings['Unplanned Breakdown'].duration, 'id': 0 });
        waterFall.push({ 'name': tumTimings['Planned Maintenance'], 'value': tumTimings['Planned Maintenance'].duration, 'id': 1 });
        waterFall.push({ 'name': 'Total Availability', 'value': null });
        waterFall.push({ 'name': tumTimings['Unplanned Standby'], 'value': tumTimings['Unplanned Standby'].duration, 'id': 2 });
        waterFall.push({ 'name': tumTimings['Operating Standby'], 'value': tumTimings['Operating Standby'].duration, 'id': 3 });
        waterFall.push({ 'name': 'Total Utilisation', 'value': null });
        waterFall.push({ 'name': tumTimings['Secondary Operating'], 'value': tumTimings['Secondary Operating'].duration, 'id': 4 });
        waterFall.push({ 'name': tumTimings['Primary Operating'], 'value': tumTimings['Primary Operating'].duration, 'id': 5 });

        waterFall[0].value = waterFall[1].value + waterFall[2].value + waterFall[4].value + waterFall[5].value + waterFall[7].value + waterFall[8].value;
        waterFall[3].value = waterFall[0].value - waterFall[1].value - waterFall[2].value;
        waterFall[6].value = waterFall[3].value - waterFall[4].value - waterFall[5].value;

        $scope.calendarTime = Math.round(waterFall[0].value / 3600, 0) / 1000;

        var wf = ChartsMonthly.CreateLongTermWaterfall("tumwf", waterFall);
        //console.log(waterFall);
    }



    //    $scope.createEquipmentData();
    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            //$scope.createEquipmentData();
            $scope.createEquipmentCharts();
        }, 150);
        //$scope.createEquipmentData();
        //$scope.createEquipmentCharts();
    });



    $scope.$on('updateShift', function (event, data) {
        //$timeout(function () {
        $route.reload();
        //}, 10);
    });

});