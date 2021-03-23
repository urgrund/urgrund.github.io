
class ChartsMines {



    static CreateBar(_elementID, _data) {

        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;

        //console.log(_data[1]);


        var timeLength = timeLabelsShift[ShiftIndex()].length;
        var seriesName = "Tonnes";

        var plan = [];
        var profiledTarget = [];

        // ---------------------------------------------
        // The monthly target for this day
        if (_data[1] != null) {
            var monthlySite = _data[1].sites[_data[2]];
            var dailyTarget = (monthlySite.totalMetricTarget / _data[1].daysInMonth) * (ShiftIndex() < 2 ? 0.5 : 1.0);

            for (var i = 0; i < timeLength; i++) {
                // Cumulative target for each hour
                var frac = (i / (timeLength - 1)) * dailyTarget;

                // Modify the target by the profile
                plan.push(frac);
                var profileIndex = i + (ShiftIndex() == 1 ? 12 : 0);
                var profileScalar = ServerInfo.shiftTargetProductionProfile[profileIndex];
                profileScalar -= ShiftIndex() == 1 ? ServerInfo.shiftTargetProductionProfile[11] : 0;

                profiledTarget.push(
                    dailyTarget
                    * ServerInfo.shiftTargetAgressiveScalar
                    * profileScalar
                    * (ShiftIndex() < 2 ? 2 : 1)
                );
            }
        }
        // ---------------------------------------------

        // Get all the tonnes data
        //var tph = ArrayOfNumbers(0, timeLength, 0);     // Tonnes
        //var pph = ArrayOfNumbers(0, timeLength, 0);     // Production
        //var cph = _data.cph;// ArrayOfNumbers(0, timeLength, 0);     // Cumulative

        // TODO - NEED A CONFIG TO EXPLAIN WHAT PRODUCTION TONNES ARE
        // for (var i = 0; i < _data.length; i++) {
        //     for (var j = 0; j < _data[i].mph.length; j++) {
        //         cph[j] += _data[i].cph[j];
        //         tph[j] += _data[i].mph[j];
        //     }
        // }


        // Conditional colour coding for the TPH bars
        var cph;
        if (_data[0] != null) {
            cph = [];
            for (var i = 0; i < _data[0].cph.length; i++) {
                cph[i] = {
                    value: _data[0].cph[i],
                    itemStyle: { color: (_data[0].cph[i] > profiledTarget[i]) ? ChartStyles.TUMColors[2] : ChartStyles.TUMColors[0] }
                };
            }
        } else
            cph = ArrayOfNumbers(0, timeLength, 0);
        //console.log(cph);




        var option = {
            textStyle: ChartStyles.textStyle,
            backgroundColor: ChartStyles.backGroundColor,
            tooltip: {
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params, index) {
                    var string = ChartStyles.toolTipTextTitle(params[0].name);
                    string += ChartStyles.toolTipTextEntry(params[0].seriesName + ": " + params[0].value.toFixed());
                    if (params[1] != undefined && params[2] != undefined) {
                        string += ChartStyles.toolTipTextEntry(params[1].seriesName + ": " + params[1].value.toFixed());
                        string += ChartStyles.toolTipTextEntry(params[2].seriesName + ": " + params[2].value.toFixed());
                    }
                    else string += ChartStyles.toolTipTextEntry("No plan found...", "light");
                    return string;
                }
            },
            legend: {
                textStyle: { color: "#fff" },
                data: [seriesName, 'Target', 'Plan']
            },
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "SiteTPH"),
            grid: ChartStyles.gridSpacing(),
            xAxis: ChartStyles.xAxis(timeLabelsShift[ShiftIndex()]),
            yAxis: [
                {
                    type: 'value',
                    splitLine: { show: false },
                    axisLine: ChartStyles.axisLineGrey,
                    axisLabel: {
                        color: 'white',
                        fontSize: ChartStyles.fontSizeSmall,
                        formatter: function (value, index) { return ChartStyles.axisFormatThousands(value); }
                    }
                }
            ],
            series: [
                {
                    name: seriesName,
                    type: 'bar',
                    barMaxWidth: ChartStyles.barMaxWidth,
                    data: cph,
                    itemStyle: { color: ChartStyles.siteColors[0] }
                },
                {
                    name: "Plan",
                    type: 'line',
                    itemStyle: { color: ChartStyles.cumulativeColor },
                    areaStyle: { color: ChartStyles.cumulativeArea },
                    symbol: 'none',
                    lineStyle: ChartStyles.lineShadow(),
                    data: plan,
                },
                {
                    name: "Target",
                    type: 'line',
                    itemStyle: { color: ChartStyles.TUMColors[0] },
                    //areaStyle: { color: ChartStyles.cumulativeArea },
                    symbol: 'none',
                    lineStyle: ChartStyles.lineShadow(),
                    data: profiledTarget//target,
                }
            ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }







    // static CreateBar(_elementID, _data, _title) {

    //     // -------------------------------------------------------------        
    //     var myChart = echarts.init(document.getElementById(_elementID), ChartStyles.baseStyle);

    //     var option = {
    //         textStyle: ChartStyles.textStyle,
    //         title: ChartStyles.createTitle(_title),
    //         backgroundColor: ChartStyles.backGroundColor,

    //         tooltip: {
    //             confine: true,
    //             trigger: 'axis',
    //             textStyle: ChartStyles.toolTipTextStyle(),
    //             axisPointer: ChartStyles.toolTipShadow(),
    //             backgroundColor: ChartStyles.toolTipBackgroundColor(),
    //             formatter: function (params, index) {
    //                 var string = ChartStyles.toolTipTextTitle(params[0].name);
    //                 string += ChartStyles.toolTipTextEntry(params[0].seriesName + ": " + params[0].value);
    //                 string += ChartStyles.toolTipTextEntry(params[1].seriesName + ": " + params[1].value, "bold");
    //                 return string;
    //             }
    //         },
    //         legend: {
    //             textStyle: { color: "#fff" },
    //             y: 'top',
    //             data: ['Tonnes', 'Cumulative']// 'Target A', 'Target U', 'Target U of A']
    //         },
    //         toolbox: ChartStyles.toolBox(myChart.getHeight(), "SiteTPH"),
    //         grid: {
    //             left: '3%',
    //             right: '4%',
    //             bottom: '3%',
    //             containLabel: true
    //         },
    //         xAxis: ChartStyles.xAxis(timeLabelsShift[shift]),
    //         yAxis: [{
    //             type: 'value',
    //             splitLine: { show: false },
    //             axisLine: ChartStyles.axisLineGrey,
    //             axisLabel: {
    //                 color: 'white',
    //                 fontSize: ChartStyles.fontSizeSmall,
    //                 formatter: function (value, index) { return ChartStyles.axisFormatThousands(value); }
    //             }
    //         },
    //         {
    //             type: 'value',
    //             splitLine: { show: false },
    //             axisLine: ChartStyles.axisLineGrey,
    //             axisLabel: {
    //                 color: 'white',
    //                 fontSize: ChartStyles.fontSizeSmall,
    //                 formatter: function (value, index) { return ChartStyles.axisFormatThousands(value); }
    //             }
    //         }],
    //         series: [
    //             {
    //                 name: "Tonnes",
    //                 type: 'bar',
    //                 yAxisIndex: 0,
    //                 data: _data.mph,
    //                 itemStyle: { color: ChartStyles.siteColors[0] }
    //             },
    //             {
    //                 name: "Cumulative",
    //                 type: 'line',
    //                 yAxisIndex: 1,
    //                 itemStyle: { color: ChartStyles.cumulativeColor },
    //                 areaStyle: { color: ChartStyles.cumulativeArea },
    //                 symbol: 'none',
    //                 lineStyle: ChartStyles.lineShadow(),
    //                 data: _data.cph,
    //             }
    //         ]
    //     };

