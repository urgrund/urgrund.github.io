
class ChartsMines {

    static CreateUsageBar(_elementID, _data) {
        // -------------------------------------------------------------
        //if (myPie == null)
        var myChart = echarts.init(document.getElementById(_elementID), 'chartTone');

        var _d = _data.shiftData[shift];

        //var t = SecondsToMinutes(_d.timeAvailable + (_d.timeAvailable - _d.timeUtilised) + _d.timeDown);
        //var t = (_d.timeAvailable + (_d.timeAvailable - _d.timeUtilised) + _d.timeDown);

        var t = _d.timeExOperating + _d.timeExIdle + _d.timeExDown;

        //console.log("Total time : " + t);
        var _barWidth = '12';
        function getLabel(_val) {
            if (_val === 0)
                return "";
            return Math.round((_val / t) * 100) + "%";
        }


        var option = {
            backgroundColor: ChartStyleContainer.backGroundColor,
            textStyle: ChartStyleContainer.textStyle,
            tooltip: {
                show: false
                // trigger: 'axis',
                // axisPointer: {
                //     type: 'shadow'
                // }
            },
            grid: {
                left: '3%',
                right: '3%',
                top: '25%',
                bottom: '0%',
                // height: '20%',
                containLabel: true
            },
            xAxis: {
                show: true,
                type: 'value'
                // min: 0,
                , max: t,
                interval: 3600,
                axisLine: {
                    show: true
                },
                splitLine: {
                    show: false,
                    interval: '100000'
                },
                axisLabel: {
                    show: false
                }
            },
            yAxis: {
                show: false,
                type: 'category'
            },
            //color: ['green', 'orange', 'red'],
            series: [
                {
                    name: 'Operating',
                    type: 'bar',
                    stack: 'a',
                    barWidth: _barWidth,
                    label: { formatter: function (params) { return getLabel(params.value); }, show: true, position: ['0%', '-100%'] },
                    data: [_d.timeExOperating],
                    itemStyle: ChartStyles.statusItemStyle(0)
                },
                {
                    name: 'Idle',
                    type: 'bar',
                    stack: 'a',
                    barWidth: _barWidth,
                    label: { formatter: function (params) { return getLabel(params.value); }, show: true, position: ['0%', '-100%'] },
                    data: [_d.timeExIdle],
                    itemStyle: ChartStyles.statusItemStyle(1)
                },
                {
                    name: 'Down',
                    type: 'bar',
                    stack: 'a',
                    barWidth: _barWidth,
                    label: { formatter: function (params) { return getLabel(params.value); }, show: true, position: ['0%', '-100%'] },
                    data: [_d.timeExDown],
                    itemStyle: ChartStyles.statusItemStyle(2)
                }
            ]
        };



        SetOptionOnChart(option, myChart);
    }




