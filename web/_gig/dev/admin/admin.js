


var app = angular.module('myApp', []);



app.controller('myCtrl', function ($scope, $http) {
    var _url = '../php/admin.php';

    // $scope.timeRegenStart;
    // $scope.timeRegenEnd;

    $scope.dataStatus = [];
    $scope.dataForView = [];

    $scope.prepareViewData = function () {
        return;

        // $scope.dataForView = null;
        // $scope.dataForView = [];

        // for (var key in $scope.dataStatus) {
        //     $scope.dataForView.push($scope.dataStatus[key]);
        // }
        // console.log($scope.dataForView);
    };


    $scope.getListOfDates = function () {
        var _data = { 'func': 0 };
        var request = $http({
            method: 'POST',
            url: _url,
            data: _data
        })
        request.then(function (response) {
            $scope.dataStatus = response.data;
            for (var key in $scope.dataStatus) {
                if ($scope.dataStatus[key]['LastUpdate'] != null) {
                    $scope.dataStatus[key]['class'] = "far fa-check-circle green";//$sce.trustAsHtml("<h1>Poo</h1>");
                } else
                    $scope.dataStatus[key]['class'] = "far fa-times-circle red";
            }
            console.log($scope.dataStatus);
            $scope.prepareViewData();
        }, function (error) {
        });
    };


    $scope.regenerateAll = function () {
        //$scope.regenerateDataForDate('20181001');

        for (var key in $scope.dataStatus) {
            $scope.regenerateDataForDate(key);
        }
    }


    $scope.regenerateDataForDate = function (_date) {
        if ($scope.dataStatus[_date] != undefined) {

            $scope.dataStatus[_date]['class'] = "fas fa-sync-alt spinner loading";

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
                if ((response.data.Date in $scope.dataStatus)) {
                    $scope.dataStatus[response.data.Date] = response.data;
                    $scope.dataStatus[response.data.Date]['class'] = "far fa-check-circle green";

                    $scope.prepareViewData();
                }
            }, function (error) {
            });
        }
    }

    $scope.regenerateMissing = function () {

        console.log("Regenerating data..." + new Date());


        // Check if any of the entries have 
        // null updates, then attempt to regenerate
        for (var key in $scope.dataStatus) {
            if ($scope.dataStatus[key]['LastUpdate'] == null) {

                //console.log("Starting regen for " + key + " at " + new Date());

                $scope.dataStatus[key]['class'] = "fas fa-sync-alt spinner loading";

                // Prepare payload
                var _data = {
                    'func': 1,
                    'date': key,
                    'regen': true
                };
                var request = $http({
                    method: 'POST',
                    url: _url,
                    data: _data
                })
                request.then(function (response) {
                    //console.log(response.data);

                    if ((response.data.Date in $scope.dataStatus)) {
                        //console.log("Added new data for " + key + " at " + new Date());
                        $scope.dataStatus[response.data.Date] = response.data;
                        $scope.dataStatus[response.data.Date]['class'] = "far fa-check-circle green";

                        $scope.prepareViewData();
                    }
                }, function (error) {
                });
            }
        }
    };

    $scope.getListOfDates();
});