    //     SetOptionOnChart(option, myChart);
    //     return myChart;
    // }




    static CreateTinyPie(_elementID, _data, _title) {
        // Create an eCharts instance 
        var myChart = InitChartFromElementID(_elementID);
        if (myChart == undefined) return;


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            //title: ChartStyles.createTitle('Hello'),
            title:
            {
                subtext: _title,
                subtextStyle: { color: '#fff' },
                left: 'center',
                top: '30%'
            },
            tooltip: { show: false },
            grid: ChartStyles.gridSpacing(),
            // grid: {
            //     left: '0%',
            //     right: '0%',
            //     bottom: '0%',
            //     top: '0%',
            //     containLabel: true
            // },
            series: [
                {
                    type: 'pie',
                    radius: ['60%', '80%'],
                    avoidLabelOverlap: true,
                    hoverOffset: 3,
                    label: { show: false },
                    labelLine: { normal: { show: false } },
                    data: [
                        {
                            value: SecondsToMinutes(_data[0]),
                            name: 'Available',
                            itemStyle: ChartStyles.statusItemStyle(0)
                        },
                        {
                            value: SecondsToMinutes(_data[1]),
                            name: 'Non-Utilised',
                            itemStyle: ChartStyles.statusItemStyle(1)
                        },
                        {
                            value: SecondsToMinutes(_data[2]),
                            name: 'Downtime',
                            itemStyle: ChartStyles.statusItemStyle(2)
                        }
                    ]
                }
            ]
        };

