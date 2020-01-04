


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



const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}











// =====================================================================================
//  MAIN APPLICATION 
// =====================================================================================

// Init the Angular application
var app = angular.module("myApp", ['ngRoute', 'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.exporter', 'ngMaterial', 'ngMessages']);


// First run and rootscope
app.run(function ($rootScope) {

    // TODO
    // Shift should at least start correctly
    // ie) if it's 6am-6pm,  it's Day Shift

    //if(itsDayShift) shift = 0 else shift = 1;

    $rootScope.shift = shift;
    $rootScope.shiftTitle = shiftTitle[shift];

    // All sites
    $rootScope.siteData = allData;

    // Meta data is last
    $rootScope.meta = $rootScope.siteData.pop();

    // All equip next
    $rootScope.equipment = $rootScope.siteData.pop();


    // Debug output
    console.log("Sites :");
    console.log($rootScope.siteData);

    console.log("Equipment :");
    console.log($rootScope.equipment);

    console.log("META :");
    console.log($rootScope.meta);


    // Background options
    $rootScope.backGroundClass = "bg_img";
    $rootScope.backGroundClassBlur = "bg_imgBlur";

    $rootScope.backgroundOptions = [
        { 'name': 'Navy', 'value': 'bg_navy' },
        { 'name': 'Image', 'value': 'bg_img' }
    ];


    // ------------------------------------------------------
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
    // ------------------------------------------------------



    $rootScope.setNewSiteData = function (_data) {
    };




    $rootScope.getEquipStyle = function (majorGroup) {
        if (majorGroup == "OPERATING") { return { 'color': ChartStyles.statusColorsFlat[0] } }
        if (majorGroup == "IDLE") { return { 'color': ChartStyles.statusColorsFlat[1] } }
        if (majorGroup == "DOWN") { return { 'color': ChartStyles.statusColorsFlat[2] } }
    };



    //console.log($rootScope.alerts);
});


// Main controller
app.controller("myCtrl", function ($scope, $rootScope, $timeout) {

    console.log("Main App Entry");





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


    $scope.createMenuEquipList = function () {
        var list = [];
        for (var key in $rootScope.equipment) {
            list.push($rootScope.equipment[key].id);
        }
        //console.log(list);
        return list;
    };


    $scope.switchBackground = function (_class) {
        if (_class == true) {
            $rootScope.backGroundClass = "bg_img";
            $rootScope.backGroundClassBlur = $rootScope.backGroundClass + "Blur";
        }
        else {
            $rootScope.backGroundClass = "bg_navy";
            $rootScope.backGroundClassBlur = $rootScope.backGroundClass + "Blur";
        }
        //console.log(_class);
        //$rootScope.backGroundClass = _class;
        //$rootScope.backGroundClassBlur = _class + "Blur";
        //$scope.shiftSwitchChanged($rootScope.shift == 0 ? true : false);
    }

    $scope.$watch('$viewContentLoaded', function () {
        $scope.createMenuEquipList();
    });

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
            //.when("/equip/:siteIndex/:equipIndex", {
            .when("/equip/:id", {
                templateUrl: 'drilldown.html',
                controller: 'DrillDown',
                resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/callup/:cupPeriod", {
                templateUrl: 'callup.html',
                controller: 'CallUp',
                resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/timeline/", {
                templateUrl: 'timeline.html',
                controller: 'TimeLine',
                resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/productivity/:filter", {
                templateUrl: 'productivity.html',
                controller: 'Productivity',
                resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/monthly/:site/:func", {
                templateUrl: function (params) {
                    return params.func == 0 ? 'monthly.html' : 'monthlyAdjust.html';
                    console.log(func);
                },
                controller: 'Monthly',
                resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/reports/", {
                templateUrl: 'reports.html',
                controller: 'Reports',
                resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/longterm/", {
                templateUrl: 'longterm.html',
                controller: 'LongTerm',
                resolve: { init: function () { ClearAllCharts(); } }
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
        name: '@',
        chart: '@'
    },
    controller: function ($rootScope) {
        //console.log($rootScope);
        //this.root = $rootScope;
    }
});
/// ----------------------------------------





/// ----------------------------------------
/// Equipment Header Details
/// ----------------------------------------
app.component("drillDownHeader", {
    //require: { main: '^myCtrl' },
    templateUrl: 'components/drillDownHeader.html',
    bindings: {
        shift: '@',
        lines: '@',
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


            this.flexColumn = "";
            this.flex = "flex flex-start";

            if (this.lines == 0) {
                this.flexColumn = "";
                this.flex = "";
            }

        };
    }
});
/// ----------------------------------------





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
/// ----------------------------------------





/// ----------------------------------------
/// Report Item
/// ----------------------------------------
app.component("reportItem", {
    templateUrl: 'components/reportItem.html',
    bindings: {
        key: '@',
        value: '@',
        id: '@'
    },
    controller: function ($rootScope) {
        this.$onInit = function () {
            //console.log(this.id);
        };
    }
});
/// ----------------------------------------





// =====================================================================================