
var app = angular.module("myApp", []);

console.log("Setting up Components...");


/// ----------------------------------------
/// Drill Down Chart Container
/// ----------------------------------------
app.component("drillDownChart", {
    templateUrl: 'components/drillDownChart.html',
    bindings: {
        title: '@',
        chart: '@'
    }
});



/// ----------------------------------------
/// Equipment Header Details
/// ----------------------------------------
app.component("drillDownHeader", {
    //require: { main: '^myCtrl' },
    templateUrl: 'components/drillDownHeader.html',
    bindings: {
        shift: '@',
        equip: '<'
    },
    controller: function () {

        this.getEquipStyle = function (majorGroup) {
            if (majorGroup == "OPERATING") { return { 'color': ChartStyles.statusColorsFlat[0] } }
            if (majorGroup == "IDLE") { return { 'color': ChartStyles.statusColorsFlat[1] } }
            if (majorGroup == "DOWN") { return { 'color': ChartStyles.statusColorsFlat[2] } }
        };

        this.$onInit = function () {

            var len = this.equip.shiftData[this.shift].events.length;
            this.lastEvent = this.equip.shiftData[this.shift].events[len - 1];

            // ---------------------------------------------
            // Get time difference from 8am or 8pm
            var date1 = new Date(this.lastEvent.eventTime.date);
            var date2 = new Date();
            var diff = date2 - date1;

            var msec = diff;
            var hh = Math.floor(msec / 1000 / 60 / 60);
            msec -= hh * 1000 * 60 * 60;
            var mm = Math.floor(msec / 1000 / 60);
            diff = hh + "hr " + mm + "m";


            // Can this variable be updated with 
            // interval check so that its realtime?
            this.late = 0;
            if (hh > 4) {
                this.timeSinceLastCall = ">" + 4 + "hrs!";
                this.late = 1;
            }
            else
                this.timeSinceLastCall = diff;

            this.lastEventTime = this.lastEvent.eventTime.date.split(" ")[1].substring(0, 8);
            // ---------------------------------------------


            // 

        };
    }
});




/// ----------------------------------------
/// Alert Box
/// ----------------------------------------
app.component("alertBox", {
    templateUrl: 'components/alertBox.html',
    bindings: {
        alert: '<'
    }
});