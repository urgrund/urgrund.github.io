

// Holds all chart instances
var allCharts = [];


// General Array Indexes for time
// 0 = Day
// 1 = Night
// 2 = 24hr

// -----------------------------------------------------------------------
// Convenience arrays for time labels 
timeLabelsShift = [];
timeLabelsShift[0] = GenerateTimeLabels(12, 6);
timeLabelsShift[1] = GenerateTimeLabels(12, 18);
timeLabelsShift[2] = GenerateTimeLabels(24, 6);

timeLabels24hr = GenerateTimeLabels(24, 6);

// extra means it's from, say 6am to 6pm instead of 5pm
timeLabelsShiftExtra = [];
timeLabelsShiftExtra[0] = GenerateTimeLabels(13, 6);
timeLabelsShiftExtra[1] = GenerateTimeLabels(13, 18);
timeLabelsShiftExtra[2] = GenerateTimeLabels(25, 6);

// function PrepareAllTimeLabels(_shiftStart) {
//     timeLabelsShift[0] = GenerateTimeLabels(12, _shiftStart);
//     timeLabelsShift[1] = GenerateTimeLabels(12, _shiftStart + 12);
//     timeLabelsShift[2] = GenerateTimeLabels(24, _shiftStart);
//     timeLabelsShiftExtra[0] = GenerateTimeLabels(13, _shiftStart);
//     timeLabelsShiftExtra[1] = GenerateTimeLabels(13, _shiftStart + 12);
//     timeLabelsShiftExtra[2] = GenerateTimeLabels(25, _shiftStart);

//     timeLabels24hr = GenerateTimeLabels(24, shiftStart);
// }
// PrepareAllTimeLabels(6);

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

const secondsInShift = 43200;
const secondsInDay = 86400;

function GenerateDateLabels(_startDate, _numberOfDays) {

    var d = moment(_startDate);
    //console.log(_startDate + "  " + d);
    var dateLabels = [];
    for (var i = 0; i < _numberOfDays; i++) {
        dateLabels.push(d.format("D-M-YY"));
        d.add(1, 'd');
        //console.log(d.format("D/M/YYYY"));
    }
    //console.log(_startDate + "  " + d);
    return dateLabels;
}


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
    //console.log("Clearing all charts");
    for (var i = 0; i < allCharts.length; i++) {
        if (allCharts[i] != null) {
            allCharts[i].dispose();
            allCharts[i] = null;
        }
    }
    allCharts = [];
}


/**
 * Assignes the option object to the echart instance
 * and updates the global list of all charts
 */
function SetOptionOnChart(_option, _chart) {
    if (_option && typeof _option === "object") {
        _chart.setOption(_option, true);
        allCharts.push(_chart);
    }
}

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
    return (Math.round(_value * 1000) / 10) + "%";
}

// function _SecondsToHoursAndMinutes(num) {
//     var hours = Math.floor(num / 3600);
//     var minutes = Math.trunc(Math.round((num % 60) * 100) / 100);
//     return (hours > 0 ? hours + "h " : "") + minutes + "m";
// }

function SecondsToHoursAndMinutes(d, showSeconds = false) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + (showSeconds ? sDisplay : "");
}

// const ChartTPHDisplay = {
//     TPH: '0',
//     CUMULATIVE: '1',
//     BOTH: '2'
// }





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


/**
 * Get the index to use to look at data based on which shift and whether its a full day view (24hr) 
 */
function ShiftIndex() { return fullDayView ? 2 : shift; }

/**
 * Find a DOM Element by ID and attempt
 * to init an echarts instance in it
 */
function InitChartFromElementID(_elementID) {
    var dom = document.getElementById(_elementID);
    if (dom == null || dom == undefined)
        return undefined;
    //var myChart = echarts.init(dom, ChartStyles.baseStyle);
    var myChart = echarts.init(dom, ChartStyles.baseStyle, { renderer: 'canvas' });
    return myChart;
}


// -----------------------------------------------------------------------
// -----------------------------------------------------------------------




// const TUMNames =
// {
//     UnplannedBreakdown: 'Unplanned Breakdown',
//     PlannedMaintenance: 'Planned Maintenance',
//     UnplannedStandby: 'Unplanned Standby',
//     OperatingStandby: 'Operating Standby',
//     SecondaryOperating: 'Secondary Operating',
//     PrimaryOperating: 'Primary Operating'
// }


