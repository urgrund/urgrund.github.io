
app.controller('LongTerm', function ($scope, $routeParams, $rootScope, $timeout)
{
    // Temp data
    $scope.days = 970;
    $scope.calendarTime = 313.33;
    $scope.totalAvailability = 84;
    $scope.totalUofA = 87;
    $scope.totalEfficiency = 94;
    $scope.totalAssetUtil = 69;


    $scope.fillDataFromColumn = function (_column)
    {
        var data = [];
        data.push([]);
        data.push([]);

        var tempDates = [];
        for (var i = 1; i < longTermData.length; i++)
        {
            if (!tempDates.includes(longTermData[i][0]))
            {
                data[0].push(longTermData[i][0]);
                data[1].push(longTermData[i][_column]);

                tempDates.push(longTermData[i][0]);
            }
        }

        tempDates = null;
        return data;
    }



    $scope.createCharts = function ()
    {
        //console.log(longTermData[0]);

        // Availability
        $scope.dataAvail = $scope.fillDataFromColumn(9);
        var chartAvail = ChartsMonthly.CreateLongTerm("lt_avail", $scope.dataAvail, "Availability", ChartStyles.statusItemStyle(0));

        // U of A
        $scope.dataUofA = $scope.fillDataFromColumn(10);
        var chartUofA = ChartsMonthly.CreateLongTerm("lt_uofa", $scope.dataUofA, "Utilisation of Availability", { color: ChartStyles.uofaColor });

        // Total 
        $scope.dataTotal = $scope.fillDataFromColumn(11);
        var chartTotal = ChartsMonthly.CreateLongTerm("lt_total", $scope.dataTotal, "Total Asset Utilisation", ChartStyles.statusItemStyle(2));

        // Efficiency 
        $scope.dataEff = $scope.fillDataFromColumn(12);
        var chartEff = ChartsMonthly.CreateLongTerm("lt_eff", $scope.dataEff, "Efficiency", ChartStyles.statusItemStyle(1));


        $scope.dataTime = {};
        $scope.dataTime.Down = $scope.fillDataFromColumn(4);
        $scope.dataTime.Idle = $scope.fillDataFromColumn(5);
        $scope.dataTime.PrimaryOperating = $scope.fillDataFromColumn(6);
        $scope.dataTime.Operating = $scope.fillDataFromColumn(7);

        //var chartTime = ChartsMonthly.CreateLongTerm("lt_time", $scope.dataTime, "Time", null, true);
        //console.log($scope.dataTime);

        // Link all charts so the zoom together
        chartAvail.group = 'group1';
        chartUofA.group = 'group1';
        chartTotal.group = 'group1';
        chartEff.group = 'group1';

        echarts.connect('group1');


        // Callbacks for zoom
        chartAvail.on('dataZoom', function (evt)
        {
            $scope.updateValuesFromDataZoom(evt, chartAvail);
        })
    }


    $scope.updateValuesFromDataZoom = function (evt, _chart)
    {
        var axis = _chart.getModel().option.xAxis[0];
        var startTime = axis.data[axis.rangeStart];
        var endTime = axis.data[axis.rangeEnd];
        //console.log(starttime, endtime);

        // To set two dates to two variables 
        var startTime = new Date(startTime);
        var endTime = new Date(endTime);


        var timeDifference = endTime.getTime() - startTime.getTime();
        var daysDifference = timeDifference / (1000 * 3600 * 24);

        if (daysDifference != undefined)
        {
            if ($scope.days != daysDifference)
            {
                $scope.days = daysDifference;
                $scope.$apply();
            }
        }

        //console.log(Difference_In_Days);
    };

    $scope.$watch('$viewContentLoaded', function ()
    {
        $timeout(function ()
        {
            $scope.createCharts();
        }, 0);
        //$scope.createEquipmentCharts();
    });



});