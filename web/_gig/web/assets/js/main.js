/*
*****************************************************
M I N E   M A G E 
Front-end web application main entry point
(c) 2019-2021 Gigworth Pty Ltd

Version     1.3.22

matt@gigworth.com.au
***************************************************** 
*/

console.log("%c     Mine-Mage\u2122      ", 'background :#00436d; font-size:12pt');
//console.log = function () { } 





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


    // So that it can be used in angular
    $rootScope.ShiftIndex = function () { return ShiftIndex(); };

    //$rootScope.siteDataRefreshIntervalSeconds = 5;
    $rootScope.siteDataLastRefresh = moment();
    $rootScope.siteDataNextRefresh = moment().add(ServerInfo.dailyRefreshInterval, 's');


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






    /**
     * Pass date as dd-mm-yyy. Creates a nicely formatted date object from a numerical date
     **/
    $rootScope.convertToNiceDateObject = function (_date) {

        var newDateObject = {
            // TEMP ADD 20 MONTHS FOR DEMO
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
            return null;
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
        var tumColor = ChartStyles.TUMColors[tumColorIndex];
        if (tumColor != undefined) {
            var tumColorStop = ChartStyles.TUMColors[tumColorIndex].colorStops[1].color;
            return {
                'background': 'linear-gradient(0deg,' + tumColorStop + ', transparent)'
            };
        }
        return "";
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


    // ------------------------------------------------------





    // ---------------------------------------------------------------------------------------
    // Setting And Fetching Dates

    /** Set the data object that the core of the SIC
     * tool will interface with. */
    $rootScope.setNewSiteData = function (_data) {

        if (_data == undefined) {
            console.log("Trying to set undefined data");
            return;
        }

        //console.log(_data);

        if (true) {
            // For non NG access
            currentDayData = {};
            currentDayData = _data;

            let newData = Array.from(_data);

            // All sites
            $rootScope.siteData = newData;

            // Check the date
            if ($rootScope.siteData.length < 1) {
                console.error("No sites with this date...");
                return;
            }

            // Meta data is last
            $rootScope.meta = $rootScope.siteData.pop();

            // All equip next
            $rootScope.equipment = $rootScope.siteData.pop();

            $rootScope.siteDataDate = $rootScope.convertToNiceDateObject($rootScope.meta.Date);
            $rootScope.functionMapping = $rootScope.meta.EquipmentFunctionMap;
        }
        else {
            currentDayData = {};
            currentDayData = _data;

            $rootScope.siteData = null;
            $rootScope.meta = null;
            $rootScope.equipment = null;
            $rootScope.siteDataDate = null;
            $rootScope.functionMapping = null;

            //let newData = Array.from(_data);
            for (let i = 0; i < _data.length - 2; i++) {
                $rootScope.siteData[i] = _data[i];
            }
            // Meta data is last
            $rootScope.meta = _data[_data.length - 1]; //$rootScope.siteData.pop();

            // All equip next
            $rootScope.equipment = _data[_data.length - 2];

            $rootScope.siteDataDate = $rootScope.convertToNiceDateObject($rootScope.meta.Date);
            $rootScope.functionMapping = $rootScope.meta.EquipmentFunctionMap;

            // All sites
            //$rootScope.siteData = newData;

            // Check the date
            if ($rootScope.siteData.length < 1) {
                console.error("No sites with this date...");
                return;
            }


        }




        // -----------------------------------------------
        // THIS SHOULD BE DONE IN PHP 

        // Create a $root list of equipment by function
        // use the function mapping table as object keys 
        // then iterate over site data to populate

        $rootScope.equipmentByFunction = {};
        for (var key in $rootScope.functionMapping) {
            $rootScope.equipmentByFunction[key] = [];
        }

        for (var key in $rootScope.equipment) {
            let asset = $rootScope.equipment[key];
            if (asset.function in $rootScope.equipmentByFunction)
                $rootScope.equipmentByFunction[asset.function].push(key);
        }
        //console.log($rootScope.equipmentByFunction);
        // -----------------------------------------------

        newData = null;
        _data = null;

        // Debug output
        if (false) {
            console.log("[ Data : " + $rootScope.meta.Date + "]");
            console.log("Sites :");
            console.log($rootScope.siteData);

            console.log("Equipment :");
            console.log($rootScope.equipment);

            console.log("META :");
            console.log($rootScope.meta);
        }

        SetActiveMonth();

        $rootScope.$broadcast('newSiteDataSet');
        $route.reload();
    };



    // Attempts to get data from an array of dates     
    $rootScope.fetchSiteData = function (_date, _setAfterFetch = false, _addToCache = false) {

        //        for (var i = 0; i < _dates.length; i++) {
        //var date = _date;
        //console.log(date);

        var _data = { 'func': 0, 'date': _date };
        var request = $http({
            method: 'POST',
            url: ServerInfo.URL_GetSiteData,
            data: _data
        })
        request.then(function (response) {


            // If this date data is to be added to the cache
            // for example the trailing week 
            if (_addToCache) {

                // Does this exist?
                var found = false;
                if ($rootScope.cachedData.length > 0)
                    found = $rootScope.cachedData.some(el => el[el.length - 1].Date === response.data[response.data.length - 1].Date);

                // It's new so add it 
                if (!found) {
                    $rootScope.cachedData.push(response.data);
                    $rootScope.cachedData.sort(function (a, b) { return b[b.length - 1]['Date'] - a[a.length - 1]['Date'] });
                }
            }

            // Apply to site if requested
            if (_setAfterFetch) {
                $rootScope.setNewSiteData(response.data);
            }

        }, function (error) {
            //console.error(error);
            $rootScope.processErrorResponse(error);
        });

        return request;
        // }
    };

    // ---------------------------------------------------------------------------------------







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



    // ----------------------------------------------------------------------------------
    // Stuff for monthly related data

    $rootScope.monthly = null;                  // All the data for each month
    $rootScope.monthlyActive = null;            // The current active month data
    $rootScope.monthlyActiveAsDate = null;      // The current active month as a date (YYYYMM)  

    function SetActiveMonth() {
        if ($rootScope.monthly == null
            || $rootScope.meta == undefined
            || $rootScope.siteData == undefined
            || $rootScope.meta.Date == undefined)
            return;

        var monthDate = ($rootScope.meta.Date).substr(0, 6);
        //console.log($rootScope.monthly);

        if (monthDate in $rootScope.monthly) {
            $rootScope.monthlyActive = $rootScope.monthly[monthDate];
            $rootScope.monthlyActiveAsDate = monthDate;
            console.log("Set active month..." + monthDate);
            //console.log($rootScope.monthlyActive);
        }
        else
            console.log("No plan data found for month... " + monthDate);
    }

    $rootScope.fetchMonthlyData = function () {

        var request = $http({
            method: 'POST',
            url: ServerInfo.URL_Monthly,
            data: { 'func': 0 }
        })
        request.then(function (response) {
            //console.log("Monthly Data received");
            //console.log(response.data);

            $rootScope.monthly = response.data;
            SetActiveMonth();
            $rootScope.$broadcast('monthlySet');
        }, function (error) {
            $rootScope.processErrorResponse(error);
        });
        return request;
    }
    // ----------------------------------------------------------------------------------


});





