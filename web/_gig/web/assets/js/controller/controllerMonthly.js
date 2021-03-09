
app.controller('Monthly', function ($scope, $routeParams, $rootScope, $http, $location, $timeout) {

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

    $scope.calendarChartMonths = [];
    $scope.createMonthsForCalendarChart = function () {
        if ($rootScope.monthly == undefined)
            return;
        var months = [];
        var debugOffset = 6;
        var monthCount = 12;
        $scope.calendarChartMonths = [];

        //console.log($rootScope.monthly);
        for (const [key, value] of Object.entries($rootScope.monthly)) {
            months.push(key);
        }
        for (var i = months.length - 1 - debugOffset; i > (months.length - monthCount - debugOffset); i--)
            $scope.calendarChartMonths.push(months[i]);
    }




    $scope.prepareChartData = function (_month) {

        //console.log("Creating for - " + _month);

        if ($rootScope.monthly == undefined)
            return;


        $scope.selectedMonth = _month;

        $scope.dataForMonth = null;
        $scope.dataForSite = null;
        //ClearAllCharts();
        //$scope.createMenuOptions($rootScope.monthly);

        $scope.siteName = $rootScope.siteData[$scope.siteIndex].name;
        //console.log($scope.siteName);
        //console.log("SM : " + $scope.selectedMonth);

        //console.log(_month);
        //console.log($rootScope.monthly);
        $timeout(function () {
            if (_month in $rootScope.monthly) {
                console.log("ASLDASDLASDLLADSJ");
                ClearAllCharts();

                $scope.dataForMonth = $rootScope.monthly[_month];
                $scope.dataForSite = $scope.dataForMonth.sites[$scope.siteName];

                $scope.gaugeChartNames = [];
                for (const [key, value] of Object.entries($scope.dataForSite.planSegments)) {
                    $scope.gaugeChartNames.push(key);
                }

                //console.log("Data for " + $scope.siteName + " : " + $scope.dataForSite);


                if ($scope.dataForSite == undefined)
                    return;


                //console.log("HSDASDS");

                // Create charts depending on switch
                //$scope.switchView($rootScope.monthlyViewAsBars);
                //if ($rootScope.monthlyViewAsBars)
                $scope.createMonthlyComplianceBars();
                //else
                $scope.createMonthlyComplianceGauges();




                // -----------------------------------------
                // Multi Calendar View
                //console.log("The Months")
                //console.log($scope.calendarChartMonths);

                if (!true) {
                    // DUMMY TEST
                    var calMonth = '202006';
                    //var calMonth = '201902';
                    console.log($rootScope.monthly['202006']);
                    var dataForCal =
                        [
                            $rootScope.monthly[calMonth].sites[$scope.siteName],
                            calMonth,
                            $rootScope.monthly[calMonth].daysInMonth
                        ];
                    ChartsMonthly.CreateCalendarChart2("cal", dataForCal);
                }
                else {
                    // For the list of calendars to display
                    for (var i = 0; i < $scope.calendarChartMonths.length; i++) {
                        var calMonth = $scope.calendarChartMonths[i];
                        dataForCal =
                            [
                                $rootScope.monthly[calMonth].sites[$scope.siteName],
                                calMonth,
                                $rootScope.monthly[calMonth].daysInMonth
                            ];
                        ChartsMonthly.CreateCalendarChart2(calMonth, dataForCal);
                    }

                }
                // -----------------------------------------




                var dataForChart =
                    [
                        $scope.dataForSite,
                        $scope.selectedMonth,
                        $scope.dataForMonth.daysInMonth
                    ];

                // The two bar graphs,  connect them when done
                var lean = ChartsMonthly.CreateMonthlyLean("monthlyLean", dataForChart);
                var date = ChartsMonthly.CreateMonthlyDateChart("monthlyDate", dataForChart);
                $timeout(function () {
                    if (lean != undefined && date != undefined) {
                        lean.group = 'a';
                        date.group = 'a';
                        echarts.connect('a');

                        lean.on('click', function (params) {
                            console.log("Click!");

                            console.log(params.dataIndex);
                            console.log($scope.selectedMonth);

                            var date = $scope.selectedMonth + (Number(params.dataIndex) + 1);
                            var url = "site/" + String($scope.siteIndex);
                            $rootScope.fetchSiteData([date], true);
                            $location.path(url);
                            //var index = $rootScope.cachedData.length - params.dataIndex - 1;
                            //$rootScope.setNewSiteData($rootScope.cachedData[index]);
                        });
                    }
                }, 200);
            }
        }, 200);
    }




    // --------------------------------------------------
    $scope.switchView = function (_state) {
        $rootScope.monthlyViewAsBars = _state;
        //if ($rootScope.monthlyViewAsBars)
        //$scope.createMonthlyComplianceBars();
        //else
        //$scope.createMonthlyComplianceGauges();
        //$scope.prepareChartData(mmData.monthView);
        $scope.prepareChartData($rootScope.monthlyActiveAsDate);
    }


    $scope.createMonthlyComplianceBars = function () {
        //console.log("CREATING BARS");
        $timeout(function () {
            ChartsMonthly.CreateMonthlyComplianceBars("monthlyChart", [$scope.dataForMonth, $scope.siteName]);
        }, 100);
    }


    $scope.createMonthlyComplianceGauges = function () {
        //console.log("CREATING GUAGE");
        $timeout(function () {
            for (const [key, value] of Object.entries($scope.dataForSite.planSegments)) {
                ChartsMonthly.CreateMonthlyComplianceGauge(key, [$scope.dataForMonth, value]);
            }
        }, 100);
    }
    // --------------------------------------------------



    $scope.setupCalendar = function () {
        if ($rootScope.monthly == undefined)
            return;

        var d = new Date($routeParams.month.substr(0, 4), $routeParams.month.substr(5, 6), 0, 0, 0, 0, 0);

        flatpickr('.calendar', {

            defaultDate: d,// Date($routeParams.month),//Date.now(),
            plugins: [
                new monthSelectPlugin({
                })
            ],
            // On Click of a new date
            onChange: function (selectedDates, dateStr, instance) {
                var date = moment(selectedDates[0]).format('YYYYMM').toString();
                //console.log("Selected - " + date);
                //console.log($rootScope.monthlyActiveAsDate());
                //mmData.monthView = date;
                $rootScope.monthlyActiveAsDate = date;
                $scope.prepareChartData(date);
            }
        });
    }






    // ----------------------------------------------------
    $scope.$on('monthlySet', function () { Ready(); });
    $scope.$watch('$viewContentLoaded', function () { Ready(); });
    function Ready() {
        //mmData.monthView = $routeParams.month;
        $scope.createMonthsForCalendarChart();
        $scope.setupCalendar();
        $scope.prepareChartData($routeParams.month);
    }

    $scope.setupCalendar();
    // ----------------------------------------------------

});




// class Chart {
//     constructor(_elementID) {
//         this.option = null;
//         this.prepare();
//     }
//     prepare() { 
//         // Init
//     }

//     submit() {
//         //this.option
//     }
// }

// class ChartWaterfall extends Chart {
//     constructor() {
//         super("id");

//         // bl abl b
//         super.option =

//             this.submit();
//     }
// }