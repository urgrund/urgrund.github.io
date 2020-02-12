

// NOT CURRENTLY USED

app.controller('Menu', function ($scope, $routeParams, $rootScope, $timeout) {

    console.log("MENU CONTROLLER");

    $scope.equipList = null;

    $scope.setupMenu = function () {
        var list = [];
        for (var key in $rootScope.equipment) {
            list.push($rootScope.equipment[key].id);
        }

        $scope.equipList = list;
        console.log(list);


        var fp = flatpickr('#test', {
            "minDate": new Date().fp_incr(1)
        });
        console.log(fp);

        return list;
    };

    $scope.$watch('$viewContentLoaded', function () {
        $timeout(function () {
            console.log("ASLKDJLASKDJLASKDJ");
            $scope.setupMenu();
        }, 100);
    });

    $rootScope.$on('newSiteDataSet', function () {
        $scope.setupMenu();
    });


    $scope.$on('updateShift', function (event, data) {
        $scope.setupMenu();
    });

});