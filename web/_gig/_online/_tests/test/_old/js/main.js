//$(document).ready(function () { });
$(document).ready(CreateGraph("Poo"));




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



function CreateGraph(chartLabel)
{
    // $.ajax({
    //     url: "data.php",
    //     dataType: 'json',
    //     type: "GET",
    //     success: function (data)
    //     {
    //         //console.log(data);

    //         var userid = [];
    //         var ageValues = [];
    //         //var twitter_follower = [];
    //         //var googleplus_follower = [];

    //         for (var i in data) {
    //             userid.push(data[i].Name);
    //             ageValues.push(data[i].Age);
    //             //  twitter_follower.push(data[i].twitter);
    //             //  googleplus_follower.push(data[i].googleplus);
    //         }

    //         var chartdata = {
    //             labels: userid,
    //             datasets: [
    //                 {
    //                     label: chartLabel,//"Peoples Age",
    //                     fill: false,
    //                     lineTension: 0.1,
    //                     backgroundColor: "rgba(59, 89, 152, 0.75)",
    //                     borderColor: "rgba(59, 89, 152, 1)",
    //                     pointHoverBackgroundColor: "rgba(59, 89, 152, 1)",
    //                     pointHoverBorderColor: "rgba(59, 89, 152, 1)",
    //                     data: ageValues
    //                 }
    //             ]
    //         };

    //         var ctx = $("#mycanvas");

    //         window.myGraph = new Chart(ctx, {
    //             type: 'bar',
    //             data: chartdata
    //         });
    //     },
    //     error: function (data)
    //     {

    //     }
    // });
}

