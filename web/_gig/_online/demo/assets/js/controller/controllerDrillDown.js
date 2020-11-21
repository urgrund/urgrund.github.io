

app.controller('DrillDown', function ($scope, $rootScope, $routeParams, $timeout, $route) {

    $scope.routeID = $routeParams.id;
    $scope.equip = $rootScope.equipment[$routeParams.id];

    if ($scope.equip == undefined)
        return;

    $scope.lastEvent = $rootScope.getEquipmentLastEvent($scope.equip);
    $scope.equipMetric = "";
    for (var key in $scope.equip.shiftData[$rootScope.shift].metric) {
        $scope.equipMetric = $scope.equip.shiftData[$rootScope.shift].metric[key].name + " Per Hour";
    }




    $scope.createEquipmentData = function () {

        //console.log("Creating data for DD");

        $scope.routeID = $routeParams.id;
        $scope.equip = $rootScope.equipment[$routeParams.id];

        //console.log($scope.equip);

        if ($scope.equip == undefined)
            return;

        $scope.lastEvent = $rootScope.getEquipmentLastEvent($scope.equip);
        $scope.equipMetric = "";
        for (var key in $scope.equip.shiftData[$rootScope.shift].metric) {
            $scope.equipMetric = $scope.equip.shiftData[$rootScope.shift].metric[key].name + " Per Hour";
        }

    };


    $scope.createEquipmentCharts = function () {



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
            Charts.CreateUofAPie("tus", $scope.equip);
            //$timeout(function () { uofa = Charts.CreateUofA("uofa", $scope.equip); }, d); d += t;
            uofa = Charts.CreateUofA("uofa", $scope.equip);


            //$timeout(function () { Charts.CreatePareto("p1", $scope.equip.shiftData[shift].eventBreakDown.OPERATING, 4); }, d); d += t;
            Charts.CreatePareto("p1", $scope.equip.shiftData[shift].eventBreakDown.OPERATING, 4);
            //$timeout(function () { Charts.CreatePareto("p2", $scope.equip.shiftData[shift].eventBreakDown.IDLE, 1); }, d); d += t;
            Charts.CreatePareto("p2", $scope.equip.shiftData[shift].eventBreakDown.IDLE, 1);
            //$timeout(function () { Charts.CreatePareto("p3", $scope.equip.shiftData[shift].eventBreakDown.DOWN, 0); }, d); d += t;
            Charts.CreatePareto("p3", $scope.equip.shiftData[shift].eventBreakDown.DOWN, 0);

            //$timeout(function () { timeline = Charts.CreateTimeLine("timeline", $scope.equip); }, d); d += t;
            timeline = Charts.CreateTimeLine("timeline", $scope.equip);

            //$timeout(function () {
            // set group id of each instance respectively.
            // if (mph == undefined || uofa == undefined) {
            //     mph.group = 'group1';
            //     uofa.group = 'group1';
            //     echarts.connect('group1');
            // }
            //}, d * 5);

            //console.log("Done making charts");
        }, 100);
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