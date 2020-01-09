


// Variables used outside of particular NG scopes  (ie. charts)
var shift = 0;
var shiftTitle = ['Day Shift', 'Night Shift'];
//var shiftCSS = ["<i style='color: yellow' class='fas fa - sun'></i>", "<i class='fas fa-moon'></i>"];

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




// const capitalize = (s) => {
//     if (typeof s !== 'string') return ''
//     return s.charAt(0).toUpperCase() + s.slice(1)
// }











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






    /** Set the data object that the core of the SIC
     * tool will interface with. */
    $rootScope.setNewSiteData = function (_data) {
        console.log("SKDJALKSDJ");
        // All sites
        $rootScope.siteData = _data;

        // Meta data is last
        $rootScope.meta = $rootScope.siteData.pop();

        // All equip next
        $rootScope.equipment = $rootScope.siteData.pop();

        $rootScope.siteDataDate = $rootScope.convertToNiceDateObject($rootScope.meta.Date);
    };




    $rootScope.equipStyleIcon = {
        OPERATING: 'far fa-arrow-alt-circle-up',
        IDLE: 'fas fa-exclamation-circle',
        DOWN: 'fas fa-times-circle'
    };

    $rootScope.equipStyleColor = {
        OPERATING: { 'color': ChartStyles.statusColorsFlat[0] },
        IDLE: { 'color': ChartStyles.statusColorsFlat[1] },
        DOWN: { 'color': ChartStyles.statusColorsFlat[2] }
    };




    /** Create a nicely formatted date from a numerical date
     */
    $rootScope.convertToNiceDateObject = function (_date) {
        var date = new Date(_date);
        var dateDay = days[date.getDay()];
        var dateMonth = month[date.getMonth()];// "September";

        var longDate = dateDay + ", " + date.getDate() + " " + dateMonth + " " + date.getFullYear();
        var shortDate = date.getDate() + "-" + (date.getUTCMonth() + 1) + "-" + date.getFullYear();
        var newDateObject = {
            LONG: longDate,
            SHORT: shortDate
        };

        return newDateObject;
    };



    // ------------------------------------------------------
    // Background Styles

    // MAYBE ALL THIS CAN BE IT'S OWN CLASS?

    $rootScope.backGroundState = true;

    /** Background style for each equipment */
    $rootScope.backGroundEquip = {
        HAULING: 'bg_truck',
        LOADING: 'bg_bog',
        P: 'bg_drill',
        D: 'bg_drill'
    };

    $rootScope.backGroundDefault = "bg_img";


    $rootScope.backGroundClass = $rootScope.backGroundDefault;
    $rootScope.backGroundClassBlur = $rootScope.backGroundDefault + "Blur";



    // $rootScope.backgroundOptions = [
    //     { 'name': 'Navy', 'value': 'bg_navy' },
    //     { 'name': 'Image', 'value': 'bg_img' }
    // ];
    // ------------------------------------------------------



});





// Main controller
app.controller("myCtrl", function ($scope, $rootScope, $timeout, $route, $location) {

    console.log("Main App Entry");


    $rootScope.setNewSiteData(allData);

    // Debug output
    console.log("Sites :");
    console.log($rootScope.siteData);

    console.log("Equipment :");
    console.log($rootScope.equipment);

    console.log("META :");
    console.log($rootScope.meta);






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





    // On Route Change
    $scope.$on('$locationChangeStart', function (event, next, current) {
        // Clear charts for memory/performance
        ClearAllCharts();

        // Update background 
        $scope.switchBackground($rootScope.backGroundState);
    });


    $scope.switchBackground = function (_state) {
        if (_state == true) {

            if ($location.$$url.includes("equip")) {
                var equipFunction = $rootScope.equipment[$location.$$url.slice(7)].function;

                console.log(equipFunction);
                $rootScope.backGroundClass = $rootScope.backGroundEquip[equipFunction];
                $rootScope.backGroundClassBlur = $rootScope.backGroundClass + "Blur";
            }
            else {
                $rootScope.backGroundClass = $rootScope.backGroundDefault;
                $rootScope.backGroundClassBlur = $rootScope.backGroundClass + "Blur";
            }

        }
        else {
            $rootScope.backGroundClass = "bg_navy";
            $rootScope.backGroundClassBlur = $rootScope.backGroundClass + "Blur";
        }

        $rootScope.backGroundState = _state;
        //$scope.$broadcast('backGroundChanged');
    }



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
                controller: 'DrillDown'//,
                //resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/callup/:cupPeriod", {
                templateUrl: 'callup.html',
                controller: 'CallUp'//,
                //resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/timeline/", {
                templateUrl: 'timeline.html',
                controller: 'TimeLine'//,
                //resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/productivity/:filter", {
                templateUrl: 'productivity.html',
                controller: 'Productivity'//,
                // resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/monthly/:site/:func", {
                templateUrl: function (params) {
                    return params.func == 0 ? 'monthly.html' : 'monthlyAdjust.html';
                    console.log(func);
                },
                controller: 'Monthly'//,
                // resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/reports/", {
                templateUrl: 'reports.html',
                controller: 'Reports'//,
                //resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/longterm/", {
                templateUrl: 'longterm.html',
                controller: 'LongTerm'//,
                //resolve: { init: function () { ClearAllCharts(); } }
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
    controller: function ($rootScope) {


        this.$onInit = function () {

            //console.log("ASKDLAJSDK");
            //console.log($rootScope.equipment);

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