// ===============================================================================================
// Main controller
// ===============================================================================================
app.controller("myCtrl", function ($q, $scope, $rootScope, $timeout, $route, $location, $interval) {


    // -----------------------------------------------------------------
    // The start-up sequence 
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
                    //console.log("Config & Dates ready");
                    //promises = [];
                    $rootScope.fetchMonthlyData();
                    $rootScope.fetchSiteData(ServerInfo.availableDates[0], true, true);
                    for (let i = 1; i < 7; i++)
                        $rootScope.fetchSiteData(ServerInfo.availableDates[i], false, true);

                });
            }
        }
    ).catch(function (err) {
        // Failed to connect
    });
    // -----------------------------------------------------------------




    // -----------------------------------------------------------------
    // Interval function to update the current days data
    $scope.updateIntervalForTodaysData = function () {
        console.log("Refreshing todays data...");

        // Check if today exists in the available dates 
        // otherwise just use the latest date available
        let nextDate = moment().format('YYYYMMDD');
        if (!(nextDate in ServerInfo.availableDates)) {
            nextDate = ServerInfo.availableDates[0];
        }
        //console.log(nextDate);
        $q.all([$rootScope.fetchSiteData(nextDate, false)]).then(
            function (responses) {
                //console.log("Reponse...");
                //console.log(responses[0].data[5].Date);
                //console.log($rootScope.cachedData[0]);
                //console.log($rootScope.meta.Date);
                //console.log(viewingSameDate);

                $rootScope.cachedData[0] = responses[0].data;
                let viewingSameDate = $rootScope.meta.Date === responses[0].data[5].Date;
                if (viewingSameDate)
                    $rootScope.setNewSiteData($rootScope.cachedData[0]);

                $rootScope.siteDataLastRefresh = moment();
                $rootScope.siteDataNextRefresh = moment().add(ServerInfo.dailyRefreshInterval, 's');

                viewingSameDate = null;
                responses = null;
            }
        ).catch(function (err) { });
        nextDate = null;
    }

    $interval(function () { $scope.updateIntervalForTodaysData(); }, ServerInfo.dailyRefreshInterval * 1000);
    // -----------------------------------------------------------------





    // Callback for new data being set
    $rootScope.$on('newSiteDataSet', function () {

        // ------------------------------------------------------
        // Fake alerts
        let alerts = [];
        $rootScope.alerts = [];
        for (let i = 0; i < Math.round(Math.random() * 10); i++) {
            let randSite = Math.floor(Math.random() * ($rootScope.siteData.length - 1));
            if ($rootScope.siteData[randSite] == undefined)
                continue;

            let randEquip = Math.floor(Math.random() * $rootScope.siteData[randSite].equipment.length);
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
            .when("/monthly/:site/:month", {
                templateUrl: 'monthly.html',
                controller: 'Monthly'
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
            .when("/uploadPlan/", {
                templateUrl: 'uploadPlan.html',
                controller: 'UploadPlan'
            })
            .when("/error/", {
                templateUrl: 'error.html',
                //controller: 'Site'
            });

        //error
    }
);


// =====================================================================================

// Commonly held variables across the site 

class MineMageSiteData {
    constructor(_data) {
        this.dateView = "";
        this.monthView = moment().format('YYYYMM');
    }
}
app.value("mmData", new MineMageSiteData());






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