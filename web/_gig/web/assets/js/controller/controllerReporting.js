
app.controller('Reporting', function ($scope, $http, $rootScope, $timeout, uiGridExporterService, uiGridExporterConstants) {


    // Details needed to 
    // send to server
    $scope.reportGenStartDate;
    $scope.reportGenEndDate;
    $scope.reportGenStartShift;
    $scope.reportGenEndShift;
    $scope.reportSQLFile;

    // List of available reports
    $scope.availableReports;

    // Message for when there is no result
    $scope.noResult = true;
    $scope.hasEverRunReport = false;
    $scope.resultMsg = '<h3><i class="fas fa-info-circle"></i> Click on a report link to view results...</h3>';

    // This is for file saving, as the date picker may change before user saves
    $scope.resultDates = null;


    $scope.generateReportFromClick = function (_key, _file) {
        _key = _key.replace(" ", "_");
        var fullFileName = _key + "\\" + _file;
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

        // Set the title to be 'loading' spinner 
        $scope.resultMsg = '<i class="fas fa-circle-notch fa-spin"></i> ...';

        console.log($scope.reportGenStartDate + "   " + $scope.reportGenEndDate);

        var _data = { 'func': 0, 'date': data };
        var request = $http({
            method: 'POST',
            url: ServerInfo.URL_Reporting,
            data: _data
        })
        request.then(function (response) {
            //console.log(response);
            $scope.resultDates = [$scope.reportGenStartDate, $scope.reportGenEndDate];

            $scope.hasEverRunReport = true;
            $scope.noResult = false;
            if (response.data[0] == "No Result") {
                $scope.noResult = true;
                //$scope.resultMsg = "<h3><i class='fas fa-info-circle'></i> " + response.data[0] + "</h3><br/>";
                //$scope.resultMsg += "<h4>" + response.data[1] + "</h4><br/>";
                //$scope.resultMsg += "<h5>" + response.data[2] + "</h5><br/>";
                //return;
            }
            $scope.resultMsg = NiceNameFromReport($scope.reportSQLFile);

            SetTabulatorData(response.data);

        }, function (error) {
            $rootScope.processErrorResponse(error);
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
            //console.log($scope.noResult);
            $scope.availableReports = response.data;
        }, function (error) {
            console.error(error);
        });
    }



    $scope.setupCalendars = function () {
        var minDate = ServerInfo.availableDates[ServerInfo.availableDates.length - 1];
        var maxDate = ServerInfo.availableDates[0];

        var subtractDays = 7;
        minDate = moment(minDate).format('YYYY-MM-DD').toString();
        maxDate = moment(maxDate).format('YYYY-MM-DD').toString();

        rangeStart = moment(maxDate).subtract(subtractDays, 'days').format('YYYY-MM-DD').toString();

        // Default to the last week
        $scope.reportGenStartDate = moment(maxDate).subtract(subtractDays, 'days').format('YYYYMMDD').toString();
        $scope.reportGenEndDate = moment(maxDate).format('YYYYMMDD').toString();

        flatpickr('.calendar', {
            // This doesn't seem to work with Month calendars
            enable: [{
                from: minDate,
                to: maxDate
            }],

            altInput: true,
            //altFormat: "F j, Y",
            altFormat: "Y-m-d",
            dateFormat: "Y-m-d",
            mode: "range",
            defaultDate: [rangeStart, maxDate],
            // On Click of a new date
            onChange: function (selectedDates, dateStr, instance) {
                $scope.reportGenStartDate = moment(selectedDates[0]).format('YYYYMMDD').toString();
                $scope.reportGenEndDate = moment(selectedDates[1]).format('YYYYMMDD').toString();

                // console.log("_____________________");
                // console.log($scope.reportGenStartDate);
                // console.log($scope.reportGenEndDate);
                // console.log($scope.reportGenStartShift);
                // console.log($scope.reportGenEndShift);
            }
        });
    }






    // ----------------------------------------------------------------------
    //
    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            $scope.getAvailableReports();
            $scope.setupCalendars();
        }, 200);
    });


    $rootScope.$on('newSiteDataSet', function () {
        $timeout(function () {
        }, 50);
    });


    $scope.$on('updateShift', function (event, data) {
        $timeout(function () {
        }, 10);
    });

    // ----------------------------------------------------------------------






    // ----------------------------------------------------------------------
    // Dealing with the table itself and the user options such as save and print

    // Download the report in numerous formats
    $scope.downloadAs = function (_format) {
        //  $scope.resultDate
        var fileName = NiceNameFromReport($scope.resultMsg);
        fileName = fileName.replace(/ /g, "");
        fileName += $scope.resultDates[0] + "_" + $scope.resultDates[1];
        fileName += "." + _format;
        if (_format == 'pdf') {
            table.download("pdf", fileName, {
                orientation: "portrait",
                title: NiceNameFromReport($scope.resultMsg)
            });
        }
        else {
            table.download(_format, fileName);
        }
    }


    $scope.print = function () {
        //table.printHeader = "LSKJDLAKSJDS";
        table.print(false, true);
    }


    function NiceNameFromReport(_reportName) {
        var split = _reportName.split("\\");
        //console.log(split);
        var final = "";
        for (var i = 0; i < split.length; i++) {
            var str = split[i].replace("RP_", "");
            str = str.replace(".sql", "");
            str = str.replace(/_/g, " ");
            final += str;
            if (i == 0)
                final += " : ";
        }
        return final;
    }


    function SetTabulatorData(_data) {
        //console.log("Setting");
        if ($scope.noResult == true) {
            table.setHeight('0%');
            return;
        }

        tabledata = [];
        for (var i = 1; i < _data.length; i++) {
            var newRow = {};
            for (let j = 0; j < _data[0].length; j++) {
                newRow[_data[0][j]] = _data[i][j];
                // If it's a date
                if (_data[i][j] != null)
                    if (_data[i][j].date != undefined)
                        newRow[_data[0][j]] = _data[i][j].date;
            }
            tabledata.push(newRow);
        }
        //console.log(_data[1][3].date);

        var newColumns = []
        for (let i = 0; i < _data[0].length; i++) {
            var name = String(_data[0][i]);
            var newCol = { title: name, field: name };
            newColumns[i] = newCol;
        }
        //console.log(newColumns);
        //console.log(_data);

        table.setColumns(newColumns);
        table.setData(tabledata);
        table.setHeight('97%');
        table.redraw(true);
    }
    // ----------------------------------------------------------------------



    var tabledata = [];
    var table = new Tabulator("#tabulator", {
        height: '0%', // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
        data: tabledata, //assign data to table
        layout: "fitColumns", //fit columns to width of table (optional)

        //layout: "fitDataFill",
        //layoutColumnsOnNewData: true,
        //autoColumns: true,
        //Define Table Columns
        columns: [],
        // columns: [ 
        //     { title: "Name", field: "name", width: 150 },
        //     { title: "Age", field: "age", hozAlign: "left", formatter: "progress" },
        //     { title: "Favourite Color", field: "col" },
        //     { title: "Date Of Birth", field: "dob", sorter: "date", hozAlign: "center" },
        // ],
        rowClick: function (e, row) { //trigger an alert message when the row is clicked
            //alert("Row " + row.getData().id + " Clicked!!!!");
        }
    });

});