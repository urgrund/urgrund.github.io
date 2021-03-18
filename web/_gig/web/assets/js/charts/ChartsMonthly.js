
class ChartsMonthly {


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
            // by stacking nothing on top of the other values
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
                bottom: '4%',
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
                        barBorderRadius: 8
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

        //console.log(_elementID);

        if (_data[1][0] == 0) {
            console.log("No plan target for " + _elementID);
            return;
        }
        //var data = new MonthlyChartDataForLocation(_data);

        //console.log(_data);

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
                            itemStyle: { color: ChartStyles.TUMColors[5] }
                        },
                        {
                            value: actualOver,
                            name: 'Over',
                            itemStyle: { color: ChartStyles.TUMColors[0] }
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
        // console.log(dailyAverageTarget);

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
            grid: ChartStyles.gridSpacingMonth(),
            legend: {
                data: ['Below Variance', 'Above Variance', '3MRF Target Line'],
                itemGap: 25,
                left: 10
            },


            /*
            brush: {
                 toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
                 xAxisIndex: 0
             },
             toolbox: {
                 feature: {
                     magicType: {
                         type: ['stack', 'tiled']
                     },
                     dataView: {}
                 }
             },
            */

            tooltip: {
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                showDelay: 0,
                transitionDuration: 0,
                formatter: function (params, index) {
                    var string = "";
                    if (params[2].data == null) {
                        var dailyTotal = (params[1].data + params[3].data);
                        string += ChartStyles.toolTipTextEntry('Daily Total: ' + dailyTotal);
                        string += ChartStyles.toolTipTextEntry('Daily Target: ' + params[4].data);
                        string += ChartStyles.toolTipTextEntry('Above Variance: ' + params[3].data);
                    } else {
                        if (params[4] != undefined && params[2].data != undefined) {
                            var dailyTotal = (params[4].data - params[2].data);
                            string += ChartStyles.toolTipTextEntry('Daily Total: ' + dailyTotal);
                            string += ChartStyles.toolTipTextEntry('Daily Target: ' + params[4].data);
                            string += ChartStyles.toolTipTextEntry('Below Variance: ' + params[2].data);
                        }
                    }
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
                    barMaxWidth: ChartStyles.barMaxWidth,
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
                    barMaxWidth: ChartStyles.barMaxWidth,
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
            grid: ChartStyles.gridSpacingMonth(),
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
                formatter: function (params, index) {
                    var string = "";
                    string += ChartStyles.toolTipTextEntry('Daily Total: ' + params[0].data);
                    string += ChartStyles.toolTipTextEntry('Cumulative Actuals: ' + Math.round(params[2].data));
                    string += ChartStyles.toolTipTextEntry('Cumulative Target: ' + Math.round(params[1].data));
                    return string;
                },
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
                    barMaxWidth: ChartStyles.barMaxWidth,
                    type: 'bar',
                    yAxisIndex: 0,
                    itemStyle: { color: ChartStyles.siteColors[0] },
                    label: { normal: { show: true, position: 'top', distance: 5 } }
                },
                {
                    name: 'Cumulative Daily Average Target',
                    data: cumulativeTargetArray,
                    barMaxWidth: ChartStyles.barMaxWidth,
                    type: 'line',
                    yAxisIndex: 1,
                    symbol: 'none',
                    itemStyle: { color: 'rgba(192,192,192,0.5)' },
                    areaStyle: { color: ChartStyles.cumulativeArea }
                },
                {
                    name: 'Cumulative Tonnes',
                    data: monthCumulativeValues,
                    barMaxWidth: ChartStyles.barMaxWidth,
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
    // ---------------------------------------------------------------------------------------













    static CreateCalendarChart2(_elementID, _data) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        var monthData = _data[0];
        var date = _data[1];
        var daysInMonth = _data[2];
        var monthSplit = date.substring(0, 4) + "-" + date.substring(4, 6);
        var cellSize = [40, 40];

        var dailyAvgTarget = -1;
        var maxYaxis = -1;
        var minYaxis = -1;
        if (monthData != undefined) {
            dailyAvgTarget = Math.round((monthData.totalMetricTarget / daysInMonth) * 10) / 10;
            maxYaxis = Math.round((Math.max(...monthData.dailyTotals) / 1000)) * 1000;
            minYaxis = Math.round((Math.min(...monthData.dailyTotals) / 1000)) * 1000;
        }



        // Creates the data for the heatmap/calendar
        function createData(year) {
            if (monthData != undefined) {
                var date = +echarts.number.parseDate(year + '-' + '01');
                var end = +echarts.number.parseDate(year + '-' + daysInMonth);
                var dayTime = 3600 * 24 * 1000;
                var data = [];
                var i = 0;
                for (var time = date; time <= end; time += dayTime) {
                    data.push([
                        echarts.format.formatTime('yyyy-MM-dd', time),
                        monthData.dailyTotals[i]
                    ]);
                    i++;
                }
                return data;
            }
        }
        var calData = createData(monthSplit);


        // Crates visual map properties
        // { min: ((dailyAvgTarget + maxYaxis) / 2), color: ChartStyles.TUMColors[4] },
        // { min: dailyAvgTarget, max: ((dailyAvgTarget + maxYaxis) / 2), color: ChartStyles.TUMColors[5] },
        // { max: (dailyAvgTarget - 1), color: ChartStyles.TUMColors[0] },
        //{ min: dailyAvgTarget, color: ChartStyles.TUMColors[4] },
        //{ max: (dailyAvgTarget - 1), color: ChartStyles.TUMColors[0] },
        //{ max: minYaxis, min: maxYaxis, color: ChartStyles.TUMColors[3] },
        var vmProps = {};
        vmProps.show = true;
        vmProps.pieces = [{ min: dailyAvgTarget, color: ChartStyles.TUMColors[5] }, { max: dailyAvgTarget, color: ChartStyles.TUMColors[0] }];

        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            title: {
                text: month[Number(date.substring(4, 6)) - 1] + " " + date.substring(0, 4),
                left: 'center',
                textStyle: ChartStyles.textStyle,
                textStyle: { color: 'white', fontSize: 22, fontWeight: 150 },
            },
            grid: ChartStyles.gridSpacing(),
            tooltip: {
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                showDelay: 0,
                transitionDuration: 0,
                position: 'top',
                formatter: function (params, index) {
                    var string = "";
                    string += ChartStyles.toolTipTextTitle(echarts.format.formatTime('dd-MM-yyyy', params.value[0]));
                    string += ChartStyles.toolTipTextEntry('Daily Total: ' + Math.round(params.value[1]));
                    string += ChartStyles.toolTipTextEntry('Daily Target: ' + Math.round(dailyAvgTarget));
                    string += ChartStyles.toolTipTextEntry('Daily Compliance: ' + Math.round((parseInt(params.value[1]) / parseInt(dailyAvgTarget)) * 100) + '%');
                    return string;
                },
            },
            visualMap: {
                type: 'piecewise',
                //type: 'continuous',
                show: vmProps.show,
                min: minYaxis,
                max: maxYaxis,
                orient: 'horizontal',
                left: 'center',
                top: '8%',
                range: [minYaxis, maxYaxis],
                calculable: true,
                realtime: true,
                seriesIndex: [0],
                textStyle: ChartStyles.textStyle,
                pieces: vmProps.pieces,
                outOfRange: {
                    color: ['rgba(0,0,1,1)']
                }

                // inRange: {
                //     color: ['red', 'red', 'green'],
                //     symbolSize: [150, 200]
                // },

                // controller: {
                //     inRange: {
                //         symbolSize: [70, 100]
                //     }
                // }

                // //splitNumber: 8,
                // inRange: {
                //     color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                // }
            },
            calendar: {
                orient: 'vertical', //'horizontal',
                yearLabel: {
                    show: false,
                    margin: 50,
                    fontSize: 16,
                    fontWeight: 'normal'
                },
                dayLabel: {
                    firstDay: 1,
                    nameMap: 'en',
                    padding: [0, 0, -17, 0],
                    textStyle: ChartStyles.textStyle,
                    textShadowColor: ChartStyles.shadowColor,
                    textShadowBlur: 10,
                    nameMap: daysShort
                },
                monthLabel: {
                    show: false,
                    nameMap: 'en',
                    align: 'center',
                    verticalAlign: 'top',
                    formatter: '{nameMap}-{yy}',
                    lineHeight: 506,
                    margin: 20,
                    textStyle: ChartStyles.textStyle,
                    textStyle: { color: 'white', fontSize: 22, },
                },
                cellSize: cellSize,
                //top: 100,
                left: 10,
                range: monthSplit
            },

            series: {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                // label: {
                //     show: true
                // },
                label: {
                    show: true,
                    formatter: function (dayLabel) {
                        return echarts.format.formatTime('dd', dayLabel.value[0]);  //This line may break because of the echarts reference
                    },
                    offset: [-cellSize[0] / 2 + 10, -cellSize[1] / 2 + 10],
                    fontSize: 11
                },
                itemStyle: {
                    color: ChartStyles.TUMColors[2],
                    emphasis: {
                        borderColor: 'white',
                        borderWidth: 0.5,
                        shadowBlur: 15,
                        shadowColor: ChartStyles.shadowColor
                    }
                },
                data: calData//createData(monthSplit)
            }
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








    // ---------------------------------------------------------------------------------------
    // Monthly Calendar

    // static CreateCalendarChart(_elementID, _data) {

    //     // Create an eCharts instance 
    //     var myChart = InitChartFromElementID(_elementID);
    //     if (myChart == undefined) return;

    //     var monthData = _data[0];
    //     var monthAvg = Math.round((monthData.totalMetricTarget / _data[2]) * 10) / 10;
    //     var maxYaxis = Math.round((Math.max(...monthData.dailyTotals) / 1000) + 1) * 1000;
    //     var minYaxis = Math.round((Math.min(...monthData.dailyTotals) / 1000)) * 1000;
    //     var monthDateLabelsSTR = [];
    //     var month = _data[1];
    //     var cellSize = [40, 40];                //This is an issue as well
    //     var daysInMonth = _data[2]
    //     var monthDateLabelsSTR = GenerateDateLabels(month + "01", daysInMonth);
    //     var realDate = [];
    //     var dateMilliSeconds = [];
    //     var calendarData = [];
    //     var dayLabel = [];
    //     var tooltipLabel = [];

    //     for (var i = 0; i < monthDateLabelsSTR.length; i++) {
    //         realDate[i] = new Date(monthDateLabelsSTR[i].substring(0, 4) + "-" + monthDateLabelsSTR[i].substring(4, 6) + "-" + monthDateLabelsSTR[i].substring(6, 8));
    //         dateMilliSeconds[i] = Date.parse(realDate[i]);
    //         calendarData.push([dateMilliSeconds[i], monthData.dailyTotals[i]]);
    //         dayLabel.push(monthDateLabelsSTR[i].substring(4, 6));
    //         tooltipLabel.push(monthDateLabelsSTR[i].substring(0, 4) + "-" + monthDateLabelsSTR[i].substring(4, 6) + "-" + monthDateLabelsSTR[i].substring(6, 8));
    //     }

    //     var option = {
    //         backgroundColor: ChartStyles.backGroundColor,
    //         textStyle: ChartStyles.textStyle,
    //         tooltip: {
    //             textStyle: ChartStyles.toolTipTextStyle(),
    //             axisPointer: ChartStyles.toolTipShadow(),
    //             backgroundColor: ChartStyles.toolTipBackgroundColor(),
    //             showDelay: 0,
    //             transitionDuration: 0,
    //             position: 'top',
    //             formatter: function (params, index) {
    //                 var string = "";
    //                 string += ChartStyles.toolTipTextTitle('Date: ' + echarts.format.formatTime('dd-MM-yyyy', params.value[0]));
    //                 string += ChartStyles.toolTipTextEntry('Daily Total: ' + Math.round(params.value[1]));
    //                 string += ChartStyles.toolTipTextEntry('Daily Target: ' + Math.round(monthAvg));
    //                 string += ChartStyles.toolTipTextEntry('Daily Compliance: ' + Math.round((parseInt(params.value[1]) / parseInt(monthAvg)) * 100) + '%');
    //                 return string;
    //             },
    //         },

    //         visualMap: [
    //             {
    //                 min: minYaxis,
    //                 max: maxYaxis,
    //                 range: [minYaxis, maxYaxis],
    //                 calculable: true,
    //                 realtime: false,
    //                 seriesIndex: [0],
    //                 orient: 'vertical',
    //                 left: '80%',                                                                            //Not sure how this will perform
    //                 bottom: '25%',                                                                          //Same here. I think this offset will cause issues
    //                 inRange: {
    //                     color: ['rgba(255,0,0,1)', 'rgba(50,205,50,1)'],
    //                 },
    //                 textStyle: ChartStyles.textStyle
    //             }
    //         ],

    //         ///THIS iS THE FORMATTING OF THE CHART

    //         calendar: [
    //             {
    //                 tooltip: {

    //                 },
    //                 orient: 'vertical', //'horizontal',
    //                 yearLabel: {
    //                     margin: 50,
    //                     fontSize: 16,
    //                     fontWeight: 'normal'
    //                     //nameMap:  'yyyy-mmm'
    //                 },
    //                 dayLabel: {
    //                     firstDay: 1,
    //                     nameMap: 'en',
    //                     textStyle: ChartStyles.textStyle,
    //                     nameMap: daysShort //['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    //                 },
    //                 monthLabel: {
    //                     nameMap: 'en',
    //                     textStyle: {
    //                         color: 'white',
    //                         fontFamily: 'Poppins',
    //                         fontSize: 22,
    //                         fontWeight: 'normal'
    //                     },
    //                     margin: 20
    //                 },
    //                 cellSize: cellSize,
    //                 top: 100,
    //                 left: 100,
    //                 range: month.substring(0, 4) + "-" + month.substring(4, 6)         // Not sure if we want to make this line better it needs to be 'yyyy-mm'
    //             }],

    //         series: [{
    //             type: 'heatmap',
    //             coordinateSystem: 'calendar',
    //             calendarIndex: 0,
    //             data: calendarData,
    //             label: {
    //                 show: true,
    //                 formatter: function (dayLabel) {
    //                     return echarts.format.formatTime('dd', dayLabel.value[0]);  //This line may break because of the echarts reference
    //                 },
    //                 offset: [-cellSize[0] / 2 + 10, -cellSize[1] / 2 + 10],
    //                 fontSize: 11
    //             },
    //         }]
    //     };

    //     SetOptionOnChart(option, myChart);
    //     return myChart;
    // };
    // ---------------------------------------------------------------------------------------
