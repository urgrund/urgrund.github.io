

app.controller("CallUp", function ($route, $scope, $rootScope, $routeParams, $timeout) {
    $scope.callUpIsFirst = $routeParams.cupPeriod == 0 ? true : false;
    $scope.callUpIsDay = $rootScope.shift ? true : false;

    $scope.calUpTitleFirst = $scope.callUpIsFirst == true ? " First Operating Call-up" : " Last Event Call-up";
    //$scope.callUpTitleShift = $scope.callUpIsDay == true ? " Day Shift" : " Night Shift";


    /** 
     * Get the event for this call up
     * depending on first/last day/night
     **/
    $scope.getCallUpEvent = function (_equip) {

        //var shiftData = _equip.shiftData[$scope.callUpIsDay ? 1 : 0];
        var shiftData = _equip.shiftData[ShiftIndex()];

        // So that we don't overwrite the original 
        var eventIndex = ($scope.callUpIsFirst == true) ? shiftData.eventFirstOp : shiftData.events[shiftData.events.length - 1];
        var callUpEvent = JSON.stringify(_equip.events[eventIndex]);

        if (callUpEvent == undefined) {
            //console.log("Event was null " + _equip);
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