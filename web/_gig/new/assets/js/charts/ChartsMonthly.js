
class ChartsMonthly {

    static CreateLongTermWaterfall(_elementID, _data) {

        var myChart = echarts.init(document.getElementById(_elementID), ChartStyles.baseStyle);

        // Create the arrays for the data
        var labels = [];
        var valueStack = [];
        var valueSpace = [];

        var timeSpent = 0;
        for (var i = 0; i < _data.length; i++) {

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
                valueSpace[i] = _data[0].value - timeSpent;
            }
        }

        // console.log(labels);
        // console.log(valueStack);
        // console.log(valueSpace);


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            title: ChartStyles.createTitle("Time Utilisation Model Breakdown"),
            tooltip: {
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
                left: '3%',
                right: '4%',
                bottom: '5%',
                containLabel: true
            },
            xAxis: ChartStyles.xAxis(labels, 0),
            yAxis: {
                type: 'value',
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey
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
                    data: valueStack
                }
            ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }






    static CreateLongTerm(_elementID, _data, _name, _style, _lines) {
        var myChart = echarts.init(document.getElementById(_elementID), 'chartTone');

        var smoothVal = 0;

        if (_lines == true) {

            var _series = [
                {
                    name: _name,
                    data: _data.Down[1],
                    type: 'line',
                    symbol: 'none',
                    stack: 'stack',
                    itemStyle: ChartStyles.statusItemStyle(2),
                    areaStyle: { color: 'rgba(255,0,0,0.4)' },
                    lineStyle: { width: 1 },
                    large: true,
                    smooth: 0.5
                },
                {
                    name: _name,
                    data: _data.Idle[1],
                    type: 'line',
                    symbol: 'none',
                    stack: 'stack',
                    itemStyle: ChartStyles.statusItemStyle(1),
                    areaStyle: { color: 'rgba(255,255,0,0.4)' },
                    lineStyle: { width: 1 },
                    large: true,
                    smooth: 0.5
                },
                {
                    name: _name,
                    data: _data.Operating[1],
                    type: 'line',
                    symbol: 'none',
                    stack: 'stack',
                    itemStyle: ChartStyles.statusItemStyle(0),
                    areaStyle: { color: 'rgba(0,255,0,0.4' },
                    lineStyle: { width: 1 },
                    large: true,
                    smooth: 0.5
                }
            ];
        }
        else {
            var ma30 = CalculateMA(30, _data[1]);
            var ma60 = CalculateMA(60, _data[1]);

            var _series = [{
                name: _name,
                data: _data[1],
                type: 'line',
                symbol: 'none',
                itemStyle: _style,//ChartStyles.statusItemStyle(_colorIndex),
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
        }



        var option = {

            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,


            toolbox: {
                left: 'center',
                feature: {

                    restore: {}
                }
            },
            grid: {
                top: '4%',
                bottom: '20%',
                left: '1%',
                right: '1%',
                containLabel: true
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow()
            },
            dataZoom: [{
                type: 'inside'
            }, {
                type: 'slider'
            }],
            xAxis: {
                type: 'category',
                data: _lines == true ? _data.Idle[0] : _data[0]
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: function (value, index) { return (value * 100 + "%"); }
                },
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey
            },
            series: _series
            // {
            //     name: 'MA30',
            //     data: ma30,
            //     type: 'line',
            //     symbol: 'none',
            //     lineStyle: { width: 1 },
            //     large: true
            // },
            // {
            //     name: 'MA60',
            //     data: ma60,
            //     type: 'line',
            //     symbol: 'none',
            //     itemStyle: { color: 'white' },
            //     lineStyle: { width: 1 },
            //     large: true
            // }]
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

        var option = {

            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "MonthlyCompliance"),
            tooltip: {
                trigger: 'axis',
                formatter: function (params, index) {

                    var label = "";

                    var target = params[3].value;
                    var mined = params[0].value + params[1].value;
                    var over = params[1].value;

                    var len = _data[params[0].name][1].length;
                    var average = (_data[params[0].name][1][len - 1] / len).toFixed(2);

                    label += "<h4 class='underline'>" + params[0].name + "</h4>"
                        + "Target : " + target + "</br>"
                        + "Mined : " + mined + (target > 0 ? " (" + RatioToPercent(mined / target) + ")</br>" : "</br>")
                        + "Average : " + average;//+ _data[params[0].name];
                    if (over > 0)
                        label += "<p class='cup-redwarn'>Over: " + params[1].value + " (" + RatioToPercent(params[1].value / target) + ")</p>";

                    return label;
                },
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: 'rgba(50,50,50,0.9)'
            },

            grid: {
                top: '3%',
                bottom: '3%',
                left: '3%',
                right: '3%',
                containLabel: true
            },
            legend: {
                textStyle: ChartStyles.toolTipTextStyle(),
                orient: 'horizontal',
                x: 'center',
                y: 'top',
                selectedMode: false,
                data: ['Tonnes', 'Over', 'Target']
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
                    barWidth: 10,

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
                    barWidth: 20,
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

