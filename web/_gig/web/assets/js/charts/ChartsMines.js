
class ChartsMines {





    static CreateBar(_elementID, _data, _title) {

        // -------------------------------------------------------------        
        var myChart = echarts.init(document.getElementById(_elementID), ChartStyles.baseStyle);

        var option = {
            textStyle: ChartStyles.textStyle,
            title: ChartStyles.createTitle(_title),
            backgroundColor: ChartStyles.backGroundColor,

            tooltip: {
                confine: true,
                trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params, index) {
                    var string = ChartStyles.toolTipTextTitle(params[0].name);
                    string += ChartStyles.toolTipTextEntry(params[0].seriesName + ": " + params[0].value);
                    string += ChartStyles.toolTipTextEntry(params[1].seriesName + ": " + params[1].value, "bold");
                    return string;
                }
            },
            legend: {
                textStyle: { color: "#fff" },
                y: 'top',
                data: ['Tonnes', 'Cumulative']// 'Target A', 'Target U', 'Target U of A']
            },
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "SiteTPH"),
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: ChartStyles.xAxis(timeLabelsShift[shift]),
            yAxis: [{
                type: 'value',
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
                axisLabel: {
                    color: 'white',
                    fontSize: ChartStyles.fontSizeSmall,
                    formatter: function (value, index) { return ChartStyles.axisFormatThousands(value); }
                }
            },
            {
                type: 'value',
                splitLine: { show: false },
                axisLine: ChartStyles.axisLineGrey,
                axisLabel: {
                    color: 'white',
                    fontSize: ChartStyles.fontSizeSmall,
                    formatter: function (value, index) { return ChartStyles.axisFormatThousands(value); }
                }
            }],
            series: [
                {
                    name: "Tonnes",
                    type: 'bar',
                    yAxisIndex: 0,
                    data: _data.mph,
                    itemStyle: { color: ChartStyles.siteColors[0] }
                },
                {
                    name: "Cumulative",
                    type: 'line',
                    yAxisIndex: 1,
                    itemStyle: { color: ChartStyles.cumulativeColor },
                    areaStyle: { color: ChartStyles.cumulativeArea },
                    symbol: 'none',
                    lineStyle: ChartStyles.lineShadow(),
                    data: _data.cph,
                }
            ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }




