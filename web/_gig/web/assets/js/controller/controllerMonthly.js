
app.controller('Monthly', function ($scope, $routeParams, $rootScope, $http, $interval, $timeout) {

    // --------------------------------------------------------
    // Old

    // $scope.site = $rootScope.siteData[$routeParams.site];

    // var response = [{ "WF4540D13": [[360, 414, 0, 0, 1170, 900, 1296, 720, 612, 828, 1260, 270, 0, 522, 1260, 540, 1116, 1134, 1440, 0, 0, 0, 0, 0, 0, 0, 54, 684, 0, 0, 0], [360, 774, 774, 774, 1944, 2844, 4140, 4860, 5472, 6300, 7560, 7830, 7830, 8352, 9612, 10152, 11268, 12402, 13842, 13842, 13842, 13842, 13842, 13842, 13842, 13842, 13896, 14580, 14580, 14580, 14580], ["14000", "Ore", "Production Stope", "WF", "4540", "D13", 360, "WF4540D13"]], "WF4540D15": [[1476, 1746, 2466, 360, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2430, 4410, 1738, 3258], [1476, 3222, 5688, 6048, 6048, 6048, 6048, 6048, 6048, 6048, 6048, 6048, 6048, 6048, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 8520, 12930, 14668, 17926], ["16500", "Ore", "Production Stope", "WF", "4540", "D15", 1476, "WF4540D15"]], "WF4555D30": [[2772, 774, 2052, 1890, 1530, 396, 0, 540, 1116, 2286, 3024, 180, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [2772, 3546, 5598, 7488, 9018, 9414, 9414, 9954, 11070, 13356, 16380, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560], ["17500", "Ore", "Production Stope", "WF", "4555", "D30", 2772, "WF4555D30"]], "WF4555OD0": [[198, 0, 54, 0, 0, 414, 0, 0, 0, 0, 0, 0, 0, 0, 306, 0, 0, 0, 0, 0, 54, 510, 0, 630, 18, 567, 18, 360, 0, 18, 0], [198, 198, 252, 252, 252, 666, 666, 666, 666, 666, 666, 666, 666, 666, 972, 972, 972, 972, 972, 972, 1026, 1536, 1536, 2166, 2184, 2751, 2769, 3129, 3129, 3147, 3147], ["4000", "Ore", "Development Horizontal", "WF", "4555", "OD0", 198, "WF4555OD0"]], "WF4540PD0": [[0, 54, 468, 54, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 522, 0, 90, 0, 360, 0, 0, 0, 0, 72, 270, 54, 72, 0, 0, 198], [0, 54, 522, 576, 576, 576, 576, 576, 576, 576, 576, 576, 576, 576, 576, 1098, 1098, 1188, 1188, 1548, 1548, 1548, 1548, 1548, 1620, 1890, 1944, 2016, 2016, 2016, 2214], ["5000", "Ore", "Development Horizontal", "WF", "4540", "PD0", 54, "WF4540PD0"]], "WF4490HD0": [[0, 0, 21, 0, 396, 36, 0, 18, 0, 0, 72, 0, 0, 0, 0, 0, 0, 432, 84, 0, 0, 0, 0, 0, 414, 54, 0, 144, 0, 414, 0], [0, 0, 21, 21, 417, 453, 453, 471, 471, 471, 543, 543, 543, 543, 543, 543, 543, 975, 1059, 1059, 1059, 1059, 1059, 1059, 1473, 1527, 1527, 1671, 1671, 2085, 2085], ["4500", "Ore", "Development Horizontal", "WF", "4490", "HD0", 21, "WF4490HD0"]], "WF4555D32": [[0, 0, 0, 0, 0, 774, 270, 0, 0, 0, 0, 0, 0, 0, 1314, 0, 1224, 1440, 1980, 720, 0, 0, 0, 1026, 1980, 2520, 2340, 2466, 0, 0, 0], [0, 0, 0, 0, 0, 774, 1044, 1044, 1044, 1044, 1044, 1044, 1044, 1044, 2358, 2358, 3582, 5022, 7002, 7722, 7722, 7722, 7722, 8748, 10728, 13248, 15588, 18054, 18054, 18054, 18054], ["11111", "Ore", "Production Stope", "WF", "4555", "D32", 774, "WF4555D32"]], "WF4570D28": [[0, 0, 0, 0, 0, 0, 1674, 0, 0, 0, 0, 0, 0, 0, 306, 1440, 0, 0, 0, 180, 2700, 3330, 1080, 468, 0, 0, 0, 90, 1314, 0, 0], [0, 0, 0, 0, 0, 0, 1674, 1674, 1674, 1674, 1674, 1674, 1674, 1674, 1980, 3420, 3420, 3420, 3420, 3600, 6300, 9630, 10710, 11178, 11178, 11178, 11178, 11268, 12582, 12582, 12582], ["7500", "Ore", "Production Rings", "WF", "4570", "D28", 1674, "WF4570D28"]], "WF4555D34": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1728, 360, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1752, 1080, 1080], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1728, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 3840, 4920, 6000], ["8000", "Ore", "Production Stope", "WF", "4555", "D34", 1728, "WF4555D34"]], "WF4555SU0": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], [0, "Ore", "Development Horizontal", "WF", "4555", "SU0", 36, "WF4555SU0"]], "WF4570D26": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 990, 756, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 990, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746], ["9500", "Ore", "Production Stope", "WF", "4570", "D26", 990, "WF4570D26"]], "WF4540D17": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 540, 414, 0, 1134, 2250, 720, 1242, 2196, 3060, 2556, 2430, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 540, 954, 954, 2088, 4338, 5058, 6300, 8496, 11556, 14112, 16542, 16542, 16542, 16542, 16542], ["18000", "Ore", "Production Stope", "WF", "4540", "D17", 540, "WF4540D17"]], "WF4540OD1": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 144, 0, 0, 0, 0, 0, 180, 0, 234, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 144, 144, 144, 144, 144, 144, 324, 324, 558, 558, 558, 558, 558], [0, "Ore", "Development Horizontal", "WF", "4540", "OD1", 144, "WF4540OD1"]], "WF4540OD0": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 108, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 108, 108, 108, 108, 108, 108, 108, 108, 108], [0, "Ore", "Development Horizontal", "WF", "4540", "OD0", 108, "WF4540OD0"]], "WF4540D19": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 36, 36, 36], [0, "Ore", "Production Stope", "WF", "4540", "D19", 36, "WF4540D19"]] }, { "target": 115611, "actual": 107638, "overmined": 13343, "avgRequired": 3729.39, "avgCurrent": 3844.21, "spatialCompliance": 0.931, "volumetricCompliance": 1.0464 }];

    // $scope.data = response[0];
    // $scope.compliance = response[1];
    // --------------------------------------------------------



    // Set the view choice in the root so its 
    // persistent with page reloads and equip filter
    if ($rootScope.monthlyViewAsBars == undefined) {
        $rootScope.monthlyViewAsBars = true;
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
            $scope.createMonthlyComplianceChart();
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
                //if ($scope.mappedPlan[i][4] != undefined && $scope.mappedPlan[i][3] > 0)
                if ($scope.mappedPlan[0][i][3] > 0)
                    $scope.chartData.push($scope.mappedPlan[0][i]);
            }
        }

        var siteName = $rootScope.siteData[1].name;
        console.log(siteName);
        $scope.meta = $scope.mappedPlan[1][siteName];
        //$scope.meta = $scope.mappedPlan[1]['Western Flanks'];
        //console.log("Building chart...");
        //console.log(chartData);
        console.log($scope.chartData);
    }


    $scope.createMonthlyComplianceChart = function () {
        $timeout(function () {
            ChartsMonthly.CreateMonthlyCompliance2("monthlyChart", $scope.chartData);
        }, 1);
    }


    $scope.createMonthlyComplianceGauges = function () {
        $timeout(function () {
            var elements = document.getElementsByClassName("chartdivcontent");
            for (var i = 0; i < $scope.chartData.length; i++) {
                ChartsMonthly.CreateMonthlyComplianceGauge(elements[i].id, $scope.chartData[i]);
            }
        }, 1);
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