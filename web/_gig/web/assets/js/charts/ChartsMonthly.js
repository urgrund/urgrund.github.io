
class ChartsMonthly {

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
            //labels[i] = name.replace(" ", "</br>");
            labels[i] = _data[i].name;

            valueStack[i] = {
                value: _data[i].value,
                itemStyle: { color: _data[i].id == undefined ? ChartStyles.darkColor : ChartStyles.TUMColors[_data[i].id] }
                //itemStyle: { color: ChartStyles.getTUMColor(i) }
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
            //title: ChartStyles.createTitle("Time Utilisation Model Breakdown"),
            tooltip: {
                show: false,
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),//'rgba(50,50,50,0.9)',               
                formatter: function (params) {
                    var tar = params[1];
                    return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
                }
            },
            grid: {
                // left: '3%',
                // right: '4%',
                // bottom: '5%',
                containLabel: true
            },
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
            //,
            //animationDurationUpdate: 5000
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }






    static CreateLongTerm(_elementID, _data, _name, _style, _zoom) {
        var myChart = echarts.init(document.getElementById(_elementID), 'chartTone');

        var smoothVal = 0;
        var ma30 = CalculateMA(30, _data);
        var ma60 = CalculateMA(60, _data);

        var _series = [{
            name: _name,
            data: _data,//[1],
            type: 'line',
            symbol: 'none',
            itemStyle: _style,
            lineStyle: { width: 1.5 },
            large: true,
            smooth: smoothVal
        },
        {
            name: 'MA30',
            data: ma30,
            type: 'line',
            symbol: 'none',
            itemStyle: { color: 'white' },
            lineStyle: { width: 1 },
            large: true,
            smooth: true
        }];


        //console.log(_zoom == true);
        var _dataZoom = null;
        if (_zoom == true) {
            var _dataZoom = [{
                type: 'inside'
            }, {
                type: 'slider',
                dataBackground: {
                    lineStyle: { color: 'white' },
                    areaStyle: _style
                }
            }];
        }


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,

            title: ChartStyles.createTitle(_name),
            toolbox: {
                left: 'center',
                feature: {

                    restore: {}
                }
            },
            grid: {
                top: '15%',
                bottom: '0%',
                left: '1%',
                right: '1%',
                containLabel: true
            },
            tooltip: {
                //show: false,
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                formatter: function (params) {
                    return "";
                }
            },
            dataZoom: _dataZoom,
            xAxis: ChartStyles.xAxis(GenerateDateLabels('20181001', _data.length)),

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






    static CreateMonthlyCompliance(_elementID, _data) {

        //console.log(_data);

        var myChart = echarts.init(document.getElementById(_elementID), 'chartTone');

        var newData = [[], [], [], [], []];

        var index = 0;
        for (var key in _data) {

            var len = _data[key][1].length - 1;
            var target = parseInt(_data[key][2][0]);

            // Add location
            newData[0].push(key);

            // Add current cumulative            
            newData[1].push(Math.min(_data[key][1][len], target));

            // Overmined
            newData[2].push(Math.max(0, _data[key][1][len] - target));

            // Add target
            newData[3].push(target);

            // Label, it's fake data that is positioned based on cumulative            
            newData[4].push({ value: 0, label: { formatter: String(_data[key][1][len]) } });//{ value: 0, label: { formatter: 'A', fontSize: '50', color: '#337849' } });
        }
        //console.log(newData);



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
                data: ['Tonnes', 'Over', 'Target']
            },
            tooltip: {
                trigger: 'axis',
                confine: true,
                formatter: function (params, index) {
                    var target = params[3].value;
                    var mined = params[0].value + params[1].value;
                    var over = params[1].value;

                    var len = _data[params[0].name][1].length;
                    var average = (_data[params[0].name][1][len - 1] / len).toFixed(2);

                    var label = "";
                    label += ChartStyles.toolTipTextTitle(params[0].name)
                        + ChartStyles.toolTipTextEntry("Target : " + target)
                        + ChartStyles.toolTipTextEntry("Mined : " + mined + (target > 0 ? " (" + RatioToPercent(mined / target) + ")" : ""))
                        + ChartStyles.toolTipTextEntry("Average : " + average);
                    if (over > 0 && target > 0)
                        label += ChartStyles.toolTipTextEntry("Over: " + params[1].value + " (" + RatioToPercent(params[1].value / target) + ")", 'cup-redwarn');

                    return label;
                },
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor()
            },

            grid: {
                top: '3%',
                bottom: '3%',
                left: '3%',
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
                        fontSize: ChartStyles.fontSizeAxis
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
                nameGap: 40,
                axisLabel: { fontSize: ChartStyles.fontSizeAxis },
                splitLine: {
                    show: false,
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
                    animationDuration: 500,
                    animationDelay: 0
                },
                {
                    data: newData[2],
                    type: 'bar',
                    stack: 'stack',
                    name: 'Over',
                    itemStyle: { color: ChartStyles.statusColors[2], barBorderRadius: borderRadius },
                    // barGap: '50%',
                    barWidth: barWidth,

                    animationEasing: 'linear',
                    animationDuration: 500,
                    animationDelay: 500,
                }
                ,
                {
                    data: newData[4],
                    stack: 'stack',
                    type: 'bar',
                    label: { show: true, position: 'top' }
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
                    // label: {
                    //     show: true,
                    //     position: 'top',
                    //     rotate: '90',
                    //     color: '#70d4ff'
                    // },
                    z: 0
                }
            ]
        };

        SetOptionOnChart(option, myChart);
    }






    static CreateMonthlyCompliance2(_elementID, _data) {

        var myChart = echarts.init(document.getElementById(_elementID), 'chartTone');

        // 1 - location
        // 3 - plan
        // 4 - actuals

        var newData = [[], [], [], [], []];

        var newData = [[], [], [], [], []];
        for (var i = 0; i < _data.length; i++) {
            var target = parseInt(_data[i][3]);
            var actual = parseInt(_data[i][4]);

            //console.log(actual);

            // Add location
            newData[0].push(_data[i][1]);

            // Current progress related to the target           
            newData[1].push(Math.min(actual, target));

            // Overmined
            newData[2].push(Math.max(0, actual - target));

            // The target value 
            newData[3].push(target);

            // Label, this is a 'dummy' bar to position the label 
            // by stacking nothing (0) on top of the other values
            newData[4].push({ value: 0, label: { formatter: String(_data[i][4]) } });
        }

        //console.log(newData);



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
                data: ['Tonnes', 'Over', 'Target']
            },
            tooltip: {
                trigger: 'axis',
                confine: true,
                formatter: function (params, index) {
                    var target = params[3].value;
                    var mined = params[0].value + params[1].value;
                    var over = params[1].value;

                    //var len = _data[params[0].name][1].length;
                    //var average = (_data[params[0].name][1][len - 1] / len).toFixed(2);

                    var label = "";
                    // label += ChartStyles.toolTipTextTitle(params[0].name)
                    //     + ChartStyles.toolTipTextEntry("Target : " + target)
                    //     + ChartStyles.toolTipTextEntry("Mined : " + mined + (target > 0 ? " (" + RatioToPercent(mined / target) + ")" : ""))
                    //     + ChartStyles.toolTipTextEntry("Average : " + average);
                    // if (over > 0 && target > 0)
                    //     label += ChartStyles.toolTipTextEntry("Over: " + params[1].value + " (" + RatioToPercent(params[1].value / target) + ")", 'cup-redwarn');

                    //label = params;
                    //console.log(params);

                    label += ChartStyles.toolTipTextTitle(params[0].name)
                        // + ChartStyles.toolTipTextEntry(params[0].value)
                        // + ChartStyles.toolTipTextEntry(params[1].value)
                        // + ChartStyles.toolTipTextEntry(params[2].value)
                        // + ChartStyles.toolTipTextEntry(params[3].value)
                        + ChartStyles.toolTipTextEntry("Target : " + target)
                        + ChartStyles.toolTipTextEntry("Mined  : " + mined + (target > 0 ? " (" + RatioToPercent(mined / target) + ")" : ""));
                    if (over > 0 && target > 0)
                        label += ChartStyles.toolTipTextEntry("Over: " + params[1].value + " (" + RatioToPercent(params[1].value / target) + ")", 'cup-redwarn');
                    return label;
                },
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor()
            },

            grid: {
                top: '3%',
                bottom: '3%',
                left: '3%',
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
                        fontSize: ChartStyles.fontSizeAxis
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
                nameGap: 40,
                axisLabel: { fontSize: ChartStyles.fontSizeAxis },
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
                    animationDuration: 500,
                    animationDelay: 0
                },
                {
                    data: newData[2],
                    type: 'bar',
                    stack: 'stack',
                    name: 'Over',
                    itemStyle: { color: ChartStyles.statusColors[2], barBorderRadius: borderRadius },
                    // barGap: '50%',
                    barWidth: barWidth,

                    animationEasing: 'linear',
                    animationDuration: 500,
                    animationDelay: 500,
                }
                ,
                {
                    data: newData[4],
                    stack: 'stack',
                    type: 'bar',
                    label: { show: true, position: 'top' }
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
                    // label: {
                    //     show: true,
                    //     position: 'top',
                    //     rotate: '90',
                    //     color: '#70d4ff'
                    // },
                    z: 0
                }
            ]
        };

        SetOptionOnChart(option, myChart);
    }

}

