
app.controller('Monthly', function ($scope, $routeParams, $rootScope, $timeout)
{

    $scope.siteIndex = $routeParams.site;
    $scope.site = $rootScope.siteData[$routeParams.site];

    var response = [{ "WF4540D13": [[360, 414, 0, 0, 1170, 900, 1296, 720, 612, 828, 1260, 270, 0, 522, 1260, 540, 1116, 1134, 1440, 0, 0, 0, 0, 0, 0, 0, 54, 684, 0, 0, 0], [360, 774, 774, 774, 1944, 2844, 4140, 4860, 5472, 6300, 7560, 7830, 7830, 8352, 9612, 10152, 11268, 12402, 13842, 13842, 13842, 13842, 13842, 13842, 13842, 13842, 13896, 14580, 14580, 14580, 14580], ["14000", "Ore", "Production Stope", "WF", "4540", "D13", 360, "WF4540D13"]], "WF4540D15": [[1476, 1746, 2466, 360, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2430, 4410, 1738, 3258], [1476, 3222, 5688, 6048, 6048, 6048, 6048, 6048, 6048, 6048, 6048, 6048, 6048, 6048, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 6090, 8520, 12930, 14668, 17926], ["16500", "Ore", "Production Stope", "WF", "4540", "D15", 1476, "WF4540D15"]], "WF4555D30": [[2772, 774, 2052, 1890, 1530, 396, 0, 540, 1116, 2286, 3024, 180, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [2772, 3546, 5598, 7488, 9018, 9414, 9414, 9954, 11070, 13356, 16380, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560, 16560], ["17500", "Ore", "Production Stope", "WF", "4555", "D30", 2772, "WF4555D30"]], "WF4555OD0": [[198, 0, 54, 0, 0, 414, 0, 0, 0, 0, 0, 0, 0, 0, 306, 0, 0, 0, 0, 0, 54, 510, 0, 630, 18, 567, 18, 360, 0, 18, 0], [198, 198, 252, 252, 252, 666, 666, 666, 666, 666, 666, 666, 666, 666, 972, 972, 972, 972, 972, 972, 1026, 1536, 1536, 2166, 2184, 2751, 2769, 3129, 3129, 3147, 3147], ["4000", "Ore", "Development Horizontal", "WF", "4555", "OD0", 198, "WF4555OD0"]], "WF4540PD0": [[0, 54, 468, 54, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 522, 0, 90, 0, 360, 0, 0, 0, 0, 72, 270, 54, 72, 0, 0, 198], [0, 54, 522, 576, 576, 576, 576, 576, 576, 576, 576, 576, 576, 576, 576, 1098, 1098, 1188, 1188, 1548, 1548, 1548, 1548, 1548, 1620, 1890, 1944, 2016, 2016, 2016, 2214], ["5000", "Ore", "Development Horizontal", "WF", "4540", "PD0", 54, "WF4540PD0"]], "WF4490HD0": [[0, 0, 21, 0, 396, 36, 0, 18, 0, 0, 72, 0, 0, 0, 0, 0, 0, 432, 84, 0, 0, 0, 0, 0, 414, 54, 0, 144, 0, 414, 0], [0, 0, 21, 21, 417, 453, 453, 471, 471, 471, 543, 543, 543, 543, 543, 543, 543, 975, 1059, 1059, 1059, 1059, 1059, 1059, 1473, 1527, 1527, 1671, 1671, 2085, 2085], ["4500", "Ore", "Development Horizontal", "WF", "4490", "HD0", 21, "WF4490HD0"]], "WF4555D32": [[0, 0, 0, 0, 0, 774, 270, 0, 0, 0, 0, 0, 0, 0, 1314, 0, 1224, 1440, 1980, 720, 0, 0, 0, 1026, 1980, 2520, 2340, 2466, 0, 0, 0], [0, 0, 0, 0, 0, 774, 1044, 1044, 1044, 1044, 1044, 1044, 1044, 1044, 2358, 2358, 3582, 5022, 7002, 7722, 7722, 7722, 7722, 8748, 10728, 13248, 15588, 18054, 18054, 18054, 18054], ["11111", "Ore", "Production Stope", "WF", "4555", "D32", 774, "WF4555D32"]], "WF4570D28": [[0, 0, 0, 0, 0, 0, 1674, 0, 0, 0, 0, 0, 0, 0, 306, 1440, 0, 0, 0, 180, 2700, 3330, 1080, 468, 0, 0, 0, 90, 1314, 0, 0], [0, 0, 0, 0, 0, 0, 1674, 1674, 1674, 1674, 1674, 1674, 1674, 1674, 1980, 3420, 3420, 3420, 3420, 3600, 6300, 9630, 10710, 11178, 11178, 11178, 11178, 11268, 12582, 12582, 12582], ["7500", "Ore", "Production Rings", "WF", "4570", "D28", 1674, "WF4570D28"]], "WF4555D34": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1728, 360, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1752, 1080, 1080], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1728, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 2088, 3840, 4920, 6000], ["8000", "Ore", "Production Stope", "WF", "4555", "D34", 1728, "WF4555D34"]], "WF4555SU0": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], [0, "Ore", "Development Horizontal", "WF", "4555", "SU0", 36, "WF4555SU0"]], "WF4570D26": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 990, 756, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 990, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746, 1746], ["9500", "Ore", "Production Stope", "WF", "4570", "D26", 990, "WF4570D26"]], "WF4540D17": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 540, 414, 0, 1134, 2250, 720, 1242, 2196, 3060, 2556, 2430, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 540, 954, 954, 2088, 4338, 5058, 6300, 8496, 11556, 14112, 16542, 16542, 16542, 16542, 16542], ["18000", "Ore", "Production Stope", "WF", "4540", "D17", 540, "WF4540D17"]], "WF4540OD1": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 144, 0, 0, 0, 0, 0, 180, 0, 234, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 144, 144, 144, 144, 144, 144, 324, 324, 558, 558, 558, 558, 558], [0, "Ore", "Development Horizontal", "WF", "4540", "OD1", 144, "WF4540OD1"]], "WF4540OD0": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 108, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 108, 108, 108, 108, 108, 108, 108, 108, 108], [0, "Ore", "Development Horizontal", "WF", "4540", "OD0", 108, "WF4540OD0"]], "WF4540D19": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 36, 36, 36], [0, "Ore", "Production Stope", "WF", "4540", "D19", 36, "WF4540D19"]] }, { "target": 115611, "actual": 107638, "overmined": 13343, "avgRequired": 3729.39, "avgCurrent": 3844.21, "spatialCompliance": 1.0464, "volumetricCompliance": 0.931 }];

    $scope.data = response[0];
    $scope.compliance = response[1];



    /*
        console.log($routeParams.func);
        console.log($scope.data);
        console.log($scope.compliance);
    */

    // Chart view of Monthyl Compliance
    if ($routeParams.func == 0)
    {
        //ChartsMonthly.CreateMonthlyCompliance("monthlyChart", $scope.data);



        // Test Long Term
        //console.log(longTermData);
        var data = [];
        data.push([]);
        data.push([]);
        for (var i = 1; i < longTermData.length; i++)
        {
            data[0].push(longTermData[i][0]);
            data[1].push(longTermData[i][9]);
        }
        var c1 = ChartsMonthly.CreateLongTerm("poo", data, "Availability", ChartStyles.statusItemStyle(0));


        data = [];
        data.push([]);
        data.push([]);
        for (var i = 1; i < longTermData.length; i++)
        {
            data[0].push(longTermData[i][0]);
            data[1].push(longTermData[i][10]);
        }
        var c2 = ChartsMonthly.CreateLongTerm("poo2", data, "Utilisation of Availability", { color: ChartStyles.uofaColor });

        c1.group = 'group1';
        c2.group = 'group1';
        //timeline.group = 'group1';
        echarts.connect('group1');
    }


    $scope.getLockClass = function ($index)
    {
        //$event.currentTarget.classList.toggle("fa-lock-open");
        //$event.currentTarget.classList.toggle("unlocked");
        if ($scope.entry[$index] != undefined)
        {
            if ($scope.entry[$index].lock == true)
            {
                return "fas fa-lock locked"
            } else
            {
                return "fas fa-lock-open unlocked";
            }
        }
        return "";
    }


    $scope.toggleLock = function ($event, $index)
    {
        //console.log($index);
        //console.log($scope.biglock);
        //
        //$scope.biglock == '0'
        if ($index == -1)
        {
            for (var i = 0; i < $scope.entry.length; i++)
            {
                $scope.entry[i].lock = $scope.biglock == 0 ? true : false;
            }
        }
        else
        {
            if ($scope.biglock == 1)
                if ($scope.entry[$index] != undefined)
                    $scope.entry[$index].lock = !$scope.entry[$index].lock;
        }
    }


    // Targets Adjustment 
    if ($routeParams.func == 1)
    {
        $scope.entry = [];
        for (var key in $scope.data)
        {
            $scope.entry.push({ lock: false, data: $scope.data[key][2] });
        }


        $scope.gridOptions = {};
        $scope.gridOptions.data = JSON.stringify($scope.entry);

        //console.log($scope.entry);
    }

});