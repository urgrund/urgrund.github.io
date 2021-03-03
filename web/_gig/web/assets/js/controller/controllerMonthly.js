
app.controller('Monthly', function ($scope, $routeParams, $rootScope, $http, $interval, $timeout, mmData) {

    // Set the view choice in the root so its 
    // persistent with page reloads and equip filter
    if ($rootScope.monthlyViewAsBars == undefined) {
        $rootScope.monthlyViewAsBars = true;
    }

    $scope.siteIndex = $routeParams.site;
    $scope.siteName;

    $scope.selectedMonth;

    $scope.dataForMonth = null;
    $scope.dataForSite = null;


    $scope.gaugeChartNames = [];

    // $scope.createMenuOptions = function (_object) {
    //     $scope.names = Object.keys(_object);
    //     $scope.selectedName = $scope.names[0];
    // }

    // $scope.updateSelectionList = function () {
    //     $scope.prepareChartData($scope.selectedName);
    // }

    //function GetStartingMonth() {
    //if ($rootScope.monthlyActive == undefined)
    //return '201901';
    //else
    //  return $rootScope.monthlyActive;
    //}


    $scope.prepareChartData = function (_month) {

        if ($rootScope.monthly == undefined)
            return;


        $scope.selectedMonth = _month;

        $scope.dataForMonth = null;
        $scope.dataForSite = null;
        //ClearAllCharts();
        //$scope.createMenuOptions($rootScope.monthly);

        $scope.siteName = $rootScope.siteData[$scope.siteIndex].name;
        //console.log($scope.siteName);
        //console.log($scope.selectedMonth);

        //console.log(_month);
        //console.log($rootScope.monthly);
        if (_month in $rootScope.monthly) {

            //ClearAllCharts();

            $scope.dataForMonth = $rootScope.monthly[_month];
            $scope.dataForSite = $scope.dataForMonth.sites[$scope.siteName];

            $scope.gaugeChartNames = [];
            for (const [key, value] of Object.entries($scope.dataForSite.planSegments)) {
                $scope.gaugeChartNames.push(key);
            }

            //console.log("Data for " + $scope.siteName + " : " + $scope.dataForSite);


            if ($scope.dataForSite == undefined)
                return;
            //$scope.dataForMonth.timeRemaining = moment.duration(80000).format("h:mm:ss");
            //$scope.dataForMonth.timeRemaining = ($scope.dataForMonth.timeRemaining / 3600).toFixed();            

            // Create charts depending on switch
            //$scope.switchView($rootScope.monthlyViewAsBars);
            if ($rootScope.monthlyViewAsBars)
                $scope.createMonthlyComplianceBars();
            else
                $scope.createMonthlyComplianceGauges();

            // Create other charts 
            // Little data pack for the chart
            var dataForChart =
                [
                    $scope.dataForSite,
                    $scope.selectedMonth,
                    $scope.dataForMonth.daysInMonth
                ];

            ChartsMonthly.CreateMonthlyLean("monthlyLean", dataForChart);
            ChartsMonthly.CreateMonthlyDateChart("monthlyDate", dataForChart);
        }
    }




    // --------------------------------------------------
    $scope.switchView = function (_state) {
        $rootScope.monthlyViewAsBars = _state;
        $scope.prepareChartData(mmData.monthView);
    }


    $scope.createMonthlyComplianceBars = function () {
        $timeout(function () {
            ChartsMonthly.CreateMonthlyComplianceBars("monthlyChart", [$scope.dataForMonth, $scope.siteName]);
        }, 100);
    }


    $scope.createMonthlyComplianceGauges = function () {
        $timeout(function () {
            //return;
            var elements = document.getElementsByClassName("chartdivcontent");
            for (var i = 0; i < elements.length; i++) {
                //console.log(elements[i]);
                var plan = $scope.dataForSite.planSegments[elements[i].id];
                //console.log(plan);
                ChartsMonthly.CreateMonthlyComplianceGauge(elements[i].id, [$scope.dataForMonth, plan]);
            }
            //for (const [key, value] of Object.entries($scope.dataForSite.planSegments)) {
            //  ChartsMonthly.CreateMonthlyComplianceGauge(elements[i].id, [$scope.dataForMonth, [key, value]]);
            //}

        }, 100);
    }
    // --------------------------------------------------



    $scope.setupCalendar = function () {
        if ($rootScope.monthly == undefined)
            return;

        //console.log("Setting up calendar");

        //var dates = Object.values($rootScope.monthly);
        //var minDate = moment(String(dates[0] + "01")).format('YYYY-MM-DD').toString();
        //var maxDate = moment(String(dates[10] + "01")).format('YYYY-MM-DD').toString();

        var d = new Date($routeParams.month.substr(0, 4), $routeParams.month.substr(5, 6), 0, 0, 0, 0, 0);

        flatpickr('.calendar', {
            // enable: [
            //     {
            //         from: "2019-01-01",
            //         to: "2021-01-01"
            //     }
            // ],
            defaultDate: d,// Date($routeParams.month),//Date.now(),
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
                //console.log("Selected - " + date);
                mmData.monthView = date;
                $scope.prepareChartData(date);
            }
        });
    }

    // ----------------------------------------------------
    $scope.$on('monthlySet', function () {
        $scope.setupCalendar();
        $scope.prepareChartData($routeParams.month);
    });


    $scope.$watch('$viewContentLoaded', function () {
        //$timeout(function () {
        $scope.setupCalendar();
        $scope.prepareChartData($routeParams.month);
        //}, 10);
    });


    $scope.setupCalendar();
    // ----------------------------------------------------

});