    static CreateTinyPie(_elementID, _data, _title) {
        // -------------------------------------------------------------
        //if (myPie == null)
        var myChart = echarts.init(document.getElementById(_elementID));//, chartTone);
        //console.log(myChart);
        //var _d = _data.shiftData[shift];

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
            grid: {
                left: '0%',
                right: '0%',
                bottom: '0%',
                top: '0%',
                containLabel: true
            },
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




    // Sankey 
    // Takes all site data so that it can build a 
    // sankey with greyed out areas from other sites
    // using index to colour the site in focus

    static CreateSankey(_elementID, _data, _index) {


        var myChart = echarts.init(document.getElementById(_elementID));


        // The nodes
        var graphData = [];

        // The lines between the nodes
        var linesData = [];


        // Build the graph Nodes

        // Height to width ratio for the graph
        var ratio = 1;
        var asLocations = _data[_index].asLocations;
        var xCount = 0;
        for (var x in asLocations) {
            for (var y = 0; y < asLocations[x].length; y++) {
                // Category is whether a 1 or 0 was written
                // which determines if this is the data set
                // we want to emphasise 
                var cat = asLocations[x][y][1];
                console.log(cat);
                var xPos = xCount;//(xCount / 1) * ratio;
                var yPos = (y + 1) / (asLocations[x].length + 1) * (1 / ratio * 2);
                graphData.push({
                    name: asLocations[x][y][0],
                    x: xPos,
                    y: yPos,
                    category: (cat != _index) ? 0 : 1,
                    symbol: 'circle',
                    symbolSize: (cat == _index) ? 13 : 7,
                });

            }
            xCount++;
        }
        //}


        // Build the links only for this stie        
        var links = [];
        var materialMovement = _data[_index].materialMovement;
        for (var i = 0; i < materialMovement.length; i++) {
            links.push(
                {
                    source: materialMovement[i][2],
                    target: materialMovement[i][4],
                    symbolSize: [13, 13],
                    label: { normal: { show: false } },
                    lineStyle: {
                        normal: {
                            //width: materialMovement[i][7] / 50,
                            width: 5,
                            curveness: 0.2,
                            opacity: 1,
                            color: ChartStyles.siteColors[0]
                        },
                        emphasis: {
                            opacity: 1,
                            color: ChartStyles.siteColors[1]//'white'
                        }
                    }
                }
            );
        }



        const categories = [{
            itemStyle: {
                normal: ChartStyles.disabledColor
            },
            label: {
                normal: {
                    fontSize: '8',
                    position: 'left',
                    color: 'grey'
                }
            },
        }, {
            itemStyle: ChartStyles.statusItemStyle(0),
            //itemStyle: ChartStyles.siteColors[0],
            label: {
                normal: {
                    fontSize: ChartStyles.fontSizeSmall,
                    position: 'bottom'
                }
            },
        }]

        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            title: ChartStyles.createTitle(''),
            toolbox: ChartStyles.toolBox(myChart.getHeight(), "Material Movement"),
            grid: {
                top: '1%',
                bottom: '1%',
                left: '0%',
                right: '0%'
            },
            tooltip: {
                confine: true,
                //trigger: 'axis',
                textStyle: ChartStyles.toolTipTextStyle(),
                axisPointer: ChartStyles.toolTipShadow(),
                backgroundColor: ChartStyles.toolTipBackgroundColor(),
                formatter: function (params) {
                    var string = ChartStyles.toolTipTextTitle("BLAA...");
                    string += ChartStyles.toolTipTextEntry("...kkkkkkk");
                    return string;
                }
            },
            xAxis: { show: false, type: 'value' },
            yAxis: { show: false, type: 'value' },
            series:
                [
                    {
                        type: 'graph',
                        layout: 'none',
                        symbolSize: 10,
                        roam: false,
                        label: {
                            normal: {
                                show: true,
                                textStyle: { fontSize: 2 }
                            }
                        },
                        edgeSymbol: ['', 'arrow'],
                        edgeSymbolSize: [100, 80],
                        edgeLabel: {
                            normal: { textStyle: { fontSize: 10 } }
                        },
                        data: graphData,
                        links: links,
                        categories: categories
                    },
                    // {
                    //     type: 'lines',
                    //     coordinateSystem: 'cartesian2d',
                    //     zlevel: 2,
                    //     effect: {
                    //         show: true,
                    //         period: 4,
                    //         trailLength: 0.02,
                    //         symbol: 'arrow',
                    //         symbolSize: 9,
                    //     },
                    //     lineStyle: {
                    //         normal: {
                    //             color: 'white',
                    //             width: 1,
                    //             opacity: 1,
                    //             curveness: .3
                    //         }
                    //     },
                    //     data: linesData                      
                    //}
                ]
        };

        SetOptionOnChart(option, myChart);
        return myChart;
    }

    static CreateSankey2(_elementID, _data, _siteID) {
        var myChart = echarts.init(document.getElementById(_elementID));
        var mm = _data[_siteID].shiftData[shift].materialMovements;
        // console.log(mm);

        // 0: "M30"
        // 1: "2"
        // 2: "Development Horizontal"
        // 3: "5013OD31N___"
        // 4: "5013 OD 31N ___"
        // 5: "5013SPDEV___"
        // 6: "5013 SP DEV __"
        // 7: "M30"
        // 8: 36
        // 9: 1
        // 10: 0
        // 11: 1

        var _temp = [];
        var _locations = [];
        var _links = [];
        for (var x = 0; x < mm.length; x++) {
            // Add unique locations
            if (!(mm[x][3] in _temp))
                _temp[mm[x][3]] = 0;
            if (!(mm[x][5] in _temp))
                _temp[mm[x][5]] = 0;

            // Add links
            _links.push({
                source: mm[x][3],
                target: mm[x][5],
                value: mm[x][8],
            });
        }

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

        console.log(_locations);
        console.log(_links);



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
                    var string = "";
                    string += ChartStyles.toolTipTextTitle(params.name);
                    string += ChartStyles.toolTipTextEntry(Math.round(params.value));
                    //string += ChartStyles.toolTipTextEntry(params.seriesName);

                    console.log(params);
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
