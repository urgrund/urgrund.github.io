


var allCharts = [];




// Time label data 
timeLabelsShift = [];
timeLabelsShift[0] = GenerateTimeLabels(12, 6);
timeLabelsShift[1] = GenerateTimeLabels(12, 18);
time12 = GenerateTimeLabels(12, 6);
time24 = GenerateTimeLabels(24, 6);
function GenerateTimeLabels(_count, _offset)
{
    var _array = [];
    var num;
    var suf;
    for (var i = _offset; i < _count + _offset; i++)
    {
        var hr = i % 24;
        if (hr == 0) hr = 12;
        num = hr > 12 ? hr - 12 : hr;
        suf = hr > 11 ? "pm" : "am";
        _array[i - _offset] = num + suf;
    }
    return _array;
}




$(window).on('resize', function ()
{
    ResizeAllCharts();
});



function ResizeAllCharts()
{
    //if (allCharts != null && allCharts.length > 0)
    //  for (var i = 0; i < allCharts.length; i++)    
    for (var i = 0; i < allCharts.length; i++)
        if (allCharts[i] != null)
            allCharts[i].resize();
}

function ClearAllCharts()
{
    for (var i = 0; i < allCharts.length; i++)
    {
        if (allCharts[i] != null)
        {
            allCharts[i].dispose();
            allCharts[i] = null;
        }
    }
    allCharts = [];
}


function SetOptionOnChart(_option, _chart)
{
    if (_option && typeof _option === "object")
    {
        _chart.setOption(_option, true);
        allCharts.push(_chart);
        //console.log("Added chart, total : " + allCharts.length);
    }
}

function TrimDataForShift(_data)
{
    var _trimmedArray = [];
    var spliceIndex = shiftIsDay == 0 ? 0 : 6;
    for (var i = 0; i < _data.length; i++)
    {
        _trimmedArray[i] = _data[i].slice(spliceIndex, spliceIndex + 12);//12);
    }
    return _trimmedArray;
}


// ------------------
// Sloppy, move these functions elsewhere
function SecondsToMinutes(_seconds)
{
    return _seconds / 60;
}

function ArrayOfNumbers(_number, _count, _startIndex)
{
    var arr = [];
    for (var i = 0; i < _count; i++)
        arr[i] = i >= _startIndex ? _number : 0;
    return arr;
}
// ------------------

const ChartTPHDisplay = {
    TPH: '0',
    CUMULATIVE: '1',
    BOTH: '2'
}


// Variables used in the charts
// need to manage these better
var dailyTargetPercent = 85;
var chartTone = 'dark';


