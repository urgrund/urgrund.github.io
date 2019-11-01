

app.controller('DrillDownRoute', function ($scope, $routeParams, $timeout) {

    //console.log($routeParams.siteIndex + "  " + $routeParams.equipIndex);

    $scope.equip = $scope.siteData[$routeParams.siteIndex].equipment[$routeParams.equipIndex];
    console.log($scope.equip);

    var len = $scope.equip.shiftData[$scope.shift].events.length;
    $scope.lastEvent = $scope.equip.shiftData[$scope.shift].events[len - 1];

    $scope.equipMetric = "";
    for (var key in $scope.equip.shiftData[$scope.shift].metric) {
        //console.log($scope.equip.shiftData[shiftIsDay].metric[key]);
        $scope.equipMetric = $scope.equip.shiftData[$scope.shift].metric[key].name + " Per Hour";
    }

    $scope.$watch('$viewContentLoaded', function () {
        // Fancy timing to load charts
        var t = 50
        var d = 70;

        var mph;
        var uofa;
        var timeline;
        $timeout(function () { mph = Charts.CreateMPH("mph", $scope.equip, 2); }, d); d += t;
        $timeout(function () { Charts.CreateUofAPie("tus", $scope.equip); }, d); d += t;
        $timeout(function () { uofa = Charts.CreateUofA("uofa", $scope.equip); }, d); d += t;

        $timeout(function () { Charts.CreatePareto("p1", MajorGroup.OPERATING, $scope.equip); }, d); d += t;
        $timeout(function () { Charts.CreatePareto("p2", MajorGroup.IDLE, $scope.equip); }, d); d += t;
        $timeout(function () { Charts.CreatePareto("p3", MajorGroup.DOWN, $scope.equip); }, d); d += t;

        $timeout(function () { timeline = Charts.CreateTimeLine("timeline", $scope.equip); }, d); d += t;

        $timeout(function () {
            // set group id of each instance respectively.
            mph.group = 'group1';
            uofa.group = 'group1';
            //timeline.group = 'group1';
            echarts.connect('group1');
        }, d);
    });
});