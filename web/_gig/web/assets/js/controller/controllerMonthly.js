
app.controller('Monthly', function ($scope, $routeParams, $rootScope, $http, $interval, $timeout) {

    // Set the view choice in the root so its 
    // persistent with page reloads and equip filter
    if ($rootScope.monthlyViewAsBars == undefined) {
        $rootScope.monthlyViewAsBars = true;
    }

    $scope.siteIndex = $routeParams.site;
    $scope.siteName = null;

    $scope.dataForMonth = null;
    $scope.dataForSite = null;

    $scope.switchView = function (_state) {
        $rootScope.monthlyViewAsBars = _state;
        ClearAllCharts();
        if (_state)
            $scope.createMonthlyComplianceBars();
        else
            $scope.createMonthlyComplianceGauges();
    }



    $scope.createMenuOptions = function (_object) {
        $scope.names = Object.keys(_object);
        $scope.selectedName = $scope.names[0];
    }

    $scope.updateSelectionList = function () {
        $scope.prepareChartData($scope.selectedName);
    }

    function GetStartingMonth() {
        return '201901';
    }


    $scope.prepareChartData = function (_month) {

        if ($rootScope.monthly == undefined)
            return;

        $scope.createMenuOptions($rootScope.monthly);

        $scope.siteName = $rootScope.siteData[$scope.siteIndex].name;
        //console.log(siteName);

        // Temp for now
        $scope.dataForMonth = $rootScope.monthly[_month];
        $scope.dataForSite = $scope.dataForMonth.sites[$scope.siteName];

        //$scope.dataForMonth.timeRemaining = moment.duration(80000).format("h:mm:ss");
        //$scope.dataForMonth.timeRemaining = ($scope.dataForMonth.timeRemaining / 3600).toFixed();
        console.log($scope.dataForMonth);

        $scope.switchView($rootScope.monthlyViewAsBars);
    }


    $scope.createMonthlyComplianceBars = function () {
        $timeout(function () {
            ChartsMonthly.CreateMonthlyComplianceBars("monthlyChart", [$scope.dataForMonth, $scope.siteName]);
        }, 1);
    }


    $scope.createMonthlyComplianceGauges = function () {
        $timeout(function () {
            var elements = document.getElementsByClassName("chartdivcontent");

            for (const [key, value] of Object.entries($scope.dataForSite.planSegments)) {
                ChartsMonthly.CreateMonthlyComplianceGauge(elements[i].id, [$scope.dataForMonth, [key, value]]);
            }


            //for (var i = 0; i < $scope.chartData.length; i++) {
            //  ChartsMonthly.CreateMonthlyComplianceGauge(elements[i].id, $scope.chartData[i]);
            //}
        }, 100);
    }




    $scope.setupCalendar = function () {

        var dates = Object.values($rootScope.monthly);
        var minDate = moment(String(dates[0] + "01")).format('YYYY-MM-DD').toString();
        var maxDate = moment(String(dates[10] + "01")).format('YYYY-MM-DD').toString();

        flatpickr('.calendar', {
            // enable: [
            //     {
            //         from: "2019-01-01",
            //         to: "2021-01-01"
            //     }
            // ],
            plugins: [
                new monthSelectPlugin({
                    //shorthand: true, //defaults to false
                    //dateFormat: "m.y", //defaults to "F Y"
                    //altFormat: "F Y", //defaults to "F Y"
                    //theme: "dark" // defaults to "light"
                })
            ],
            // On Click of a new date
            onChange: function (selectedDates, dateStr, instance) {
                var date = moment(selectedDates[0]).format('YYYYMM').toString();
                console.log(date);
                if (date in $rootScope.monthly)
                    $scope.prepareChartData(date);


            }
        });
    }


    // ----------------------------------------------------
    $scope.$on('monthlySet', function () {
        $scope.setupCalendar();

        //console.log("MONTHLY HAS BEEN SET");
        $scope.prepareChartData(GetStartingMonth());
    });


    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            $scope.prepareChartData(GetStartingMonth());
        }, 10);
    });
    // ----------------------------------------------------







    // ----------------------------------------------------
    // For the input side of monthly targets
    // $scope.getLockClass = function ($index) {
    //     if ($scope.entry[$index] != undefined) {
    //         if ($scope.entry[$index].lock == true) {
    //             return "fas fa-lock locked"
    //         } else {
    //             return "fas fa-lock-open unlocked";
    //         }
    //     }
    //     return "";
    // }


    // $scope.toggleLock = function ($event, $index) {
    //     //console.log($index);
    //     //console.log($scope.biglock);
    //     //
    //     //$scope.biglock == '0'
    //     if ($index == -1) {
    //         for (var i = 0; i < $scope.entry.length; i++) {
    //             $scope.entry[i].lock = $scope.biglock == 0 ? true : false;
    //         }
    //     }
    //     else {
    //         if ($scope.biglock == 1)
    //             if ($scope.entry[$index] != undefined)
    //                 $scope.entry[$index].lock = !$scope.entry[$index].lock;
    //     }
    // }


    // // Targets Adjustment 
    // if ($routeParams.func == 1) {
    //     $scope.entry = [];
    //     for (var key in $scope.data) {
    //         $scope.entry.push({ lock: false, data: $scope.data[key][2] });
    //     }


    //     $scope.gridOptions = {};
    //     $scope.gridOptions.data = JSON.stringify($scope.entry);

    //     //console.log($scope.entry);
    // }


    // $scope.getMonthlyPlan = function () {
    //     // var _url = '../dev/php/monthly/monthly.php';

    //     var _data = {
    //         'func': 1,
    //         'year': $scope.currentPlanYear,
    //         'month': $scope.currentPlanMonth
    //     };
    //     var request = $http({
    //         method: 'POST',
    //         url: $scope.urlMonthly,
    //         data: _data,
    //     })
    //     request.then(function (response) {

    //         console.log(response);
    //         //$scope.fileContent = Papa.unparse(response.data);
    //         $scope.fileContent = response.data;

    //         $scope.fileContent = [];
    //         for (var i = 0; i < response.data.length; i++) {
    //             // Check if each property in 
    //             // the object can be converted to number
    //             var obj = response.data[i];
    //             for (var prop in obj) {
    //                 if (obj.hasOwnProperty(prop) && !isNaN(obj[prop])) {
    //                     obj[prop] = +obj[prop];
    //                     obj[prop] = +parseFloat(obj[prop]).toFixed(0);
    //                 }
    //             }

    //             // Push to the content array
    //             $scope.fileContent.push(response.data[i]);
    //         }
    //         $scope.createUniqueSiteNames();

    //     }, function (error) {
    //         console.log(error);
    //     });
    // }



    // $scope.getMonthlyActuals = function () {
    //     //var _url = '../dev/php/monthly/monthly.php';

    //     var _data = {
    //         'func': 3,
    //         'year': $scope.currentPlanYear,
    //         'month': $scope.currentPlanMonth
    //     };
    //     var request = $http({
    //         method: 'POST',
    //         url: $scope.urlMonthly,
    //         data: _data,
    //     })
    //     request.then(function (response) {
    //         console.log(response);
    //     }, function (error) {
    //         console.log(error);
    //     });
    // }




    // $scope.getMappedActualsToPlan = function () {

    //     var _data = {
    //         'func': 4,
    //         'year': $scope.currentPlanYear,
    //         'month': $scope.currentPlanMonth
    //     };
    //     var request = $http({
    //         method: 'POST',
    //         url: $scope.urlMonthly,
    //         data: _data,
    //     })
    //     request.then(function (response) {

    //         if ($rootScope.checkResponseError(response))
    //             return;

    //         $scope.mappedPlan = response.data;

    //         console.log("[Mapped Actuals to Plan]");
    //         console.log($scope.mappedPlan);

    //         // Create the data needed for charts
    //         // and force a switch view to create charts
    //         if ($routeParams.func == 0) {
    //             $scope.prepareChartData();
    //             $scope.switchView($rootScope.monthlyViewAsBars);
    //         }

    //     }, function (error) {
    //         console.log(error);
    //     });
    // }
    // ----------------------------------------------------


});