class Charts
{
    static CreateTPH(_elementID, _data, _display)
    {

        // Error handling
        if (_data.shiftData[shiftIsDay].tph == null)
        {
            var e = document.getElementById(_elementID);
            e.innerHTML = "<i class='fas fa-exclamation-circle'> No data available...</i>";
            return;
        }



        var myChart = echarts.init(document.getElementById(_elementID), chartTone);

        // Adjust for shift        
        //console.log(_data.shiftData[shiftIsDay]);

        var _d = _data.shiftData[shiftIsDay].tph;  //_data["tph"];// TrimDataForShift(_data["tph"]);// [];

        //var k = _data.shiftData[shiftIsDay].metric.keys();

        var title = _data["metric"];// "Tonnes Per Hour";//data[1][1];


        var siteColors = ['orange', 'yellow'];


        var tonnesPerHour = [];
        for (var i = 0; i < _d.length - 1; i++)
            tonnesPerHour[i] = _d[i];

        //console.log(tonnesPerHour);

        var dataLength = tonnesPerHour[0].length;
        var colouredCumulativeData = [];
        var dailyTargetData = [];
        var eightyFiveTargetData = [];


        // These numbers should come from targets?
        var dailyTarget = 1500;
        if (_data["metric"].indexOf("M") !== -1)
            dailyTarget = 180;

        // Hourly tonne and % targets
        for (var i = 0; i < dataLength; i++)
        {
            var perHourDailyTarget = (parseFloat(dailyTarget / 12) * (i + 1));
            dailyTargetData.push(perHourDailyTarget);
            eightyFiveTargetData.push(parseFloat(perHourDailyTarget * parseFloat(dailyTargetPercent / 100)));
        }

        // Color based on reaching % target            
        var cumulativeVal = 0;
        for (var i = 0; i < dataLength; i++)
        {
            for (var j = 0; j < tonnesPerHour.length; j++)
            {
                cumulativeVal += tonnesPerHour[j][i]; //_d[0][i];
                tonnesPerHour[j][i] = { value: Math.round(tonnesPerHour[j][i]), itemStyle: { color: siteColors[j] } };
            }

            var colorString = (parseFloat(cumulativeVal) < parseFloat(eightyFiveTargetData[i])) ? 'red' : 'green';
            colouredCumulativeData.push({ value: Math.round(cumulativeVal), itemStyle: { color: colorString } });
            //var colorString = (parseFloat(_data[2][i]) < parseFloat(eightyFiveTargetData[i])) ? 'red' : 'green';
            //colouredCumulativeData.push({ value: _data[2][i], itemStyle: { color: colorString } });
        }

        //console.log(_d);

        var seriesArray = [];
        seriesArray.push(
            {
                name: 'Targets',
                type: 'line',
                lineStyle: { type: 'solid', color: 'grey' },
                animation: false,
                data: dailyTargetData
            },
            {
                name: 'Targets',//dailyTargetPercent.toString(),
                type: 'line',
                lineStyle: { type: 'dotted', color: 'orange' },
                animation: false,
                data: eightyFiveTargetData
            });


        switch (_display.toString())
        {
            case ChartTPHDisplay.TPH.toString():
                seriesArray.push({
                    name: 'Hourly',//_data["metric"],
                    type: 'bar',
                    data: tonnesPerHour,
                    label: { normal: { show: true, position: 'top' } }
                });
                break;
            case ChartTPHDisplay.CUMULATIVE.toString():
                seriesArray.push(
                    {
                        name: 'Cumulative',
                        type: 'bar',
                        data: colouredCumulativeData,
                        label: { normal: { show: true, position: 'top' } }
                    });
                break;
            case ChartTPHDisplay.BOTH.toString():
                for (var i = 0; i < tonnesPerHour.length; i++)
                {
                    seriesArray.push(
                        {
                            name: _data.tphSites[i], //'Hourly',//_data["metric"],
                            type: 'bar',
                            stack: 'tph',
                            data: tonnesPerHour[i],
                            itemStyle: { color: siteColors[i] },
                            label: { normal: { show: true, position: 'top' } }
                        });
                }
                seriesArray.push(
                    {
                        name: 'Cumulative',
                        type: 'bar',
                        data: colouredCumulativeData,
                        label: { normal: { show: true, position: 'top' } }
                    });
                break;
        }


        // Create legend
        var legend = [];
        for (var i = 0; i < tonnesPerHour.length; i++)
            legend.push({ name: _data.tphSites[i], /*textStyle: { color: siteColors[i] },*/ icon: 'pin' });
        legend.push('Cumulative');
        legend.push('Targets');


        var option = {
            //backgroundColor: 'rgba(0,0,0,0)',
            title: {
                text: title
            },
            tooltip: {},
            legend: {
                y: 'bottom',
                data: legend//['Hourly', 'Cumulative', 'Targets']//dailyTargetPercent.toString()]
            },
            // toolbox: {
            //     show: true,
            //     feature: {
            //         magicType: { type: ['line'], title: [''] },
            //         restore: { title: [''] }
            //     }
            // },
            xAxis: {
                type: 'category',
                data: timeLabelsShift[shiftIsDay],//hoursLabels,
                interval: 1
            },
            yAxis: {
                name: 'Tonnes',
                nameLocation: 'middle',
                nameGap: -20 //,
                //max: 3500
            },
            series: seriesArray
        };

        // use configuration item and data specified to show chart
        //if (option && typeof option === "object")
        {
            myChart.setOption(option, true);
            allCharts.push(myChart);
            ResizeAllCharts();
        }
    }



    //---------------------------------------------------------------------------------------------







