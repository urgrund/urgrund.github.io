app.component("sectionTitle", {
    templateUrl: 'components/sectionTitle.html',
    bindings: {
        icon: '@',
        title: '@',
        right: '@'
    },
    controller: function ($rootScope) {
        this.$onInit = function () {
            //console.log(this.icon);
            //this.titleTxt = this.title;
            //this.rightTxt = this.right;
        };
    }
});