        SetOptionOnChart(option, myChart);
    }






    static CreateSankey(_elementID, _data, _siteID) {
        var dom = document.getElementById(_elementID);
        if (dom == null || dom == undefined)
            return;
        var myChart = echarts.init(dom, ChartStyles.baseStyle);

        var mm = _data[_siteID].shiftData[ShiftIndex()].materialMovements;


        // 0: "M30"
        // 1: "2"
        // 2: "Development Horizontal"
        // 3: "5013OD31N___"
        // 4: "5013 OD 31N ___"
        // 5: "5013SPDEV___"
        // 6: "5013 SP DEV __"
        // 7: "M30"
        // 8: 36

        //console.log(mm);

        var _temp = [];
        var _locations = [];
        var _links = [];
        for (var x = 0; x < mm.length; x++) {

            //            console.log(mm[x][6]);

            // Add unique locations
            if (!(mm[x][3] in _temp))
                _temp[mm[x][3]] = 0;
            if (!(mm[x][4] in _temp))
                _temp[mm[x][4]] = 0;

            // Add links
            _links.push({
                source: mm[x][3],
                target: mm[x][4],
                value: mm[x][5],
            });
        }

        //console.log(mm);
        //console.log(_links);

        for (var key in _temp) {

            // Add the values that feed into this
            // location from each link/path in the sankey
            var valueIn = 0;
            for (var i = 0; i < _links.length; i++) {
                if (_links[i].target == key)
                    valueIn += _links[i].value;
                //console.log(_links[i].value);
            }

            _locations.push({
                name: key,
                value: valueIn,
                itemStyle: {
                    normal: { color: ChartStyles.TUMColors[2], }
                }
            });
        }

        //console.log(_locations);
        //console.log(_links);



        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            tooltip: {
                confine: true,
                trigger: 'item',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params, index) {

                    //var index = params.dataIndex;
                    //var t = mm[index][5];
                    var i = index.substr(index.length - 1, 1);
                    //console.log(i + " - " + mm[i][5] + " - " + mm[i][6]);

                    // The sankey params for a Link
                    var locs = params.name.split(" > ");

                    var matType = "";
                    if (mm[i] != undefined && locs.length > 1)
                        matType = mm[i][6];

                    var string = "";
                    string += ChartStyles.toolTipTextTitle(Math.round(params.value) + " " + matType + " Tonnes");


                    if (locs.length > 1) {
                        string += ChartStyles.toolTipTextEntry("Source : " + locs[0]);
                        string += ChartStyles.toolTipTextEntry("Dest   : " + locs[1]);
                    }
                    else {
                        string += ChartStyles.toolTipTextEntry("At " + params.name);
                    }
                    return string;
                }
            },
            series: {
                type: 'sankey',
                //layout: 'none',
                //focusNodeAdjacency: 'inEdges',
                data: _locations,
                links: _links,
                label: ChartStyles.textStyle,
                lineStyle: {
                    color: "source",
                    curveness: 0.5
                }
            }
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }


}





    // static CreateSankey(_elementID, _data) {

    //     //var myChart = echarts.init(document.getElementById(_elementID, 'dark'));
    //     var myChart = echarts.init(document.getElementById(_elementID), 'light');



    //     // -----------------------------------------------------------------
    //     // D a t a   P r e p 
    //     // This could/should be moved to PHP so that JS focuses
    //     // on presentation and PHP on preparation

    //     var uniqueLocations = [];
    //     var uniqueCountIndex = 0;

    //     //console.log(echarts.dataTool.gexf);

    //     // Get all unique destinations into an array      
    //     //for (var x = 0; x < 3; x++) {
    //     //var _data = _site[x].materialMovement;
    //     for (var i = 0; i < _data.length; i++) {
    //         //console.log(_data[i][2]);
    //         // Only add a Source if it doesn't exist
    //         if (!uniqueLocations.includes(_data[i][2])) {
    //             uniqueLocations[uniqueCountIndex] = _data[i][2];
    //             uniqueCountIndex++;
    //         }

    //         // Only add a Finished Area if it doesn't exist
    //         if (!uniqueLocations.includes(_data[i][4])) {
    //             uniqueLocations[uniqueCountIndex] = _data[i][4];
    //             uniqueCountIndex++;
    //         }
    //     }
    //     //}
    //     //console.log(uniqueLocations);
    //     // Convert to the format eCharts wants        
    //     for (var i = 0; i < uniqueLocations.length; i++) {
    //         uniqueLocations[i] = { name: uniqueLocations[i], label: { color: '#000' } };
    //     }

    //     // Convert Links to the format eCharts wants
    //     // As the Sankey auto-merges duplicates, that saves having 
    //     // to do this here and can just filter the SQL to eCharts
    //     var links = [];
    //     for (var i = 0; i < _data.length; i++) {

    //         links[i] = {
    //             source: _data[i][2],
    //             target: _data[i][4],
    //             value: _data[i][7]
    //         };
    //     }
    //     // -----------------------------------------------------------------


    //     var position = [];
    //     //console.log(myChart);
    //     // myChart.getModel().getSeriesByIndex(0).getGraph().eachNode(function (node) {
    //     //     var layout = node.getLayout();
    //     //     if (layout) {
    //     //         position.push({
    //     //             name: node.id,
    //     //             position: [layout[0], layout[1]]
    //     //         });
    //     //     }
    //     // });



    //     //The chart option        
    //     var option = {
    //         // title: { text: _title },
    //         //backgroundColor: ChartStyles.backGroundColor,
    //         //textStyle: ChartStyles.textStyle,
    //         tooltip: {
    //             trigger: 'item',
    //             triggerOn: 'mousemove'
    //         },
    //         series: {
    //             type: 'sankey',
    //             layout: 'none',
    //             // focusNodeAdjacency: 'allEdges',

    //             // Hook up the data
    //             data: uniqueLocations,
    //             links: links
    //         }
    //     };
    //     // var option = {
    //     //     backgroundColor: ChartStyles.backGroundColor,
    //     //     textStyle: ChartStyles.textStyle,
    //     //     series: {
    //     //         type: 'sankey',
    //     //         layout: 'none',
    //     //         focusNodeAdjacency: 'allEdges',
    //     //         data: [{
    //     //             name: 'a'
    //     //         }, {
    //     //             name: 'b'
    //     //         }, {
    //     //             name: 'a1'
    //     //         }, {
    //     //             name: 'a2'
    //     //         }, {
    //     //             name: 'b1'
    //     //         }, {
    //     //             name: 'c'
    //     //         }],
    //     //         links: [{
    //     //             source: 'a',
    //     //             target: 'a1',
    //     //             value: 5
    //     //         }, {
    //     //             source: 'a',
    //     //             target: 'a2',
    //     //             value: 3
    //     //         }, {
    //     //             source: 'b',
    //     //             target: 'b1',
    //     //             value: 8
    //     //         }, {
    //     //             source: 'a',
    //     //             target: 'b1',
    //     //             value: 3
    //     //         }, {
    //     //             source: 'b1',
    //     //             target: 'a1',
    //     //             value: 1
    //     //         }, {
    //     //             source: 'b1',
    //     //             target: 'c',
    //     //             value: 2
    //     //         }]
    //     //     }
    //     // };

    //     SetOptionOnChart(option, myChart);
    // }


