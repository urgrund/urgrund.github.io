/*
***************************************
M I N E   M A G E 
Front-end web application main entry point
(c) 2019-2021 Gigworth Pty Ltd

Version     1
Data        3
Revision    22

matt@gigworth.com.au
*************************************** 
*/

//console.log = function () { }



// Variables used outside of particular NG scopes  (ie. charts)
var shift = 0;
var fullDayView = 0;

const shiftTitle = ['Day Shift', 'Night Shift', '24hr'];

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const month = new Array();
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

const monthShort = new Array();
monthShort[0] = "Jan";
monthShort[1] = "Feb";
monthShort[2] = "Mar";
monthShort[3] = "Apr";
monthShort[4] = "May";
monthShort[5] = "Jun";
monthShort[6] = "Jul";
monthShort[7] = "Aug";
monthShort[8] = "Sep";
monthShort[9] = "Oct";
monthShort[10] = "Nov";
monthShort[11] = "Dec";





// =====================================================================================
//  MAIN APPLICATION 
// =====================================================================================

//angular.module('app', ['ui.grid', 'ui.grid.autoFitColumns'])
// Init the Angular application
var app = angular.module("myApp", ['ngRoute', 'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.exporter']);


// First run and rootscope
app.run(function ($rootScope, $http, $route, $location, $sce) {

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
    $rootScope.siteData = null;
    $rootScope.cachedData = [];
    $rootScope.config;
    $rootScope.monthly = null;



    // So that it can be used in angular
    $rootScope.ShiftIndex = function () { return ShiftIndex(); };

    $rootScope.siteDataRefreshIntervalSeconds = 60;
    $rootScope.siteDataLastRefresh = moment();
    $rootScope.siteDataNextRefresh = moment().add($rootScope.siteDataRefreshIntervalSeconds, 's');


    //$rootScope.configs = [];

    $rootScope.lastResponseError = null;
    $rootScope.checkResponseError = function (response) {
        if (response.data.includes('xdebug-error')) {
            console.log("[Error]");
            console.log(response);

            $rootScope.lastResponseError = response.data;
            $location.path('/error');
            return true;
        }
        return false;
    };


    $rootScope.errorResponse = null;
    $rootScope.processErrorResponse = function (error) {
        // Run the DB connect test to see
        // if this is a DB issue 
        $rootScope.checkConnection();

        console.log(error);
        $rootScope.errorResponse = error.data;
        $location.path('/error');
    };



    $rootScope.trustAsHtml = function (html) {
        return $sce.trustAsHtml(html);
    }

    // ------------------------------------------------------

    /** Set the data object that the core of the SIC
     * tool will interface with. */
    $rootScope.setNewSiteData = function (_data, _test = false) {

        if (_data == undefined) {
            console.log("Trying to set unassigned data");
            return;
        }

        console.log(_data);

        // For non NG access
        currentDayData = _data;

        //var jsonString = JSON.stringify(_data);
        //var newData = JSON.parse(jsonString);
        var newData = Array.from(_data);

        // All sites
        $rootScope.siteData = newData;

        // Meta data is last
        $rootScope.meta = $rootScope.siteData.pop();

        // All equip next
        $rootScope.equipment = $rootScope.siteData.pop();

        $rootScope.siteDataDate = $rootScope.convertToNiceDateObject($rootScope.meta.Date);
        $rootScope.functionMapping = $rootScope.meta.EquipmentFunctionMap;

        // Error check the date
        if ($rootScope.siteData.length < 1) {
            console.error("No sites with this date...");
            return;
        }


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
        //console.log($rootScope.equipmentByFunction);

        newData = null;

        // Debug output
        if (false) {
            console.log("[" + $rootScope.meta.Date + "]");
            console.log("Sites :");
            console.log($rootScope.siteData);

            console.log("Equipment :");
            console.log($rootScope.equipment);

            console.log("META :");
            console.log($rootScope.meta);
        }

        $rootScope.$broadcast('newSiteDataSet');
        $route.reload();
    };


    // ------------------------------------------------------






    /**
     * Pass date as dd-mm-yyy. Creates a nicely formatted date object from a numerical date
     **/
    $rootScope.convertToNiceDateObject = function (_date) {

        var newDateObject = {
            // TEMP ADD OF 20 MONTHS FOR DEMO
            //LONG: moment(_date).add(20, 'months').format('dddd, DD-MM-YY'),
            //SHORT: moment(_date).add(20, 'months').format('ddd DD MMM YYYY'),
            LONG: moment(_date).format('dddd, DD-MM-YY'),
            SHORT: moment(_date).format('ddd DD MMM YYYY'),
        };
        return newDateObject;
    };


    /**
     * Get the last event registered with equipment based on the current shift     
     */
    $rootScope.getEquipmentLastEvent = function (_equip) {
        if (_equip === undefined)
            return;
        var len = _equip.shiftData[ShiftIndex()].events.length;
        var index = _equip.shiftData[ShiftIndex()].events[len - 1];
        return _equip.events[index];
    };





    // ------------------------------------------------------
    // Styles related stuff

    // MAYBE ALL THIS CAN BE IT'S OWN CLASS?

    $rootScope.equipStyleIcon = {
        Operating: 'far fa-arrow-alt-circle-up',
        Idle: 'fas fa-exclamation-circle',
        Down: 'fas fa-times-circle'
    };

    $rootScope.equipStyleColor = {
        Operating: { 'color': ChartStyles.statusColorsFlat[0] },
        Idle: { 'color': ChartStyles.statusColorsFlat[1] },
        Down: { 'color': ChartStyles.statusColorsFlat[2] }
    };

    /**
     *  @param {string} _tumEvent */
    $rootScope.equipStyleTUMColorBG = function (_tumEvent) {
        var tumCategory = ServerInfo.config.TUM[_tumEvent];
        var tumColorIndex = ServerInfo.config.TUMKeys[tumCategory];
        var tumColor = ChartStyles.TUMColors[tumColorIndex].colorStops[1].color;
        return {
            'background': 'linear-gradient(0deg,' + tumColor + ', transparent)'
        };
    }

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


    /** Colour for metrics that are production*/
    $rootScope.metricProductionColour = "#007260";

    // ------------------------------------------------------




    $rootScope.fetchSiteData = function (_dates, _setAfterFetch = false, _replace = false) {

        for (var i = 0; i < _dates.length; i++) {
            var date = _dates[i];
            //console.log(date);

            var _data = { 'func': 0, 'date': date };
            var request = $http({
                method: 'POST',
                url: ServerInfo.URL_GetSiteData,
                data: _data
            })
            request.then(function (response) {

                //console.log($rootScope.cachedData);

                // Does this exist?
                var found = false;
                if ($rootScope.cachedData.length > 0)
                    found = $rootScope.cachedData.some(el => el[el.length - 1].Date === response.data[response.data.length - 1].Date);

                // It's new so add it 
                if (!found) {
                    //console.log("Wasn't found...");
                    $rootScope.cachedData.push(response.data);
                }

                // if (!true) {
                //     console.log("[" + response.data[response.data.length - 1].Date + "] was added...");
                //     console.log(response.data);
                //     console.log($rootScope.cachedData.length + " days of data in memory");
                // }

                //if (_replace)
                //  return;

                // Apply to site if requested
                if (_setAfterFetch) {
                    $rootScope.setNewSiteData(response.data, _replace);
                }

                // Sort 
                $rootScope.cachedData.sort(function (a, b) { return b[b.length - 1]['Date'] - a[a.length - 1]['Date'] });

            }, function (error) {
                //console.error(error);
                $rootScope.processErrorResponse(error);
            });
        }
    };





    $rootScope.fetchSiteConfigs = function () {
        var _data = { 'func': 4 };
        var request = $http({
            method: 'POST',
            url: ServerInfo.URL_Admin,
            data: _data,
        })
        request.then(function (response) {

            ServerInfo.config = response.data;
            ServerInfo.config.TUMIndex = Object.values(ServerInfo.config.TUMIndex);
            $rootScope.config = response.data;

            console.log("[Configs]");
            console.log(ServerInfo.config);

            $rootScope.$broadcast('configSet');
        }, function (error) {
        });
        return request;
    }




    /**
     * Get the available data dates from the server and set trailing week
     */
    $rootScope.fetchAvailableDates = function (_setTrailingWeek = true) {
        var _data = { 'func': 1 };
        var request = $http({
            method: 'POST',
            url: ServerInfo.URL_GetSiteData,
            data: _data,
        })
        request.then(function (response) {
            if ($rootScope.checkResponseError(response))
                return;
            //console.log("[Available Dates]");
            //console.log(response.data);
            ServerInfo.availableDates = response.data;
            $rootScope.$broadcast('availableDatesSet');

        }, function (error) {
        });
        return request;
    }



    $rootScope.connectionStatus = new ConnectionStatus();
    $rootScope.checkConnection = function () {
        var _data = { 'func': 5 };
        var request = $http({
            method: 'POST',
            url: ServerInfo.URL_Admin,
            data: _data,
        })
        request.then(function (response) {
            console.log("Connected to DB");
            $rootScope.connectionStatus.status = 1;
            $rootScope.connectionStatus.text = "Ok";
            $rootScope.connectionStatus.messages = "";

            //console.log(response.data);
        }, function (error) {
            console.error("Failed to connect to DB");
            $rootScope.connectionStatus.status = 0;
            $rootScope.connectionStatus.text = error.data[0];
            $rootScope.connectionStatus.messages = error.data[1];
        });
        return request;
    }



    $rootScope.fetchMonthlyData = function () {

        var request = $http({
            method: 'POST',
            url: ServerInfo.URL_Monthly,
            data: { 'func': 0 }
        })
        request.then(function (response) {
            console.log(response.data);
            $rootScope.monthly = response.data;
            $rootScope.$broadcast('monthlySet');
        }, function (error) {
        });
        return request;
    }
});