    static CreateTimeLine(_elementID, _data)
    {
        var dom = document.getElementById(_elementID);
        var myChart = echarts.init(dom, chartTone);

        var _d = _data.shiftData[shiftIsDay];


        // Helper function for strings
        //function insert(str, index, value) { return str.substr(0, index) + value + str.substr(index); }

        var categories = ['Operating', 'Idle', 'Down'];
        var colors = ['green', 'orange', 'red'];

        var data = [];
        for (var i = 0; i < _d.events.length; i++)
        {
            var majorGroup = _d.events[i].majorGroup;// 

            var groupIndex;
            if (majorGroup == "OPERATING") groupIndex = 0;
            if (majorGroup == "IDLE") groupIndex = 1;
            if (majorGroup == "DOWN") groupIndex = 2;


            // Convert the date-time to seconds with a 6hr offset
            var startTime = new Date(_d.events[i].eventTime.date);
            var trueTime = startTime.toLocaleTimeString('it-IT');

            // Convert date to seconds considering 0 as 6am 
            // and accounting for dates that go into the next day 
            startTime = (startTime.getHours() * 60 * 60) + (startTime.getMinutes() * 60) + startTime.getSeconds();
            startTime += 3600 * 24 * _d.events[i].dayAhead;
            startTime -= 3600 * (shiftIsDay == 0 ? 6 : 18); //(3600 * 6);

            //var duration = _data.events[i].duration;
            var duration = _d.events[i].duration;

            //console.log(i + "  st: " + startTime + "   tt: " + trueTime);
            data.push({
                //name: _data.events[i].status,
                name: _d.events[i].status,
                value: [
                    // these relate to the encode in the custom graph
                    groupIndex,
                    startTime,
                    startTime + duration,
                    duration,
                    trueTime
                ],
                itemStyle: {
                    normal: {
                        color: colors[groupIndex] //typeItem.color
                    }
                }
            });
        }
        // console.log(data);



        // ----------------------------------------
        // Custom render for timeline
        var customTypes = ["Bar", "Box", "Line"];
        var customTypeOffsets = [2, 15, 2];//[-0, -25, -50];

        function renderItem(params, api, customType)
        {
            var categoryIndex = api.value(0);
            var start = api.coord([api.value(1), categoryIndex]);
            var end = api.coord([api.value(2), categoryIndex]);
            var height = api.size([0, 1])[1] * 1;

            // This is the canvas rect to clip against
            var clipRect = { x: params.coordSys.x, y: params.coordSys.y - height * 2, width: params.coordSys.width, height: params.coordSys.height * 2 };

            // Offset of each bar
            var hOffset = height / 4;// customTypeOffsets[categoryIndex];

            if (customType == customTypes[2])
            {
                //var newY = categoryIndex == 2 ? start[1] + hOffset : start[1];
                //var newH = categoryIndex == 2 ? -hOffset + categoryIndex : hOffset;
                var newY = start[1];
                var newH = api.size([0, 1])[1];//height / 2;//hOffset;

                var rectShape = echarts.graphic.clipRectByRect(
                    {
                        x: start[0],
                        y: newY,//start[1] + hOffset,// - height / 2,//hOffset + start[1] - height / 2,
                        width: 1,//customType == customTypes[1] ? height / 2 : end[0] - start[0],
                        height: newH// -hOffset + categoryIndex// height / 2
                    }
                    ,
                    clipRect
                );
            } else
            {
                var rectShape = echarts.graphic.clipRectByRect(
                    {
                        x: start[0],
                        y: hOffset + start[1] - (customType == customTypes[1] ? height / 2 : height / 2),
                        width: customType == customTypes[1] ? height / 8 : end[0] - start[0],
                        height: customType == customTypes[1] ? height / 2 : height / 2
                    }
                    ,
                    clipRect
                );
            }

            return rectShape && {
                type: 'rect',
                shape: rectShape,
                style: api.style()
            };
        }
        // ----------------------------------------


        //return;

        var option = {
            tooltip: {
                // Display info about the events 
                formatter: function (params)
                {
                    var duration = Math.round(params.value[3] / 60);
                    return params.marker + params.value[4] + "<br/ >" + params.name + "<br/ >" + " for " + duration + " min";
                },
                textStyle: { fontSize: 10 }
            },
            title: {
                text: 'Timeline of Events',
                subtext: _d.events.length + " events"
            },
            grid: {
                left: '10%',
                right: '10%',
                height: 80//'30%'
            },
            xAxis: [
                {
                    // type: 'value',
                    show: true,
                    //min: 0,
                    //max: 12,
                    data: timeLabelsShift[shiftIsDay],
                    boundaryGap: false,
                    minInterval: 0.01,
                    axisLabel: {
                        rotate: 90,
                        fontSize: 10,
                        formatter: '{value}'
                    }
                },
                {
                    //type: 'category',
                    show: false,
                    boundaryGap: false,
                    interval: 3600,
                    min: 0,
                    max: 43200
                }
            ],
            yAxis: [
                {
                    data: categories
                }
            ],
            series:
                [
                    {
                        // Custom Event Bars
                        type: 'custom',
                        renderItem: function (params, api) { return renderItem(params, api, customTypes[0]); },//renderItem,
                        itemStyle: {
                            normal: {
                                opacity: 0.33
                            }
                        },
                        encode: { x: [1, 2], y: 0 },
                        data: data,
                        z: 10,
                        xAxisIndex: 1,
                        yAxisIndex: 0
                    }
                    ,
                    {
                        // Custom Event Box
                        type: 'custom',
                        renderItem: function (params, api) { return renderItem(params, api, customTypes[1]); },//renderItem,
                        itemStyle: {
                            normal: {
                                opacity: 1.0
                            }
                        },
                        encode: { x: [1, 2], y: 0 },
                        data: data,
                        xAxisIndex: 1,
                        yAxisIndex: 0
                    }
                    // ,
                    // {
                    //     // Custom Event Line to Center
                    //     type: 'custom',
                    //     renderItem: function (params, api) { return renderItem(params, api, customTypes[2]); },//renderItem,
                    //     itemStyle: {
                    //         normal: {
                    //             opacity: 1.0
                    //         }
                    //     },
                    //     encode: { x: [1, 2], y: 0 },
                    //     data: data,
                    //     xAxisIndex: 1,
                    //     yAxisIndex: 0
                    // }
                ]
            // dataZoom: [
            //     {
            //         type: 'inside',
            //         start: 0,
            //         end: 100,
            //         minValueSpan: 10,
            //         xAxisIndex: [0, 1]
            //     }
            //,
            // {
            //     show: true,
            //     type: 'slider',
            //     bottom: 60,
            //     start: 0,
            //     end: 100,
            //     minValueSpan: 10,
            //     xAxisIndex: [0, 1]
            // }
            //],
        };



        SetOptionOnChart(option, myChart);
        // if (option && typeof option === "object")
        // {
        //     myChart.setOption(option, true);
        // }
    }



