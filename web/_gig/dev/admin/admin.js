


var app = angular.module('myApp', []);



app.controller('myCtrl', function ($scope, $http) {
    var _url = '../php/admin.php';

    $scope.dataStatus = [];

    $scope.getListOfDates = function () {
        var _data = { 'func': 0 };
        var request = $http({
            method: 'POST',
            url: _url,
            data: _data
        })
        request.then(function (response) {
            $scope.dataStatus = response.data;
            console.log($scope.dataStatus);
        }, function (error) {
        });
    };





    $scope.regenerateMissing = function () {

        // Check if any of the entries have 
        // null updates, then attempt to regenerate
        for (var key in $scope.dataStatus) {
            if ($scope.dataStatus[key]['LastUpdate'] == null) {

                console.log("Need to regen for : " + key);

                // Update the frontend


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
                        console.log("Add new data for : " + key);
                        $scope.dataStatus[response.data.Date] = response.data;
                    }
                }, function (error) {
                });
            }
        }
    };

    $scope.getListOfDates();
});
