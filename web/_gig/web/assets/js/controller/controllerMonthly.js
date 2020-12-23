
app.controller('Monthly', function ($scope, $routeParams, $rootScope, $http, $interval, $timeout) {

    // Set the view choice in the root so its 
    // persistent with page reloads and equip filter
    if ($rootScope.monthlyViewAsBars == undefined) {
        $rootScope.monthlyViewAsBars = true;
        //$rootScope.monthlyViewAsBars = false;
    }

    $scope.siteIndex = $routeParams.site;

    $scope.urlMonthly = '../dev/php/monthly/monthly.php';

    $scope.currentPlanYear = '2018';
    $scope.currentPlanMonth = '10';

    $scope.configFiles;
    $scope.fileContent = [];

    $scope.mappedPlan = [];
    $scope.chartData = [];

    var fp = flatpickr('#test', {
        "minDate": new Date().fp_incr(1),
        "static": true,
        "altInput": true
    });


    $scope.switchView = function (_state) {
        $rootScope.monthlyViewAsBars = _state;
        ClearAllCharts();
        if (_state)
            $scope.createMonthlyComplianceBars();
        else
            $scope.createMonthlyComplianceGauges();
    }


    $scope.checkSiteValidForLoop = function (siteName, mapName) {
        return $scope.configFiles.configSites[siteName] == mapName;
    }



    $scope.onFileReadComplete = function ($contents) {
        if ($contents == undefined) {
            console.log("File data was undefined...");
            return;
        }
        $scope.fileContent = null;
        $scope.fileContent = $contents;
        $scope.filterFileContent();
        console.log($scope.fileContent);

        $scope.createUniqueSiteNames();
        $scope.$apply();
    }



    $scope.filterFileContent = function () {

        // Remove 1 sized rows
        var temp = [];
        for (var i = 0; i < $scope.fileContent.length; i++) {
            if ($scope.fileContent[i].length > 1)
                temp.push($scope.fileContent[i]);
            else
                console.log("Cleaned row " + i);
        }
        $scope.fileContent = temp;

        // Clear out null values
        $scope.fileContent = $scope.fileContent.filter(function (el) {
            if (el != null || el != undefined)
                return (el[0] != null);
            return el != null;
        });
    }



    $scope.createUniqueSiteNames = function () {
        // Get unique site names based on config mapping
        $scope.distinctNames = [...new Set($scope.fileContent.map(x => $scope.configFiles.configSites[x[0]]))];
        $scope.distinctNames.shift();
    }




    $scope.uploadMonthlyPlan = function () {
        //var _url = '../dev/php/monthly/monthly.php';

        //console.log(($scope.fileContent));
        //return;        

        var _data = {
            'func': 0,
            'data': ($scope.fileContent),
            'year': $scope.currentPlanYear,
            'month': $scope.currentPlanMonth
        };

        var request = $http({
            method: 'POST',
            url: $scope.urlMonthly,
            data: _data,
        })
        request.then(function (response) {
            $scope.response = response;
            console.log(response);
        }, function (error) {
            $scope.response = error;
            console.log(error);
        });
    }




    $scope.getMonthlyPlan = function () {
        // var _url = '../dev/php/monthly/monthly.php';

        var _data = {
            'func': 1,
            'year': $scope.currentPlanYear,
            'month': $scope.currentPlanMonth
        };
        var request = $http({
            method: 'POST',
            url: $scope.urlMonthly,
            data: _data,
        })
        request.then(function (response) {

            console.log(response);
            //$scope.fileContent = Papa.unparse(response.data);
            $scope.fileContent = response.data;

            $scope.fileContent = [];
            for (var i = 0; i < response.data.length; i++) {
                // Check if each property in 
                // the object can be converted to number
                var obj = response.data[i];
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && !isNaN(obj[prop])) {
                        obj[prop] = +obj[prop];
                        obj[prop] = +parseFloat(obj[prop]).toFixed(0);
                    }
                }

                // Push to the content array
                $scope.fileContent.push(response.data[i]);
            }
            $scope.createUniqueSiteNames();

        }, function (error) {
            console.log(error);
        });
    }



    $scope.getMonthlyActuals = function () {
        //var _url = '../dev/php/monthly/monthly.php';

        var _data = {
            'func': 3,
            'year': $scope.currentPlanYear,
            'month': $scope.currentPlanMonth
        };
        var request = $http({
            method: 'POST',
            url: $scope.urlMonthly,
            data: _data,
        })
        request.then(function (response) {
            console.log(response);
        }, function (error) {
            console.log(error);
        });
    }



    $scope.getConfigs = function () {
        var _url = '../dev/php/admin.php';
        var _data = { 'func': 4 };
        var request = $http({
            method: 'POST',
            url: _url,
            data: _data,
        })
        request.then(function (response) {
            $scope.configFiles = response.data;
            console.log($scope.configFiles);
        }, function (error) {
        });
    }



    $scope.getMappedActualsToPlan = function () {
        //var _url = '../dev/php/monthly/monthly.php';

        var _data = {
            'func': 4,
            'year': $scope.currentPlanYear,
            'month': $scope.currentPlanMonth
        };
        var request = $http({
            method: 'POST',
            url: $scope.urlMonthly,
            data: _data,
        })
        request.then(function (response) {
            console.log(response);
            $scope.mappedPlan = response.data;

            // Create the data needed for charts
            // and force a switch view to create charts
            if ($routeParams.func == 0) {
                $scope.prepareChartData();
                $scope.switchView($rootScope.monthlyViewAsBars);
            }

        }, function (error) {
            console.log(error);
        });
    }


    $scope.prepareChartData = function () {
        $scope.chartData = [];
        for (var i = 1; i < $scope.mappedPlan[0].length; i++) {
            if ($scope.mappedPlan[0][i][0] == "WF") {
                if ($scope.mappedPlan[0][i][3] > 0)
                    $scope.chartData.push($scope.mappedPlan[0][i]);
            }
        }

        var siteName = $rootScope.siteData[1].name;
        $scope.meta = $scope.mappedPlan[1][siteName];
    }


    $scope.createMonthlyComplianceBars = function () {
        $timeout(function () {
            ChartsMonthly.CreateMonthlyComplianceBars("monthlyChart", $scope.chartData);
        }, 1);
    }


    $scope.createMonthlyComplianceGauges = function () {
        $timeout(function () {
            var elements = document.getElementsByClassName("chartdivcontent");
            for (var i = 0; i < $scope.chartData.length; i++) {
                ChartsMonthly.CreateMonthlyComplianceGauge(elements[i].id, $scope.chartData[i]);
            }
        }, 100);
    }







    // ----------------------------------------------------
    // Branch based on whether this is to adjust 
    // the plan or to view the chart
    // ----------------------------------------------------

    $scope.getConfigs();


    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {

            // Entry point for the chart view
            if ($routeParams.func == 0) {
                $scope.site = $rootScope.siteData[$scope.siteIndex];
                // $interval(function () {
                //     $scope.getMappedActualsToPlan();
                // }, 3000);
                $scope.getMappedActualsToPlan();
            }

            // Entry point for the plan view
            if ($routeParams.func == 1) {

            }
        }, 1);
    });
    // ----------------------------------------------------
    // ----------------------------------------------------







    // ----------------------------------------------------
    // For the input side of monthly targets
    $scope.getLockClass = function ($index) {
        if ($scope.entry[$index] != undefined) {
            if ($scope.entry[$index].lock == true) {
                return "fas fa-lock locked"
            } else {
                return "fas fa-lock-open unlocked";
            }
        }
        return "";
    }


    $scope.toggleLock = function ($event, $index) {
        //console.log($index);
        //console.log($scope.biglock);
        //
        //$scope.biglock == '0'
        if ($index == -1) {
            for (var i = 0; i < $scope.entry.length; i++) {
                $scope.entry[i].lock = $scope.biglock == 0 ? true : false;
            }
        }
        else {
            if ($scope.biglock == 1)
                if ($scope.entry[$index] != undefined)
                    $scope.entry[$index].lock = !$scope.entry[$index].lock;
        }
    }


    // Targets Adjustment 
    if ($routeParams.func == 1) {
        $scope.entry = [];
        for (var key in $scope.data) {
            $scope.entry.push({ lock: false, data: $scope.data[key][2] });
        }


        $scope.gridOptions = {};
        $scope.gridOptions.data = JSON.stringify($scope.entry);

        //console.log($scope.entry);
    }
    // ----------------------------------------------------


});