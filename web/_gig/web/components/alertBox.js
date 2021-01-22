
/// ----------------------------------------
/// Alert Box
/// ----------------------------------------
app.component("alertBox", {
    templateUrl: 'components/alertBox.html',
    bindings: {
        alert: '<'
    },
    controller: function ($rootScope) {
        this.$onInit = function () {
            this.equipment = $rootScope.siteData[this.alert.siteIndex].equipment[this.alert.equipIndex];
            //console.log(this.equipment);
        };
    }
});
/// ----------------------------------------