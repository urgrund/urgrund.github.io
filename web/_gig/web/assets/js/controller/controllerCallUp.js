

app.controller("CallUp", function ($route, $scope, $rootScope, $routeParams, $timeout) {
    $scope.callUpIsFirst = $routeParams.cupPeriod == 0 ? true : false;
    $scope.callUpIsDay = $rootScope.shift ? true : false;

    $scope.calUpTitleFirst = $scope.callUpIsFirst == true ? " First Operating Call-up" : " Last Operating Call-up";
    $scope.callUpTitleShift = $scope.callUpIsDay == true ? " Day Shift" : " Night Shift";


    //console.log($scope.siteData);
    //console.log($scope.calUpTitle);


    // Create arrays for call-up
    $scope.equipByFunc = [];
    $scope.equipByFunc.push({ 'name': "Trucks", 'equipment': [] });
    $scope.equipByFunc.push({ 'name': "Boggers", 'equipment': [] });
    $scope.equipByFunc.push({ 'name': "Drills", 'equipment': [] });

    for (var key in $rootScope.equipment) {
        var e = $rootScope.equipment[key];
        if (e.function == 'P' || e.function == 'D')
            $scope.equipByFunc[2].equipment.push(e);
        else if (e.function == 'LOADING')
            $scope.equipByFunc[1].equipment.push(e);
        else if (e.function == 'HAULING')
            $scope.equipByFunc[0].equipment.push(e);
    }

    console.log($scope.equipByFunc);





    // TODO
    // Remove Site and Index, use only Equip KEY
    $scope.getCallUpEvent = function (_equip) {

        var shiftData = _equip.shiftData[$scope.callUpIsDay ? 1 : 0];

        // So that we don't overwrite the original 
        var eventIndex = ($scope.callUpIsFirst == true) ? shiftData.eventFirstOp : shiftData.events[shiftData.events.length - 1];
        var callUpEvent = JSON.stringify(_equip.events[eventIndex]);

        if (callUpEvent == undefined) {
            console.log("Event was null " + _equip);
            return;
        }

        // And... turn it back into an object...
        callUpEvent = JSON.parse(callUpEvent);

        // ---------------------------------------------
        // Get time difference from 8am or 8pm
        var date1 = new Date(callUpEvent.eventTime.date);
        var date2 = new Date(callUpEvent.eventTime.date);
        date2.setHours($scope.callUpIsDay ? 8 : 20);
        date2.setMinutes(0);
        date2.setSeconds(0);
        var diff = date1 - date2;

        var msec = diff;
        var hh = Math.floor(msec / 1000 / 60 / 60);
        msec -= hh * 1000 * 60 * 60;
        var mm = Math.floor(msec / 1000 / 60);
        diff = hh + "hr " + mm + "m";

        callUpEvent.timeDiff = diff;
        // ---------------------------------------------

        //console.log(callUpEvent.eventTime.date);

        callUpEvent.eventTime.date = callUpEvent.eventTime.date.split(" ")[1].substring(0, 8);
        return callUpEvent;
    };



    $scope.$watch('$viewContentLoaded', function () {

    });



    $scope.$on('updateShift', function (event, data) {
        $route.reload();
    });
});