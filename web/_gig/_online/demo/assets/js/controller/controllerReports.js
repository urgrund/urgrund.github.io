app.controller('Reports', function ($scope, $http, $httpParamSerializerJQLike, $timeout, uiGridExporterService, uiGridExporterConstants) {


    // The list of available reports
    // this will need to come from server 
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

    $scope.accordionActive = false;

    //console.log(tempReports);


    $scope.reportCategory = "Bogger Tonnes"
    $scope.reportTitle = "All Tonnes By Mine By Time";

    $scope.gridOptions = {};



    $scope.gridOptions = {
        enableGridMenu: true,
        exporterMenuCsv: false,
        exporterMenuPdf: false,
        // gridMenuCustomItems: [{
        //     title: 'Export to CSV',
        //     action: function () {
        //         $scope.export('csv');
        //     },
        //     order: 210
        // }, {
        //     title: 'Export to PDF',
        //     action: function () {
        //         $scope.export('pdf');
        //     },
        //     order: 250
        // }],
        enableFiltering: true,
        paginationPageSizes: [8, 16, 24],
        paginationPageSize: 8,
        exporterCsvFilename: 'report.csv',
        exporterExcelFilename: 'report.xlsx',
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };



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

        //console.log($scope.reportKeys);
        //console.log($scope.generatedReports);

        //}, function (error) { });
    };


    $scope.accordionClick = function ($event) {
        $event.currentTarget.classList.toggle("active");
        var panel = $event.currentTarget.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }

        $scope.accordionActive = !$scope.accordionActive;
    }



    var refresh = function () {
        $scope.refresh = true;
        $timeout(function () {
            $scope.refresh = false;
        }, 0);
    };



    // User clicks to view a report
    $scope.setCSVViewData = function (key, rep) {
        // $scope.currentKeyView = key;
        // $scope.currentRepView = rep;
        // $scope.currentCSVView = $scope.generatedReports[key][rep][0];
        // $scope.currentCSVText = csvJSON($scope.currentCSVView[2]);

        $scope.gridOptions.data = csvJSON(tempReport[2]);// $scope.currentCSVText;

        //$scope.gridOptions.exporterCsvFilename = $scope.currentCSVView[0];
        //$scope.gridOptions.exporterExcelFilename = $scope.currentCSVView[0] + ".xlsx";
        refresh();
    };


    function csvJSON(csv) {
        var lines = csv.split("\n");
        var result = [];
        var headers = lines[0].split(",");
        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline = lines[i].split(",");

            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }

            result.push(obj);
        }

        //return result; //JavaScript object
        return JSON.stringify(result); //JSON
    }




    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            // Ready...
            $scope.getReports();
            $scope.setCSVViewData(null, null);

            //console.log(tempReport);
        }, 0);
    });
});


/* <script>
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++)
    {
        acc[i].addEventListener("click", function ()
        {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight)
            {
                panel.style.maxHeight = null;
            } else
            {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
}
</script> */