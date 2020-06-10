
app.controller('LongTerm', function ($scope, $routeParams, $rootScope, $timeout) {

    flatpickr('#calendar-tomorrow', {
        //"minDate": new Date().fp_incr(1),
        inline: true
    });

    console.log(longTerm2);

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
        //console.log(longTerm2);

        //console.log(longTerm2[1]['Availability'][0]);

        $scope.createParetos();
        $scope.createWaterfall();


        // Availability
        $scope.dataAvail = longTerm2[1]['Availability']; //$scope.fillDataFromColumn(9);
        var chartAvail = ChartsMonthly.CreateLongTerm("lt_avail", $scope.dataAvail, "", ChartStyles.statusItemStyle(2), true);

        // U of A
        $scope.dataUofA = longTerm2[1]['UofA'];//$scope.fillDataFromColumn(10);
        var chartUofA = ChartsMonthly.CreateLongTerm("lt_uofa", $scope.dataUofA, "", { color: ChartStyles.uofaColor }, true);

        // Total 
        $scope.dataTotal = longTerm2[1]['Total Asset Utilisation']; //$scope.fillDataFromColumn(11);
        var chartTotal = ChartsMonthly.CreateLongTerm("lt_total", $scope.dataTotal, "", ChartStyles.statusItemStyle(0), true);

        // Efficiency 
        //$scope.dataEff = longTerm2[1]['Efficiency'];//$scope.fillDataFromColumn(12);
        //var chartEff = ChartsMonthly.CreateLongTerm("lt_eff", $scope.dataEff, "Efficiency", ChartStyles.statusItemStyle(1), true);


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
        //chartEff.group = 'group1';

        echarts.connect('group1');


        // Callbacks for zoom
        chartTotal.on('dataZoom', function (evt) {
            $scope.updateValuesFromDataZoom(evt, chartTotal);
        })


    }



    function sumArrayValues(total, num) {
        return total + num;
    }



    // -----------------------------------------------------------------------------------
    // PARETO
    $scope.createParetos = function () {


        for (var i = 0; i < $scope.TUMCategories.length; i++) {
            //var i = 1;
            var cat = $scope.TUMCategories[i];

            var newParetoObject = {};
            var newDuration = 0;
            newParetoObject.categories = {};
            //var newCategories = {};

            for (var key in longTerm2[0][cat].categories) {
                if (longTerm2[0][cat].categories.hasOwnProperty(key)) {
                    //console.log(key);
                    // This is the array with the complete data
                    // depending on the date range fetched
                    var categoryArray = longTerm2[0][cat][key];

                    // This is the spliced array 
                    var splice = longTerm2[0][cat][key].slice($scope.dateIndexStart, $scope.dateIndexEnd);
                    var reduce = splice.reduce(sumArrayValues);
                    //console.log(splice);
                    //console.log(reduce);
                    if (reduce > 0) {
                        newParetoObject.categories[key] = reduce;
                        newDuration += reduce;
                    }
                }
            }

            newParetoObject.duration = newDuration;
            //console.log(newParetoObject);

            //Charts.CreatePareto(cat, longTerm2[0][cat], i);
            Charts.CreatePareto(cat, newParetoObject, i);
        }
    }
    // -----------------------------------------------------------------------------------




    // -----------------------------------------------------------------------------------
    // WATERFALL

    $scope.getWaterFallTotal = function (_tumIndex) {
        var splice = longTerm2[0][TUMCategories[_tumIndex]].daily.slice($scope.dateIndexStart, $scope.dateIndexEnd);
        return splice.reduce(sumArrayValues);
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

        var wf = ChartsMonthly.CreateLongTermWaterfall("lt_wf", waterFall);
        //console.log(waterFall);
    }
    // -----------------------------------------------------------------------------------



    $scope.updateValuesFromDataZoom = function (evt, _chart) {
        var axis = _chart.getModel().option.xAxis[0];
        var startTime = axis.data[axis.rangeStart];
        var endTime = axis.data[axis.rangeEnd];

        $scope.dateIndexStart = axis.rangeStart;
        $scope.dateIndexEnd = axis.rangeEnd;

        $scope.createWaterfall();
        $scope.createParetos();

        //$scope.$apply();


    };

    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            $scope.createCharts();
        }, 100);
    });



});