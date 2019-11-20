
app.controller('LongTerm', function ($scope, $routeParams, $rootScope, $timeout) {


    // Temp data
    $scope.days = 970;
    $scope.calendarTime = 313.33;
    $scope.totalAvailability = 84;
    $scope.totalUofA = 87;
    $scope.totalEfficiency = 94;
    $scope.totalAssetUtil = 69;





    $scope.fillDataFromColumn = function (_column) {
        var data = [];
        data.push([]);
        data.push([]);
        for (var i = 1; i < longTermData.length; i++) {
            data[0].push(longTermData[i][0]);
            data[1].push(longTermData[i][_column]);
        }
        return data;
    }



    $scope.createCharts = function () {
        console.log(longTermData[0]);

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

        chartAvail.group = 'group1';
        chartUofA.group = 'group1';
        chartTotal.group = 'group1';
        chartEff.group = 'group1';


        echarts.connect('group1');
    }

    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            $scope.createCharts();
        }, 0);
        //$scope.createEquipmentCharts();
    });



});