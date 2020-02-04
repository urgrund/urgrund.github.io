


// Holds all chart instances
var allCharts = [];



// -----------------------------------------------------------------------
// Convenience arrays for time labels 
timeLabelsShift = [];
timeLabelsShift[0] = GenerateTimeLabels(12, 6);
timeLabelsShift[1] = GenerateTimeLabels(12, 18);

timeLabelsShiftExtra = [];
timeLabelsShiftExtra[0] = GenerateTimeLabels(13, 6);
timeLabelsShiftExtra[1] = GenerateTimeLabels(13, 18);

function GenerateTimeLabels(_count, _offset) {
    var _array = [];
    var num;
    var suf;
    for (var i = _offset; i < _count + _offset; i++) {
        var hr = i % 24;
        if (hr == 0) hr = 12;
        num = hr > 12 ? hr - 12 : hr;
        suf = hr > 11 ? "pm" : "am";
        _array[i - _offset] = num + suf;
    }
    return _array;
}


//console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
//GenerateDateLabels('20181001', 91);
//console.log(timeLabelsShift[0]
function GenerateDateLabels(_startDate, _numberOfDays) {
    var d = moment(_startDate);
    var dateLabels = [];
    for (var i = 0; i < _numberOfDays; i++) {
        dateLabels.push(d.format('DD-MM-YY'));
        d.add(1, 'd');
    }
    return dateLabels;
}
// -----------------------------------------------------------------------




// -----------------------------------------------------------------------


// Subscribe to resize event to deal with chart resizing
window.addEventListener('resize', function (event) {
    ResizeAllCharts();
});


// Call resize on all existing eCharts
function ResizeAllCharts() {
    for (var i = 0; i < allCharts.length; i++)
        if (allCharts[i] != null)
            allCharts[i].resize();
}

// Wipe all chart references
function ClearAllCharts() {
    console.log("Clearing all charts");
    for (var i = 0; i < allCharts.length; i++) {
        if (allCharts[i] != null) {
            allCharts[i].dispose();
            allCharts[i] = null;
        }
    }
    allCharts = [];
}


function SetOptionOnChart(_option, _chart) {
    if (_option && typeof _option === "object") {
        _chart.setOption(_option, true);
        allCharts.push(_chart);
    }
}
// -----------------------------------------------------------------------


// -----------------------------------------------------------------------
// Time and other functions
function SecondsToMinutes(_seconds) {
    return _seconds / 60;
}

function ArrayOfNumbers(_number, _count, _startIndex) {
    var arr = [];
    for (var i = 0; i < _count; i++)
        arr[i] = i >= _startIndex ? _number : 0;
    return arr;
}

// Converts a value into a useable % string
function RatioToPercent(_value) {
    return Math.round(_value * 100) + "%";
}

function SecondsToHoursAndMinutes(num) {
    var hours = Math.floor(num / 60);
    var minutes = Math.trunc(Math.round((num % 60) * 100) / 100);
    return (hours > 0 ? hours + "h " : "") + minutes + "m";
}

const ChartTPHDisplay = {
    TPH: '0',
    CUMULATIVE: '1',
    BOTH: '2'
}



// Calculates a Moving Average and
// returns an array of values 
function CalculateMA(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data[i - j];//[1];
        }
        result.push((sum / dayCount).toFixed(2));
    }
    return result;
}
// -----------------------------------------------------------------------




class Charts {

