app.controller('Landing', function ($route, $scope, $timeout) {

    // Fake data for landing page
    var date = new Date();

    var dateDay = days[date.getDay()];
    var dateMonth = month[date.getMonth()];// "September";

    $scope.dateString = dateDay + ", " + date.getDate() + " " + dateMonth + " " + date.getFullYear();


    // Clock counter
    $scope.clock = Date.now(); // initialise the time variable
    $scope.tickInterval = 1000 //ms

    var tick = function () {
        $scope.clock = Date.now() // get the current time
        $timeout(tick, $scope.tickInterval); // reset the timer
    }

    // Start the timer
    $timeout(tick, $scope.tickInterval);
});