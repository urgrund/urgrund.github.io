


window.allCharts = [];
var myChart;

// callback on array
// function myFunction(value, index, array) {
//   console.log(array[index] + " Index = " + index);
// }


$(window).on('resize', function ()
{
    ResizeAllGraphs();
});




//
function ResizeAllGraphs()
{
    if (allCharts != null && allCharts.length > 0) {
        for (var i = 0; i < allCharts.length; i++) {
            allCharts[i].resize();
        }
    }
}



/// Generate a graph 
function CreateBoggerGraphs(elementID)
{

    $.ajax({
        url: "data.php?adsd=sss",
        dataType: 'json',
        type: "GET",
        success: function (data)
        {
            //var seriesName = 'Cumulative Tonnes';
            //var headersSQL = data[0];
            //var cumulativeSQL = data[2];
            //console.log("_________");
            //console.log(data);

            // console.log("_________");



            var offsetIndex = 3;

            //var shift = data[1][0];
            var equipment = data[1][1];
            var titleID = elementID + "_Title";
            document.getElementById(titleID).innerHTML = equipment;



            var hoursData = data[0].slice(offsetIndex);
            var tonnesPerHour = data[1].slice(offsetIndex);
            var cumulativeData = data[2].slice(offsetIndex);
            var dailyTargetData = data[3].slice(offsetIndex);
            var eightyFiveTargetData = data[4].slice(offsetIndex);


            // Color based on reaching 85% target
            var colouredCumulativeData = [];
            for (i = 0; i < cumulativeData.length; i++) {
                var colorString = (parseFloat(cumulativeData[i]) < parseFloat(eightyFiveTargetData[i])) ? 'red' : 'green';
                colouredCumulativeData.push({ value: cumulativeData[i], itemStyle: { color: colorString } });
            }

            //console.log(colouredCumulativeData);

            // based on prepared DOM, initialize echarts instance
            //myChart = echarts.init(document.getElementById('zoo'), 'dark');


            var chartID;

            // --------------------------------------------
            // First chart
            chartID = elementID + "_ChartCML";
            myChart = echarts.init(document.getElementById(chartID), 'light');
            var option = {
                backgroundColor: 'rgba(0,0,0,0)',
                title: {
                    text: ''//equipment
                },
                tooltip: {},
                legend: {
                    data: ['Cumulative', 'Daily Target', '85%']
                },
                toolbox: {
                    show: true,
                    feature: {
                        magicType: { type: ['line'], title: [''] },
                        restore: { title: [''] }
                    }
                },
                xAxis: {
                    data: hoursData
                },
                yAxis: {
                    name: 'Tonnes',
                    nameLocation: 'middle',
                    nameGap: 40
                },

                series: [
                    {
                        name: 'Daily Target',
                        type: 'line',
                        lineStyle: { type: 'solid', color: 'grey' },
                        data: dailyTargetData
                    },
                    {
                        name: '85%',
                        type: 'line',
                        lineStyle: { type: 'dotted', color: 'red' },
                        data: eightyFiveTargetData
                    },
                    {
                        name: 'Cumulative',
                        type: 'bar',
                        data: colouredCumulativeData,
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        }
                    }
                ]
            };

            // use configuration item and data specified to show chart
            myChart.setOption(option);
            allCharts.push(myChart);
            // --------------------------------------------

            // --------------------------------------------
            // Second chart
            chartID = elementID + "_ChartTPH";
            myChart = echarts.init(document.getElementById(chartID), 'light');
            var option = {
                backgroundColor: 'rgba(0,0,0,0)',
                title: {
                    text: ''//equipment
                },
                tooltip: {},
                // legend: {
                //     data: ['Cumulative', 'Daily Target', '85%']
                // },
                // toolbox: {
                //     show: true,
                //     feature: {
                //         magicType: { type: ['line'], title: [''] },
                //         restore: { title: [''] }
                //     }
                // },
                xAxis: {
                    data: hoursData
                },
                yAxis: {
                    name: 'Tonnes',
                    nameLocation: 'middle',
                    nameGap: -10,
                    nameTextStyle: { fontSize: 10 },
                    axisLabel: { fontSize: 10 }
                },

                series: [
                    {
                        name: '',
                        type: 'line',
                        lineStyle: { type: 'solid', color: 'grey' },
                        data: tonnesPerHour
                    },
                    {
                        name: 'TPH',
                        type: 'bar',
                        data: tonnesPerHour,
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        }
                    }
                ]
            };

            // use configuration item and data specified to show chart
            myChart.setOption(option);
            allCharts.push(myChart);
            // --------------------------------------------


        },
        error: function (data)
        {
        }
    });
}


function CreateRadarGraph(elementID)
{
    var chartID;

    // --------------------------------------------
    // First chart
    chartID = elementID;
    myChart = echarts.init(document.getElementById(chartID), 'light');

    var option = {

        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: ['A', 'B', 'C', 'D', 'E']
        },
        series: [
            {
                //name: 'Poo',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: [
                    { value: 335, name: 'A' },
                    { value: 310, name: 'B' },
                    { value: 234, name: 'C' },
                    { value: 135, name: 'D' },
                    { value: 1548, name: 'E' }
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    myChart.setOption(option);
    allCharts.push(myChart);
}