    //---------------------------------------------------------------------------------------------




    static CreateUofA(_elementID, _data)
    {
        var myChart = echarts.init(document.getElementById(_elementID), chartTone);

        // Split up all the data
        //var trimmedData = [];
        // for (var i = 0; i < _data.length; i++)
        // {
        //     var temp = _data[i].slice(2);
        //     temp.pop();
        //     trimmedData[i] = temp;
        // }
        var _d = _data.shiftData[shiftIsDay].uofa;

        var availability = [];
        var utilisation = [];
        var uofa = [];

        for (var i = 0; i < _d.length; i++)
        {
            availability[i] = _d[i].availability;
            utilisation[i] = _d[i].utilisation;
            uofa[i] = _d[i].uofa;
        }


        var option = {
            title: {
                text: "Availability & Utilistaion",
                subtext: 'Actual Availability, Utilisation and U of A vs Target'
            },
            legend: {
                y: 'bottom',
                data: ['Availability', 'Utilisation', 'U of A', 'Targets']// 'Target A', 'Target U', 'Target U of A']
            },
            xAxis: {
                type: 'category',
                data: timeLabelsShift[shiftIsDay]
            },
            yAxis: {
                type: 'value',
                axisLabel:
                {
                    formatter: function (value, index)
                    {
                        return (value * 100 + "%");
                    }
                }
            },
            series: [
                {
                    name: "Availability",
                    color: 'green',
                    data: availability,
                    type: 'line'
                },
                {
                    name: "Utilisation",
                    color: 'orange',
                    data: utilisation,
                    type: 'line'
                },
                {
                    name: "U of A",
                    color: 'blue',
                    data: uofa,
                    type: 'line',
                    z: 1//,
                    //lineStyle: { type: 'dotted' }
                }
                ,
                {
                    name: 'Targets',//"Target A",
                    color: 'green',
                    data: ArrayOfNumbers(0.85, 24, 0),
                    type: 'line',
                    lineStyle: { type: 'dotted' }
                }
                ,
                {
                    name: 'Targets',//"Target U",
                    color: 'orange',
                    data: ArrayOfNumbers(0.63, 24, 1),
                    type: 'line',
                    lineStyle: { type: 'dotted' }
                }
                ,
                {
                    name: 'Targets',//"Target U of A",
                    color: 'lightblue',
                    data: ArrayOfNumbers(0.78, 24, 1),
                    type: 'line',
                    lineStyle: { type: 'dotted' }
                }
            ]
        };

        SetOptionOnChart(option, myChart);
    }



