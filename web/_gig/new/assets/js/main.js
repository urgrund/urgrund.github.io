


// Variables used outside of particular NG scopes  (ie. charts)
var shift = 0;

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";


const MajorGroup = {
    IDLE: 'Idle',
    OPERATING: 'Operating',
    DOWN: 'Down'
}

getEquipStyle = function (majorGroup) {
    if (majorGroup == "OPERATING") { return { 'color': ChartStyles.statusColorsFlat[0] } }
    if (majorGroup == "IDLE") { return { 'color': ChartStyles.statusColorsFlat[1] } }
    if (majorGroup == "DOWN") { return { 'color': ChartStyles.statusColorsFlat[2] } }
};




// =====================================================================================
//  MAIN APPLICATION 
// =====================================================================================

var app = angular.module("myApp", ["ngRoute"]);

// Main Application Entry Point
app.controller("myCtrl", function ($scope, $timeout, $element, $document) {
    console.log("Main App Entry");
    $scope.siteData = allData;
    $scope.shift = shift;
    console.log($scope.siteData);

    $scope.myValue = true;
    $scope.shiftSwitchChanged = function (_state) {
        if (_state == true)
            $scope.shift = 0;
        else
            $scope.shift = 1;

        console.log(_state + "  " + $scope.shift);
    };

});


// =====================================================================================
// =====================================================================================







// =====================================================================================
// Router

app.config(
    function ($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "landing.html",
                controller: 'LandingRoute'
            })
            .when("/equip/:siteIndex/:equipIndex", {
                templateUrl: 'drilldown.html',
                controller: 'DrillDownRoute'
            });
        // .when("/Mines", {
        //     templateUrl: "dash_mines.html",
        //     controller: 'MineRoute'
        // })
        // .when('/abcdefg', {
        //     controller: 'BlaBla',
        //     templateUrl: function () {
        //         // You can route to different templates
        //         return loggedIn ? "app/main/main-loggedIn.html" : "app/main/main-loggedOut.html"
        //     }
        // });
    }
);


// =====================================================================================





// =====================================================================================
// Components

console.log("Setting up Components...");


/// ----------------------------------------
/// Drill Down Chart Container
/// ----------------------------------------
app.component("drillDownChart", {
    templateUrl: 'components/drillDownChart.html',
    bindings: {
        title: '@',
        chart: '@'
    }
});



/// ----------------------------------------
/// Equipment Header Details
/// ----------------------------------------
app.component("drillDownHeader", {
    //require: { main: '^myCtrl' },
    templateUrl: 'components/drillDownHeader.html',
    bindings: {
        shift: '@',
        equip: '<'
    },
    controller: function () {

        this.getEquipStyle = function (majorGroup) {
            if (majorGroup == "OPERATING") { return { 'color': ChartStyles.statusColorsFlat[0] } }
            if (majorGroup == "IDLE") { return { 'color': ChartStyles.statusColorsFlat[1] } }
            if (majorGroup == "DOWN") { return { 'color': ChartStyles.statusColorsFlat[2] } }
        };

        this.$onInit = function () {

            if (this.equip == undefined)
                return;

            var len = this.equip.shiftData[this.shift].events.length;
            this.lastEvent = this.equip.shiftData[this.shift].events[len - 1];

            // ---------------------------------------------
            // Get time difference from 8am or 8pm
            var date1 = new Date(this.lastEvent.eventTime.date);
            var date2 = new Date();
            var diff = date2 - date1;

            var msec = diff;
            var hh = Math.floor(msec / 1000 / 60 / 60);
            msec -= hh * 1000 * 60 * 60;
            var mm = Math.floor(msec / 1000 / 60);
            diff = hh + "hr " + mm + "m";


            // Can this variable be updated with 
            // interval check so that its realtime?
            this.late = 0;
            if (hh > 4) {
                this.timeSinceLastCall = ">" + 4 + "hrs!";
                this.late = 1;
            }
            else
                this.timeSinceLastCall = diff;

            this.lastEventTime = this.lastEvent.eventTime.date.split(" ")[1].substring(0, 8);
            // ---------------------------------------------

        };
    }
});




/// ----------------------------------------
/// Alert Box
/// ----------------------------------------
app.component("alertBox", {
    templateUrl: 'components/alertBox.html',
    bindings: {
        alert: '<'
    }
});

// =====================================================================================