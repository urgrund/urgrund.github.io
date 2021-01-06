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
            onChange: function (selectedDates, dateStr, instance) {
                //...
                var date = dateStr.replace("-", "");
                date = date.replace("-", "");
                console.log(date);
                $rootScope.fetchSiteData([date], true);
            }
        });
    }

    //$scope.calendarHover


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