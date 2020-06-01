


// Variables used outside of particular NG scopes  (ie. charts)
var shift = 0;
var shiftTitle = ['Day Shift', 'Night Shift'];

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



// =====================================================================================
//  MAIN APPLICATION 
// =====================================================================================

// Init the Angular application
//var app = angular.module("myApp", ['ngRoute', 'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.exporter', 'ngMaterial', 'ngMessages']);
var app = angular.module("myApp", ['ngRoute', 'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.exporter']);


// First run and rootscope
app.run(function ($rootScope, $http, $route) {

    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";


    // Set the shift upon load of the site
    // based on the time of day of the client
    var format = 'hh:mm:ss'
    var time = moment(),
        beforeTime = moment('06:00:00', format),
        afterTime = moment('18:00:00', format);
    shift = (time.isBetween(beforeTime, afterTime)) ? 0 : 1;
    $rootScope.shift = shift;
    $rootScope.shiftTitle = shiftTitle[shift];


    // Data that the site will use 
    // Site data represents the current view
    // Chached data is the last 7 days for quick access
    $rootScope.siteData = null;
    $rootScope.cachedData = [];


    // ------------------------------------------------------

    /** Set the data object that the core of the SIC
     * tool will interface with. */
    $rootScope.setNewSiteData = function (_data) {

        var jsonString = JSON.stringify(_data);
        var newData = JSON.parse(jsonString);

        //console.log(newData);

        // All sites
        $rootScope.siteData = newData;

        // Meta data is last
        $rootScope.meta = $rootScope.siteData.pop();

        // All equip next
        $rootScope.equipment = $rootScope.siteData.pop();


        $rootScope.siteDataDate = $rootScope.convertToNiceDateObject($rootScope.meta.Date);


        $rootScope.functionMapping = $rootScope.meta.EquipmentFunctionMap;

        // Create a $root list of equipment by function
        // use the function mapping table as object keys 
        // then iterate over site data to populate
        $rootScope.equipmentByFunction = {};
        for (var key in $rootScope.functionMapping) {
            $rootScope.equipmentByFunction[key] = [];
        }

        for (var key in $rootScope.equipment) {
            var asset = $rootScope.equipment[key];
            if (asset.function in $rootScope.equipmentByFunction)
                $rootScope.equipmentByFunction[asset.function].push(key);
        }
        console.log($rootScope.equipmentByFunction);



        // Debug output
        if (true) {
            console.log("Sites :");
            console.log($rootScope.siteData);

            console.log("Equipment :");
            console.log($rootScope.equipment);

            console.log("META :");
            console.log($rootScope.meta);
        }
        // Update and broadcast message to the app
        //$rootScope.$apply();
        $rootScope.$broadcast('newSiteDataSet');
        $route.reload();
    };



    $rootScope.fetchSiteData = function (_dates, _setAfterFetch = false) {

        var urlGetData = '../dev/php/get_site_data.php';
        for (var i = 0; i < _dates.length; i++) {
            var date = _dates[i];
            //console.log(date);

            var _data = { 'func': 0, 'date': date };
            var request = $http({
                method: 'POST',
                url: urlGetData,
                data: _data
            })
            request.then(function (response) {
                // console.log("Response.....");
                // console.log(date);
                // console.log(response.data);
                //console.log(response);
                // console.log(".............");
                const { length } = $rootScope.cachedData;
                const found = $rootScope.cachedData.some(el => el[el.length - 1].Date === response.data[el.length - 1].Date);

                // It's new so add it 
                if (!found) {
                    $rootScope.cachedData.push(response.data);
                }

                // Apply to site if requested
                if (_setAfterFetch) {
                    $rootScope.setNewSiteData(response.data);
                }

                // Sort 
                $rootScope.cachedData.sort(function (a, b) { return b[b.length - 1]['Date'] - a[a.length - 1]['Date'] });

            }, function (error) {
                console.error("ERROR FETCHING DATA");
                console.error(error);
            });
        }



        // THIS WILL CHANGE TO NG PHP CALL
        // for (var i = 0; i < _dates.length; i++) {
        //     var date = _dates[i];

        //     //var file = 'http://localhost/web/sitedata/' + date + '.json';
        //     var file = '//localhost/web/sitedata/' + date + '.json';

        //     // console.log(date);console.log(date);

        //     fetch(file)
        //         .then((response) => {
        //             return response.json();
        //         })
        //         .then((myJson) => {

        //             //console.log(date);
        //             //console.log(myJson);

        //             // Check if date data already exists
        //             const { length } = $rootScope.cachedData;
        //             const found = $rootScope.cachedData.some(el => el[el.length - 1].Date === myJson[el.length - 1].Date);

        //             // It's new so add it 
        //             if (!found) {
        //                 $rootScope.cachedData.push(myJson);
        //             }

        //             // Apply to site if requested
        //             if (_setAfterFetch) {
        //                 $rootScope.setNewSiteData(myJson);
        //             }

        //             // Sort 
        //             //console.log($rootScope.cachedData);
        //             $rootScope.cachedData.sort(function (a, b) { return b[b.length - 1]['Date'] - a[a.length - 1]['Date'] });
        //         });
        // }
    };



    // With real data this should be set to current data
    var dates = ['20181010', '20181009', '20181008', '20181007', '20181006', '20181005', '20181004'];
    $rootScope.fetchSiteData(dates, false);

    // ------------------------------------------------------




    // ------------------------------------------------------
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
    // ------------------------------------------------------



    /**
     * Pass date as dd-mm-yyy. Creates a nicely formatted date from a numerical date
     */
    $rootScope.convertToNiceDateObject = function (_date) {
        var newDateObject = {
            LONG: moment(_date).format('dddd, DD-MM-YY'),
            SHORT: moment(_date).format('ddd DD MMM YYYY'),
        };
        return newDateObject;
        console.log("USE MOMENT FOR THIS");

        // Given a date such as 20181010
        // Split out the day, month, year
        var tmpDay = _date.substring(6, 8);
        var tmpMonth = _date.substring(4, 6);
        var tmpYear = _date.substring(0, 4);

        var tmpDate = tmpMonth + "-" + tmpDay + "-" + tmpYear;
        var date = new Date(tmpDate);
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


    /**
     * Get the last event registered with equipment based on the current shift     
     */
    $rootScope.getEquipmentLastEvent = function (_equip) {
        var len = _equip.shiftData[$rootScope.shift].events.length;
        var index = _equip.shiftData[$rootScope.shift].events[len - 1];
        return _equip.events[index];
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


    /** Colour for metrics that are production **/
    $rootScope.metricProductionColour = "#007260";

    // ------------------------------------------------------

});





// Main controller
app.controller("myCtrl", function ($scope, $rootScope, $timeout, $route, $location) {

    console.log("Main App Entry");

    // Fetch todays data and set it as soon as done
    $rootScope.fetchSiteData(['20181010'], true);


    //console.log(longTerm2);


    // Callback for new data being set
    $rootScope.$on('newSiteDataSet', function () {

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

    });






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
                if ($rootScope.equipment == undefined)
                    return;

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






    // $scope.$watch('$viewContentLoaded', function () {
    //     $timeout(function () {
    //         console.log("ASLKDJLASKDJLASKDJ");
    //         $scope.setupMenu();
    //     }, 100);
    // });

});


// =====================================================================================
// =====================================================================================



app.directive('fileReader', function () {
    return {
        scope: { someCtrlFn: '&callbackFn' },
        link: function (scope, element, attrs) {
            (element).on('change', function (changeEvent) {

                var files = changeEvent.target.files;
                if (files.length) {
                    Papa.parse(files[0], {
                        complete: function (results) {
                            //scope.$apply(function () { });
                            scope.someCtrlFn({ arg1: results.data });
                        }
                    });
                }
            });
        }
    };
});

app.directive('stringToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (value) {
                return '' + value;
            });
            ngModel.$formatters.push(function (value) {
                return parseFloat(value);
            });
        }
    };
});

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
                },
                controller: 'Monthly'
            })
            .when("/reports/", {
                templateUrl: 'reports.html',
                controller: 'Reports'
            })
            .when("/longterm/", {
                templateUrl: 'longterm.html',
                controller: 'LongTerm'
            })
            .when("/site/:site", {
                templateUrl: 'site.html',
                controller: 'Site'
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

//console.log("Setting up Components...");


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
        styleGroup: '@',
        styleItem: '@',
        lines: '@',
        equip: '<'
    },
    controller: function ($rootScope) {


        this.$onInit = function () {

            console.log(this.styleGroup);
            //console.log($rootScope.equipment);

            if (this.equip == undefined)
                return;

            //var len = this.equip.shiftData[this.shift].events.length;
            //this.lastEvent = this.equip.shiftData[this.shift].events[len - 1];
            this.lastEvent = $rootScope.getEquipmentLastEvent(this.equip);

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


            // this.flexColumn = "";
            // this.flex = "flex flex-start";

            // if (this.lines == 0) {
            //     this.flexColumn = "";
            //     this.flex = "";
            // }

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




/// ----------------------------------------
/// Shift Text
/// ----------------------------------------
app.component("shiftText", {
    templateUrl: 'components/shiftText.html',
    controller: function ($rootScope) {
        console.log("SALKDJALSKDJASKJDKASJDJLKASDLJK222222");
        this.shift = $rootScope.shift;
        this.shiftTitle = $rootScope.shiftTitle;
    }
});
/// ----------------------------------------




// =====================================================================================