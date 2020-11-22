$.noConflict();

jQuery(document).ready(function ($)
{

	"use strict";

	[].slice.call(document.querySelectorAll('select.cs-select')).forEach(function (el)
	{
		new SelectFx(el);
	});

	jQuery('.selectpicker').selectpicker;


	$('#menuToggle').on('click', function (event)
	{
		$('body').toggleClass('open');
	});

	$('.search-trigger').on('click', function (event)
	{
		event.preventDefault();
		event.stopPropagation();
		$('.search-trigger').parent('.header-left').addClass('open');
	});

	$('.search-close').on('click', function (event)
	{
		event.preventDefault();
		event.stopPropagation();
		$('.search-trigger').parent('.header-left').removeClass('open');
	});



	$(function ()
	{
		$('.datepicker').datepicker({
			format: 'mm-dd-yyyy'
		});
	});

});


// var currentSite =
// {
//     name = "poo",
//     time = "1"
// }
var currentSite = "";
var currentCompany = "Some Company";
var currentDataForDate;

var app = angular.module("myApp", ["ngRoute"]);

app.config(
	function ($routeProvider)
	{
		$routeProvider
			.when("/", {
				templateUrl: "sitedash.html",
				controller: function ($scope)
				{
					//DecorateSitePage($scope, "Site A");
				}
			})
			.when("/Equip/:topicId", {
				templateUrl: 'equipdash.html',
				controller: function ($scope)
				{ console.log("LKSADJLAKSJDAJSD"); }
			});
		// 	.when("/siteA", {
		// 		templateUrl: "sitedash.html",
		// 		controller: function ($scope) { DecorateSitePage($scope, "Site A"); }
		// 	})
		// 	.when("/siteB", {
		// 		templateUrl: "sitedash.html",
		// 		controller: function ($scope) { DecorateSitePage($scope, "Site B"); }
		// 	});
	}
);

function DecorateSitePage($scope, siteName)
{
	$scope.companyName = currentCompany;
	$scope.siteName = siteName;
	currentSite = siteName;

	$scope.$emit('child', "bla");

	CreateBoggerGraphs('chartA');
	CreateBoggerGraphs('chartB');

	CreateRadarGraph('chartC');
	CreateRadarGraph('chartD');
}



/// 
app.controller('myCtrl', function ($scope)
{
	$scope.$on('child', function (event, data)
	{
		$scope.siteName = currentSite.name;
	});

	$scope.$on('siteUpdate', function (event, data)
	{
		$scope.sites = currentDataForDate;
	});

});



// Collects the details of this company
// such as number of sites, equipment... 
app.controller('menu_sites', function ($scope, $http)
{

	// This should be high highest level ngcontroller
	// with everything else emitting a call upwards
	// so when it's complete there will be sitewide
	// update to any new data pulled
	$http.get("php/menu_get_sites.php")
		.then(function (response)
		{
			$scope.sites = response.data;
			menuLoaderDiv.style.display = "none";
			currentDataForDate = response.data;
			$scope.$emit('siteUpdate', response.data);
		});


	$http.get("php/menu_get_company.php")
		.then(function (response)
		{
			$scope.companyName = response.data.companyName;
		});
});