    static CreateMPH(_elementID, _data, _display) {
        var myChart = echarts.init(document.getElementById(_elementID), ChartStyles.baseStyle);

        // Grab all the metrics recorded for this equipment 
        // Only interested if there was any metrics recorded this shift
        var metrics = [];
        for (var i = 0; i < _data.shiftData[shift].metricData.length; i++) {
            var metric = _data.shiftData[shift].metricData[i];
            if (metric.cph[11] > 0)
                metrics.push(metric);
        }

        var cumulative = ArrayOfNumbers(0, 12, 0);

        // Add all the series together
        // along with legend info 
        var seriesArray = [];
        var legend = [];
        var perSiteTotals = [];
        var perHourTotals = ArrayOfNumbers(0, 12, 0);


        for (var i = 0; i < metrics.length; i++) {
            // Invisible Series
            seriesArray.push(
                {
                    id: i,
                    name: metrics[i].site,
                    yAxisIndex: 0,
                    type: 'bar',
                    data: metrics[i].mph,
                    stack: 'mph',
                    barGap: '-100%',
                    itemStyle: { color: 'rgba(0,0,0,0)' }
                });


            // Add this site to the Legend
            if (!legend.includes(metrics[i].site))
                legend.push(metrics[i].site);

            // Site total
            // See if a site (WF, SLC..etc) exists
            // and create clean empty arrays for it
            if (!(metrics[i].site in perSiteTotals)) {
                perSiteTotals[metrics[i].site] = ArrayOfNumbers(0, 12, 0);
            }

            // Accumulate values into each site
            for (var j = 0; j < 12; j++) {
                cumulative[j] += metrics[i].cph[j];
                perSiteTotals[metrics[i].site][j] = perSiteTotals[metrics[i].site][j] + metrics[i].mph[j];
                perHourTotals[j] += metrics[i].mph[j];
            }
        }


        seriesArray.push(
            {
                name: "SLC",
                type: 'bar',
                z: 3,
                barMaxWidth: '15',
                data: perHourTotals,
                yAxisIndex: 0,
                itemStyle: { color: ChartStyles.siteColors[0] },
                label: { normal: { show: true, position: 'top' } },
                barGap: '-100%',
                itemStyle: { color: 'rgba(0,0,0,0)' }
            });


        // ------------------------
        // Cumulative Line        
        legend.push("Cumulative");
        seriesArray.push(
            {
                name: "Cumulative",
                yAxisIndex: 1,
                z: 2,
                type: 'line',
                data: cumulative,
                itemStyle: { color: ChartStyles.cumulativeColor },
                areaStyle: { color: ChartStyles.cumulativeArea },
                symbol: 'none',
                lineStyle: ChartStyles.lineShadow()
            });
        // ------------------------





        // ------------------------
        // Add each site data to series
        for (var key in perSiteTotals) {
            seriesArray.unshift(
                {
                    name: key,
                    type: 'bar',
                    stack: 'aaa',
                    barMaxWidth: '15',
                    data: perSiteTotals[key],
                    itemStyle: { color: ChartStyles.siteColors[0] }//,
                    //label: { normal: { show: true, position: 'top' } }
                });
        }
        //console.log(perSiteTotals);
        //console.log(perHourTotals);
        // ------------------------



        // ------------------------
        // Construct the hover over message
        function Label(params) {
            var string = "";

            // The time 
            string += ChartStyles.toolTipTextTitle(params[0].name);

            // Labels for each metric
            for (var i = 0; i < params.length; i++) {
                var metric = metrics[params[i].seriesId];
                if (typeof metric !== 'undefined') {
                    if (params[i].value > 0) {
                        string += ChartStyles.toolTipTextEntry("(" + metric.site + ") " + metric.name + " : " + params[i].value);
                    }
                }
            }

            // The last params element is the cumulative 
            var index = params.length - 1;
            string += ChartStyles.toolTipTextEntry(params[index].seriesName + " : " + params[index].value, "bold");
            return string;
        }
        // ------------------------


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            //tooltip: ChartStyles.toolTip(),
            legend: { y: 'top', data: legend },
            grid: {
                top: '20%',
                bottom: '5%',
                left: '3%',
                right: '3%',
                containLabel: true
            },
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "TPH"),
            tooltip: {
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params, index) {
                    return Label(params);
                }
            },
            xAxis: ChartStyles.xAxis(timeLabelsShift[shift]),
            yAxis: [{
                type: 'value',
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
                axisLabel: {
                    fontSize: ChartStyles.fontSizeSmall
                }
            },
            {
                type: 'value',
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
                axisLabel: {
                    fontSize: ChartStyles.fontSizeSmall
                }
            }],
            series: seriesArray
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }


    //---------------------------------------------------------------------------------------------







    static CreateTimeLine(_elementID, _data) {
        var dom = document.getElementById(_elementID);
        var myChart = echarts.init(dom, ChartStyles.baseStyle);

        var _d = _data.shiftData[shift];


        // Helper function for strings
        //function insert(str, index, value) { return str.substr(0, index) + value + str.substr(index); }

        var categories = ['Down', 'Idle', 'Operating'];
        var colorIndex = [2, 1, 0];
        //var colors = ['red', 'orange', 'green'];

        var data = [];
        for (var i = 0; i < _d.events.length; i++) {
            var event = _data.events[_d.events[i]];

            var majorGroup = event.majorGroup;// 

            var groupIndex;
            if (majorGroup == "OPERATING") groupIndex = 2;
            if (majorGroup == "IDLE") groupIndex = 1;
            if (majorGroup == "DOWN") groupIndex = 0;


            // Convert the date-time to seconds with a 6hr offset
            var startTime = new Date(event.eventTime.date);
            var trueTime = startTime.toLocaleTimeString('it-IT');

            // Convert date to seconds considering 0 as 6am 
            // and accounting for dates that go into the next day 
            startTime = (startTime.getHours() * 60 * 60) + (startTime.getMinutes() * 60) + startTime.getSeconds();
            startTime += 3600 * 24 * event.dayAhead;
            startTime -= 3600 * (shift == 0 ? 6 : 18); //(3600 * 6);

            //var duration = _data.events[i].duration;
            var duration = event.duration;

            //console.log(i + "  st: " + startTime + "   tt: " + trueTime);
            data.push({
                //name: _data.events[i].status,
                name: event.status,
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
                        color: ChartStyles.statusColors[colorIndex[groupIndex]] //colors[groupIndex] //typeItem.color
                    }
                }
            });
        }


        //console.log(data);



        // ----------------------------------------
        // Custom render for timeline
        var customTypes = ["Bar", "Box", "Line"];
        //var customTypeOffsets = [2, 15, 2];//[-0, -25, -50];

        function renderItem(params, api, customType) {
            var categoryIndex = api.value(0);
            var start = api.coord([api.value(1), categoryIndex]);
            var end = api.coord([api.value(2), categoryIndex]);
            var height = api.size([0, 1])[1] * 1.1;

            // This is the canvas rect to clip against
            var clipRect = { x: params.coordSys.x, y: params.coordSys.y - height * 2, width: params.coordSys.width, height: params.coordSys.height * 2 };

            // Offset of each bar
            var hOffset = height / 4;// customTypeOffsets[categoryIndex];

            if (customType == customTypes[2]) {

                var newY = start[1];
                var newH = api.size([0, 1])[1];//height / 2;//hOffset;

                var rectShape = echarts.graphic.clipRectByRect(
                    {
                        x: start[0],
                        y: newY,
                        width: 1,
                        height: newH
                    }
                    ,
                    clipRect
                );
            } else {
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


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            title: ChartStyles.createTitle(_d.events.length + " events"),
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "Timeline"),
            tooltip: {
                // Display info about the events 
                confine: true,
                formatter: function (params) {
                    return ChartStyles.toolTipTextTitle(params.value[4]) + ChartStyles.toolTipTextEntry(params.name + " for " + SecondsToHoursAndMinutes(params.value[3] / 60));
                },
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor()
            },
            grid: {
                containLabel: true,
                top: '2%',
                left: '2%',
                right: '2%',
                bottom: '4%'
            },
            xAxis: [
                {
                    // type: 'value',
                    show: true,
                    //min: 0,
                    max: 12,
                    data: timeLabelsShiftExtra[shift],
                    boundaryGap: false,
                    minInterval: 1,
                    maxInterval: 1,
                    axisLabel: {
                        rotate: 45,
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
                                opacity: 0.5
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
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }



    //---------------------------------------------------------------------------------------------




    static CreateUofA(_elementID, _data) {
        var myChart = echarts.init(document.getElementById(_elementID), ChartStyles.baseStyle);

        var _d = _data.shiftData[shift].uofa;

        var availability = [];
        var utilisation = [];
        var uofa = [];

        // Why is this logic here and not controller or PHP?
        for (var i = 0; i < _d.length; i++) {
            availability[i] = _d[i].availability / _d[i].totalTime;
            utilisation[i] = (_d[i].utilisation / _d[i].totalTime);// * 0.99;
            uofa[i] = _d[i].uofa;// * 0.98;
        }


        var option = {

            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            title: ChartStyles.createTitle('Actual Availability, Utilisation & U of A'),// vs Target'),
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "UofA"),
            legend: {
                top: 25,
                data: ['Availability', 'Utilisation', 'U of A', 'Targets']// 'Target A', 'Target U', 'Target U of A']
            },
            grid: {
                top: '20%',
                bottom: '5%',
                left: '3%',
                right: '3%',
                containLabel: true
            },
            tooltip: {
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params) {
                    var string = ChartStyles.toolTipTextTitle(params[0].name);
                    string += ChartStyles.toolTipTextEntry(params[0].seriesName + ": " + RatioToPercent(params[0].value));
                    string += ChartStyles.toolTipTextEntry(params[1].seriesName + ": " + RatioToPercent(params[1].value));
                    string += ChartStyles.toolTipTextEntry(params[2].seriesName + ": " + RatioToPercent(params[2].value));
                    return string;
                }
            },
            xAxis: ChartStyles.xAxis(timeLabelsShift[shift]),
            yAxis: {
                type: 'value',
                axisLabel:
                {
                    fontSize: ChartStyles.fontSizeSmall,
                    formatter: function (value, index) {
                        return (value * 100 + "%");
                    }
                },
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
            },
            series: [
                {
                    name: "Availability",
                    color: 'green',
                    data: availability,
                    itemStyle: ChartStyles.statusItemStyle(0),
                    type: 'line',
                    symbol: 'none',
                    lineStyle: ChartStyles.lineShadow(),
                    z: 2

                },
                {
                    name: "Utilisation",
                    color: 'orange',
                    data: utilisation,
                    itemStyle: ChartStyles.statusItemStyle(1),
                    type: 'line',
                    symbol: 'none',
                    lineStyle: ChartStyles.lineShadow(),
                    z: 1
                },
                {
                    name: "U of A",
                    color: 'blue',
                    data: uofa,
                    type: 'line',
                    symbol: 'none',
                    lineStyle: ChartStyles.lineShadow(),
                    itemStyle: { color: ChartStyles.uofaColor },
                    z: 0//,
                    //lineStyle: { type: 'dotted' }
                }
                // ,
                // {
                //     name: 'Targets',//"Target A",
                //     color: 'green',
                //     data: ArrayOfNumbers(0.85, 12, 0),
                //     type: 'line',
                //     lineStyle: { type: 'dotted' }
                // }
                // ,
                // {
                //     name: 'Targets',//"Target U",
                //     color: 'orange',
                //     data: ArrayOfNumbers(0.63, 12, 1),
                //     type: 'line',
                //     lineStyle: { type: 'dotted' }
                // }
                // ,
                // {
                //     name: 'Targets',//"Target U of A",
                //     color: 'lightblue',
                //     data: ArrayOfNumbers(0.78, 12, 1),
                //     type: 'line',
                //     lineStyle: { type: 'dotted' }
                // }
            ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }



    //---------------------------------------------------------------------------------------------




    static CreateUofAPie(_elementID, _data) {
        // -------------------------------------------------------------
        //if (myPie == null)
        var myChart = echarts.init(document.getElementById(_elementID), ChartStyles.baseStyle);

        var _d = _data.shiftData[shift];

        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            // title: {
            //     text: "Time Usage Split"
            // },
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "TimeUsageSplit"),
            tooltip: {
                trigger: 'item',
                formatter: function (params, index) {
                    var string = ChartStyles.toolTipTextTitle(params.name);
                    string += ChartStyles.toolTipTextEntry((Math.round(params.percent * 10) / 10) + "%" + "  (" + SecondsToHoursAndMinutes(params.value) + ")");
                    return string;
                },
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor()
            },

            legend: {
                orient: 'horizontal',
                x: 'center',
                y: 'top',
                data: ['Available', 'Non-Utilised', 'Downtime']
            },
            series: [
                {
                    name: 'Time Usage Split',
                    type: 'pie',
                    radius: ChartStyles.pieRadii,
                    avoidLabelOverlap: true,

                    // Example Shadow
                    // itemStyle: {
                    //     normal: {
                    //         label: { show: true },
                    //         labelLine: { show: true },
                    //         shadowBlur: 30,
                    //         shadowColor: 'rgba(20, 20, 60, 1)',
                    //     }
                    // },
                    label: {
                        formatter: '{d}%',
                        fontSize: ChartStyles.fontSizeAxis
                    },
                    data: [
                        {
                            value: SecondsToMinutes(_d.timeExOperating),
                            name: 'Available',
                            itemStyle: ChartStyles.statusItemStyle(0)
                        },
                        {
                            value: SecondsToMinutes(_d.timeExIdle),
                            name: 'Non-Utilised',
                            itemStyle: ChartStyles.statusItemStyle(1)
                        },
                        {
                            value: SecondsToMinutes(_d.timeExDown),
                            name: 'Downtime',
                            itemStyle: ChartStyles.statusItemStyle(2)
                        }
                    ]
                }
            ]

        };

        SetOptionOnChart(option, myChart);
    }


    //---------------------------------------------------------------------------------------------



    static CreatePareto(_elementID, _data, _colorIndex) {

        var myChart = echarts.init(document.getElementById(_elementID), ChartStyles.baseStyle);



        //var eventData = _data;

        var eventCategories;
        var eventTotalDuration;
        var eventCount;



        // Get data sorted 
        var newEvents = new Array();
        if (_data == 'undefined' || _data == null) {
            eventTotalDuration = 0;
            eventCount = 1;
            newEvents.push({ "event": "No Events", "duration": 0 });
        }
        else {
            eventCategories = _data.categories;
            eventTotalDuration = _data.duration;
            eventCount = _data.eventCount;
            var len = 0;
            for (var prop in eventCategories) {
                if (eventCategories.hasOwnProperty(prop))
                    ++len;
            }

            for (var key in eventCategories)
                newEvents.push({ "event": key, "duration": eventCategories[key] });
            newEvents.sort(function (a, b) { return b.duration - a.duration });
        }


        // TODO - if there's null data (ie. Workshop)
        var eventNames = [];
        var eventBars = [];
        var cumulative = [];
        var tempSum = 0;
        for (let i = 0; i < newEvents.length; i++) {
            tempSum += (newEvents[i].duration) / eventTotalDuration;
            cumulative.push(tempSum);
            eventNames[i] = newEvents[i].event.replace("-", "").replace(/ /g, "\n");
        }

        // Get cumulative to %
        for (let i = 0; i < newEvents.length; i++) {
            cumulative[i] = cumulative[i] / cumulative[cumulative.length - 1];
            eventBars[i] = {
                value: newEvents[i].duration / 3600,
                itemStyle: { color: ChartStyles.TUMColors[_colorIndex] }
            };  //getItemStyle(newEvents[i], cumulative[i]);
        }

        var barWidth = eventBars.length > 1 ? (eventBars.length > 3 ? '50%' : '20%') : '10%';
        //console.log(cumulative);

        // Simple horizontal line to show the 80%
        var paretoLimit = new Array(newEvents.length);
        paretoLimit.fill(0.8, 0, newEvents.length);


        // Sub text for each chart
        var durationAsHours = (eventTotalDuration / 60 / 60).toFixed(2);
        if (durationAsHours > 999) durationAsHours = (durationAsHours / 1000).toFixed(2) + "k";
        var subText =
            (durationAsHours
                + ' hours across '
                + newEvents.length
                + (newEvents.length > 1 ? ' categories' : ' category')
                + (eventCount != undefined ? " & " + eventCount + (eventCount > 1 ? " events" : " event") : ""));



        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            title: ChartStyles.createTitle(subText),
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "EventBreakdown"),
            tooltip: {
                trigger: 'axis',
                //textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params, index) {
                    return ChartStyles.toolTipTextTitle(params[0].name) + ChartStyles.toolTipTextEntry(SecondsToHoursAndMinutes(params[0].value * 60));
                },
                barMaxWidth: barWidth
            },
            xAxis: [
                ChartStyles.xAxis(eventNames, 0)
            ],
            yAxis: [
                {
                    splitLine: { show: false },
                    name: 'Hours',
                    nameLocation: 'center',
                    nameRotate: 90,
                    nameGap: 20,
                    axisLabel: {
                        fontSize: ChartStyles.fontSizeSmall,
                        formatter: function (value, index) {
                            return (value > 999) ? (value / 100) + "k" : value;
                        }
                    },
                    //interval: 1,
                    axisLine: ChartStyles.axisLineGrey
                },
                {
                    id: 1,
                    max: 1,
                    splitLine: { show: false },
                    axisLabel: {
                        fontSize: ChartStyles.fontSizeSmall,
                        formatter: function (value, index) { return value * 100 + "%"; }
                    },
                    axisLine: ChartStyles.axisLineGrey
                }
            ],
            series: [
                {
                    type: 'bar',
                    data: eventBars,
                    barMaxWidth: barWidth
                },
                {
                    // Pareto
                    type: 'line',
                    data: eventBars.length > 1 ? cumulative : null,
                    lineStyle: { color: 'red' },
                    symbol: 'none', // Turn off dots
                    yAxisIndex: 1,
                    smooth: true
                }
            ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }






    static CreateTimeLineFlat(_elementID, _data) {
        var dom = document.getElementById(_elementID);
        var myChart = echarts.init(dom, ChartStyles.baseStyle);

        var _d = _data.shiftData[shift];


        var categories = ['Down', 'Idle', 'Operating'];
        var colorIndex = [2, 1, 0];
        //var colors = ['red', 'orange', 'green'];

        var data = [];
        for (var i = 0; i < _d.events.length; i++) {
            var event = _data.events[_d.events[i]];

            var majorGroup = event.majorGroup;// 

            var groupIndex;
            if (majorGroup == "OPERATING") groupIndex = 2;
            if (majorGroup == "IDLE") groupIndex = 1;
            if (majorGroup == "DOWN") groupIndex = 0;


            // Convert the date-time to seconds with a 6hr offset
            var startTime = new Date(event.eventTime.date);
            var trueTime = startTime.toLocaleTimeString('it-IT');

            // Convert date to seconds considering 0 as 6am 
            // and accounting for dates that go into the next day 
            startTime = (startTime.getHours() * 60 * 60) + (startTime.getMinutes() * 60) + startTime.getSeconds();
            startTime += 3600 * 24 * event.dayAhead;
            startTime -= 3600 * (shift == 0 ? 6 : 18); //(3600 * 6);

            //var duration = _data.events[i].duration;
            var duration = event.duration;

            //console.log(i + "  st: " + startTime + "   tt: " + trueTime);
            data.push({
                //name: _data.events[i].status,
                name: event.status,
                value: [
                    // these relate to the encode in the custom graph
                    groupIndex,
                    startTime,
                    startTime + duration,
                    duration,
                    trueTime
                ],
                itemStyle: ChartStyles.statusItemStyle(colorIndex[groupIndex])
            });
        }


        //console.log(data);



        // ----------------------------------------
        // Custom render for timeline
        var customTypes = ["Bar", "Box", "Line"];

        function renderItem(params, api, customType) {
            var categoryIndex = api.value(0);
            var start = api.coord([api.value(1), categoryIndex]);
            var end = api.coord([api.value(2), categoryIndex]);
            var height = 20;//api.size([0, 1])[1] * 1;

            // This is the canvas rect to clip against            
            var clipRect = {
                x: params.coordSys.x,
                y: 0,
                width: params.coordSys.width,
                height: params.coordSys.height// * 2
            };

            // These are the 2 custom rects to draw
            if (customType == customTypes[2]) {
                var rectShape = echarts.graphic.clipRectByRect(
                    {
                        x: start[0],
                        y: 0,//start[1] + hOffset,// - height / 2,//hOffset + start[1] - height / 2,
                        width: customType == customTypes[1] ? height / 2 : end[0] - start[0],
                        height: 1000// -hOffset + categoryIndex// height / 2
                    }
                    ,
                    clipRect
                );
            } else {
                var rectShape = echarts.graphic.clipRectByRect(
                    {
                        x: start[0],
                        y: 0,//hOffset + start[1] - (customType == customTypes[1] ? height / 2 : height / 2),
                        width: customType == customTypes[1] ? height / 8 : end[0] - start[0],
                        height: 1000////customType == customTypes[1] ? height / 2 : height / 2
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


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            tooltip: {
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),//'rgba(50,50,50,0.9)',

                // Display info about the events 
                formatter: function (params) {
                    ChartStyles.toolTipTextEntry
                    var text = ChartStyles.toolTipTextTitle(params.value[4]);
                    var duration = Math.round(params.value[3] / 60);
                    text += ChartStyles.toolTipTextEntry(params.name + " for " + duration + " min");
                    return text;
                    //return params.marker + params.value[4] + "<br/ >" + params.name + "<br/ >" + " for " + duration + " min";
                },

                // Fast show/hide as there's a LOT of them 
                hideDelay: 0,
                showDelay: 0,
                transitionDuration: 0,
                confine: true
            },
            grid: {
                top: '3%',
                bottom: '3%',
                left: '1%',
                right: '1%'
            },
            xAxis: [
                {
                    // type: 'value',
                    show: false,
                    //min: 0,
                    max: 12,
                    data: timeLabelsShift[shift],
                    boundaryGap: false,
                    minInterval: 1,
                    maxInterval: 1,
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
            yAxis: { show: false, data: categories },
            series:
                [
                    {
                        // Custom Event Bars
                        type: 'custom',
                        renderItem: function (params, api) { return renderItem(params, api, customTypes[0]); },//renderItem,
                        itemStyle: {
                            normal: {
                                opacity: 0.5
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
                ]
        };



        SetOptionOnChart(option, myChart);
    }





    static CreateTimeLineFlatTime(_elementID) {
        var dom = document.getElementById(_elementID);
        var myChart = echarts.init(dom, ChartStyles.baseStyle);
        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            grid: {
                top: '3%',
                bottom: '3%',
                left: '1%',
                right: '1%'
            },
            xAxis:
            {
                show: true,
                min: 0,
                max: 12,
                position: 'bottom',
                data: timeLabelsShiftExtra[shift],
                boundaryGap: false,
                minInterval: 0,
                maxInterval: 0,
                axisLabel: {
                    inside: true,
                    rotate: 90,
                    //padding: [0, 0, -10, 60],
                    formatter: '{value}',
                    fontFamily: 'Poppins',
                    fontSize: 10
                },
                axisTick: { inside: true }
            },
            yAxis: { show: false, data: [1, 2, 3] },
            series: {
                type: 'line',
                itemStyle: { normal: { opacity: 0.5 } }
            }
        };
        SetOptionOnChart(option, myChart);
    }

}










// static CreateTPH(_elementID, _data, _display) {
//     var myChart = echarts.init(document.getElementById(_elementID), ChartStyles.baseStyle);

//     // Adjust for shift        
//     //console.log("Make TPH");
//     var _d = _data.shiftData[shift].tph;  //_data["tph"];// TrimDataForShift(_data["tph"]);// [];

//     //var title = _data["metric"];// "Tonnes Per Hour";//data[1][1];



//     var tonnesPerHour = [];
//     for (var i = 0; i < _d.length - 1; i++)
//         tonnesPerHour[i] = _d[i];

//     //console.log(tonnesPerHour);

//     var dataLength = tonnesPerHour[0].length;
//     var colouredCumulativeData = [];
//     var dailyTargetData = [];
//     var eightyFiveTargetData = [];


//     // These numbers should come from targets
//     // and from PHP / SQL,  not here in charts
//     var dailyTarget = 1200;
//     if (_data["metric"].indexOf("M") !== -1)
//         dailyTarget = 180;

//     // Hourly tonne and % targets
//     for (var i = 0; i < dataLength; i++) {
//         var perHourDailyTarget = (parseFloat(dailyTarget / 12) * (i + 1));
//         dailyTargetData.push({ value: perHourDailyTarget, symbolSize: (i == dataLength - 1) ? '10' : '0' });// (i = dataLength - 1) ? 'false' : 'true' });
//         eightyFiveTargetData.push(parseFloat(perHourDailyTarget * parseFloat(dailyTargetPercent / 100)));
//     }

//     // Color based on reaching % target            
//     var cumulativeVal = 0;
//     for (var i = 0; i < dataLength; i++) {
//         for (var j = 0; j < tonnesPerHour.length; j++) {
//             cumulativeVal += Math.round(tonnesPerHour[j][i]);
//             var val = Math.round(tonnesPerHour[j][i]);
//             tonnesPerHour[j][i] = {
//                 value: val == 0 ? "" : val,
//                 itemStyle: { color: ChartStyles.siteColors[i] }
//             };
//         }

//         var overUnder = (parseFloat(cumulativeVal) < parseFloat(eightyFiveTargetData[i])) ? 2 : 0;
//         colouredCumulativeData.push(
//             {
//                 value: cumulativeVal == 0 ? "" : cumulativeVal,
//                 itemStyle: { color: ChartStyles.statusColors[overUnder] }
//             });
//     }

//     //console.log(_d);

//     var seriesArray = [];
//     seriesArray.push(
//         {
//             name: 'Targets',
//             type: 'line',
//             yAxisIndex: 1,
//             lineStyle: { type: 'solid', color: ChartStyles.cumulativeColor, width: '1' },
//             itemStyle: { color: ChartStyles.cumulativeColor },
//             // symbol: 'none',
//             //animation: false,
//             data: dailyTargetData,
//             z: '-1',
//             areaStyle: {
//                 normal: {
//                     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
//                         offset: 0,
//                         color: ChartStyles.cumulativeColor.colorStops[0].color
//                     },
//                     {
//                         offset: 1,
//                         color: 'rgba(0,0,0,0.0)'
//                     }
//                     ], false),
//                     shadowColor: 'rgba(53,142,215, 0)',
//                     shadowBlur: 20
//                 }
//             }
//         }//,
//         // {
//         //     name: 'Targets',//dailyTargetPercent.toString(),
//         //     type: 'line',
//         //     yAxisIndex: 1,
//         //     lineStyle: { type: 'dotted', color: 'orange' },
//         //     animation: false,
//         //     data: eightyFiveTargetData
//         // }
//     );


//     switch (_display.toString()) {
//         case ChartTPHDisplay.TPH.toString():
//             seriesArray.push({
//                 name: 'Hourly',//_data["metric"],
//                 type: 'bar',
//                 yAxisIndex: 1,
//                 data: tonnesPerHour,
//                 label: { normal: { show: true, position: 'top' } }
//             });
//             break;
//         case ChartTPHDisplay.CUMULATIVE.toString():
//             seriesArray.push(
//                 {
//                     name: 'Cumulative',
//                     type: 'bar',
//                     yAxisIndex: 1,
//                     data: colouredCumulativeData,
//                     itemStyle: { color: ChartStyles.cumulativeColor },
//                     label: { normal: { show: true, position: 'top' } }
//                 });
//             break;
//         case ChartTPHDisplay.BOTH.toString():
//             for (var i = 0; i < tonnesPerHour.length; i++) {
//                 seriesArray.push(
//                     {
//                         name: _data.sites[i], //'Hourly',//_data["metric"],
//                         type: 'bar',
//                         stack: 'tph',
//                         data: tonnesPerHour[i],
//                         yAxisIndex: 1,
//                         itemStyle: { color: ChartStyles.siteColors[i] },
//                         label: { normal: { show: true, position: 'top' } }
//                     });
//             }
//             seriesArray.push(
//                 {
//                     name: 'Cumulative',
//                     type: 'bar',
//                     data: colouredCumulativeData,
//                     yAxisIndex: 1,
//                     itemStyle: { color: ChartStyles.cumulativeColor },
//                     label: { normal: { show: true, position: 'top' } }
//                 });
//             break;
//     }


//     // Create legend
//     var legend = [];
//     for (var i = 0; i < tonnesPerHour.length; i++)
//         legend.push({ name: _data.sites[i]/*, textStyle: { color: siteColors[i] }, icon: 'pin'*/ });
//     //legend.push('Cumulative');
//     legend.push('Targets');


//     var option = {
//         backgroundColor: ChartStyles.backGroundColor,
//         textStyle: ChartStyles.textStyle,
//         tooltip: ChartStyles.toolTip(),
//         legend: { y: 'top', data: legend },
//         grid: {
//             top: '20%',
//             bottom: '5%',
//             left: '3%',
//             right: '3%',
//             containLabel: true
//         },
//         toolbox: ChartStyles.toolBox(myChart.getHeight(), "TPH"),
//         xAxis: {
//             type: 'category',
//             data: timeLabelsShift[shift],
//             axisLabel: ChartStyles.timeLineAxisLabel()
//         },
//         yAxis: [
//             {
//                 //name: 'Tonnes',
//                 //nameLocation: 'middle',
//                 splitLine: { show: false },
//                 axisLine: ChartStyles.axisLineGrey
//             }, {
//                 //name: 'Cumulative',
//                 //nameLocation: 'middle',
//                 splitLine: { show: false },
//                 axisLine: ChartStyles.axisLineGrey
//             }
//         ],
//         series: seriesArray
//     };

//     SetOptionOnChart(option, myChart);
//     return myChart;
// }


