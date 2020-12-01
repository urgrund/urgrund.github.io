/*
    Section Title
    This manages the top banner that is seen on each 
    page.  Base on the page binding, the HTLM shown will
    be different.

    PRODUCTIVITY - The productivity page, splitting the view from compressed to expanded
    MONTHLY - Changes views from bucket to speed dials
*/
app.component("sectionTitle", {
    bindings: {
        icon: '@',
        title: '@',
        right: '@',
        page: '@'
    },
    templateUrl: 'components/sectionTitle.html',
    controller: function ($rootScope) {
        this.$onInit = function () {
        };
    }
});