
class ChartsMonthly {

    /**
     * Create a waterfall chart based on TUM values
     **/
    static CreateLongTermWaterfall(_elementID, _data) {

        var myChart = echarts.init(document.getElementById(_elementID), ChartStyles.baseStyle);

        // Create the arrays for the data
        var labels = [];
        var valueStack = [];
        var valueSpace = [];

        var timeSpent = 0;

        // For the marker
        var biggestTimeIndex = -1;
        var biggestValue = 0;
        var biggestStyle = undefined;

        for (var i = 0; i < _data.length; i++) {

            _data[i].value = Math.round(_data[i].value / 3600);

            var name = _data[i].name;
            labels[i] = _data[i].name;

            valueStack[i] = {
                value: _data[i].value,
                itemStyle: { color: _data[i].id == undefined ? ChartStyles.darkColor : ChartStyles.TUMColors[_data[i].id] }
            };

            // Because Dave version has full
            // columns for these indices
            if (i == 0 || i == 3 || i == 6) {
                valueSpace[i] = 0;
            } else {
                timeSpent += _data[i].value;
                valueSpace[i] = (_data[0].value) - timeSpent;

                // Find which TUM is the biggest
                if (_data[i].value > biggestValue) {
                    biggestValue = _data[i].value;
                    biggestTimeIndex = i;
                    biggestStyle = { color: ChartStyles.TUMColors[_data[i].id] };
                }
            }
        }

        // Need to add back the empty space
        biggestValue += valueSpace[biggestTimeIndex];


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            tooltip: {
                show: false,
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params) {
                    var tar = params[1];
                    return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
                }
            },
            grid: ChartStyles.gridSpacing(),
            xAxis: ChartStyles.xAxis(labels, 0),
            yAxis: {
                type: 'value',
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
                min: 0
            },
            series: [
                {
                    type: 'bar',
                    stack: 'a',
                    // This is to make it invisible
                    itemStyle: {
                        normal: {
                            barBorderColor: 'rgba(0,0,0,0)',
                            color: 'rgba(0,0,0,0)'
                        },
                        emphasis: {
                            barBorderColor: 'rgba(0,0,0,0)',
                            color: 'rgba(0,0,0,0)'
                        }
                    },
                    data: valueSpace
                },
                {
                    type: 'bar',
                    stack: 'a',
                    label: {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    data: valueStack,
                    markPoint: {
                        data: [{ coord: [biggestTimeIndex, biggestValue] }],
                        symbolSize: 30,
                        symbolOffset: [0, -20],
                        itemStyle: biggestStyle
                    }
                }
            ],
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }






