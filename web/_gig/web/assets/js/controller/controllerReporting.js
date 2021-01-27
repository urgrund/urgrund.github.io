
app.controller('Reporting', function ($scope, $http, $rootScope, $timeout, $route) {

    $scope.reportGenStartDate;
    $scope.reportGenEndDate;
    $scope.reportGenStartShift;
    $scope.reportGenEndShift;
    $scope.reportSQLFile;

    $scope.availableReports;

    $scope.reportForView = "hellO";


    $scope.myData = [
        {
            firstName: "Cox",
            lastName: "Carney",
            company: "Enormo",
            employed: true
        },
        {
            firstName: "Lorraine",
            lastName: "Wise",
            company: "Comveyer",
            employed: false
        },
        {
            firstName: "Nancy",
            lastName: "Waters",
            company: "Fuelton",
            employed: false
        }
    ];

    // $scope.myData = [
    //     ['Foo', 'Boo', 'Woo'],
    //     ['Foo', 'Boo', 'Woo'],
    //     ['Foo', 'Boo', 'Woo']
    // ];
    // $scope.myData = JSON.stringify($scope.myData);


    $scope.generateReportFromClick = function (_key, _file) {

        //'Bogger_Tonnes\\RP_BoggerTonnes_AllTonnesByMineByTime.sql'
        var fullFileName = _key + "\\" + _file;
        console.log(fullFileName);

        $scope.reportSQLFile = fullFileName;
        $scope.generateReport();
    }




    $scope.generateReport = function () {

        var data = [
            $scope.reportGenStartDate,
            $scope.reportGenEndDate,
            $scope.reportGenStartShift === true ? 1 : 2,
            $scope.reportGenEndShift === true ? 1 : 2,
            $scope.reportSQLFile,
        ];

        // Test Data
        //var data = ['20181010', '20181020', 1, 2, $scope.reportSQLFile];


        //console.log("Sending request...");
        //console.log(data);

        var _data = { 'func': 0, 'date': data };
        var request = $http({
            method: 'POST',
            url: ServerInfo.URL_Reporting,
            data: _data
        })
        request.then(function (response) {

            if ($rootScope.checkResponseError(response))
                return;

            console.log(response.data);

            // Header Row
            var data = response.data;
            var dataForDisplay = [];
            var header = data[0];

            for (var i = 0; i < data.length; i++) {
                var newRow = {};
                for (var j = 0; j < data[i].length; j++) {
                    newRow[header[j]] = data[i][j];
                }
                dataForDisplay.push(newRow);
            }

            console.log(dataForDisplay);
            $scope.myData = dataForDisplay;

        }, function (error) {
            console.error(error);
        });
    }



    $scope.getAvailableReports = function () {

        var _data = { 'func': 1 };
        var request = $http({
            method: 'POST',
            url: ServerInfo.URL_Reporting,
            data: _data
        })
        request.then(function (response) {

            //if ($rootScope.checkResponseError(response))
            //  return;

            //console.log(response);
            $scope.availableReports = response.data;

        }, function (error) {
            console.error(error);
        });
    }


    $scope.setupCalendars = function () {
        var minDate = ServerInfo.availableDates[ServerInfo.availableDates.length - 1];
        var maxDate = ServerInfo.availableDates[0];

        minDate = moment(minDate).format('YYYY-MM-DD').toString();
        maxDate = moment(maxDate).format('YYYY-MM-DD').toString();

        rangeStart = moment(maxDate).subtract(7, 'days').format('YYYY-MM-DD').toString();

        // Default to the last week
        $scope.reportGenStartDate = moment(maxDate).subtract(7, 'days').format('YYYYMMDD').toString();
        $scope.reportGenEndDate = moment(maxDate).format('YYYYMMDD').toString();
        //console.log(rangeStart);
        //flatpickr('.calendar');

        flatpickr('.calendar', {
            enable: [
                {
                    from: minDate,
                    to: maxDate
                }
            ],
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
            mode: "range",
            defaultDate: [rangeStart, maxDate],
            // On Click of a new date
            onChange: function (selectedDates, dateStr, instance) {
                $scope.reportGenStartDate = moment(selectedDates[0]).format('YYYYMMDD').toString();;
                $scope.reportGenEndDate = moment(selectedDates[1]).format('YYYYMMDD').toString();;

                console.log("_____________________");
                console.log($scope.reportGenStartDate);
                console.log($scope.reportGenEndDate);
                console.log($scope.reportGenStartShift);
                console.log($scope.reportGenEndShift);
            }
        });
    }






    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            //$scope.reportSQLFile = 'Bogger_Tonnes\\RP_BoggerTonnes_AllTonnesByMineByTime.sql';
            //$scope.generateReport();
            $scope.getAvailableReports();
            $scope.setupCalendars();
        }, 50);
    });


    $rootScope.$on('newSiteDataSet', function () {
        $timeout(function () {
        }, 50);
    });


    $scope.$on('updateShift', function (event, data) {
        $timeout(function () {
        }, 10);
    });

});