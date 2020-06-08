


var app = angular.module('myApp', []);



app.controller('myCtrl', function ($scope, $http) {
    var _url = '../php/admin.php';

    // $scope.timeRegenStart;
    // $scope.timeRegenEnd;

    $scope.dataStatus = [];

    $scope.dumpDateToConsole = function ($_date) {
        //console.log($scope.dataStatus[$_date]);        
        console.log($_date + " - Downloading...");

        var _data = { 'func': 3, 'date': $_date };
        var request = $http({
            method: 'POST',
            url: _url,
            data: _data,
        })
        request.then(function (response) {

            //var newData = JSON.parse($scope.dataStatus);
            //var json = JSON.parse(response.data);
            //console.log(json);
            console.log(response.data);
            //$scope.prepareViewData();
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

            // var str = String(response.data);
            // if (str.includes("xdebug-error"))
            //     $scope.errorMsg = response.data;

            console.log(response.data);
            // Make associative
            $tmp = {};
            for (var key in response.data) {
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
            // console.log(key);
            $scope.regenerateDataForDate(key);
        }
    }


    $scope.regenerateDataForDate = function (_date) {
        if ($scope.dataStatus[_date] != undefined) {

            console.log("Here");
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
                console.log("Returned...");
                console.log(response);
                if ((response.data.Date in $scope.dataStatus)) {
                    $scope.dataStatus[response.data.Date] = response.data;
                    $scope.dataStatus[response.data.Date]['class'] = "far fa-check-circle green";
                }
            }, function (error) {
            });
        }
    }


    $scope.regenerateMissing = function () {

        //console.log("Regenerating data..." + new Date());


        // Check if any of the entries have 
        // null updates, then attempt to regenerate
        for (var key in $scope.dataStatus) {
            if ($scope.dataStatus[key]['LastUpdate'] == null) {
                console.log("Starting regen for " + $scope.dataStatus[key]['Date']);// + " at " + new Date());

                $scope.dataStatus[key]['class'] = "fas fa-sync-alt spinner loading";

                // Prepare payload
                var _data = {
                    'func': 1,
                    'date': $scope.dataStatus[key]['Date'],
                    'regen': true
                };
                var request = $http({
                    method: 'POST',
                    url: _url,
                    data: _data
                })
                request.then(function (response) {
                    console.log("Returned...");
                    var dataString = String(response.data);
                    if (dataString.includes("xdebug-error")) {
                        console.log("THERE WAS AN ERROR");
                        $scope.dataStatus[key]['Version'] = response.data;

                        console.log($scope.dataStatus[key]);
                    }
                    else {
                        console.log(response.data);

                        if ((response.data.Date in $scope.dataStatus)) {
                            //console.log("Added new data for " + key + " at " + new Date());
                            $scope.dataStatus[response.data.Date] = response.data;
                            $scope.dataStatus[response.data.Date]['class'] = "far fa-check-circle green";
                        }
                    }
                }, function (error) {
                });
            }
        }
    };


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


    $scope.getListOfDates();
});
