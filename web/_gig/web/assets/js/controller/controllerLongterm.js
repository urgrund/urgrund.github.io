
app.controller('LongTerm', function ($scope, $routeParams, $rootScope, $timeout) {
    // Temp data
    $scope.days = longTerm2[1]['Availability'].length;
    $scope.calendarTime = 313.33;
    $scope.totalAvailability = 84;
    $scope.totalUofA = 87;
    $scope.totalEfficiency = 94;
    $scope.totalAssetUtil = 69;

    $scope.dateIndexStart = 0;
    $scope.dateIndexEnd = longTerm2[1]['Availability'].length;
    //console.log($scope.dateIndexEnd);


    // test?
    $scope.TUMCategories = TUMCategories;


    //NO LONGER NEEDED,  OLD DATA
    $scope.fillDataFromColumn = function (_column) {
        var data = [];
        data.push([]);
        data.push([]);

        var tempDates = [];
        for (var i = 1; i < longTermData.length; i++) {
            if (!tempDates.includes(longTermData[i][0])) {
                data[0].push(longTermData[i][0]);
                data[1].push(longTermData[i][_column]);

                tempDates.push(longTermData[i][0]);
            }
        }

        tempDates = null;
        return data;
    }



    $scope.createCharts = function () {
        console.log(longTerm2);

        //console.log(longTerm2[1]['Availability'][0]);

        // Availability
        $scope.dataAvail = longTerm2[1]['Availability']; //$scope.fillDataFromColumn(9);
        var chartAvail = ChartsMonthly.CreateLongTerm("lt_avail", $scope.dataAvail, "Availability", ChartStyles.statusItemStyle(0));

        // U of A
        $scope.dataUofA = longTerm2[1]['UofA'];//$scope.fillDataFromColumn(10);
        var chartUofA = ChartsMonthly.CreateLongTerm("lt_uofa", $scope.dataUofA, "Utilisation of Availability", { color: ChartStyles.uofaColor });

        // Total 
        $scope.dataTotal = longTerm2[1]['Total Asset Utilisation']; //$scope.fillDataFromColumn(11);
        var chartTotal = ChartsMonthly.CreateLongTerm("lt_total", $scope.dataTotal, "Total Asset Utilisation", ChartStyles.statusItemStyle(2));

        // Efficiency 
        $scope.dataEff = longTerm2[1]['Efficiency'];//$scope.fillDataFromColumn(12);
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
        chartAvail.on('dataZoom', function (evt) {
            $scope.updateValuesFromDataZoom(evt, chartAvail);
        })


        $scope.createParetos();
        $scope.createWaterfall();
    }



    function myFunc(total, num) {
        return total + num;
    }


    $scope.createParetos = function () {
        for (var i = 0; i < $scope.TUMCategories.length; i++) {
            var cat = $scope.TUMCategories[i];
            //var splice = longTerm2[0][TUMCategories[cat]].daily.slice($scope.dateIndexStart, $scope.dateIndexEnd); 
            Charts.CreatePareto(cat, longTerm2[0][cat], i);
        }
    }

    $scope.getWaterFallTotal = function (_tumIndex) {



        //console.log($scope.dateIndexStart + "  " + $scope.dateIndexEnd);
        var splice = longTerm2[0][TUMCategories[_tumIndex]].daily.slice($scope.dateIndexStart, $scope.dateIndexEnd);
        //console.log(splice.reduce(myFunc));
        return splice.reduce(myFunc);
    };




    $scope.createWaterfall = function () {

        var waterFall = [];

        waterFall.push({ 'name': 'Calendar Time', 'value': null });
        waterFall.push({ 'name': TUMCategories[0], 'value': $scope.getWaterFallTotal(0), 'id': 0 });
        waterFall.push({ 'name': TUMCategories[1], 'value': $scope.getWaterFallTotal(1), 'id': 1 });
        waterFall.push({ 'name': 'Total Availability', 'value': null });
        waterFall.push({ 'name': TUMCategories[2], 'value': $scope.getWaterFallTotal(2), 'id': 2 });
        waterFall.push({ 'name': TUMCategories[3], 'value': $scope.getWaterFallTotal(3), 'id': 3 });
        waterFall.push({ 'name': 'Total Utilisation', 'value': null });
        waterFall.push({ 'name': TUMCategories[4], 'value': $scope.getWaterFallTotal(4), 'id': 4 });
        waterFall.push({ 'name': TUMCategories[5], 'value': $scope.getWaterFallTotal(5), 'id': 5 });

        waterFall[0].value = waterFall[1].value + waterFall[2].value + waterFall[4].value + waterFall[5].value + waterFall[7].value + waterFall[8].value;
        waterFall[3].value = waterFall[0].value - waterFall[1].value - waterFall[2].value;
        waterFall[6].value = waterFall[3].value - waterFall[4].value - waterFall[5].value;

        $scope.calendarTime = Math.round(waterFall[0].value / 3600, 0) / 1000;
        //console.log(waterFall);
        // waterFall.push({ 'name': 'Calendar Time', 'value': total });
        // waterFall.push({ 'name': TUMCategories[0], 'value': longTerm2[0][TUMCategories[0]].total, 'id': 0 });
        // waterFall.push({ 'name': TUMCategories[1], 'value': longTerm2[0][TUMCategories[1]].total, 'id': 1 });
        // waterFall.push({ 'name': 'Total Availability', 'value': totalAvail });
        // waterFall.push({ 'name': TUMCategories[2], 'value': longTerm2[0][TUMCategories[2]].total, 'id': 2 });
        // waterFall.push({ 'name': TUMCategories[3], 'value': longTerm2[0][TUMCategories[3]].total, 'id': 3 });
        // waterFall.push({ 'name': 'Total Utilisation', 'value': totalUtil });
        // waterFall.push({ 'name': TUMCategories[4], 'value': longTerm2[0][TUMCategories[4]].total, 'id': 4 });
        // waterFall.push({ 'name': TUMCategories[5], 'value': longTerm2[0][TUMCategories[5]].total, 'id': 5 });


        var wf = ChartsMonthly.CreateLongTermWaterfall("lt_wf", waterFall);
        //console.log(waterFall);
    }




    $scope.updateValuesFromDataZoom = function (evt, _chart) {
        var axis = _chart.getModel().option.xAxis[0];
        var startTime = axis.data[axis.rangeStart];
        var endTime = axis.data[axis.rangeEnd];

        $scope.dateIndexStart = axis.rangeStart;
        $scope.dateIndexEnd = axis.rangeEnd;

        $scope.createWaterfall();
        $scope.$apply();
        //console.log(Difference_In_Days);
    };

    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            $scope.createCharts();
        }, 100);
        //$scope.createEquipmentCharts();
    });



});