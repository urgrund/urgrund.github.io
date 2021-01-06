
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
                    restore: { title: 'restore' }
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





    static CreateMonthlyComplianceBars(_elementID, _data) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        // 1 - location
        // 3 - plan
        // 4 - actuals


        var locationData = [];
        var markerData = [];
        for (var i = 0; i < _data.length; i++) {
            var d = new MonthlyChartDataForLocation(_data[i]);
            locationData.push(d);
            markerData.push(
                {
                    name: '',
                    value: '',//d.percentOfTargetToDate,
                    xAxis: i,
                    yAxis: d.percentOfTargetToDate,
                    itemStyle: { color: 'white' }
                }
            );
        }


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

                    var label = "";

                    label += ChartStyles.toolTipTextTitle(params[0].name)
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
                top: '0%',
                bottom: '0%',
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

        var data = new MonthlyChartDataForLocation(_data);

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
                            value: data.progress,
                            name: 'Progress',
                            itemStyle: { color: ChartStyles.siteColors[0] }
                        },
                        {
                            value: data.under,
                            name: 'Under',
                            itemStyle: { color: ChartStyles.TUMColors[0] }
                        },
                        {
                            value: data.overForChart,
                            name: 'Over',
                            itemStyle: { color: ChartStyles.TUMColors[5] }
                        },
                        {
                            value: data.targetForChart,
                            name: 'Target',
                            itemStyle: { color: 'rgba(0,0,0,0)' }
                        }
                        ,
                        {
                            value: data.target,
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
                            color: [[1, '#02b3ff']]
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
                                case '0': return ('1st ' + monthShort[10]);
                                case '100': return ('30th ' + monthShort[10]);
                                default: return '';
                            }
                        },
                        fontSize: ChartStyles.fontSizeSmall
                    },
                    detail: { show: false },
                    data: [{ value: data.monthPassed, name: '' }]
                }
            ]

        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }

}

class MonthlyChartDataForLocation {
    constructor(_data) {
        this.location = _data[1];
        this.progress = _data[4];
        this.target = _data[3];
        this.monthPassed = 75;

        this.percentOfTargetToDate = this.target * (this.monthPassed / 100);
        this.bias = this.progress - this.percentOfTargetToDate;

        this.under = Math.abs(Math.min(0, this.bias));
        this.over = Math.abs(Math.max(0, this.bias));

        // Clamp progress
        this.progress = Math.min(Math.min(this.progress, this.percentOfTargetToDate), this.target);

        var overDiff = Math.max(0, (this.progress + this.over) - this.target);
        this.overForChart = this.over - overDiff;
        this.targetForChart = this.target - Math.min(this.target, this.progress + this.under + this.overForChart);
    }
}