/*
    Drilldown Header
    The header for a drilldown page 
*/
app.component("drillDownHeader", {
    templateUrl: 'components/drillDownHeader.html',
    bindings: {
        shift: '@',
        styleGroup: '@',
        styleItem: '@',
        lines: '@',
        equip: '<'
    },
    controller: function ($rootScope) {

        this.$onInit = function () {

            if (this.equip == undefined)
                return;

            this.lastEvent = $rootScope.getEquipmentLastEvent(this.equip);
            if (this.lastEvent == undefined)
                return;

            this.TUMStyle = $rootScope.equipStyleTUMColorBG(this.lastEvent.status);
            console.log(this.TUMStyle);

            // Below could be PHP instead?
            // But it's more about the difference in time
            // right now versus the data, so it's kinda of client side
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
        };
    }
});