    static CreateBar(_elementID, _data, _title, _type) {

        // -------------------------------------------------------------        
        var myChart = echarts.init(document.getElementById(_elementID));//, chartTone);        


        var option = {
            // color: ['#3398DB'],
            title: ChartStyles.createTitle(_title),
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                textStyle: ChartStyles.textStyle
            },
            grid: {
                // left: '3%',
                // right: '4%',
                // bottom: '3%',
                containLabel: true
            },

            xAxis: [
                {
                    type: 'category',
                    data: timeLabelsShift[shift],
                    axisTick: { alignWithLabel: true },
                    splitLine: { show: false }
                }
            ],
            yAxis: [
                { type: 'value', splitLine: { show: false } }
            ],
            series: [
                {
                    name: _title,
                    type: _type,
                    barWidth: '60%',
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(50,222,239,.6)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(0,111,252,0.2)'
                            }
                            ], false),
                            shadowColor: 'rgba(53,142,215, 0.9)',
                            shadowBlur: 20
                        }
                    },
                    data: _data,
                    itemStyle: { color: ChartStyles.siteColors[0] }
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
                    // label: {
                    //     normal: { show: false, position: 'left' },
                    //     emphasis: {
                    //         show: false,
                    //         position: 'top',
                    //         formatter: '{b}\n{d}%',
                    //         textStyle: {
                    //             fontSize: '10',
                    //             fontWeight: 'bold'
                    //         }
                    //     }
                    // },
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




    static CreateSankey(_elementID, _data, _index) {

        var myChart = echarts.init(document.getElementById(_elementID));

        var asLocations = [[], [], [], []];
        var uniqueLocations = [];
        var graphData = [];

        var linesData = [];
        // Get all unique destinations into an array           
        // and flag if they are from the _index site
        for (var i = 0; i < _data.length; i++) {
            var _d = _data[i].materialMovement;

            for (var x = 0; x < _d.length; x++) {

                if (!(_d[x][2] in uniqueLocations)) {
                    uniqueLocations[_d[x][2]] = _d[x][9];
                    asLocations[_d[x][9]].push([_d[x][2], (i == _index) ? 1 : 0]);
                }

                if (!(_d[x][4] in uniqueLocations)) {
                    //if (i == _index)
                    //  console.log(_d[x][4]);
                    uniqueLocations[_d[x][4]] = _d[x][10];
                    asLocations[_d[x][10]].push([_d[x][4], (i == _index) ? 1 : 0]);
                }
            }
        }


        console.log(asLocations);


        // Build the graph Nodes
        var ratio = 2;
        for (var x = 0; x < asLocations.length; x++) {
            for (var y = 0; y < asLocations[x].length; y++) {
                var cat = asLocations[x][y][1];
                graphData.push({
                    name: asLocations[x][y][0],
                    x: (x / asLocations.length) * ratio,
                    y: (y + 1) / (asLocations[x].length + 1),
                    category: cat,
                    symbol: (cat == 1) ? 'circle' : 'diamond',
                    symbolSize: (cat == 1) ? 13 : 7
                });


                //console.log(asLocations[x][y][0] + " : " + cat);
            }
        }



        // Build the links
        var linkData = _data[_index].materialMovement;
        var links = [];

        for (var i = 0; i < linkData.length; i++) {
            //lines.push({ name: 'A', coord: [linkData[i][2], linkData[i][4]] });

            linesData.push([{
                coord: [linkData[i][2], linkData[i][2] + 4]
            }, {
                coord: [linkData[i][4], linkData[i][4] + 5]
            }])

            links.push(
                {
                    source: linkData[i][2],
                    target: linkData[i][4],
                    symbolSize: [13, 13],
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    lineStyle: {
                        normal: {
                            width: linkData[i][7] / 80,
                            curveness: 0.2,
                            color: ChartStyles.siteColors[0]//'red'
                        },
                        emphasis: {
                            color: ChartStyles.siteColors[1]//'white'
                        }
                    }
                }
            );
        }
        //console.log(links);

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
            label: {
                normal: {
                    fontSize: '10',
                    position: 'left'
                }
            },
        }]


        var option = {
            backgroundColor: ChartStyles.backGroundColor,
            textStyle: ChartStyles.textStyle,

            title: { text: 'Graph' },
            grid: {
                top: '3%',
                bottom: '3%',
                left: '0%',
                right: '0%'
            },
            xAxis: { show: false, type: 'value' },
            yAxis: { show: false, type: 'value' },
            tooltip: {},
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
                        edgeSymbol: ['', ''],
                        edgeSymbolSize: [4, 4],
                        edgeLabel: {
                            normal: { textStyle: { fontSize: 10 } }
                        },
                        data: graphData,
                        links: links,
                        categories: categories
                    },
                    {
                        name: 'A',
                        type: 'lines',
                        coordinateSystem: 'cartesian2d',
                        z: 1,
                        effect: {
                            show: true,
                            smooth: false,
                            trailLength: 0,
                            symbol: "arrow",
                            color: 'rgba(55,155,255,0.5)',
                            symbolSize: 20
                        },
                        data: linesData
                    }
                ]
        };


        SetOptionOnChart(option, myChart);
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
}

