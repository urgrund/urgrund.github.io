

app.controller('DrillDown', function ($scope, $rootScope, $routeParams, $timeout, $route) {

    $scope.createEquipmentData = function () {

        $scope.equip = $rootScope.equipment[$routeParams.id];

        //var len = $scope.equip.shiftData[$rootScope.shift].events.length;
        $scope.lastEvent = $rootScope.getEquipmentLastEvent($scope.equip);  // $scope.equip.shiftData[$rootScope.shift].events[len - 1];
        //console.log($scope.lastEvent);

        var len = $scope.equip.shiftData[$rootScope.shift].events.length;
        $scope.lastEvent = $scope.equip.shiftData[$rootScope.shift].events[len - 1];

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
        $timeout(function () { mph = Charts.CreateMPH("mph", $scope.equip, 2); }, d); d += t;
        $timeout(function () { Charts.CreateUofAPie("tus", $scope.equip); }, d); d += t;
        $timeout(function () { uofa = Charts.CreateUofA("uofa", $scope.equip); }, d); d += t;

        $timeout(function () { Charts.CreatePareto("p1", $scope.equip.shiftData[shift].eventBreakDown.OPERATING, 4); }, d); d += t;
        $timeout(function () { Charts.CreatePareto("p2", $scope.equip.shiftData[shift].eventBreakDown.IDLE, 1); }, d); d += t;
        $timeout(function () { Charts.CreatePareto("p3", $scope.equip.shiftData[shift].eventBreakDown.DOWN, 0); }, d); d += t;

        $timeout(function () { timeline = Charts.CreateTimeLine("timeline", $scope.equip); }, d); d += t;

        $timeout(function () {
            // set group id of each instance respectively.
            mph.group = 'group1';
            uofa.group = 'group1';
            //timeline.group = 'group1';
            echarts.connect('group1');
        }, d);
    }


    $scope.createEquipmentData();
    $scope.$watch('$viewContentLoaded', function () {

        $scope.createEquipmentCharts();
    });



    $scope.$on('updateShift', function (event, data) {
        $route.reload();
    });

});