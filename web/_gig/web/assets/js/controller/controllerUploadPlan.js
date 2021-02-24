
app.controller('UploadPlan', function ($scope, $routeParams, $rootScope, $http, $interval, $timeout) {







    $scope.planDisplay = null;


    // ----------------------------------------------------
    // ----------------------------------------------------
    // P L A N   U P L O A D I N G   S T U F F 


    $scope.onFileReadComplete = function ($contents) {
        if ($contents == undefined) {
            console.log("File data was undefined...");
            return;
        }
        $scope.fileContent = null;
        $scope.fileContent = $contents;
        //$scope.filterFileContent();
        //console.log($scope.fileContent);
        $scope.createDisplayArrays();

        //$scope.createUniqueSiteNames();
        //$scope.$apply();
    }


    $scope.createDisplayArrays = function () {
        var sites = {};
        for (var i = 0; i < $scope.fileContent.length; i++) {
            var s = $scope.fileContent[i][0];
            var siteName = ServerInfo.config.Sites[s];
            //console.log(siteName);

            if (siteName != undefined) {
                if (!(siteName in sites))
                    sites[siteName] = [];

                var entry = $scope.fileContent[i];
                $scope.fileContent[i].shift();
                sites[siteName].push(entry);
            }
        }
        $scope.planDisplay = sites;
        console.log(sites);
    }



    $scope.filterFileContent = function () {

        // Remove 1 sized rows
        var temp = [];
        for (var i = 0; i < $scope.fileContent.length; i++) {
            if ($scope.fileContent[i].length > 1)
                temp.push($scope.fileContent[i]);
            else
                console.log("Cleaned row " + i);
        }
        $scope.fileContent = temp;

        // Clear out null values
        $scope.fileContent = $scope.fileContent.filter(function (el) {
            if (el != null || el != undefined)
                return (el[0] != null);
            return el != null;
        });
    }




    $scope.uploadMonthlyPlan = function () {
        //var _url = '../dev/php/monthly/monthly.php';

        //console.log(($scope.fileContent));
        //return;        

        var _data = {
            'func': 0,
            'data': ($scope.fileContent),
            'year': $scope.currentPlanYear,
            'month': $scope.currentPlanMonth
        };

        var request = $http({
            method: 'POST',
            url: $scope.urlMonthly,
            data: _data,
        })
        request.then(function (response) {
            $scope.response = response;
            console.log(response);
        }, function (error) {
            $scope.response = error;
            console.log(error);
        });
    }


    $scope.$on('monthlySet', function (event, data) {
        //console.log("MONTHLY HAS BEEN SET");
        //$route.reload();
    });



    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
        }, 10);
    });


});