    static CreateLongTerm(_elementID, _data, _colorIndex, _startDate) {
        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;


        var smoothVal = 0;
        //var ma30 = CalculateMA(7, _data);
        //var ma60 = CalculateMA(60, _data);

        // Nicely formatted dates for the tooltip
        var niceDates = GenerateDateLabels(_startDate, _data.length, true);

        var _series = [
            {
                name: "Data",
                data: _data,
                type: 'line',
                symbol: 'none',
                itemStyle: { color: ChartStyles.TUMColors[_colorIndex] },
                //areaStyle: ChartStyles.lineAreaFromStyle(ChartStyles.TUMColors[_colorIndex]), //{ color: ChartStyles.cumulativeArea },
                areaStyle: { color: ChartStyles.cumulativeArea },
                lineStyle: { width: 1.5 },
                large: true,
                smooth: smoothVal
            }
        ];

        //console.log(_zoom == true);
        var _dataZoom = null;
        if (true) {
            var _dataZoom = [{ type: 'inside' }];
        }


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,

            //title: ChartStyles.createTitle(_name),
            // toolbox: {
            //     left: 'center',
            //     feature: {
            //         restore: { title: 'restore' }
            //     }
            // },           
            grid: ChartStyles.gridSpacing(),
            tooltip: {
                trigger: 'axis',
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params) {
                    var index = params[0].dataIndex;
                    return ChartStyles.toolTipTextTitle(RatioToPercent(params[0].value)) + ChartStyles.toolTipTextEntry(niceDates[index]);
                    //return ChartStyles.toolTipTextTitle(niceDates[index]) + ChartStyles.toolTipTextEntry(RatioToPercent(params[0].value));
                },
                hideDelay: 0,
                showDelay: 0,
                transitionDuration: 0,
                confine: true
            },
            dataZoom: _dataZoom,
            xAxis: ChartStyles.xAxis(GenerateDateLabels(_startDate, _data.length)),

            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: function (value, index) { return (value * 100 + "%"); }
                },
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey
            },
            series: _series

        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }




    static CreateLongTermZoomTime(_elementID, _data, _startDate) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        var dateLabels = GenerateDateLabels(_startDate, _data.length);

        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            grid: {
                top: '0%',
                bottom: '0%',
                left: '3%',
                right: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dateLabels,
                axisLabel: {
                    inside: true,
                    //rotate: 45,
                    formatter: '{value}',
                    fontFamily: 'Poppins',
                    fontWeight: 'lighter',
                    fontSize: ChartStyles.fontSizeSmall,
                    margin: 10
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
            yAxis: {
                show: false,
                type: 'value',
                boundaryGap: [0, '100%']
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 50
                },
                {
                    start: 0,
                    end: 50,
                    type: 'slider',
                    //backgroundColor: 'red',

                    fillerColor: ChartStyles.cumulativeArea,

                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    handleStyle: {
                        color: 'white',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 1)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }
            ],
            series: [
                {
                    type: 'line',
                    data: dateLabels//data
                }
            ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;

    }





    static CreateMonthlyComplianceBars(_elementID, _data) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        // 1 - location
        // 3 - plan
        // 4 - actuals

        var planSegments = _data[0].sites[_data[1]].planSegments;

        //console.log(planSegments);


        var markerData = [];
        var newData = [[], [], [], [], []];

        var tmpIndex = 0;
        for (const [key, value] of Object.entries(planSegments)) {

            var target = parseInt(value[0]);
            var actual = parseInt(value[1]);

            // Add location
            newData[0].push(key);

            // Current actual related to the target           
            newData[1].push(Math.min(actual, target));

            // Overmined
            newData[2].push(Math.max(0, actual - target));

            // The target value 
            newData[3].push(target);

            // Label, this is a 'dummy' bar to position the label 
            // by stacking nothing (0) on top of the other values
            newData[4].push({
                value: Math.max(0, target - actual),
                label: { formatter: String(actual) },
                itemStyle: { color: 'rgba(0, 0, 0, 0)' }
            });

            markerData.push(
                {
                    name: '',
                    value: '',//d.percentOfTargetToDate,
                    xAxis: tmpIndex,
                    yAxis: target * _data[0].timePassedInMonth,
                    itemStyle: { color: 'white' }
                }
            );
            tmpIndex++;
        }



        var borderRadius = '0';
        var barWidth = 18;

        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            title: ChartStyles.createTitle(""),
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "MonthlyCompliance"),
            legend: {

                textStyle: {
                    color: "#fff"
                },
                orient: 'horizontal',
                x: 'center',
                y: 'top',
                selectedMode: false,
                data: ['Tonnes', 'Unplanned', 'Target']
            },
            tooltip: {
                trigger: 'axis',
                confine: true,
                formatter: function (params, index) {
                    var target = params[3].value;
                    var mined = params[0].value + params[1].value;
                    var over = params[1].value;

                    var label = "";

                    label += ChartStyles.toolTipTextTitle(params[0].name)
                        + ChartStyles.toolTipTextEntry("Target : " + target)
                        + ChartStyles.toolTipTextEntry("Mined  : " + mined + (target > 0 ? " (" + RatioToPercent(mined / target) + ")" : ""));


                    if (over > 0 && target > 0)
                        label += ChartStyles.toolTipTextEntry("Unplanned: " + params[1].value + " (" + RatioToPercent(params[1].value / target) + ")", 'cup-redwarn');
                    return label;
                },
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor()
            },

            grid: {
                top: '0%',
                bottom: '0%',
                left: '4%',
                right: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: newData[0],
                    axisLabel: {
                        show: true,
                        interval: 0,
                        rotate: 90,
                        fontSize: 14//ChartStyles.fontSizeAxis
                    },
                    axisLine: { show: false, lineStyle: { color: '#71a3c5' } },
                    axisTick: {
                        alignWithLabel: true,
                        length: 5
                    }
                },
                { type: 'category', show: false, data: newData[0] }
            ],
            yAxis: {
                type: 'value',
                name: 'Tonnes',
                nameLocation: 'center',
                nameTextStyle: {
                    fontSize: ChartStyles.fontSizeLarge
                },
                nameGap: 60,
                axisLabel: { fontSize: 14 },// ChartStyles.fontSizeAxis },
                splitLine: {
                    show: true,
                    lineStyle: { color: 'rgba(126, 134, 136, 0.33)', width: 1 }
                }
            },
            series: [
                {
                    data: newData[1],
                    type: 'bar',
                    stack: 'stack',
                    name: 'Tonnes',
                    itemStyle: { color: ChartStyles.siteColors[0], barBorderRadius: borderRadius },
                    // barGap: '-100%',
                    // barWidth: 10,
                    animationEasing: 'linear',
                    animationDuration: 200,
                    animationDelay: 0
                },
                {
                    data: newData[2],
                    type: 'bar',
                    stack: 'stack',
                    name: 'Unplanned',
                    itemStyle: { color: ChartStyles.statusColors[2], barBorderRadius: borderRadius },
                    // barGap: '50%',
                    barWidth: barWidth,

                    animationEasing: 'linear',
                    animationDuration: 200,
                    animationDelay: 200,
                    z: 5
                }
                ,
                {
                    data: newData[4],
                    stack: 'stack',
                    type: 'bar',
                    label: { show: true, position: 'top' },
                    markPoint: {
                        symbol: 'rect',
                        symbolSize: [barWidth * 1.75, 1.5],
                        data: markerData
                    },
                    z: 3
                },
                {
                    data: newData[3],
                    xAxisIndex: 1,
                    type: 'bar',
                    //barGap: '-50%',
                    barWidth: (barWidth * 1.75),
                    itemStyle: {
                        color: 'rgba(0,0,0,0.125)',
                        barBorderColor: '#02b3ff',
                        barBorderWidth: 1,
                        barBorderRadius: 2
                    },
                    z: 0
                }
            ]
        };

        SetOptionOnChart(option, myChart);
    }


    /**
     * @param {string} _elementID
     * @param {Array} _data 
     */
    static CreateMonthlyComplianceGauge(_elementID, _data) {
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        if (_data[1][0] == 0) {
            console.log("No plan target for " + _elementID);
            return;
        }
        //var data = new MonthlyChartDataForLocation(_data);

        console.log(_data);

        var daysInMonth = _data[0].daysInMonth;
        var month = _data[0].month - 1;
        var timePassedInMonth = _data[0].timePassedInMonth;


        var target = _data[1][0];
        var actual = Math.min(target, _data[1][1]);

        var toMonthTarget = target * timePassedInMonth;
        var gaugeActual = Math.min(actual, toMonthTarget);

        //var actualPadding = target - gaugeActual;// Math.min(0, target - actual);

        var actualUnder = Math.max(0, toMonthTarget - actual);
        var actualOver = Math.max(0, actual - toMonthTarget);
        var actualPadding = target - toMonthTarget - actualOver; //(actualOver + actualUnder + toMonthTarget);

        //console.log(_elementID + " | " + actualOver + "   " + actualUnder);
        if (_elementID == "4540 D15") {
            //console.log(_elementID + " | " + gaugeActual + " " + actualOver + " " + actualUnder);
            console.log(" | " + _elementID + " | ");
            console.log("GAct | " + gaugeActual);
            console.log("ToMn | " + toMonthTarget);
            console.log("Act | " + actual);
            console.log("Tgt | " + target);
            console.log("Und | " + actualUnder);
            console.log("Ovr | " + actualOver);
            console.log("Pad | " + actualPadding);
        }



        //console.log(_data);
        var strPct = (x) => x.toString().concat("%");
        var center = ['50%', '75%'];
        var maxRadius = 120;
        var radiusThickness = 20;
        var radiusPadding = 4;


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            toolbox: ChartStyles.toolBox(myChart.getHeight(), _elementID + "_MonthlyCompliance"),

            tooltip: {
                trigger: 'item',
                formatter: function (params, index) {
                    var string = ChartStyles.toolTipTextTitle(params.name);
                    string += ChartStyles.toolTipTextEntry((Math.round(params.percent * 2 * 10) / 10) + "%");
                    return string;
                },
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor()
            },
            series: [
                {
                    name: 'Monthly Compliance',
                    type: 'pie',
                    center: center,
                    radius: [strPct(maxRadius - radiusThickness), strPct(maxRadius)],
                    avoidLabelOverlap: true,
                    startAngle: 180,
                    z: 0,
                    label: {
                        formatter: '{d}%',
                        fontSize: ChartStyles.fontSizeAxis
                    },
                    data: [
                        {
                            value: gaugeActual,
                            name: 'actual',
                            itemStyle: { color: ChartStyles.siteColors[0] }
                        },
                        {
                            value: actualUnder,
                            name: 'Under',
                            itemStyle: { color: ChartStyles.TUMColors[0] }
                        },
                        {
                            value: actualOver,
                            name: 'Over',
                            itemStyle: { color: ChartStyles.TUMColors[5] }
                        },
                        {
                            value: actualPadding,
                            name: 'Target',
                            itemStyle: { color: 'rgba(0,0,0,0)' }
                        }
                        ,
                        {
                            value: target,
                            name: 'Invisible',
                            itemStyle: { color: 'rgba(0,0,0,0)' }
                        }
                    ]
                },
                {
                    name: 'Target Bucket',
                    type: 'pie',
                    center: center,
                    radius: [strPct(maxRadius - radiusThickness - radiusPadding), strPct(maxRadius + radiusPadding)],
                    startAngle: 180,
                    z: 0,
                    toolTip: { show: false, trigger: 'none', showContent: false },
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
                },
                {
                    type: 'gauge',
                    radius: strPct(maxRadius),
                    center: center,
                    startAngle: 180,
                    endAngle: 0,
                    axisLine: {
                        show: false,
                        lineStyle: {
                            width: 0,
                            color: [[1, '#b5c6ce']],
                            shadowBlur: {
                                shadowColor: 'rgba(0, 0, 0, 0.5)',
                                shadowBlur: 10
                            }
                        }
                    },
                    splitLine: { show: false },
                    axisTick: { show: false },
                    pointer: {
                        width: 4
                    },
                    axisLabel: {
                        textStyle: ChartStyles.textStyle,
                        lineHeight: 100,
                        distance: -35,
                        padding: [0, 0, -15, 0],
                        formatter: function (v) {
                            switch (v + '') {
                                case '0': return ('1 ' + monthShort[month]);
                                case '100': return (daysInMonth + " " + monthShort[month]);
                                default: return '';
                            }
                        },
                        fontSize: ChartStyles.fontSizeSmall
                    },
                    detail: { show: false },
                    data: [{ value: (timePassedInMonth * 100), name: '' }]
                }
            ]

        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }







    static CreateMonthlyLean(_elementID, _data) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        var monthData = _data[0];
        //console.log(monthData);
        var dailyAverageTarget = [];
        var theDate = [];
        var maxYaxis = Math.round((Math.max(...monthData.dailyTotals) / 1000) + 1) * 1000;

        for (var i = 0; i < monthData.dailyTotals.length; i++) {
            dailyAverageTarget.push(Math.round((monthData.totalMetricTarget / _data[2]) * 1) / 1);
            theDate.push(_data[1] + (i < 9 ? "0" : "") + (i + 1));
        }
        //console.log(dailyAverageTarget);

        var monthDateLabelsSTR = [];
        var month = _data[1];
        var daysInMonth = _data[2]
        monthDateLabelsSTR = GenerateDateLabels(month + "01", daysInMonth);
        var belowVariance = [];
        var aboveVariance = [];
        var clearAbove = [];
        var clearBelow = [];
        for (let j = 0; j < monthData.dailyTotals.length; j++) {
            if (dailyAverageTarget[j] > monthData.dailyTotals[j]) {
                let tmp = dailyAverageTarget[j] - monthData.dailyTotals[j];
                belowVariance[j] = Math.round(tmp * 10) / 10;
                let tmp2 = dailyAverageTarget[j] + -belowVariance[j];
                clearBelow[j] = Math.round(tmp2 * 10) / 10;
                aboveVariance[j] = null;
                clearAbove[j] = 0;
            }
            else {
                let tmp3 = monthData.dailyTotals[j] - dailyAverageTarget[j];
                aboveVariance[j] = Math.round(tmp3 * 10) / 10;
                clearAbove[j] = dailyAverageTarget[j];
                belowVariance[j] = null;
                clearBelow[j] = 0;
            }
        }

        var emphasisStyle = {
            itemStyle: {
                barBorderWidth: 1,
                shadowBlur: 1,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowColor: 'rgba(0,0,0,0.5)'
            }
        };

        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            //grid: ChartStyles.monthGridSpacing(),
            legend: {
                data: ['Below Variance', 'Above Variance', '3MRF Target Line'],
                itemGap: 25,
                left: 10
            },
            tooltip: {
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                showDelay: 0,
                transitionDuration: 0,
                formatter: function (params, index) {
                    var dailyTotal = (params[0].data + params[1].data + params[2].data + params[3].data);
                    var string = "";
                    string += ChartStyles.toolTipTextEntry('Daily Total: ' + dailyTotal);
                    string += ChartStyles.toolTipTextEntry('Daily Target: ' + params[4].data);
                    if (params[2].data == '0')
                        string += ChartStyles.toolTipTextEntry('Above Variance: ' + params[3].data);
                    else string += ChartStyles.toolTipTextEntry('Below Variance: ' + params[2].data);
                    return string;
                },
            },
            xAxis: ChartStyles.xAxis(monthDateLabelsSTR),
            yAxis: {
                name: 'Daily Tonnes',
                nameLocation: 'middle',
                nameTextStyle: {
                    padding: [0, 0, 26, 0]
                },
                inverse: false,
                splitArea: { show: false },
                min: 0,
                max: maxYaxis,
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
                axisLabel: { fontSize: ChartStyles.fontSizeSmall }
            },

            series: [
                {
                    name: 'Clear Below',
                    type: 'bar',
                    stack: 'one',
                    emphasis: { color: 'rgba(0,0,0,0)' },
                    data: clearBelow,
                    itemStyle: { color: 'rgba(0,0,0,0)' }
                },
                {
                    name: 'Clear Above',
                    type: 'bar',
                    stack: 'one',
                    emphasis: emphasisStyle,
                    data: clearAbove,
                    itemStyle: { color: 'rgba(0,0,0,0)' }
                },
                {
                    name: 'Below Variance',
                    type: 'bar',
                    stack: 'one',
                    animationEasing: 'bounceOut',
                    emphasis: emphasisStyle,
                    data: belowVariance,
                    label: { normal: { show: true, position: 'bottom', distance: 5 } },  // need to add the formatter here
                    itemStyle: {
                        color: ChartStyles.TUMColors[0]
                    }
                },
                {
                    name: 'Above Variance',
                    type: 'bar',
                    stack: 'one',
                    animationEasing: 'bounceIn',
                    emphasis: emphasisStyle,
                    data: aboveVariance,
                    label: { normal: { show: true, position: 'top', distance: 5 } },
                    itemStyle: {
                        color: ChartStyles.TUMColors[5]
                    }

                },

                {
                    name: '3MRF Target Line',
                    type: 'line',
                    step: 'middle',
                    lineStyle: { width: '2' },
                    //boundaryGap: ['95%', '95%'],
                    //emphasis: emphasisStyle,
                    emphasis: {
                        //focus: 'none',
                        // blurScope: 'coordinateSystem',
                        lineStyle: { width: '6' },
                    },
                    symbol: "none",
                    data: dailyAverageTarget,
                    itemStyle: { color: 'rgba(255,255,255,1)' }
                }
            ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }

    static CreateMonthlyDateChart(_elementID, _data) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        var monthData = _data[0];
        var dailyAverageTarget = [];
        var theDate = [];
        var maxYaxis = Math.round((Math.max(...monthData.dailyTotals) / 1000) + 1) * 1000;

        for (var i = 0; i < monthData.dailyTotals.length; i++) {
            dailyAverageTarget.push(Math.round((monthData.totalMetricTarget / _data[2]) * 10) / 10);
            theDate.push(_data[1] + (i < 9 ? "0" : "") + (i + 1));
        }

        var monthDateLabelsSTR = [];
        var month = _data[1];
        var daysInMonth = _data[2]
        var monthDateLabelsSTR = GenerateDateLabels(month + "01", daysInMonth);

        //CUMULATIVE ACTUALS AND DAILY TARGET
        var monthCumulativeValues = [];
        var cumulativeTargetArray = [];

        for (var i = 0; i < monthData.dailyTotals.length; i++) {
            if (i != 0) {
                monthCumulativeValues[i] = monthCumulativeValues[i - 1] + monthData.dailyTotals[i];
                cumulativeTargetArray[i] = Math.round((cumulativeTargetArray[i - 1] + dailyAverageTarget[i]) * 10) / 10;
            } else {
                monthCumulativeValues[i] = monthData.dailyTotals[i];
                cumulativeTargetArray[i] = Math.round(dailyAverageTarget[i] * 10) / 10;
            }
        }

        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            //grid: ChartStyles.monthGridSpacing(),
            legend: {
                data: ['Daily Tonnes', 'Cumulative Tonnes', 'Cumulative Daily Average Target'],
                itemGap: 25,
                left: 10
            },
            tooltip: {
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextEntry(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                showDelay: 0,
                transitionDuration: 0,
            },
            xAxis: ChartStyles.xAxis(monthDateLabelsSTR),
            yAxis: [{
                name: 'Daily Tonnes',
                nameLocation: 'middle',
                nameTextStyle: {
                    padding: [0, 0, 26, 0]
                },
                type: 'value',
                inverse: false,
                splitArea: { show: false },
                min: 0,
                max: maxYaxis,
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
                axisLabel: { fontSize: ChartStyles.fontSizeSmall }
            },
            {
                name: 'Cumulative Tonnes',
                nameLocation: 'middle',
                nameTextStyle: {
                    padding: [32, 0, 0, 0]
                },
                type: 'value',
                inverse: false,
                splitArea: { show: false },
                min: 0,
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
                axisLabel: { fontSize: ChartStyles.fontSizeSmall }
            }],



            series: [
                {
                    name: 'Daily Tonnes',
                    data: monthData.dailyTotals,
                    type: 'bar',
                    yAxisIndex: 0,
                    itemStyle: { color: ChartStyles.siteColors[0] },
                    label: { normal: { show: true, position: 'top', distance: 5 } }
                },
                {
                    name: 'Cumulative Daily Average Target',
                    data: cumulativeTargetArray,
                    type: 'line',
                    yAxisIndex: 1,
                    symbol: 'none',
                    itemStyle: { color: 'rgba(192,192,192,0.5)' },
                    areaStyle: { color: ChartStyles.cumulativeArea }
                },
                {
                    name: 'Cumulative Tonnes',
                    data: monthCumulativeValues,
                    type: 'line',
                    yAxisIndex: 1,
                    symbol: 'none',
                    itemStyle: { color: 'rgba(50,205,50,0.5)' },
                    areaStyle: { color: ChartStyles.cumulativeArea }
                }

            ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    };



}



class MonthlyChartDataForLocation {
    constructor(_data) {
        this.location = _data[1];
        this.actual = _data[1];
        this.target = _data[0];
        this.monthPassed = 75;

        this.percentOfTargetToDate = this.target * (this.monthPassed / 100);
        this.bias = this.actual - this.percentOfTargetToDate;

        this.under = Math.abs(Math.min(0, this.bias));
        this.over = Math.abs(Math.max(0, this.bias));

        // Clamp actual
        this.actual = Math.min(Math.min(this.actual, this.percentOfTargetToDate), this.target);

        var overDiff = Math.max(0, (this.actual + this.over) - this.target);
        this.overForChart = this.over - overDiff;
        this.targetForChart = this.target - Math.min(this.target, this.actual + this.under + this.overForChart);
    }
}


class SimpleGaugeData {
    constructor() {
        this.value = 0;
        this.fontSize = 60;
        this.color = ChartStyles.TUMColors[2];
        this.subText = "";
        this.subTextLineHeight = 0;
        this.titleBottom = 25;
        this.center = [50, 80];
        this.maxRadius = 120;
        this.radiusThickness = 20;
    }
}