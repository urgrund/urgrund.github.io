
app.controller("adjustTargets", function ($scope)
{
    var modal = document.getElementById('targetsForm');
    var adjTargetChart;


    $scope.$on('open', function (event)
    {
        modal.style.display = "block";
        if (adjTargetChart != null)
            adjTargetChart.resize();
    });

    window.onclick = function (event)
    {
        if (event.target == modal)
        {
            modal.style.display = "none";
        }
    }




    var siteData = [
        { name: "Sub Level Cave", t: 40000, m: 0, w: 0, d: 0 },
        { name: "Western Flanks", t: 30000, m: 0, w: 0, d: 0 },
        { name: "M Reefs", t: 20000, m: 0, w: 0, d: 0 }
    ];

    $scope.sites = siteData;

    // Clean
    for (var i = 0; i < $scope.sites.length; i++)
        UpdateAveragesForSite($scope.sites[i]);

    function UpdateAveragesForSite(site)
    {
        site.m = parseInt(site.t / 28);
        site.w = parseInt(site.t / 26);
        site.d = parseInt(site.t / 25);
        //console.log(site.m);
    }

    $scope.submitMeasureForm = function ()
    {
        console.log("Submit Button Pressed");
        modal.style.display = "none";
    };

    $scope.prodTargetsChanged = function (t, site)
    {
        site.t = t;
        //site.t = parseInt(site.t);
        //console.log(t);
        UpdateAveragesForSite(site);
        UpdateChart($scope.sites);
    };

    //var app = {};
    UpdateChart($scope.sites);

    function UpdateChart(_data)
    {
        if (adjTargetChart == null)
        {
            var dom = document.getElementById("chart");
            adjTargetChart = echarts.init(dom, 'dark');
        }

        var colors = ['brightred', 'green', 'orange'];
        var seriesData = [];
        var legendNames = [];

        var xLabel = [];
        for (var j = 0; j < 28; j++)
            xLabel[j] = j;

        for (var i = 0; i < _data.length; i++)
        {
            var monthlyDaily = [];
            var monthlyCumulative = [];
            var daily = parseInt(_data[i].t / 28);

            for (var j = 0; j < 28; j++)
            {
                monthlyCumulative[j] = daily * j;
                monthlyDaily[j] = Math.abs(daily * j + ((Math.random() * 2 - 1) * daily * 4));
                //console.log(monthlyCumulative[j]);
            }
            //console.log("-----------------------------------");

            legendNames[i] =
                {
                    name: _data[i].name,
                    icon: 'diamond'
                    //textStyle: { color: colors[i] }
                }
            seriesData[i] =
                {
                    name: _data[i].name,
                    data: monthlyCumulative,
                    type: 'line'//,
                    // lineStyle: { color: colors[i], type: 'solid' }
                }

            seriesData[_data.length + i] =
                {
                    name: _data[i].name,
                    data: monthlyDaily,
                    type: 'bar'//,
                    //itemStyle: { color: colors[i] }
                }
            monthlyCumulative = null;
            monthlyDaily = null;
        }

        //console.log(lines);

        option = null;
        option = {
            color: ['pink', 'green', 'orange'],
            legend: {
                data: legendNames
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                interval: 100,
                data: xLabel

                //data: lines// ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { show: false }
            },
            series: seriesData
        };

        if (option && typeof option === "object")
        {
            adjTargetChart.setOption(option, true);
        }


        option = null;
        colors = null;
        seriesData = null;
        legendNames = null;
        xLabel = null;

    }

});