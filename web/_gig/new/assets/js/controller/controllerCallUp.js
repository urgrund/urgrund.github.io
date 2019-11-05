

app.controller("CallUp", function ($route, $scope, $rootScope, $routeParams, $timeout) {

    //console.log($routeParams.cupShift);
    //$scope.siteData = allData;


    $scope.callUpIsFirst = $routeParams.cupPeriod == 0 ? true : false;
    $scope.callUpIsDay = $rootScope.shift ? true : false;

    $scope.calUpTitleFirst = $scope.callUpIsFirst == true ? " First Operating Call-up" : " Last Operating Call-up";
    $scope.callUpTitleShift = $scope.callUpIsDay == true ? " Day Shift" : " Night Shift";


    //console.log($scope.siteData);
    //console.log($scope.calUpTitle);

    // Based on a site index and equipment index
    // return the real data object for the equipment
    $scope.getEquipObject = function (site, index) {
        if (index != null || index != undefined) { return $rootScope.siteData[site].equipment[index]; }
    };


    $scope.getCallUpEvent = function (site, index) {
        if (index != null || index != undefined) {
            var shiftData = $scope.getEquipShiftData(site, index);


            // So that we don't overwrite the original 
            var callUpEvent = JSON.stringify(($scope.callUpIsFirst == true) ? shiftData.events[shiftData.eventFirstOp] : shiftData.events[shiftData.events.length - 1]);

            if (callUpEvent == undefined) {
                console.log("Event was null for " + site + "  " + index);
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
        }
    };


    $scope.getEquipShiftData = function (site, index) {
        if (index != null || index != undefined) { return $scope.siteData[site].equipment[index].shiftData[$scope.callUpIsDay ? 1 : 0]; }
    };




    $scope.$watch('$viewContentLoaded', function () {

    });



    $scope.$on('updateShift', function (event, data) {
        $route.reload();
    });
});