class Charts {



    static CreateWaterfall(_elementID, _data, _calendarTime = -1) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        var xAxisLabels = [];
        var tumBars = [];
        var invisibleBars = [];
        //var timeBars = [];
        var blackBarNames = [];
        blackBarNames[0] = "Calendar Time";
        blackBarNames[2] = "Total Availability";
        blackBarNames[4] = "Total Utilisation";
        //console.log(blackBarNames);

        var calendarTime;
        if (_calendarTime > -1)
            calendarTime = _calendarTime;
        else calendarTime = ShiftIndex() == 2 ? secondsInDay : secondsInShift;

        var timeSpent = 0;
        var i = 0;

        for (var i = 0; i < ServerInfo.config.TUMIndex.length; i++) {
            var tumCategory = ServerInfo.config.TUMIndex[i];
            //console.log(key);
            if (i == 0 || i == 2 || i == 4) {
                xAxisLabels.push(blackBarNames[i]);
                tumBars.push(
                    {
                        name: blackBarNames[i],
                        value: calendarTime - timeSpent,
                        itemStyle: { color: ChartStyles.darkColor }
                    });
                invisibleBars.push(0);
            }

            var duration = _data[tumCategory].duration;
            timeSpent += duration;
            xAxisLabels.push(tumCategory);
            tumBars.push(
                {
                    name: tumCategory,
                    value: duration,
                    itemStyle: { color: ChartStyles.TUMColors[ServerInfo.config.TUMKeys[tumCategory]] }
                });
            invisibleBars.push(calendarTime - timeSpent);
        }