// static CreateUsageBar(_elementID, _data) {
//     // -------------------------------------------------------------
//     //if (myPie == null)
//     var myChart = echarts.init(document.getElementById(_elementID), ChartStyles.baseStyle);

//     var _d = _data.shiftData[shift];

//     //var t = SecondsToMinutes(_d.timeAvailable + (_d.timeAvailable - _d.timeUtilised) + _d.timeDown);
//     //var t = (_d.timeAvailable + (_d.timeAvailable - _d.timeUtilised) + _d.timeDown);

//     var t = _d.timeExOperating + _d.timeExIdle + _d.timeExDown;

//     //console.log("Total time : " + t);
//     var _barWidth = '12';
//     function getLabel(_val) {
//         if (_val === 0)
//             return "";
//         return Math.round((_val / t) * 100) + "%";
//     }


//     var option = {
//         backgroundColor: ChartStyleContainer.backGroundColor,
//         textStyle: ChartStyleContainer.textStyle,
//         tooltip: {
//             show: false
//             // trigger: 'axis',
//             // axisPointer: {
//             //     type: 'shadow'
//             // }
//         },
//         grid: {
//             left: '3%',
//             right: '3%',
//             top: '25%',
//             bottom: '0%',
//             // height: '20%',
//             containLabel: true
//         },
//         xAxis: {
//             show: true,
//             type: 'value'
//             // min: 0,
//             , max: t,
//             interval: 3600,
//             axisLine: {
//                 show: true
//             },
//             splitLine: {
//                 show: false,
//                 interval: '100000'
//             },
//             axisLabel: {
//                 show: false
//             }
//         },
//         yAxis: {
//             show: false,
//             type: 'category'
//         },
//         //color: ['green', 'orange', 'red'],
//         series: [
//             {
//                 name: 'Operating',
//                 type: 'bar',
//                 stack: 'a',
//                 barWidth: _barWidth,
//                 label: { formatter: function (params) { return getLabel(params.value); }, show: true, position: ['0%', '-100%'] },
//                 data: [_d.timeExOperating],
//                 itemStyle: ChartStyles.statusItemStyle(0)
//             },
//             {
//                 name: 'Idle',
//                 type: 'bar',
//                 stack: 'a',
//                 barWidth: _barWidth,
//                 label: { formatter: function (params) { return getLabel(params.value); }, show: true, position: ['0%', '-100%'] },
//                 data: [_d.timeExIdle],
//                 itemStyle: ChartStyles.statusItemStyle(1)
//             },
//             {
//                 name: 'Down',
//                 type: 'bar',
//                 stack: 'a',
//                 barWidth: _barWidth,
//                 label: { formatter: function (params) { return getLabel(params.value); }, show: true, position: ['0%', '-100%'] },
//                 data: [_d.timeExDown],
//                 itemStyle: ChartStyles.statusItemStyle(2)
//             }
//         ]
//     };



//     SetOptionOnChart(option, myChart);
// }
