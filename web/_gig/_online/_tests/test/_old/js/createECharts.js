


window.allCharts = [];
var myChart;

// callback on array
// function myFunction(value, index, array) {
//   console.log(array[index] + " Index = " + index);
// }


$.ajax({
    url: "testchart.php?adsd=sss",
    dataType: 'json',
    type: "GET",
    success: function (data)
    {
        var seriesName = 'Cumulative Tonnes';
        //var headersSQL = data[0];
        //var cumulativeSQL = data[2];

        var offsetIndex = 3;

        var shift = data[1][0];
        var equipment = data[1][1];

        var hoursData = data[0].slice(offsetIndex);
        var cumulativeData = data[2].slice(offsetIndex);
        var dailyTargetData = data[3].slice(offsetIndex);
        var eightyFiveTargetData = data[4].slice(offsetIndex);

        var colouredCumulativeData = [];
        for (i = 0; i < cumulativeData.length; i++) {
            var colorString = (parseFloat(cumulativeData[i]) < parseFloat(eightyFiveTargetData[i])) ? 'red' : 'green';
            console.log(parseFloat(cumulativeData[i]) + "   " + parseFloat(eightyFiveTargetData[i]));
            colouredCumulativeData.push({ value: cumulativeData[i], itemStyle: { color: colorString } });
        }

        //console.log(colouredCumulativeData);

        // based on prepared DOM, initialize echarts instance
        myChart = echarts.init(document.getElementById('zoo'), 'dark');

        // specify chart configuration item and data
        var option = {
            backgroundColor: 'rgba(0,0,0,0)',
            title: {
                text: equipment
            },
            tooltip: {},
            legend: {
                data: [seriesName, 'Daily Target', '85%']
            },
            toolbox: {
                show: true,
                feature: {
                    magicType: { type: ['line'], title: [''] },
                    restore: { title: [''] }
                }
            },
            xAxis: {
                data: hoursData//["shirt", "cardign", "chiffon shirt", "pants", "heels", "socks"]
            },
            yAxis: {
                name: seriesName,
                nameLocation: 'middle',
                nameGap: 40
            },

            series: [
                {
                    name: 'Daily Target',
                    type: 'line',
                    //itemStyle: { normal: { areaStyle: { type: 'default' } } },
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
                    name: seriesName,
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

    },
    error: function (data)
    {
    }
});


// // based on prepared DOM, initialize echarts instance
// myChart = echarts.init(document.getElementById('poo'));
// // specify chart configuration item and data
// var option = {
//     title: {
//         text: 'LH100'
//     },
//     tooltip: {},
//     legend: {
//         data: ['Sales']
//     },
//     xAxis: {
//         data: ["shirt", "cardign", "chiffon shirt", "pants", "heels", "socks"]
//     },
//     yAxis: {},
//     series: [{
//         name: 'Sales',
//         type: 'bar',
//         data: [5, 20, 36, 10, 10, 20]
//     }]
// };

// // use configuration item and data specified to show chart
// myChart.setOption(option);
// allCharts.push(myChart);

// // based on prepared DOM, initialize echarts instance
// myChart = echarts.init(document.getElementById('boo'));
// // specify chart configuration item and data
// var option = {
//     title: {
//         text: 'ECharts entry example'
//     },
//     tooltip: {},
//     legend: {
//         data: ['Sales']
//     },
//     xAxis: {
//         data: ["shirt", "cardign", "chiffon shirt", "pants", "heels", "socks"]
//     },
//     yAxis: {},
//     series: [{
//         name: 'Sales',
//         type: 'bar',
//         data: [50, 2, 3, 13, 17, 29]
//     }]
// };

// // use configuration item and data specified to show chart
// myChart.setOption(option);
// allCharts.push(myChart);