    //---------------------------------------------------------------------------------------------




    static CreateUofAPie(_elementID, _data)
    {
        // -------------------------------------------------------------        
        var myChart = echarts.init(document.getElementById(_elementID), chartTone);

        var _d = _data.shiftData[shiftIsDay];

        var pieOption = {
            title: {
                text: "Time Usage Split"
            },
            tooltip: {
                trigger: 'item',
                //formatter: "{a} <br/>{b}: {c} ({d}%)",
                formatter: function (params, index)
                {
                    return (params.name + ": " + (Math.round(params.percent * 10) / 10) + "%" + "<br/>" + Math.trunc(params.value) + " minutes.");
                }
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                y: 'center',
                data: ['Available', 'Non-Utilised', 'Downtime']
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
                                fontSize: '15'//,
                                //fontWeight: 'bold'
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
                            value: SecondsToMinutes(_d.timeExOperating),
                            name: 'Operating',
                            itemStyle: { color: 'green' }
                        },
                        {
                            value: SecondsToMinutes(_d.timeExIdle),
                            name: 'Idle',
                            itemStyle: { color: 'orange' }
                        },
                        {
                            value: SecondsToMinutes(_d.timeExDown),
                            name: 'Down',
                            itemStyle: { color: 'red' }
                        }
                    ]
                }
            ]

        };

        SetOptionOnChart(pieOption, myChart);
    }


    //---------------------------------------------------------------------------------------------



    static CreatePareto(_elementID, _majorGroup, _data)
    {


        // THIS REALLY NEEDS FIXING  :(


        //console.log("Creating Pareto for " + _majorGroup);
        var dom = document.getElementById(_elementID);
        var myChart = echarts.init(dom, chartTone);

        var _d = _data.shiftData[shiftIsDay];

        var eventData = [];
        if (_majorGroup == MajorGroup.IDLE) { eventData = _d.eventBreakDown.IDLE; }
        if (_majorGroup == MajorGroup.OPERATING) { eventData = _d.eventBreakDown.OPERATING; }
        if (_majorGroup == MajorGroup.DOWN) { eventData = _d.eventBreakDown.DOWN; }


        // Get data sorted 
        var minorGroup = new Array();
        if (eventData == 'undefined' || eventData == null)
        {
            eventData = {};
            eventData.eventCount = 0;
            eventData.duration = 0;
            minorGroup.push({ "event": "No Events", "count": 0 });
        }
        else
        {
            for (var key in eventData.categories)
                minorGroup.push({ "event": key, "count": eventData.categories[key] });

            minorGroup.sort(function (a, b) { return b.count - a.count });


        }


        // TODO - if there's null data (ie. Workshop)



        //var eventCount = (eventData == 'undefined' || eventData == null) ? 1 : eventData.eventCount;
        var eventNames = [];
        var eventBars = [];
        var cumulative = [];
        var tempSum = 0;
        for (let i = 0; i < minorGroup.length; i++)
        {
            tempSum += (minorGroup[i].count) / eventData.eventCount;
            cumulative.push(tempSum);
            eventNames[i] = minorGroup[i].event.replace("-", "").replace(/ /g, "\n");
            eventBars[i] = getItemStyle(minorGroup[i], cumulative[i]);
        }
        //console.log(cumulative);

        // move to utils class
        //function getSum(total, num) { return total + num; }

        // Simple horizontal line to show the 80%
        var paretoLimit = new Array(minorGroup.length);
        paretoLimit.fill(0.8, 0, minorGroup.length);

        // move this to a charts utilities class
        // and deal with different themes
        function getItemStyle(category, cumulativeVal)
        {
            var red = (cumulativeVal < 0.8) || (category.count / eventData.eventCount > 0.8);
            return {
                value: category.count,
                itemStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                { offset: 0, color: red == 1 ? '#83bff6' : '#83bff6' },
                                { offset: 0.5, color: red == 1 ? 'blue' : '#188df0' },
                                { offset: 1, color: red == 1 ? 'darkblue' : '#188df0' }
                            ]
                        )
                    },
                    emphasis: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                { offset: 0, color: '#2378f7' },
                                { offset: 0.7, color: '#2378f7' },
                                { offset: 1, color: '#83bff6' }
                            ]
                        )
                    }
                }
            };
        }


        // Sub text for each chart
        //eventData.eventCount
        var subText = "No Events";
        if (eventData.eventCount > 0)
        {
            subText = ((eventData.duration / 60 / 60).toFixed(2)
                + ' hours across '
                + minorGroup.length
                + (minorGroup.length > 1 ? ' categories' : ' category')
                + " & " + eventData.eventCount + (eventData.eventCount > 1 ? " events" : " event"));
        }


        // var dataShadow = [];
        // for (var i = 0; i < data.length; i++) {
        //     dataShadow.push(yMax);
        // }

        var option = {
            title: {
                text: _majorGroup,
                subtext: subText
            },
            xAxis: [
                {
                    data: eventNames,
                    axisLabel: {
                        lineHeight: 8,
                        show: true,
                        interval: 0,
                        rotate: 90,
                        fontSize: 10
                    }
                }
            ],
            yAxis: [
                {
                    axisLine: { show: false }, splitLine: { show: false },
                    axisTick: { show: false },
                    name: 'Hours',
                    nameLocation: 'center',
                    nameRotate: 90,
                    nameGap: 25,
                    axisLabel: {
                        fontSize: 10,
                        formatter: function (value, index) { return Math.round(value / 3600); }
                    }
                },
                {
                    id: 1,
                    max: 1,
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: {
                        fontSize: 10,
                        formatter: function (value, index) { return value * 100 + "%"; }
                    }
                }
            ],
            // dataZoom: [
            //     {
            //         type: 'inside'
            //     }
            // ],
            series: [
                // { // For shadow
                //     type: 'bar',
                //     itemStyle: {
                //         normal: { color: 'rgba(0,0,0,0.05)' }
                //     },
                //     barGap: '-100%',
                //     barCategoryGap: '40%',
                //     data: dataShadow,
                //     animation: false
                // },
                {
                    // Cumulative
                    type: 'line',
                    data: cumulative,
                    lineStyle: { color: 'red' },
                    yAxisIndex: 1,
                    smooth: true
                },
                // {
                //     // 80% Limit
                //     type: 'line',
                //     data: paretoLimit,
                //     lineStyle: { color: 'blue', type: 'dotted' },
                //     yAxisIndex: 1,
                //     smooth: true
                // },
                {
                    type: 'bar',
                    data: eventBars,
                    barMaxWidth: '50%'
                }
            ]
        };

        SetOptionOnChart(option, myChart);
    }
}





