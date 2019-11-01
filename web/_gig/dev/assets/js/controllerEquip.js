
app.controller('EquipRoute', function ($scope, $routeParams) 
{
    //console.log("Equip Controller...");
    //Create();

    $scope.createEquipmentData = function ()
    {
        if (!dataComplete)
            return;

        //console.log($routeParams);
        //console.log($scope.siteData[$routeParams.siteIndex]["equipment"][$routeParams.equipIndex]["id"]);


        // Make a true new copy of the array 
        // to avoid accidently manipulating the original
        $scope.equipName = $scope.siteData[$routeParams.siteIndex]["equipment"][$routeParams.equipIndex]["id"];

        var jsonString = JSON.stringify($scope.siteData[$routeParams.siteIndex]["equipment"][$routeParams.equipIndex]);
        var newData = JSON.parse(jsonString);

        $scope.equip = newData;
        $scope.shift = shiftIsDay;

        //  Parse the string to create a new instance of the data
        //ChartLoaderEquip.RecreateCharts(newData);
        $scope.createChartsForEquip(newData);

        // Get operator details
        // Put into vars to avoid the massive text all the time					
        var events = $scope.siteData[$routeParams.siteIndex]["equipment"][$routeParams.equipIndex]["events"];
        //console.log("Events...");
        //console.log(events);

        var lastEvent = events[events.length - 1];
        $scope.opName = lastEvent.operator;

        var lastDate = new Date(lastEvent.eventTime.date);
        var lastDateFormat = lastDate.getHours() + ":" + lastDate.getMinutes();
        var plusOne = (lastEvent.dayAhead == 1 ? "(+1)" : "");
        //console.log(plusOne + lastDateFormat);

        // Some fiddling for date time since last call
        $scope.opLastRadio = lastDateFormat + plusOne;
        var now = new Date();

        // The difftime is UNTESTED ON REAL DATA
        var diffTime = Math.abs(lastDate.getTime() - now.getTime()) / 1000 / 60 / 60;
        diffTime = diffTime > 24 ? ">24hrs" : Math.round(diffTime) + "hrs";
        $scope.opTimeSinceLast = diffTime;

        $scope.opMineArea = lastEvent.mineArea;
        $scope.opLocation = lastEvent.location;
        $scope.opCurrStatus = lastEvent.status;
    };




    $scope.createChartsForEquip = function (_equipData)
    {
        ClearAllCharts();

        //assetIDThisPage = _equipData["id"];
        equipDataThisPage = _equipData;

        //console.log(equipDataThisPage);
        if (equipDataThisPage != null)
        {
            Charts.CreateTPH("tph", equipDataThisPage, ChartTPHDisplay.BOTH);
            Charts.CreateUofA("uofa", equipDataThisPage);
            Charts.CreateUofAPie("pie", equipDataThisPage);

            Charts.CreatePareto("operating", MajorGroup.OPERATING, equipDataThisPage);
            Charts.CreatePareto("idle", MajorGroup.IDLE, equipDataThisPage);
            Charts.CreatePareto("down", MajorGroup.DOWN, equipDataThisPage);

            Charts.CreateTimeLine("timeline", equipDataThisPage);
        }

        ResizeAllCharts();
    };


    $scope.$on('updateShiftEquip', function (event, data) { $scope.createEquipmentData(); });
    $scope.$on('dataComplete', function (event, data) { $scope.createEquipmentData(); });

    $scope.createEquipmentData();
});

