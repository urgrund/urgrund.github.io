

app.controller('MineRoute', function ($route, $scope, $timeout) 
{
    console.log("Mine Sites Controller...");


    // Title/heading variables
    $scope.titleAvailable = "Availability";
    $scope.titleSummary = "Summary";





    //$scope.allData = allData;
    //console.log($scope.allData);

    // Based on a site index and equipment index
    // return the real data object for the equipment
    $scope.getEquipObject = function (site, index)
    {
        if (index != null || index != undefined) { return $scope.siteData[site].equipment[index]; }
    };


    // THis should be top level, or a service 
    // and accesible in any scope at all times 
    $scope.getShift = function ()
    {
        return shiftIsDay;
    };



    // Style an equipment button based on 
    // its last recorded major group status
    var equipBtnBorderWidth = '2px';
    $scope.getEquipButtonSylte = function (e)
    {
        if (e != null || e != undefined)
        {
            if (e.shiftData[shiftIsDay].events[e.shiftData[shiftIsDay].events.length - 1].majorGroup == "OPERATING") { return { 'border-left': equipBtnBorderWidth + ' solid green' } }
            if (e.shiftData[shiftIsDay].events[e.shiftData[shiftIsDay].events.length - 1].majorGroup == "IDLE") { return { 'border-left': equipBtnBorderWidth + ' solid orange' } }
            if (e.shiftData[shiftIsDay].events[e.shiftData[shiftIsDay].events.length - 1].majorGroup == "DOWN") { return { 'border-left': equipBtnBorderWidth + ' solid red' } }
        }
    };


    $scope.$on('dataComplete', function (event, data)
    {
        //$scope.createCharts();
        $route.reload();
    });



    $scope.$on('updateShiftEquip', function (event, data)
    {

        //$scope.createCharts();
        $route.reload();

        // var delay = 1000;
        // $timeout(function () { $scope.tabClick(null, 0, $scope.siteData[0].name, $scope.lastTabOfSite[0]); }, 0 * delay);
        // $timeout(function () { $scope.tabClick(null, 1, $scope.siteData[1].name, $scope.lastTabOfSite[1]); }, 1 * delay);
        // $timeout(function ()
        // {
        //     console.log("PSODPASDPS");
        //     $scope.tabClick(null, 2, $scope.siteData[2].name, $scope.lastTabOfSite[2]);
        // }, 2 * delay);


        // for (var i = 0; i < $scope.lastTabOfSite.length; i++)
        // {
        //     $scope.tabClick(null, i, $scope.siteData[i].name, $scope.lastTabOfSite[i]);
        // }
    });


    $scope.lastTabOfSite = [];
    $scope.lastTabOfSite[0] = 0;
    $scope.lastTabOfSite[1] = 0;
    $scope.lastTabOfSite[2] = 0;


    $scope.createCharts = function ($timeout)
    {
        if (!dataComplete)
            return;

        ClearAllCharts();

        //for (i = 0; i < $scope.siteData.length - 1; i++)
        for (i = 0; i < $scope.siteData.length; i++)
        {
            //console.log("Create for site : " + $scope.siteData[i].name);

            // The element ID's are set in NG in the HTML
            ChartsMines.CreateTPH(i + "TPH", $scope.siteData[i].shiftData[shiftIsDay].tph);
            ChartsMines.CreateTPH(i + "CUMUL", $scope.siteData[i].shiftData[shiftIsDay].cumulative);
            ChartsMines.CreateSankey(i + "MM", $scope.siteData[i].materialMovement);

            var x = document.getElementsByClassName($scope.siteData[i].name + "Tab");
            for (z = 0; z < x.length; z++)
            {
                // Get chart divs
                var equipChartsDivs = x[z].getElementsByClassName("equipAvailBar");
                var boggerTotalTPH = Array.apply(null, Array(12)).map(function () { return 0; });
                var boggerTotalAvail = Array.apply(null, Array(3)).map(function () { return 0; });


                // -----------------------------------------------------
                // TODO -  this should all come from PHP?
                // Yes,  yes it should...   
                // -----------------------------------------------------

                // Create the usage bar for each equipment
                for (j = 0; j < equipChartsDivs.length; j++)
                {
                    // Get the equip and create a chart
                    var id = equipChartsDivs[j].id.substring(2);
                    var equip = $scope.siteData[i].equipment[id];

                    //Charts.CreateUofAPie(equipChartsDivs[j].id, equip);
                    //console.log("Trying to get : " + id);
                    ChartsMines.CreateUsageBar(equipChartsDivs[j].id, equip);

                    // Build site totals for metric TPH and usage
                    for (k = 0; k < equip.shiftData[shiftIsDay].tph[0].length; k++)
                    {
                        boggerTotalTPH[k] += equip.shiftData[shiftIsDay].tph[equip.shiftData[shiftIsDay].tph.length - 1][k];
                    }

                    boggerTotalAvail[0] += equip.shiftData[shiftIsDay].timeExOperating;
                    boggerTotalAvail[1] += equip.shiftData[shiftIsDay].timeExIdle;
                    boggerTotalAvail[2] += equip.shiftData[shiftIsDay].timeExDown;

                    //console.log(equip.id + " A:" + equip.shiftData[0].timeAvailable + "  D:" + equip.shiftData[0].timeDown + "  U:" + equip.shiftData[0].timeUtilised);
                }

                var tphDiv = document.getElementById(i + "-" + "EquipTypeTPH");
                ChartsMines.CreateTPH(tphDiv.id, boggerTotalTPH);

                var pieDiv = document.getElementById(i + "-" + "EquipTypePIE");
                ChartsMines.CreatePie(pieDiv.id, boggerTotalAvail);

                // Idea to get charts by Element
                // and only resize those to reduce lag
                //var c = echarts.getInstanceByDom(pieDiv);
                //console.log(c);
            }
        }

        ResizeAllCharts();
    };


    // Manages click input on the numerous tabs
    // taking into account the tab ground and index
    $scope.tabClick = function ($event, siteIndex, site, tabIndex)
    {
        $scope.lastTabOfSite[siteIndex] = tabIndex;

        // Get all the tab buttons 
        var btnClassName = siteIndex + "Btn";
        var buttons = document.getElementsByClassName(btnClassName);
        //console.log(buttons);

        // What to display in the tab
        x = document.getElementsByClassName(site + "Tab");
        for (i = 0; i < x.length; i++)
        {
            // Hide all tab content to start with
            // and set button display to 'off' 
            x[i].style.display = "none";
            buttons[i].className.replace("active", "");
            buttons[i].classList.remove("active");


            // If valid tab, turn on and generate charts for them
            if (tabIndex == x[i].id)
            {
                // Set display of the tab and the button
                x[i].style.display = "block";
                buttons[i].className += " active";
            }
        }

        ResizeAllCharts();
    };


    $scope.$watch('$viewContentLoaded', function ()
    {
        $timeout(function ()
        {
            $scope.createCharts();
        }, 0);
    });


});
