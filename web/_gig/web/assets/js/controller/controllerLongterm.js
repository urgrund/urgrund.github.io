
app.controller('LongTerm', function ($scope, $rootScope, $timeout, $http) {


    // $scope.calendar = function () {
    //     $timeout(function () {
    //         var minDate = ServerInfo.availableDates[ServerInfo.availableDates.length - 1];
    //         var maxDate = ServerInfo.availableDates[0];

    //         minDate = moment(minDate).format('YYYY-MM-DD').toString();
    //         maxDate = moment(maxDate).format('YYYY-MM-DD').toString();

    //         flatpickr('#calendar', {
    //             enable: [
    //                 {
    //                     from: minDate,
    //                     to: maxDate
    //                 }
    //             ],
    //             defaultDate: maxDate,
    //             inline: true
    //         });
    //     }, 1000);
    // }

    //console.log(longTerm2);

    $scope.data;

    $scope.days = 0;
    $scope.calendarTime = 0;
    $scope.availability = 0;
    $scope.uOfa = 0;
    $scope.efficiency = 0;
    $scope.totalAU = 0;

    $scope.zoomStartValue;
    $scope.zoomEndValue;

    $scope.zoomTUM;



    $scope.dateIndexStart = 0;
    $scope.dateIndexEnd = longTerm2[1]['Availability'].length;
    //console.log($scope.dateIndexEnd);

    $scope.asset = null;

    // This should be from the TUM config instead    
    $scope.TUMCategories = [
        'Unplanned Breakdown',
        'Planned Maintenance',
        'Unplanned Standby',
        'Operating Standby',
        'Secondary Operating',
        'Primary Operating'
    ];


    // Line charts
    var l1;
    var l2;
    var l3;
    var l4;

    // Waterfall
    var wf;




    $scope.createMenuOptions = function () {
        $scope.names = Object.keys($scope.data[0]);
        $scope.selectedName = $scope.names[0];
    }


    $scope.updateAssetSelection = function () {
        $scope.asset = $scope.data[0][$scope.selectedName];
        $scope.createCharts();
    }


    function AdjustTotals() {
        //console.log($scope.zoomStartValue + '  ' + $scope.zoomEndValue);
        var asset = $scope.asset;
        var zoomDiff = $scope.zoomEndValue - $scope.zoomStartValue;
        $scope.calendarTime = 0;
        $scope.availability = 0;
        $scope.efficiency = 0;
        $scope.uOfa = 0;
        $scope.totalAU = 0;
        for (var i = $scope.zoomStartValue; i < $scope.zoomEndValue; i++) {
            $scope.calendarTime += asset.assetUtilisation[i].calendarTime;
            $scope.availability += asset.assetUtilisation[i].availability;
            $scope.efficiency += asset.assetUtilisation[i].efficiency;
            $scope.uOfa += asset.assetUtilisation[i].uOfa;
            $scope.totalAU += asset.assetUtilisation[i].totalAU;
        }
        $scope.calendarTime /= 3600;
        $scope.availability = RatioToPercent($scope.availability / zoomDiff);
        $scope.efficiency = RatioToPercent($scope.efficiency / zoomDiff);
        $scope.uOfa = RatioToPercent($scope.uOfa / zoomDiff);
        $scope.totalAU = RatioToPercent($scope.totalAU / zoomDiff);

        // This is the total data for the data range in use
        $scope.days = $scope.zoomEndValue - $scope.zoomStartValue;//asset.assetUtilisation.length;
        //$scope.calendarTime = Math.floor(asset.totalAssetUtilisation.calendarTime / 3600);
        //$scope.availability = RatioToPercent(asset.totalAssetUtilisation.availability);
        //$scope.uOfa = RatioToPercent(asset.totalAssetUtilisation.uOfa);
        //$scope.efficiency = RatioToPercent(asset.totalAssetUtilisation.efficiency);
        //$scope.totalAU = RatioToPercent(asset.totalAssetUtilisation.totalAU);
    }


    function AdjustWaterFall() {
        //console.log($scope.zoomStartValue + '  ' + $scope.zoomEndValue);
        var tumTimings = {};
        for (var i = 0; i < ServerInfo.config.TUMIndex.length; i++) {
            tumTimings[ServerInfo.config.TUMIndex[i].valueOf()] = { duration: 0 };
        }
        //let obj1 = { value: 1 };
        //let obj2 = { value: 5 };
        //obj2['Foo'] = 99;
        //let merged = { ...obj1, ...obj2 };

        for (var i = $scope.zoomStartValue; i < $scope.zoomEndValue; i++) {
            var assetTT = $scope.asset.assetUtilisation[i].tumTimings;
            for (var j = 0; j < ServerInfo.config.TUMIndex.length; j++) {
                var tumIndex = ServerInfo.config.TUMIndex[j];
                tumTimings[tumIndex].duration += assetTT[tumIndex].duration;
            }
        }

        // wf.dispatchAction({
        //     type: 'dataZoom',
        //     dataZoomIndex: 0,
        //     startValue: zoom.startValue,
        //     endValue: zoom.endValue
        // });

        //wf = Charts.CreateWaterfall("lt_wf", asset.totalAssetUtilisation.tumTimings, asset.totalAssetUtilisation.calendarTime);
        wf = Charts.CreateWaterfall("lt_wf", tumTimings, $scope.calendarTime * 3600);
        //console.log(tumTimings);
    }


    $scope.createCharts = function () {

        // The asset the chart views are
        // focusing on.  This could be everything,
        // an asset class or a single asset
        var asset = $scope.asset;

        AdjustTotals();
        AdjustWaterFall();

        for (var i = 0; i < $scope.TUMCategories.length; i++) {
            var cat = $scope.TUMCategories[i];
            Charts.CreatePareto(cat, asset.totalAssetUtilisation.tumTimings[cat]);
        }


        // Summed up...
        // This is the per-day data put into arrays
        var startDate = String(asset.assetUtilisation[0].dateID);
        var sumAvailability = [];
        var sumUofA = [];
        var sumEff = [];
        var sumTotalAU = [];

        for (var i = 0; i < asset.assetUtilisation.length; i++) {
            sumAvailability.push(asset.assetUtilisation[i].availability);
            sumUofA.push(asset.assetUtilisation[i].uOfa);
            sumEff.push(asset.assetUtilisation[i].efficiency);
            sumTotalAU.push(asset.assetUtilisation[i].totalAU);
        }

        //console.log(String(startDate));

        l1 = ChartsMonthly.CreateLongTerm("lt_tau", sumTotalAU, 2, startDate);
        l2 = ChartsMonthly.CreateLongTerm("lt_avail", sumAvailability, 4, startDate);
        l3 = ChartsMonthly.CreateLongTerm("lt_uofa", sumUofA, 3, startDate);
        l4 = ChartsMonthly.CreateLongTerm("lt_eff", sumEff, 1, startDate);

        wf = Charts.CreateWaterfall("lt_wf", asset.totalAssetUtilisation.tumTimings, asset.totalAssetUtilisation.calendarTime);

        var zoom = ChartsMonthly.CreateLongTermZoomTime("lt_zoom", sumTotalAU, startDate);

        // Link all charts so the zoom together
        l1.group = 'group1';
        l2.group = 'group1';
        l3.group = 'group1';
        l4.group = 'group1';

        echarts.connect('group1');


        // Callbacks for zoom
        zoom.on('dataZoom', function (evt) {
            $scope.updateValuesFromDataZoom(evt, zoom);
        })
    }




    $scope.updateValuesFromDataZoom = function (evt, _chart) {
        //console.log("Zoooming....");
        //var axis = _chart.getModel().option.xAxis[0];
        //console.log(axis);

        //console.log(l1.getOption().xAxis[0]);
        //l1.getOption().xAxis[0].rangeStart = axis.rangeStart;
        //l1.getOption().xAxis[0].rangeEnd = axis.rangeEnd;

        var zoom = _chart.getOption().dataZoom[0];
        l1.dispatchAction({
            type: 'dataZoom',
            dataZoomIndex: 0,
            startValue: zoom.startValue,
            endValue: zoom.endValue
        });

        //console.log(zoom.startValue + '  ' + zoom.endValue);

        $scope.zoomStartValue = zoom.startValue;
        $scope.zoomEndValue = zoom.endValue;


        AdjustTotals();
        AdjustWaterFall();


        // var startTime = axis.data[axis.rangeStart];
        // var endTime = axis.data[axis.rangeEnd];

        // $scope.dateIndexStart = axis.rangeStart;
        // $scope.dateIndexEnd = axis.rangeEnd;

        // $scope.createWaterfall();
        // $scope.createParetos();
    };


    // -------------------------------------------------
    // Server request
    $scope.getLongTermData = function () {

        var date = '201811%%';
        var _data = { 'func': 0, 'date': date };
        var request = $http({
            method: 'POST',
            url: ServerInfo.URL_Longterm,
            data: _data
        })
        request.then(function (response) {

            //xdebug-error
            // if (response.data.includes('xdebug-error')) {
            //     console.log("Error");
            //     $location.path('#!/site/0');

            //     return;
            // }
            if ($rootScope.checkResponseError(response))
                return;

            console.log("Long Term :");
            console.log(response.data);
            $scope.data = response.data;

            $scope.zoomStartValue = 0;
            $scope.zoomEndValue = $scope.data[1].assetUtilisation.length;
            $scope.createMenuOptions();

            $scope.asset = $scope.data[1];
            $scope.createCharts();

        }, function (error) {
            console.error(error);
        });
    }

    // -------------------------------------------------



    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            //$scope.createCharts();
            //$scope.calendar();
            $scope.getLongTermData();
        }, 100);
    });



});