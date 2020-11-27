class ChartsMines
{

    static CreateUsageBar(_elementID, _data)
    {
        // -------------------------------------------------------------
        //if (myPie == null)
        var myChart = echarts.init(document.getElementById(_elementID), 'chartTone');

        var _d = _data.shiftData[shiftIsDay];

        //var t = SecondsToMinutes(_d.timeAvailable + (_d.timeAvailable - _d.timeUtilised) + _d.timeDown);
        //var t = (_d.timeAvailable + (_d.timeAvailable - _d.timeUtilised) + _d.timeDown);

        var t = _d.timeExOperating + _d.timeExIdle + _d.timeExDown;

        //console.log("Total time : " + t);
        var _barWidth = '10';
        function getLabel(_val)
        {
            if (_val === 0)
                return "";
            return Math.round((_val / t) * 100) + "%";
        }

        var option = {
            tooltip: {
                show: false,
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '0%',
                right: '0%',
                top: '50%',
                bottom: '25%',
                // height: '20%',
                containLabel: true
            },
            xAxis: {
                show: false,
                type: 'value'
                // min: 0,
                , max: t,
                // interval: 3600
            },
            yAxis: {
                show: false,
                type: 'category'
            },
            color: ['green', 'orange', 'red'],
            series: [
                {
                    name: 'Operating',
                    type: 'bar',
                    stack: 'a',
                    barWidth: _barWidth,
                    label: {
                        formatter: function (params) { return getLabel(params.value); }, show: true
                    },
                    data: [_d.timeExOperating]//,                    
                },
                {
                    name: 'Idle',
                    type: 'bar',
                    stack: 'a',
                    barWidth: _barWidth,
                    label: { formatter: function (params) { return getLabel(params.value); }, show: true },
                    data: [_d.timeExIdle]//                    
                },
                {
                    name: 'Down',
                    type: 'bar',
                    stack: 'a',
                    barWidth: _barWidth,
                    label: { formatter: function (params) { return getLabel(params.value); }, show: true },
                    data: [_d.timeExDown]//,                    
                }
            ]
        };



        SetOptionOnChart(option, myChart);
    }




    static CreateTPH(_elementID, _data)
    {

        // -------------------------------------------------------------        
        var myChart = echarts.init(document.getElementById(_elementID));//, chartTone);        

        var option = {
            color: ['#3398DB'],
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: timeLabelsShift[shiftIsDay],
                    axisTick: { alignWithLabel: true }
                }
            ],
            yAxis: [
                { type: 'value' }
            ],
            series: [
                {
                    name: 'Total',
                    type: 'bar',
                    barWidth: '60%',
                    data: _data
                }
            ]
        };

        SetOptionOnChart(option, myChart);
    }




    static CreatePie(_elementID, _data)
    {
        // -------------------------------------------------------------
        //if (myPie == null)
        var myChart = echarts.init(document.getElementById(_elementID));//, chartTone);
        //console.log(_elementID);
        //var _d = _data.shiftData[shiftIsDay];

        var pieOption = {
            // title: {
            //     text: "Time Usage Split"
            // },
            tooltip: {
                trigger: 'item',
                //formatter: "{a} <br/>{b}: {c} ({d}%)",
                formatter: function (params, index)
                {
                    return (params.name + ": " + (Math.round(params.percent * 10) / 10) + "%" + "<br/>" + Math.trunc(params.value / 60) + "hrs");
                }
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                y: 'center',
                data: ['Operating', 'Idle', 'Down']
            },
            series: [
                {
                    name: 'Time Usage Split',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: true,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '15',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    // timeAvailable
                    // timeDown
                    // timeUtilised
                    data: [
                        {
                            value: (_data[0]),
                            name: 'Operating',
                            itemStyle: { color: 'green' }
                        },
                        {
                            value: (_data[1]),
                            name: 'Idle',
                            itemStyle: { color: 'orange' }
                        },
                        {
                            value: (_data[2]),
                            name: 'Down',
                            itemStyle: { color: 'red' }
                        }
                    ]
                }
            ]

        };

        SetOptionOnChart(pieOption, myChart);
    }



    static CreateSankey(_elementID, _data)
    {

        //var myChart = echarts.init(document.getElementById(_elementID, 'dark'));
        var myChart = echarts.init(document.getElementById(_elementID), 'light');

        // -----------------------------------------------------------------
        // D a t a   P r e p 
        // This could/should be moved to PHP so that JS focuses
        // on presentation and PHP on preparation

        var uniqueLocations = [];
        var uniqueCountIndex = 0;

        var destGap = " | ";

        // Get all unique destinations into an array           
        for (var i = 0; i < _data.length; i++)
        {

            // Only add a Source if it doesn't exist
            if (!uniqueLocations.includes(_data[i][1].toString()))
            {
                uniqueLocations[uniqueCountIndex] = _data[i][1].toString();
                uniqueCountIndex++;
            }

            // Only add a Finished Area if it doesn't exist
            if (!uniqueLocations.includes(_data[i][3].toString() + destGap + _data[i][2].toString()))
            {
                uniqueLocations[uniqueCountIndex] = _data[i][3].toString() + destGap + _data[i][2].toString();
                uniqueCountIndex++;
            }
        }

        // Convert to the format eCharts wants        
        for (var i = 0; i < uniqueLocations.length; i++)
        {
            uniqueLocations[i] = { name: uniqueLocations[i].toString() };
        }

        // Convert Links to the format eCharts wants
        // As the Sankey auto-merges duplicates, that saves having 
        // to do this here and can just filter the SQL to eCharts
        var links = [];
        for (var i = 0; i < _data.length; i++)
        {

            links[i] = {
                source: _data[i][1].toString(),
                target: _data[i][3].toString() + destGap + _data[i][2].toString(),
                value: _data[i][4]
            };
        }
        // -----------------------------------------------------------------


        // The chart option        
        var option = {
            // title: { text: _title },            
            tooltip: {
                trigger: 'item',
                triggerOn: 'mousemove'
            },
            series: {
                type: 'sankey',
                layout: 'none',
                // focusNodeAdjacency: 'allEdges',

                // Hook up the data
                data: uniqueLocations,
                links: links
            }
        };

        SetOptionOnChart(option, myChart);
    }
}

