// Collects the details of this company
// such as number of sites, equipment... 
app.controller('menu_sites', function ($scope, $rootScope, $http)
{
    console.log("Menu Controller...");


    $scope.$on('dataComplete', function (event, data)
    {
        console.log("Hooking up menu links...");
        $(".menu-caret").on('click', function (event)
        {
            event.stopPropagation();
            event.stopImmediatePropagation();
            $(this).next(".nested").slideToggle(150);
        });
    });

    $scope.SwitchShift = function ()
    {
        document.getElementById("shiftTitle").innerHTML = shiftIsDay == 0 ? dayHTML : nightHTML;
        shiftIsDay = 1 - shiftIsDay;//!shiftIsDay;
        $scope.$emit('updateShift');
    }

    $scope.openAdjTargets = function ()
    {
        console.log("Opening Adjust Targets Form");
        //modal.style.display = "block";
        $rootScope.$broadcast('open');
        //adjTargetChart.resize();
    }


    $scope.openReportFirstCallUp = function (id)
    {
        console.log("Opening First Call Up");
        //console.log(id);
        $rootScope.$broadcast('openFirstCallUp', id);
    }

});