///

/// Generate a graph 
// function CreateBoggerGraphs(elementID)
// {  

//     $.ajax({
//         url: "data.php?adsd=sss",
//         dataType: 'json',
//         type: "GET",
//         success: function (data)
//         {
//             var offsetIndex = 3;

//             var equipment = data[1][1];
//             var titleID = elementID + "_Title";
//             document.getElementById(titleID).innerHTML = equipment;

//             var hoursData = data[0].slice(offsetIndex);
//             var tonnesPerHour = data[1].slice(offsetIndex);
//             var cumulativeData = data[2].slice(offsetIndex);
//             var dailyTargetData = data[3].slice(offsetIndex);
//             var eightyFiveTargetData = data[4].slice(offsetIndex);

//             // Color based on reaching 85% target
//             var colouredCumulativeData = [];
//             for (i = 0; i < cumulativeData.length; i++)
//             {
//                 var colorString = (parseFloat(cumulativeData[i]) < parseFloat(eightyFiveTargetData[i])) ? 'red' : 'green';
//                 colouredCumulativeData.push({ value: cumulativeData[i], itemStyle: { color: colorString } });
//             }

//             var chartID;

//             // --------------------------------------------
//             // First chart
//             chartID = elementID + "_ChartCML";
//             myChart = echarts.init(document.getElementById(chartID), 'light');
//             var option = {
//                 backgroundColor: 'rgba(0,0,0,0)',
//                 title: {
//                     text: ''//equipment
//                 },
//                 tooltip: {},
//                 legend: {
//                     data: ['Cumulative', 'Daily Target', '85%']
//                 },
//                 toolbox: {
//                     show: true,
//                     feature: {
//                         magicType: { type: ['line'], title: [''] },
//                         restore: { title: [''] }
//                     }
//                 },
//                 xAxis: {
//                     data: hoursData
//                 },
//                 yAxis: {
//                     name: 'Tonnes',
//                     nameLocation: 'middle',
//                     nameGap: 40
//                 },

