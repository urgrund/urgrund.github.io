$.noConflict();



// ----------------------------------------------------
// Globals
var shiftIsDay = 0;
var dataComplete = false;

//var assetIDThisPage;
var equipDataThisPage;

// enum for major groups
const MajorGroup = {
	IDLE: 'Idle',
	OPERATING: 'Operating',
	DOWN: 'Down'
}
// ----------------------------------------------------




// The NG app
var app = angular.module("myApp", ["ngRoute"]);

// Page router
app.config(
	function ($routeProvider)
	{
		$routeProvider
			.when("/", {
				templateUrl: "dash_mines.html",
				controller: 'MineRoute'
			})
			.when("/equip/:siteIndex/:equipIndex", {
				templateUrl: 'dash_equip.html',
				controller: 'EquipRoute'
			})
			.when("/Mines", {
				templateUrl: "dash_mines.html",
				controller: 'MineRoute'
			})
			.when('/abcdefg', {
				controller: 'BlaBla',
				templateUrl: function ()
				{
					// You can route to different templates
					return loggedIn ? "app/main/main-loggedIn.html" : "app/main/main-loggedOut.html"
				}
			});
	}
);


app.controller('DefaultRoute', function ($scope, $timeout) 
{

});


/// App entry 
app.controller('myCtrl', function ($scope, $interval, $timeout)
{
	// First run of the site
	console.log("[Entry Point : Init Everything]");

	// Default to day to start with
	shiftIsDay = 0;

	// This is all Menu stuff,  why is it here?
	var shiftDiv = document.getElementById("sicShiftTitle");
	var nightHTML = "<div class='shift-value'><i class='far fa-moon shift-value' ></i> Night</div>";
	var dayHTML = "<div class='shift-value'><i class='fas fa-cloud-sun shift-value'></i> Day</div>";


	// Consider for background updates of data
	$interval(function ()
	{
		console.log("Interval log...  every 30 seconds...");
	}, 30000);


	// Pull the main data from the server

	$scope.getSiteData = function (_date)
	{
		$.ajax({
			url: "php/get_site_data.php",
			type: "POST",
			data: { date: _date },
			dataType: 'json',
			success: function (data)
			{
				dataComplete = true;

				//console.log(data);
				//return;

				var jsonString = JSON.stringify(data);
				var newData = JSON.parse(jsonString);
				$scope.extraDates.push(newData);


				// Setup all data 
				$scope.companyName = "ABC Company";
				$scope.siteData = data.splice(0, data.length - 1);
				$scope.meta = data[data.length - 1];



				console.log("New Data : ");
				console.log($scope.siteData);
				console.log($scope.meta);

				$scope.$apply();
				$scope.$broadcast('dataComplete');

				//CreateMenuLinks();
			},
			error: function (xhr, ajaxOptions, thrownError)
			{
				console.log(xhr.status);
				console.log(thrownError);
			}
		});
	}

	$scope.getSiteData('20181010');

	$scope.switchShift = function ()
	{
		shiftDiv.innerHTML = shiftIsDay == 0 ? nightHTML : dayHTML;
		shiftIsDay = 1 - shiftIsDay;//!shiftIsDay;

		//$scope.$emit('updateShift');
		$scope.$broadcast('updateShiftEquip');
	}


	$scope.$on('child', function (event, data)
	{
		$scope.siteName = currentSite.name;
	});


	$scope.switchToExtraDate = function (index)
	{
		var jsonString = JSON.stringify($scope.extraDates[index]);
		var newData = JSON.parse(jsonString);

		$scope.siteData = newData.splice(0, newData.length - 1);
		$scope.meta = newData[newData.length - 1];
		console.log($scope.siteData);
		console.log($scope.meta);
		//$scope.$apply();
		$scope.$broadcast('dataComplete');
	}

	$scope.extraDates = [];

	var extraDateCurrIndex = 0;
	var extraDateVals = ['20181009', '20181008', '20181007', '20181006', '20181005', '20181004'];
	//var extraDateVals = ['20181009', '20181005'];
	var hasAllExtraDates = false;
	var gettingExtraDates = false;
	$scope.getSiteData2 = function ()
	{
		for (i = 0; i < extraDateVals.length; i++)
		{
			var dateToGet = extraDateVals[i];
			console.log("Getting extra date data for : " + dateToGet);
			$.ajax({
				url: "php/get_site_data.php",
				type: "POST",
				data: { date: dateToGet },
				dataType: 'json',
				success: function (data)
				{
					$scope.extraDates.push(data);
					$scope.$apply();
				},
				error: function (xhr, ajaxOptions, thrownError)
				{
					console.log(xhr.status);
					console.log(thrownError);
				}
			});
		}

		hasAllExtraDates = true;
	}

	$scope.$on('dataComplete', function (event, data)
	{
		if (gettingExtraDates == false)
		{
			gettingExtraDates = true;
			$scope.getSiteData2();
		}
	});
});




