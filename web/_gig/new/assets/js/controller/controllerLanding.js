app.controller('LandingRoute', function ($route, $scope, $timeout) {
    console.log("JASDLJSLJSD");

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







    $scope.siteData = allData;


    // Fake alerts
    var alerts = [];
    for (var i = 0; i < Math.round(Math.random() * 10); i++) {
        if (Math.random() > 0.5) {
            alerts[i] = {
                level: 0,
                time: "09:24",
                id: 'LH020',
                message: "Bogger has been in-active for over 15minutes",
                action: "Get someone on the bogger"
            };
        } else {
            alerts[i] = {
                level: 1,
                time: "14:12",
                id: 'LH020',
                message: "TPH has been below target for over 1hr",
                action: "Get someone on the bogger"
            };
        }
    }

    $scope.alerts = alerts;
    console.log($scope.alerts);


});