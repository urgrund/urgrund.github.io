app.controller('Reports', function ($route, $scope, $timeout) {

    var tempReports = { "Bogger Tonnes": ["All Tonnes By Mine By Time ", "Development Total By Mine By Time ", "Production Total By Mine By Time ", "Stockpile Total By Mine By Time ", "Total By Time By Activity ", "Total By Time "], "Equipment TUM": ["By Event Reason ", "By Major Category "] };


    // Holds the status and data of the 
    // generated reports.  
    // ['report', status]
    // status: 0=not started,  1= generating, 2=complete
    $scope.generatedReports = [];
    $scope.reportKeys = [];

    $scope.shiftOptions = [
        { 'id': 0, 'label': 'Day' },
        { 'id': 1, 'label': 'Night' }
    ];

    $scope.startDate = new Date('2018-10-05');
    $scope.endDate = new Date('2018-10-10');
    $scope.shiftStart = $scope.shiftOptions[0];
    $scope.shiftEnd = $scope.shiftOptions[1];


    //console.log(tempReports);


    $scope.getReports = function () {
        // var request = $http({
        //     method: 'POST',
        //     url: "php/reports/reports.php", data: { 'func': 0 }
        // })
        // request.then(function (response) {
        $scope.reports = tempReports;//response.data;

        var jsonString = JSON.stringify(tempReports);
        $scope.generatedReports = JSON.parse(jsonString);

        // With a duplicate array, store #'s to 
        // determine the state of each report
        for (const key in $scope.generatedReports) {
            if ($scope.reports.hasOwnProperty(key)) {
                $scope.reportKeys.push(key);
                const element = $scope.generatedReports[key];
                for (let i = 0; i < element.length; i++)
                    element[i] = [
                        null,                       // The report data once generated
                        0,                          // 0 = Not Generated,  1 = Generating, 2 = Ready
                        $scope.shiftOptions[0]      // Shift option for generation
                    ];
            }
        }

        console.log($scope.reportKeys);
        console.log($scope.generatedReports);

        //}, function (error) { });
    };



    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            // Ready...
            $scope.getReports();
        }, 0);
    });
});