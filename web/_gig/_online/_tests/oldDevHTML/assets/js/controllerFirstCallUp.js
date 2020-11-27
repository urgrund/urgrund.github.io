
app.controller("firstCallUp", function ($scope)
{
    // The modal form 
    var modal = document.getElementById('firstCallUp');

    $scope.$on('openFirstCallUp', function (event, id)
    {
        console.log("Call up with id : " + id);

        modal.style.display = "block";

        $scope.firstOrLast = id;

        $scope.formTitle = id === 0 ? "First Operating Call-up" : "Last Call-up";
        $scope.shiftTitle = !shiftIsDay ? "Day Shift" : "Night Shift";
        $scope.timeMarker = id === 0 ? (!shiftIsDay ? ">8am" : ">8pm") : "";

        var jsonString = JSON.stringify($scope.siteData);
        $scope.data = JSON.parse(jsonString);
        $scope.$apply;

        console.log($scope.data);
    });


    $scope.close = function ()
    {
        modal.style.display = "none";
        $scope.data = null;
    };



    window.onclick = function (event)
    {
        if (event.target == modal)
        {
            modal.style.display = "none";
        }
    }

    // Get style based on major group 
    $scope.getEquipStyle = function (majorGroup)
    {
        if (majorGroup == "OPERATING") { return { 'color': 'green' } }
        if (majorGroup == "IDLE") { return { 'color': 'orange' } }
        if (majorGroup == "DOWN") { return { 'color': 'red' } }
    };

    // Get details for this particular equip
    // based on the type of call up and shift
    $scope.getCallUpDetails = function (siteIndex, e)
    {
        var equip = $scope.data[siteIndex].equipment[e.Index];
        if (equip != null || equip != undefined)
        {
            // This could be an object for 
            // better readability in NG?
            var dateData = [];

            var eventIndex;
            var event;
            if ($scope.firstOrLast === 0)
            {
                eventIndex = equip.shiftData[shiftIsDay].eventFirstOp;
                event = equip.shiftData[shiftIsDay].events[eventIndex];
            }
            else
            {
                eventIndex = equip.shiftData[shiftIsDay].events.length - 1;
                event = equip.shiftData[shiftIsDay].events[eventIndex];
            }

            // If there's no data 
            if (event == undefined)
            {
                dateData.push(null);
                dateData.push(null);
                dateData.push(null);
                return;
            }

            // Create 2 dates            
            var currDate = new Date(event.eventTime.date);
            currDate.setMilliseconds(0);

            // Set time checker based on shift
            var eightAm = new Date(currDate.getTime());

            // THe Shift thingy is buggy fundamentally 
            eightAm.setHours(shiftIsDay ? 20 : 8);

            // Get the difference in hours
            var diff = Math.round(((currDate.getTime() - eightAm.getTime()) / 1000 / 3600) * 100) / 100;

            // Push the cleaned up date and the difference
            dateData.push(event);
            dateData.push(currDate.toLocaleTimeString());

            if ($scope.firstOrLast == 0)
                dateData.push(diff);
            else
                dateData.push("");

            return dateData;
        }
    };

}); 