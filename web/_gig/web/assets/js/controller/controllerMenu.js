app.controller('Menu', function ($scope, $routeParams, $rootScope, $timeout) {

    //console.log("MENU CONTROLLER");

    $scope.equipList = null;

    $scope.setupMenu = function () {

        $scope.equipList = null;
        var list = [];
        for (var key in $rootScope.equipment) {
            list.push($rootScope.equipment[key].id);
        }

        $scope.equipList = list;

        //$scope.setupCalendar();


        return list;
    };

    $scope.setupCalendar = function () {

        var minDate = ServerInfo.availableDates[ServerInfo.availableDates.length - 1];
        var maxDate = ServerInfo.availableDates[0];

        minDate = moment(minDate).format('YYYY-MM-DD').toString();
        maxDate = moment(maxDate).format('YYYY-MM-DD').toString();

        flatpickr('#menuDataDatePick', {
            enable: [
                {
                    from: minDate,
                    to: maxDate
                }
            ],
            defaultDate: maxDate,
            inline: true,
            // On Click of a new date
            onChange: function (selectedDates, dateStr, instance) {
                var date = dateStr.replace("-", "");
                date = date.replace("-", "");
                console.log(date);
                $rootScope.fetchSiteData([date], true);
            }
        });
    }

    $scope.nextUpdate = moment(); // initialise the time variable
    $scope.tickInterval = 500; //ms


    // This is the count down timer per refresh
    var tick = function () {
        var last = moment($rootScope.siteDataLastRefresh);
        var next = moment($rootScope.siteDataNextRefresh);
        var diff = next.diff(moment());
        diff = (diff / 1000).toFixed();

        //console.log((diff) + "   " + SecondsToHoursAndMinutes(diff, true));

        $scope.lastUpdateFormat = last.format('LTS');
        $scope.nextUpdateIn = SecondsToHoursAndMinutes(diff, true);
        $timeout(tick, $scope.tickInterval); // reset the timer
    }

    // Start the timer
    $timeout(tick, $scope.tickInterval);




    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            $scope.setupMenu();
        }, 100);
    });

    $rootScope.$on('newSiteDataSet', function () {
        $timeout(function () {
            $scope.setupMenu();
        }, 100);
    });

    $rootScope.$on('availableDatesSet', function () {
        $timeout(function () {
            $scope.setupCalendar();
        }, 100);
    });


    $scope.$on('updateShift', function (event, data) {
        $timeout(function () {
            console.log("Menu Update Shift");
            $scope.setupMenu();
        }, 100);
    });

});