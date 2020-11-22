<?php

include 'QueryToJSON.php';


abstract class EquipmentCategory
{
    const LOADING = 'Loading';
    const HAULING = 'Hauling';
    const P = 'P';
    const D = 'D';
}
/**
 * Contains information about a site
 * such as the equipment 
 */
class SiteInfo
{
    var $siteKey = "";
    var $siteName = "";
    var $siteEquipment = array();

    var $lastUpdateTime;

    public function Fill($_siteName, $_siteKey)
    {
        $this->siteKey = $_siteKey;
        $this->siteName = $_siteName;

        $this->lastUpdateTime = new DateTime('now');

        // Not a very scalable approach
        if (strpos($_siteKey, 'are') !== false)
            $_siteKey = "M%";

        $siteEquip = GetEquipmentForSite($_siteKey, EquipmentCategory::LOADING);
        $siteEquip = json_decode($siteEquip);
        $index = 0;
        foreach ($siteEquip as $item) {
            if ($index > 0)
                $this->siteEquipment[] = $item[0];
            $index++;
        }
        json_encode($this->siteEquipment);

        // Old code to randomly create
        //print_r($siteEquip);
        // for ($x = 0; $x <= rand(4, 7); $x++) {
        //     $eName = "LH20";
        //     $this->siteEquipment[$x] = $eName . strval($x + 1);
        // }
    }
}

function GetEquipmentForSite($_siteKey, $_equipCategory)
{
    //print_r($_siteKey);
    //print_r($_equipCategory);

    // TODO - get these from files instead
    $sqlSiteEquipment = "-- This query is to get the Equipment Names for a selected Mine [MINE START] doing a particular activity type [PRIMARY / SECONDARY ACTIVITY TYPE].
-- Created by David Hollingsworth 05/04/2019 
DECLARE @MINENAME AS VARCHAR(8), @SelectedDate AS VARCHAR(8), @DateShift AS VARCHAR(2), @QueryDate AS VARCHAR(10), @PrimActivityType as varchar(16), @SecActivityType as varchar(16)


SET @SelectedDate = '20181205'
SET @DateShift = 'P1'
SET @MINENAME = '" . $_siteKey . "'						-- Variables are SLC, WF, M% (% This is wild character) 
SET @PrimActivityType = '" . $_equipCategory . "'			-- Variables are LOADING, (Boggers), HAULING (Haul Trucks), P (Production Drilling), D (Development Drilling / jumbos)

SET @QueryDate = @SelectedDate + @DateShift

Select 
	 [Equipment]	

FROM [dbo].[View_OverView]

Where [Shift] Like @QueryDate 
	and [Primary Activity Type] = @PrimActivityType 
	AND [Mine Start] like @MINENAME
	and [Mine Start] <> 'MISC'

Group by 
	 [Equipment]

Order By sum([Value]) Desc";

    return QueryToJSON($sqlSiteEquipment);
}






// TODO - get these from files instead

$sqlSiteNames =
    "    
Select 
	Case When [Mine Start] = 'SLC' Then 'SLC'
		When [Mine start] = 'WF' Then 'Western Flanks'
        When left ([mine start],1) = 'M' Then 'M Reefs' 
		Else 'Unknown Mine name' end as 'Mine Names'
	--,sum([value]) as 'Total Tonnes' Uncomment this if we want the tonnes'
FROM [dbo].[View_OverView]
Where [dbo].[View_OverView].[Shift] Like '20181001%' and [Measure code]= 'TONNE' and [Primary Activity Type] = 'Loading' and [Secondy Activity Type] like '%Production%'
Group by 
Case When [Mine Start] = 'SLC' Then 'SLC'
		When [Mine start] = 'WF' Then 'Western Flanks'
        When left ([mine start],1) = 'M' Then 'M Reefs' 
		Else 'Unknown Mine name' end

Order By sum([Value]) Desc
    ";

$slqSiteKeys = " Select 
	[Mine Start] as 'Mine Names'
	--,sum([value]) as 'Total Tonnes' Uncomment this if we want the tonnes'
FROM [dbo].[View_OverView]
Where [dbo].[View_OverView].[Shift] Like '20181001%' and [Measure code]= 'TONNE' and [Primary Activity Type] = 'Loading' and [Secondy Activity Type] like '%Production%'
Group by [Mine Start]

Order By sum([Value]) Desc";


//$allSiteNames = array();
//$allSiteKeys = array();
$allSiteNames = QueryToJSON($sqlSiteNames, false);
$allSiteKeys = QueryToJSON($slqSiteKeys, false);


$siteData = array();
$jsonDecode = json_decode($allSiteNames);
$jsonDecodeKeys = json_decode($allSiteKeys);


$index = 0;
foreach ($jsonDecode as $item) { //foreach element in $arr    
    //print_r($item[0]);
    $siteObj = new SiteInfo();
    $siteObj->Fill($item[0], $jsonDecodeKeys[$index][0]);
    $siteData[]  = $siteObj;
    $index++;
}


echo json_encode($siteData);


// $csvData = array("Site A", "Site B", "Site C");

// for ($x = 0; $x <= rand(4, 7); $x++) {
//     $sName = "Site ";
//     $csvData[$x] = $sName . strval($x + 1);
// }


// $siteArray = array();

// for ($x = 0; $x <= rand(2, 5); $x++) {
//     $sName = "Site ";
//     $fullName = $sName . strval($x + 1);
//     $siteObj = new SiteInfo();
//     $siteObj->Fill($fullName);
//     $siteArray[$x] = $siteObj;
// }

//echo json_encode($siteArray);
//echo json_encode($csvData);
