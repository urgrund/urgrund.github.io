


var app = angular.module('myApp', []);



app.controller('myCtrl', function ($scope, $http) {
    var _url = '../php/admin.php';
    $scope.dataStatus = [];

    $scope.dumpDateToConsole = function ($_date) {
        console.log($_date + " - Downloading...");

        var _data = { 'func': 3, 'date': $_date };
        var request = $http({
            method: 'POST',
            url: _url,
            data: _data,
        })
        request.then(function (response) {
            console.log(response.data);
        }, function (error) {
        });
    };


    $scope.getListOfDates = function () {

        console.log("Getting list of dates...");

        var _data = { 'func': 0 };
        var request = $http({
            method: 'POST',
            url: _url,
            data: _data
        })
        request.then(function (response) {
            console.log("Dates");
            console.log(response.data);
            // Make associative
            $tmp = {};
            for (var key in response.data) {
                //console.log(response.data[key]);
                $tmp[response.data[key]['Date']] = response.data[key];
            }
            $scope.dataStatus = $tmp
            //console.log($tmp);

            for (var key in $scope.dataStatus) {
                if ($scope.dataStatus[key]['LastUpdate'] != null) {
                    $scope.dataStatus[key]['class'] = "far fa-check-circle green";
                } else
                    $scope.dataStatus[key]['class'] = "far fa-times-circle red";
            }
        }, function (error) {
        });
    };


    $scope.regenerateAll = function () {
        for (var key in $scope.dataStatus) {
            $scope.regenerateDataForDate(key);
        }
    }


    $scope.regenerateMissing = function () {
        for (var key in $scope.dataStatus) {
            if ($scope.dataStatus[key]['LastUpdate'] == null) {
                $scope.regenerateDataForDate(key);
            }
        }
    };


    $scope.regenerateDataForDate = function (_date) {
        if ($scope.dataStatus[_date] != undefined) {

            //console.log("Here");
            $scope.dataStatus[_date]['class'] = "fas fa-sync-alt spinner loading";

            //_tmpDate = $scope.dataStatus[_date]['Date'];
            // Prepare payload
            var _data = {
                'func': 2,
                'date': _date,
                'regen': true
            };
            var request = $http({
                method: 'POST',
                url: _url,
                data: _data
            })
            request.then(function (response) {
                console.log(_date + " Returned...");
                console.log(response.data);
                //console.log($scope.dataStatus);

                var meta = response.data[response.data.length - 1];
                if (meta.Date in $scope.dataStatus) {
                    $scope.dataStatus[meta.Date] = meta;
                    $scope.dataStatus[meta.Date]['class'] = "far fa-check-circle green";
                } else
                    $scope.dataStatus[key]['class'] = "far fa-times-circle red";

            }, function (error) {
            });
        }
    }




    $scope.getConfigs = function () {
        var _data = { 'func': 4 };
        var request = $http({
            method: 'POST',
            url: _url,
            data: _data,
        })
        request.then(function (response) {
            console.log(response.data);
        }, function (error) {
        });
    }

    $scope.checkConnection = function () {
        var _data = { 'func': 5 };
        var request = $http({
            method: 'POST',
            url: _url,
            data: _data,
        })
        request.then(function (response) {
            console.log(response.data);
        }, function (error) {
        });
    }


    $scope.getListOfDates();
});
