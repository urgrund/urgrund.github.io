


// Variables used outside of particular NG scopes  (ie. charts)
var shift = 0;
var shiftTitle = ['Day Shift', 'Night Shift'];
var shiftCSS = ["<i style='color: yellow' class='fas fa - sun'></i>", "<i class='fas fa-moon'></i>"];

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

app.run(function ($rootScope) {
    $rootScope.shift = shift;
    $rootScope.shiftTitle = shiftTitle[shift];
    $rootScope.siteData = allData;

    // Fake alerts
    var alerts = [];
    for (var i = 0; i < Math.round(Math.random() * 10); i++) {

        var randSite = Math.floor(Math.random() * ($rootScope.siteData.length - 1));
        var randEquip = Math.floor(Math.random() * $rootScope.siteData[randSite].equipment.length);
        if (Math.random() > 0.5) {
            alerts[i] = {
                level: 0,
                time: "09:24",
                siteIndex: randSite,
                equipIndex: randEquip,
                message: "Bogger has been in-active for over 15minutes",
                action: "Get someone on the bogger"
            };
        } else {
            alerts[i] = {
                level: 1,
                time: "14:12",
                siteIndex: randSite,
                equipIndex: randEquip,
                message: "TPH has been below target for over 1hr",
                action: "Get someone on the bogger"
            };
        }
    }

    $rootScope.alerts = alerts;

    $rootScope.getEquipStyle = function (majorGroup) {
        if (majorGroup == "OPERATING") { return { 'color': ChartStyles.statusColorsFlat[0] } }
        if (majorGroup == "IDLE") { return { 'color': ChartStyles.statusColorsFlat[1] } }
        if (majorGroup == "DOWN") { return { 'color': ChartStyles.statusColorsFlat[2] } }
    };
    console.log($rootScope.alerts);
});



// Main Application Entry Point
app.controller("myCtrl", function ($scope, $rootScope, $timeout) {

    console.log("Main App Entry");
    console.log($rootScope.siteData);

    $scope.myValue = true;


    $scope.shiftSwitchChanged = function (_state) {
        if (_state == true)
            $rootScope.shift = 0;
        else
            $rootScope.shift = 1;

        $rootScope.shiftTitle = shiftTitle[$rootScope.shift];
        shift = $rootScope.shift;
        $scope.$broadcast('updateShift');
    };


    $scope.getReports = function () {
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
                controller: 'Landing'
            })
            .when("/equip/:siteIndex/:equipIndex", {
                templateUrl: 'drilldown.html',
                controller: 'DrillDown'
            })
            .when("/callup/:cupPeriod", {
                templateUrl: 'callup.html',
                controller: 'CallUp'
            });;
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

            console.log("SDKADLS");
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
    },
    controller: function ($rootScope) {
        this.$onInit = function () {
            this.equipment = $rootScope.siteData[this.alert.siteIndex].equipment[this.alert.equipIndex];
            //console.log(this.equipment);
        };
    }
});

// =====================================================================================