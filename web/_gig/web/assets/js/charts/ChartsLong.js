class ChartsLong {




    /**
     * Create a waterfall chart based on TUM values
     **/
    // static CreateLongTermWaterfall(_elementID, _data) {

    //     var myChart = echarts.init(document.getElementById(_elementID), ChartStyles.baseStyle);

    //     // Create the arrays for the data
    //     var labels = [];
    //     var valueStack = [];
    //     var valueSpace = [];

    //     var timeSpent = 0;

    //     // For the marker
    //     var biggestTimeIndex = -1;
    //     var biggestValue = 0;
    //     var biggestStyle = undefined;

    //     for (var i = 0; i < _data.length; i++) {

    //         _data[i].value = Math.round(_data[i].value / 3600);

    //         var name = _data[i].name;
    //         labels[i] = _data[i].name;

    //         valueStack[i] = {
    //             value: _data[i].value,
    //             itemStyle: { color: _data[i].id == undefined ? ChartStyles.darkColor : ChartStyles.TUMColors[_data[i].id] }
    //         };

    //         // Because Dave version has full
    //         // columns for these indices
    //         if (i == 0 || i == 3 || i == 6) {
    //             valueSpace[i] = 0;
    //         } else {
    //             timeSpent += _data[i].value;
    //             valueSpace[i] = (_data[0].value) - timeSpent;

    //             // Find which TUM is the biggest
    //             if (_data[i].value > biggestValue) {
    //                 biggestValue = _data[i].value;
    //                 biggestTimeIndex = i;
    //                 biggestStyle = { color: ChartStyles.TUMColors[_data[i].id] };
    //             }
    //         }
    //     }

    //     // Need to add back the empty space
    //     biggestValue += valueSpace[biggestTimeIndex];


    //     var option = {
    //         backgroundColor: ChartStyles.backGroundColor,
    //         textStyle: ChartStyles.textStyle,
    //         tooltip: {
    //             show: false,
    //             confine: true,
    //             trigger: 'axis',
    //             textStyle: ChartStyles.toolTipTextStyle(),
    //             axisPointer: ChartStyles.toolTipShadow(),
    //             backgroundColor: ChartStyles.toolTipBackgroundColor(),
    //             formatter: function (params) {
    //                 var tar = params[1];
    //                 return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
    //             }
    //         },
    //         grid: ChartStyles.gridSpacing(),
    //         xAxis: ChartStyles.xAxis(labels, 0),
    //         yAxis: {
    //             type: 'value',
    //             splitLine: { show: false },
    //             axisLine: ChartStyles.axisLineGrey,
    //             min: 0
    //         },
    //         series: [
    //             {
    //                 type: 'bar',
    //                 stack: 'a',
    //                 // This is to make it invisible
    //                 itemStyle: {
    //                     normal: {
    //                         barBorderColor: 'rgba(0,0,0,0)',
    //                         color: 'rgba(0,0,0,0)'
    //                     },
    //                     emphasis: {
    //                         barBorderColor: 'rgba(0,0,0,0)',
    //                         color: 'rgba(0,0,0,0)'
    //                     }
    //                 },
    //                 data: valueSpace
    //             },
    //             {
    //                 type: 'bar',
    //                 stack: 'a',
    //                 label: {
    //                     normal: {
    //                         show: true,
    //                         position: 'top'
    //                     }
    //                 },
    //                 data: valueStack,
    //                 markPoint: {
    //                     data: [{ coord: [biggestTimeIndex, biggestValue] }],
    //                     symbolSize: 30,
    //                     symbolOffset: [0, -20],
    //                     itemStyle: biggestStyle
    //                 }
    //             }
    //         ],
    //     };

    //     SetOptionOnChart(option, myChart);
    //     return myChart;
    // }





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

}