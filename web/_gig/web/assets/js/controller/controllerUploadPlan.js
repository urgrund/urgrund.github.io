app.controller('UploadPlan', function ($scope, $routeParams, $rootScope, $http, $interval, $timeout) {

    // To display
    $scope.planDisplay = null;

    // To upload    
    $scope.fileContent = null;
    $scope.uploadDate = Date.now();

    $scope.uploadSuccess = 0;

    var modal = document.getElementById("myModal");

    // ----------------------------------------------------
    // ----------------------------------------------------
    // P L A N   U P L O A D I N G   S T U F F 


    $scope.onFileReadComplete = function ($contents) {
        if ($contents == undefined) {
            console.log("File data was undefined...");
            return;
        }

        $scope.fileContent = $contents;
        $scope.uploadSuccess = 0;
        $scope.filterFileContent();

        $scope.createDisplayArrays();
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

                var row = $scope.fileContent[i];

                // Only interested to 
                // display three columns
                var entry =
                    [
                        row[1],
                        row[3],
                        row[4]
                    ];
                //$scope.fileContent[i].shift();

                //if(entry[2] == null || entry[2] == undefined
                entry[1] = Number(entry[1]);
                //console.log(entry);
                sites[siteName].push(entry);
            }
        }
        $scope.planDisplay = sites;
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



    $scope.setupCalendar = function () {
        flatpickr('.calendar', {

            defaultDate: $scope.uploadDate,//todaysMonth,
            plugins: [
                new monthSelectPlugin({
                })
            ],

            // On Click of a new date
            onChange: function (selectedDates, dateStr, instance) {
                //var date = moment(selectedDates[0]).format('YYYYMM').toString();
                var date = moment(selectedDates[0]).format('YYYYMM');
                $scope.uploadDate = date;
                console.log(date);
            }
        });
    }




    $scope.uploadMonthlyPlan = function () {
        //console.log("Upload");

        // Nothing to upload yet
        if ($scope.planDisplay == null) {
            console.error("Invalid plan...");
            return;
        }


        var _data = {
            'func': 1,
            'data': [$scope.fileContent, $scope.uploadDate]
        };

        console.log(_data);

        var request = $http({
            method: 'POST',
            url: ServerInfo.URL_Monthly,
            data: _data,
        })
        request.then(function (response) {
            //console.log(response);
            $scope.uploadSuccess = 1;
            console.log("Upload successful");
            console.log(response);
        }, function (error) {
            $rootScope.processErrorResponse(error);
        });
    }




    $scope.$on('monthlySet', function (event, data) {

    });



    $scope.$watch('$viewContentLoaded', function () {
        $scope.setupCalendar();
    });


});