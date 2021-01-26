/// ----------------------------------------
/// Drill Down Chart Container
/// ----------------------------------------
app.component("drillDownChart", {
    templateUrl: 'components/drillDownChart.html',
    bindings: {
        name: '@',
        chart: '@',
        //blank: '@'
    },
    controller: function ($rootScope) {
        this.$onInit = function () {
            //console.log(this.blank);
        };

        //this.root = $rootScope;
    }
});
/// ----------------------------------------

