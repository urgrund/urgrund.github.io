
app.controller('Reporting', function ($scope, $http, $rootScope, $timeout, $route) {

    $scope.reportGenStartDate;
    $scope.reportGenEndDate;
    $scope.reportGenStartShift;
    $scope.reportGenEndShift;
    $scope.reportSQLFile;

    $scope.availableReports;

    $scope.generateReportFromClick = function (_key, _file) {

        //'Bogger_Tonnes\\RP_BoggerTonnes_AllTonnesByMineByTime.sql'
        var fullFileName = _key + "\\" + _file;
        console.log(fullFileName);

        $scope.reportSQLFile = fullFileName;
        $scope.generateReport();
    }

    $scope.cleanReportName = function (_file) {
        //var lastIndex = _file.lastIndexOf("_") + 1;
        var split = _file.split("_");
        var word = split[split.length - 1];
        word = word.slice(0, word.length - 4);
        //console.log(word);
        return word;
    }

    $scope.generateReport = function () {

        // var date = [
        //     $scope.reportGenStartDate,
        //     $scope.reportGenEndDate,
        //     $scope.reportGenStartShift,
        //     $scope.reportGenEndShift,
        //     $scope.reportSQLFile,
        // ];

        var data = ['20181010', '20181020', 1, 2, $scope.reportSQLFile];

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

            console.log(response);
            $scope.availableReports = response.data;

        }, function (error) {
            console.error(error);
        });
    }


    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            //$scope.reportSQLFile = 'Bogger_Tonnes\\RP_BoggerTonnes_AllTonnesByMineByTime.sql';
            //$scope.generateReport();
            $scope.getAvailableReports();
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