//                 series: [
//                     {
//                         name: 'Daily Target',
//                         type: 'line',
//                         lineStyle: { type: 'solid', color: 'grey' },
//                         data: dailyTargetData
//                     },
//                     {
//                         name: '85%',
//                         type: 'line',
//                         lineStyle: { type: 'dotted', color: 'red' },
//                         data: eightyFiveTargetData
//                     },
//                     {
//                         name: 'Cumulative',
//                         type: 'bar',
//                         data: colouredCumulativeData,
//                         label: {
//                             normal: {
//                                 show: true,
//                                 position: 'top'
//                             }
//                         }
//                     }
//                 ]
//             };

//             // use configuration item and data specified to show chart
//             myChart.setOption(option);
//             allCharts.push(myChart);
//             // --------------------------------------------

//             // --------------------------------------------
//             // Second chart
//             chartID = elementID + "_ChartTPH";
//             myChart = echarts.init(document.getElementById(chartID), 'light');
//             var option = {
//                 backgroundColor: 'rgba(0,0,0,0)',
//                 title: {
//                     text: ''//equipment
//                 },
//                 tooltip: {},

//                 xAxis: {
//                     data: hoursData
//                 },
//                 yAxis: {
//                     name: 'Tonnes',
//                     nameLocation: 'middle',
//                     nameGap: -10,
//                     nameTextStyle: { fontSize: 10 },
//                     axisLabel: { fontSize: 10 }
//                 },

//                 series: [
//                     {
//                         name: '',
//                         type: 'line',
//                         lineStyle: { type: 'solid', color: 'grey' },
//                         data: tonnesPerHour
//                     },
//                     {
//                         name: 'TPH',
//                         type: 'bar',
//                         data: tonnesPerHour,
//                         label: {
//                             normal: {
//                                 show: true,
//                                 position: 'top'
//                             }
//                         }
//                     }
//                 ]
//             };

//             // use configuration item and data specified to show chart
//             myChart.setOption(option);
//             allCharts.push(myChart);
//             // --------------------------------------------


//         },
//         error: function (data)
//         {
//         }
//     });
// }


// function CreateRadarGraph(elementID)
// {

//     console.error("Do not use this method anymore");
//     return;

//     var chartID;

//     // --------------------------------------------
//     // First chart
//     chartID = elementID;
//     myChart = echarts.init(document.getElementById(chartID), 'light');

//     var option = {

//         tooltip: {
//             trigger: 'item',
//             formatter: "{a} <br/>{b} : {c} ({d}%)"
//         },
//         legend: {
//             orient: 'vertical',
//             left: 'left',
//             data: ['A', 'B', 'C', 'D', 'E']
//         },
//         series: [
//             {
//                 //name: 'Poo',
//                 type: 'pie',
//                 radius: '55%',
//                 center: ['50%', '60%'],
//                 data: [
//                     { value: 335, name: 'A' },
//                     { value: 310, name: 'B' },
//                     { value: 234, name: 'C' },
//                     { value: 135, name: 'D' },
//                     { value: 1548, name: 'E' }
//                 ],
//                 itemStyle: {
//                     emphasis: {
//                         shadowBlur: 10,
//                         shadowOffsetX: 0,
//                         shadowColor: 'rgba(0, 0, 0, 0.5)'
//                     }
//                 }
//             }
//         ]
//     };

//     myChart.setOption(option);
//     allCharts.push(myChart);
// }