// ===============================================================================================
// Main controller
// ===============================================================================================
app.controller("myCtrl", function ($q, $scope, $rootScope, $timeout, $route, $location, $interval) {

    // The start-up sequence 
    console.log("Starting Mine-Mage...");

    // First up... can we connect to the DB?
    $q.all([$rootScope.checkConnection()]).then(
        function (responses) {

            if ($rootScope.connectionStatus.status == 1) {

                // Fetch the site configs
                // and available dates
                var promises = [
                    $rootScope.fetchSiteConfigs(),
                    $rootScope.fetchAvailableDates()
                ];

                // Everything looks good to this point... 
                $q.all(promises).then(function (responses) {
                    // Set the data 
                    console.log("Config & Dates ready");
                    promises = [
                        // Latest date and Trailing week 
                        $rootScope.fetchSiteData([ServerInfo.availableDates[0]], true),
                        $rootScope.fetchSiteData(ServerInfo.availableDates.slice(1, 7), false),

                        // Monthly report data
                        $rootScope.fetchMonthlyData()
                    ];
                });
            }
        }
    ).catch(function (err) {
        // Failed to connect
    });;




    // ------------------------------------------------------
    // Interval function to update the current days data
    $scope.updateIntervalForTodaysData = function () {
        //$rootScope.fetchSiteData(['20181003'], true, true);
        console.log("Refreshing todays data...");
        $rootScope.siteDataLastRefresh = moment();
        $rootScope.siteDataNextRefresh = moment().add($rootScope.siteDataRefreshIntervalSeconds, 's');
    }

    //$interval(function () { $scope.updateIntervalForTodaysData(); }, $rootScope.siteDataRefreshIntervalSeconds * 1000);
    // ------------------------------------------------------


    // Callback for new data being set
    $rootScope.$on('newSiteDataSet', function () {

        // ------------------------------------------------------
        // Fake alerts
        var alerts = [];
        $rootScope.alerts = null;
        for (var i = 0; i < Math.round(Math.random() * 10); i++) {
            var randSite = Math.floor(Math.random() * ($rootScope.siteData.length - 1));
            if ($rootScope.siteData[randSite] == undefined)
                continue;

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


    // Switch the background visuals 
    // if it's in an equipment view, need to figure out
    // which one it is and set the custom image 
    $scope.switchBackground = function (_state) {
        if (_state == true) {

            if ($location.$$url.includes("equip")) {
                if ($rootScope.equipment == undefined)
                    return;

                var equipFunction = $rootScope.equipment[$location.$$url.slice(7)].function;

                //console.log(equipFunction);
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
    }



    // Change the shift for the current view
    // and broadcast the event 
    $scope.switchShift = function (_state) {

        if (_state == true)
            $rootScope.shift = 0;
        else
            $rootScope.shift = 1;

        shift = $rootScope.shift;
        $rootScope.shiftTitle = shiftTitle[ShiftIndex()];

        // Only broadcast if not in day view
        if ($rootScope.fullDayView === 1)
            return;
        else
            $scope.$broadcast('updateShift');
    };

    $scope.switchDayView = function (_state) {
        $rootScope.fullDayView = (_state == true) ? 0 : 1;
        fullDayView = $rootScope.fullDayView;

        //if (fullDayView == 1)
        $rootScope.shiftTitle = shiftTitle[ShiftIndex()];
        $scope.$broadcast('updateShift');
    };


    $scope.getReports = function () {
    };

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
            .when("/equip/:id", {
                templateUrl: 'drilldown.html',
                controller: 'DrillDown'//,
                //resolve: { init: function () { ClearAllCharts(); } }
            })
            .when("/callup/:cupPeriod", {
                templateUrl: 'callup.html',
                controller: 'CallUp'
            })
            .when("/timeline/", {
                templateUrl: 'timeline.html',
                controller: 'TimeLine'
            })
            .when("/productivity/:filter", {
                templateUrl: 'productivity.html',
                controller: 'Productivity'
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
            .when("/reporting/", {
                templateUrl: 'reporting.html',
                controller: 'Reporting'
            })
            .when("/longterm/", {
                templateUrl: 'longterm.html',
                controller: 'LongTerm'
            })
            .when("/site/:site", {
                templateUrl: 'site.html',
                controller: 'Site'
            })
            .when("/error/", {
                templateUrl: 'error.html',
                //controller: 'Site'
            });

        //error
    }
);


// =====================================================================================








// =====================================================================================
// Components
// TODO: Move this into component files








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