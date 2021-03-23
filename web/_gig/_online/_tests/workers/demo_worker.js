var i = 0;

// function timedCount() {
//     i = i + 1;
//     postMessage(i);
//     setTimeout("timedCount()", 1000);
// }

// timedCount();

// self.onmessage = function (msg) {
//     console.log(msg.data[Int8Array]);
//     msg.data = 666;
//     postMessage(msg.data);
// }

// CPU consuming function (sorting a big array)
function sortBigArray(bigArray) {
    return bigArray.sort((a, b) => a - b);
}

self.onmessage = ({ data }) => {

    console.log("Start work...");
    console.log(data.length);
    console.time(`Worker Sort`);

    const sorted = sortBigArray(data);
    // var sorted = [];
    // for (var c = 0; c < data.length; c++) {
    //     var num = Math.sqrt(Math.sqrt(Math.sqrt(c)));
    //     sorted.push(num);
    // }
    console.timeEnd(`Worker Sort`);

    // send the sorted array back
    postMessage(sorted);
    // we are done and can close the worker 🙌
    close();
};