        function Label(params, index) {
            var string = "";
            string += ChartStyles.toolTipTextTitle(params[0].name);
            //string += ChartStyles.toolTipTextEntry(params[1].value + " seconds");
            string += ChartStyles.toolTipTextEntry(SecondsToHoursAndMinutes(parseFloat(params[1].value)));
            var pc = RatioToPercent(params[1].value / calendarTime);
            string += ChartStyles.toolTipTextEntry(pc + " of Calendar Time");
            return string;
        }


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            grid: ChartStyles.gridSpacing(),
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "Waterfall"),
            tooltip: {
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params, index) {
                    return Label(params);
                },
                showDelay: 0,
                transitionDuration: 0
            },
            xAxis: {
                type: 'category',
                data: xAxisLabels,
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
                axisLabel: {
                    show: false,
                    fontSize: ChartStyles.fontSizeSmall,
                    interval: 0
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: calendarTime,
                axisLabel: {
                    fontSize: ChartStyles.fontSizeSmall,
                    formatter: function (value, index) { return ""; }//{ return (value / 3600).toFixed() + "hrs"; }
                },
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey
            },
            series: [
                {
                    stack: 'TUM',
                    data: invisibleBars,
                    itemStyle: { color: 'rgba(0,0,0,0)' },
                    type: 'bar'
                },
                {
                    stack: 'TUM',
                    data: tumBars,
                    type: 'bar'
                }
            ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }






    static CreateMPH(_elementID, _data) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        var shiftData = _data.shiftData[ShiftIndex()];
        var shiftLength = timeLabelsShift[ShiftIndex()].length;
        //console.log(_data);
        //console.log(shiftLength);
        //console.log(shiftData);

        var seriesArray = [];
        var legend = [];
        var cumulative = ArrayOfNumbers(0, shiftLength, 0);

        var uniqueSites = [];

        for (var i = 0; i < shiftData.metricData.length; i++) {

            var m = shiftData.metricData[i];
            legend.push(m.site);

            // Collate the metrics into site, otherwise
            // there can be many tiny little bars for each metric
            // such as M30 M35... etc etc
            if (!(m.site in uniqueSites)) {
                uniqueSites[m.site] = {
                    type: 'bar',
                    barMaxWidth: ChartStyles.barMaxWidth,
                    id: m.site,
                    name: m.site,
                    data: m.mph,
                    metricIndices: [i],
                    label: { normal: { show: true, position: 'top', distance: 0 } },
                    itemStyle: { color: ChartStyles.siteColors[i % 2] },
                };
            }
            else {
                // We've already added a metric for this Site, so map the new values into it
                uniqueSites[m.site].data = m.mph.map((x, index) => { return x + uniqueSites[m.site].data[index] });
                uniqueSites[m.site].metricIndices.push(i);
            }

            // Add this metrics cumulative to the total cumulative
            cumulative = m.cph.map((x, index) => { return x + cumulative[index] });
        }

        // Turn the unique sites object
        // into series array to pass to the chart
        for (var key in uniqueSites) {
            // Skip loop if the property is from prototype
            if (!uniqueSites.hasOwnProperty(key)) continue;
            seriesArray.push(uniqueSites[key]);
        }

        // Now run over the data to add cleaner label values 
        // This cleans up decimal spaces and removes 0 values
        for (var i = 0; i < seriesArray.length; i++) {
            seriesArray[i].data = seriesArray[i].data.map((x) => { return (x > 0) ? x.toFixed(0) : null; });
        }

        //console.log(uniqueSites);

        // Add cumulative
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

        function Label(params, index) {
            var string = "";

            // The hour to show on the label 
            string += ChartStyles.toolTipTextTitle(params[0].name);

            // Labels for each metric
            for (var i = 0; i < params.length; i++) {
                if (uniqueSites[params[i].seriesId] !== undefined) {
                    for (var j = 0; j < uniqueSites[params[i].seriesId].metricIndices.length; j++) {
                        var metricIndex = uniqueSites[params[i].seriesId].metricIndices[j];
                        var metric = shiftData.metricData[metricIndex];
                        var value = metric.mph[params[0].dataIndex];
                        if (value > 0) {
                            string += ChartStyles.toolTipTextEntry("(" + metric.site + ") " + metric.name + " : " + metric.mph[params[0].dataIndex]);
                        }
                    }
                }
            }

            // The last params element is the cumulative 
            var index = params.length - 1;
            string += ChartStyles.toolTipTextEntry(params[index].seriesName + " : " + params[index].value.toFixed(), "bold");
            return string;
        }



        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            legend: { y: 'top', data: legend },
            grid: ChartStyles.gridSpacing(),
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "MetricPerHour"),
            tooltip: {
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params, index) {
                    return Label(params);
                },
                showDelay: 0,
                transitionDuration: 0
            },
            xAxis: ChartStyles.xAxis(timeLabelsShift[ShiftIndex()]),
            yAxis: [{
                type: 'value',
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
                axisLabel: { fontSize: ChartStyles.fontSizeSmall }
            },
            {
                type: 'value',
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
                axisLabel: { fontSize: ChartStyles.fontSizeSmall }
            }],
            series: seriesArray
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }








    /*
        static CreateMPH2(_elementID, _data) {
    
            // Create an eCharts instance 
            var myChart = InitChartFromElementID(_elementID);
            if (myChart == undefined) return;
    
    
    
    
            // Grab all the metrics recorded for this equipment 
            // Only interested if there was any metrics recorded this shift
            var metrics = [];
            var hourCount = timeLabelsShift[ShiftIndex()].length;
            var equipMetricsToAdd = _data.shiftData[ShiftIndex()].metricData;
    
            //console.log(equipMetricsToAdd);        
    
            // Finalise with Metrics that have > 0 cumulative
            for (var i = 0; i < equipMetricsToAdd.length; i++) {
                var metric = equipMetricsToAdd[i];
    
                if (fullDayView) {
                    if (metric.cph[metric.shift == 0 ? 11 : 23] > 0)
                        metrics.push(metric);
                }
                else {
                    if (metric.cph[11] > 0)
                        metrics.push(metric);
                }
            }
    
            var cumulative = ArrayOfNumbers(0, hourCount, 0);
    
            // Add all the series together
            // along with legend info 
            var seriesArray = [];
            var legend = [];
            var perSiteTotals = [];
            var perHourTotals = ArrayOfNumbers(0, hourCount, 0);
    
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
                // See if a site exists and create clean empty arrays for it
                if (!(metrics[i].site in perSiteTotals)) {
                    perSiteTotals[metrics[i].site] = ArrayOfNumbers(0, hourCount, 0);
                }
    
                // Accumulate values into each site
                for (var j = 0; j < hourCount; j++) {
                    perSiteTotals[metrics[i].site][j] = perSiteTotals[metrics[i].site][j] + metrics[i].mph[j];
                    perHourTotals[j] += metrics[i].mph[j];
                }
    
                // Total culmulative starting at 1
                for (var j = 1; j < hourCount; j++) {
                    cumulative[j] = cumulative[j - 1] + perHourTotals[j];
                }
            }
    
    
            seriesArray.push(
                {
                    name: "Invisible",
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
                        barMaxWidth: ChartStyles.barMaxWidth,
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
                legend: { y: 'top', data: legend },
                grid: ChartStyles.gridSpacing(),
                toolbox: ChartStyles.toolBox(myChart.getHeight(), "TPH"),
                tooltip: {
                    confine: true,
                    trigger: 'axis',
                    textStyle: ChartStyles.toolTipTextStyle(),
                    axisPointer: ChartStyles.toolTipShadow(),
                    backgroundColor: ChartStyles.toolTipBackgroundColor(),
                    formatter: function (params, index) {
                        return Label(params);
                    },
                    showDelay: 0,
                    transitionDuration: 0
                },
                //xAxis: ChartStyles.xAxis(fullDayView ? timeLabels24hr : timeLabelsShift[shift]),
                xAxis: ChartStyles.xAxis(timeLabelsShift[ShiftIndex()]),
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
    */





    /*
        static CreateTimeLine(_elementID, _data) {
            var dom = document.getElementById(_elementID);
            if (dom == null || dom == undefined)
                return;
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
                    itemStyle: { color: ChartStyles.TUMColorsByCategory[event.tumCategory] }
                    //itemStyle: {
                    //  normal: {
                    //    color: ChartStyles.statusColors[colorIndex[groupIndex]] //colors[groupIndex] //typeItem.color
                    //}
                    //}
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
                                    opacity: 0.66
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
    */


    //---------------------------------------------------------------------------------------------




    static CreateUofA(_elementID, _data) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        var _d = _data.shiftData[ShiftIndex()].uofa;

        var availability = [];
        var utilisation = [];
        var uofa = [];

        // Why is this logic here and not controller or PHP?
        for (var i = 0; i < _d.length; i++) {
            availability[i] = _d[i].availability / _d[i].totalTime;
            utilisation[i] = (_d[i].utilisation / _d[i].totalTime);// * 0.99;
            uofa[i] = _d[i].uofa;// * 0.98;
        }


        var labels = ['Availability', 'Utilisation', 'U of A'];

        var option = {

            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            //title: ChartStyles.createTitle('Actual Availability, Utilisation & U of A'),// vs Target'),
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "UofA"),
            legend: {
                y: 'top',
                data: labels
            },
            grid: ChartStyles.gridSpacing(),
            tooltip: {
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params) {
                    var string = ChartStyles.toolTipTextTitle(params[0].name);
                    if (params[0] !== undefined) string += ChartStyles.toolTipTextEntry(params[0].seriesName + ": " + RatioToPercent(params[0].value));
                    if (params[1] !== undefined) string += ChartStyles.toolTipTextEntry(params[1].seriesName + ": " + RatioToPercent(params[1].value));
                    if (params[2] !== undefined) string += ChartStyles.toolTipTextEntry(params[2].seriesName + ": " + RatioToPercent(params[2].value));
                    return string;
                },
                showDelay: 0,
                transitionDuration: 0
            },
            xAxis: ChartStyles.xAxis(timeLabelsShift[ShiftIndex()]),
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
                    name: labels[0],
                    data: availability,
                    itemStyle: ChartStyles.statusItemStyle(0),
                    type: 'line',
                    symbol: 'none',
                    lineStyle: ChartStyles.lineShadow(),
                    z: 2

                },
                {
                    name: labels[1],
                    data: utilisation,
                    itemStyle: ChartStyles.statusItemStyle(1),
                    type: 'line',
                    symbol: 'none',
                    lineStyle: ChartStyles.lineShadow(),
                    z: 1
                },
                {
                    name: labels[2],
                    data: uofa,
                    type: 'line',
                    symbol: 'none',
                    lineStyle: ChartStyles.lineShadow(),
                    itemStyle: { color: ChartStyles.uofaColor },
                    z: 0//,
                    //lineStyle: { type: 'dotted' }
                }
            ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }



    //---------------------------------------------------------------------------------------------




    static CreateUofAPie(_elementID, _data) {

        var dom = document.getElementById(_elementID);
        if (dom == null || dom == undefined)
            return;
        var myChart = echarts.init(dom, ChartStyles.baseStyle);

        var _d = _data.shiftData[shift];


        var labels = ['Availability', 'Utilisation', 'U of A'];
        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
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
                data: labels
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
                            name: labels[0],
                            itemStyle: ChartStyles.statusItemStyle(0)
                        },
                        {
                            value: SecondsToMinutes(_d.timeExIdle),
                            name: labels[1],
                            itemStyle: ChartStyles.statusItemStyle(1)
                        },
                        {
                            value: SecondsToMinutes(_d.timeExDown),
                            name: labels[2],
                            itemStyle: ChartStyles.statusItemStyle(2)
                        }
                    ]
                }
            ]

        };

        SetOptionOnChart(option, myChart);
    }


    //---------------------------------------------------------------------------------------------




    static CreatePareto(_elementID, _data, _limit = 10) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;




        var barData = new Array();
        var axisNames = new Array();

        //console.log(_data);

        if (_data.duration > 0) {
            for (var key in _data.categories) {
                //console.log(key);

                var niceName = key.replace("-", "").replace(/ /g, "\n");

                var tumName = ServerInfo.config.TUM[key];
                var tumIndex = ServerInfo.config.TUMKeys[tumName];

                //axisNames.push(niceName);
                barData.push(
                    {
                        name: niceName,
                        value: _data.categories[key] / 3600,
                        //itemStyle: { color: ChartStyles.TUMColorsByCategory[ServerInfo.config.configTUM[key]] }
                        itemStyle: { color: ChartStyles.TUMColors[tumIndex] }
                    }
                );
            }
        } else {
            axisNames.push("No Events");
            barData.push(
                {
                    name: "No Events",
                    value: 0
                }
            );
        }

        // Sort it
        barData.sort((a, b) => b.value - a.value);



        // Sub text under the chart title
        // This will show the real totals even if limited
        var durationAsHours = (_data.duration / 3600).toFixed(2);
        if (durationAsHours > 999) durationAsHours = (durationAsHours / 1000).toFixed(2) + "k";
        var subText =
            _data.duration > 0 ?
                (SecondsToHoursAndMinutes(_data.duration)// durationAsHours
                    + 'across '
                    + barData.length
                    + (barData.length > 1 ? ' categories' : ' category')
                    + (_data.eventCount != undefined ? " & " + _data.eventCount + (_data.eventCount > 1 ? " events" : " event") : ""))
                :
                "No Events";


        // Limit the pareto 
        // This is good for long-term stuff
        if (barData.length > _limit) {
            barData = barData.slice(0, _limit);
            //axisNames = axisNames.slice(0, _limit);
        }

        // Now with the potentially shortened data
        // Build Pareto line and add Axis names
        var paretoLine = [];
        for (var i = 0; i < barData.length; i++) {
            if (i != 0)
                paretoLine[i] = (paretoLine[i - 1] + barData[i].value);
            else
                paretoLine[i] = (barData[i].value);

            axisNames.push(barData[i].name);
        }

        //console.log(paretoLine);


        var barWidth = barData.length > 1 ? (barData.length > 3 ? '40%' : '20%') : '10%';




        var option = {
            //animation: false,
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            title: ChartStyles.createTitle(subText),
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "EventBreakdown"),
            grid: ChartStyles.gridSpacing(),
            tooltip: {
                trigger: 'axis',
                //textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params, index) {
                    return ChartStyles.toolTipTextTitle(params[0].name) + ChartStyles.toolTipTextEntry(SecondsToHoursAndMinutes(params[0].value * 3600));
                },
                barMaxWidth: barWidth
            },
            xAxis: [
                ChartStyles.xAxis(axisNames, 0)
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
                        formatter: function (value, index) { return ChartStyles.axisFormatThousands(value); }
                    },
                    //interval: 1,
                    axisLine: ChartStyles.axisLineGrey
                },
                {
                    id: 1,
                    max: durationAsHours,
                    // max: 0.1,
                    splitLine: { show: false },
                    axisLabel: {
                        fontSize: ChartStyles.fontSizeSmall,
                        formatter: function (value, index) { return ((value / durationAsHours) * 101).toFixed() + "%"; }
                    },
                    axisLine: ChartStyles.axisLineGrey
                }
            ],
            series: [
                {
                    type: 'bar',
                    //data: eventBars,
                    data: barData,
                    barMaxWidth: barWidth,
                    yAxisIndex: 0
                },
                {
                    type: 'line',
                    data: barData.length > 1 ? paretoLine : null,
                    lineStyle: { color: 'red', width: 1.5 },
                    symbol: 'none', // Turn off dots
                    yAxisIndex: 1,
                    smooth: true
                }
            ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }




    static CreateTimeLineFlat(_elementID, _data, _includeTimeLine = false) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;






        // Get the shift data into a smaller variable name
        var _d = _data.shiftData[ShiftIndex()];

        var series = [];
        //var data = [];
        var totalDuration = 0;



        // As shift data only has index pointers to events
        // we create an array of the real events here 
        var sortedEvents = [];
        for (var i = 0; i < _d.events.length; i++) {
            sortedEvents.push(_data.events[_d.events[i]]);
        }

        // And then sort them...  
        sortedEvents = sortedEvents.sort(function (a, b) {
            var c = new Date(a.eventTime.date);
            var d = new Date(b.eventTime.date);
            return c - d;
        });


        var markerData = [];




        for (var i = 0; i < sortedEvents.length; i++) {
            var event = sortedEvents[i];
            totalDuration += event.duration;
            series.push(
                {
                    type: 'bar',
                    data: [event.duration],
                    stack: 'stack',
                    itemStyle: {
                        color: ChartStyles.TUMColors[ServerInfo.config.TUMKeys[event.tumCategory]],
                        opacity: 0.85
                    },
                    z: -1,
                    zlevel: -1
                }
            );

            markerData.push(
                {
                    name: '',
                    value: '',//d.percentOfTargetToDate,
                    xAxis: totalDuration,
                    yAxis: i,
                    itemStyle: { color: 'white' }
                }
            );
        }


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            tooltip: {

                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),

                // Display info about the events 
                formatter: function (params) {
                    var event = sortedEvents[params.componentIndex];
                    var text = "";
                    var startTime = moment(event.eventTime.date).format('h:mm:ss a');//new Date(event.eventTime.date);
                    text += ChartStyles.toolTipTextTitle(startTime);
                    text += ChartStyles.toolTipTextEntry(SecondsToHoursAndMinutes(event.duration));
                    text += ChartStyles.toolTipTextEntry(event.tumCategory);
                    text += ChartStyles.toolTipTextEntry(event.status);
                    return text;
                },

                // Fast show/hide as there's a LOT of them 
                hideDelay: 0,
                showDelay: 0,
                transitionDuration: 0,
                confine: true
            },
            grid: {
                top: _includeTimeLine ? '2%' : '0%',
                bottom: _includeTimeLine ? '2%' : '0%',
                left: _includeTimeLine ? '1%' : '1%',
                right: _includeTimeLine ? '2%' : '1%'
            },
            xAxis: [
                {
                    show: false,
                    type: 'value',
                    max: totalDuration,
                },
                {
                    show: _includeTimeLine,
                    min: 0,
                    max: timeLabelsShiftExtra[ShiftIndex()].length - 1,
                    position: 'bottom',
                    //offset: -5,
                    data: timeLabelsShiftExtra[ShiftIndex()],
                    boundaryGap: false,
                    minInterval: 0,
                    maxInterval: 0,
                    axisLabel: {
                        padding: [-15, 0, -20, 0],
                        inside: true,
                        rotate: 35,
                        formatter: '{value}',
                        fontFamily: 'Poppins',
                        fontWeight: '400',
                        fontSize: 11,
                        textBorderColor: 'black',
                        textBorderWidth: 1,
                        textShadowColor: 'rgba(0,0,0,0.5)',
                        textShadowBlur: 10,
                        textShadowOffsetX: 4,
                        textShadowOffsetY: 4,
                    },
                    axisTick: { inside: true }
                }
            ],
            yAxis: {
                xAxisIndex: 0,
                type: 'category',
            },
            series: series
            //series: [{ data: data, type: 'bar' }]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }





    /**
    * This is just the hour axis labels to use with the other Timeline charts    
    */
    static CreateTimeLineFlatTime(_elementID) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;



        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            grid: {
                top: '0%',
                bottom: '0%',
                left: '1%',
                right: '5%'
            },
            xAxis:
            {
                show: true,
                min: 0,
                max: timeLabelsShiftExtra[ShiftIndex()].length - 1,
                position: 'bottom',
                data: timeLabelsShiftExtra[ShiftIndex()],
                boundaryGap: false,
                minInterval: 0,
                maxInterval: 0,
                axisLabel: {
                    padding: [-15, 0, -20, 0],
                    inside: true,
                    rotate: 45,
                    formatter: '{value}',
                    fontFamily: 'Poppins',
                    fontWeight: 'lighter',
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


    /**
     * @param {any} _elementID  
     * @param {SimpleGaugeData} _data 
     */
    static CreateGauge(_elementID, _data) {
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        //var data = new MonthlyChartDataForLocation(_data);

        var value = _data.value * 100;

        //console.log(_data);
        var strPct = (x) => x.toString().concat("%");
        var center = ['50%', '80%'];
        var maxRadius = 120;
        var radiusThickness = 30;
        var radiusPadding = 4;


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            toolbox: ChartStyles.toolBox(myChart.getHeight(), _elementID + "_MonthlyCompliance"),


            title: {
                text: strPct(value.toFixed()),
                //subtext: "foo",
                left: 'center',
                bottom: '13%',
                textStyle: {
                    fontWeight: 60,
                    fontSize: _data.fontSize,
                }
            },
            grid: {
                top: '0%',
                bottom: '0%',
                left: '0%',
                right: '0%'
            },
            // tooltip: {
            //     trigger: 'item',
            //     formatter: function (params, index) {
            //         var string = ChartStyles.toolTipTextTitle(params.name);
            //         string += ChartStyles.toolTipTextEntry((Math.round(params.percent * 2 * 10) / 10) + "%");
            //         return string;
            //     },
            //     textStyle: ChartStyles.toolTipTextStyle(),
            //     axisPointer: ChartStyles.toolTipShadow(),
            //     backgroundColor: ChartStyles.toolTipBackgroundColor()
            // },
            series: [
                {
                    name: 'Monthly Compliance',
                    type: 'pie',
                    center: center,
                    radius: [strPct(maxRadius - radiusThickness), strPct(maxRadius)],
                    avoidLabelOverlap: true,
                    startAngle: 180,
                    animationDuration: 5000,
                    z: 0,
                    // label: {
                    //     formatter: '{d}%' ,
                    //     fontSize: ChartStyles.fontSizeAxis
                    // },
                    label: { show: false },
                    data: [
                        {
                            value: value,
                            name: 'Progress',
                            itemStyle: { color: _data.color }
                        },
                        {
                            value: (100 - value),
                            name: 'Under',
                            itemStyle: { color: 'rgba(0,0,0,0)' },
                        },
                        {
                            value: 100,
                            name: 'Invisible',
                            itemStyle: { color: 'rgba(0,0,0,0)' },
                            z: 10
                        }
                    ]
                },
                {
                    name: 'Target Bucket',
                    type: 'pie',
                    center: center,
                    hoverAnimation: false,
                    animationDuration: 0,
                    radius: [strPct(maxRadius - radiusThickness - radiusPadding), strPct(maxRadius + radiusPadding)],
                    startAngle: 180,
                    z: 0,
                    toolTip: { show: false, trigger: 'none', showContent: false },
                    label: { show: false },
                    data: [
                        {
                            value: 100,
                            itemStyle: {
                                borderRadius: 30,
                                borderColor: '#02b3ff',
                                borderWidth: 1.5,
                                color: 'rgba(0,0,0,0.125)'
                            }
                        },
                        {
                            value: 100,
                            name: 'Invisible',
                            itemStyle: { color: 'rgba(0,0,0,0)' }
                        }
                    ]
                }
            ]

        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }



    /*
    static CreateTimeLineFlat_OLD(_elementID, _data, _includeTimeLine = false) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        // Get the shift data into a smaller variable name
        var _d = _data.shiftData[ShiftIndex()];




        var data = [];
        for (var i = 0; i < _d.events.length; i++) {

            var event = _data.events[_d.events[i]];

            // Convert date to seconds considering 0 as 6am 
            // and accounting for dates that go into the next day 
            var startTime = new Date(event.eventTime.date);
            var trueTime = startTime.toLocaleTimeString('it-IT');
            startTime = (startTime.getHours() * 60 * 60) + (startTime.getMinutes() * 60) + startTime.getSeconds();
            startTime += 3600 * 24 * event.dayAhead;

            // Are we startign at 0600 or 1800 for this chart?
            // This depends if its day || fullday
            //console.log(event.shift);
            //var eventShift = event.shift === "P1" ? 0 : 1;
            var eventShift = event.shift; //=== "P1" ? 0 : 1;
            if (ShiftIndex() == 2)
                eventShift = 0;

            // Now use that to pull back the time 
            var shiftStart = 6;// ServerInfo.config.ShiftStart;
            startTime -= 3600 * (eventShift == 0 ? 6 : 18);

            //console.log(startTime);

            var duration = event.duration;
            data.push({
                name: event.status,
                value: [
                    // These relate to the encode in the custom render                    
                    startTime,
                    (startTime + duration),
                    duration,
                    trueTime,
                    event.tumCategory
                ],

                // Style the item based on TUM Category
                //itemStyle: { color: ChartStyles.TUMColorsByCategory[event.tumCategory] }
                //itemStyle: { color: ChartStyles.TUMColors[ServerInfo.config.TUMKeys[event.tumCategory]] }
            });
        }

        // ----------------------------------------
        // Custom render for timeline
        // Bar - the main long bar 
        // Box - the little highlight at the start
        //var customTypes = ["Bar", "Box"];

        function renderItem(params, data, customType) {

            var startTime = data.value(0);
            var start = data.coord([data.value(0), startTime]);
            var end = data.coord([data.value(1), startTime]);
            var height = 20;//api.size([0, 1])[1] * 1;

            // This is the canvas rect to clip against            
            var clipRect = {
                x: params.coordSys.x,
                y: 0,
                width: params.coordSys.width,
                height: params.coordSys.height// * 2
            };

            var rectShape = echarts.graphic.clipRectByRect(
                {
                    x: start[0],
                    y: _includeTimeLine ? 30 : 0,
                    width: (customType == 1 ? height / 8 : end[0] - start[0]),
                    height: _includeTimeLine ? 30 : 1000
                }
                ,
                clipRect
            );
            //}

            return rectShape && {
                type: 'rect',
                shape: rectShape,
                style: data.style()
            };
        }
        // ----------------------------------------


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            tooltip: {
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),

                // Display info about the events 
                formatter: function (params) {
                    ChartStyles.toolTipTextEntry
                    var duration = Math.round(params.value[2] / 60);
                    var text = "";
                    text += ChartStyles.toolTipTextTitle(params.value[3]);
                    text += ChartStyles.toolTipTextEntry(duration + " min");
                    text += ChartStyles.toolTipTextEntry(params.name);// + " for " + duration + " min");
                    text += ChartStyles.toolTipTextEntry(params.value[4]);
                    return text;
                },

                // Fast show/hide as there's a LOT of them 
                hideDelay: 0,
                showDelay: 0,
                transitionDuration: 0,
                confine: true
            },
            grid: {
                top: _includeTimeLine ? '1%' : '0%',
                bottom: _includeTimeLine ? '2%' : '0%',
                left: _includeTimeLine ? '2%' : '1%',
                right: _includeTimeLine ? '2%' : '1%'
            },
            xAxis: [
                {
                    show: _includeTimeLine,
                    min: 0,
                    max: timeLabelsShiftExtra[ShiftIndex()].length - 1,
                    position: 'bottom',
                    data: timeLabelsShiftExtra[ShiftIndex()],
                    boundaryGap: false,
                    minInterval: 0,
                    maxInterval: 0,
                    axisLabel: {
                        inside: true,
                        rotate: 45,
                        formatter: '{value}',
                        fontFamily: 'Poppins',
                        fontWeight: 'lighter',
                        fontSize: ChartStyles.fontSizeSmall,
                        margin: 50
                    },
                    z: 50,
                    axisTick: {
                        inside: true, length: 30, lineStyle: {
                            color: 'white',
                            opacity: 0.2
                        }
                    },
                    axisLine: ChartStyles.axisLineGrey
                },
                {
                    //type: 'category',
                    show: false,
                    boundaryGap: false,
                    interval: 3600,
                    min: 0,
                    max: timeLabelsShift[ShiftIndex()].length * 3600
                }
            ],
            yAxis: { show: false },
            series:
                [
                    {
                        // Event Bars
                        type: 'custom',
                        renderItem: function (params, api) { return renderItem(params, api, 0); },
                        itemStyle: { normal: { opacity: 0.5 } },
                        encode: { x: [1, 2], y: 0 },
                        data: data,
                        z: 10,
                        xAxisIndex: 1
                    },
                    {
                        // Event Tiny Box at Start
                        type: 'custom',
                        renderItem: function (params, api) { return renderItem(params, api, 1); },
                        itemStyle: { normal: { opacity: 1.0 } },
                        encode: { x: [1, 2], y: 0 },
                        data: data,
                        xAxisIndex: 1
                    }
                ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }
    */


}