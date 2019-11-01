<?php

include_once('header.php');


abstract class EquipmentCategory
{
    const LOADING = 'Loading';
    const HAULING = 'Hauling';
    const P = 'P';
    const D = 'D';
}

$equipmentCategoryList = array(EquipmentCategory::LOADING, EquipmentCategory::HAULING, EquipmentCategory::D, EquipmentCategory::P);

/**
 * Contains information about a site
 * such as the equipment 
 */
class SiteInfo
{
    var $siteKey = "";
    var $siteName = "";
    var $siteTPH = array();
    var $siteEquipment = array();

    var $lastUpdateTime;

    public function Fill($_siteName, $_siteKey)
    {
        $this->siteKey = $_siteKey;
        $this->siteName = $_siteName;
        $this->lastUpdateTime = new DateTime('now');
        global $equipmentCategoryList;

        // Get the TPH for this site
        $sqlPath = "../assets/sql/SP_MINE_TonnesPerHour.sql";
        $sqlTxt = SQLUtils::FileToQuery($sqlPath);
        $sqlTxt = str_replace("SLC", $_siteKey, $sqlTxt);
        $tphResult = SQLUtils::QueryToText($sqlTxt);

        // TODO, this could be a utility function 
        // Trim off 'x' columns of the array 
        for ($i = 0; $i < count($tphResult); $i++) {
            for ($j = 0; $j < 3; $j++) {
                unset($tphResult[$i][$j]);
            }
        }

        $tphResult[0] = array_values($tphResult[0]);
        $tphResult[1] = array_values($tphResult[1]);
        $this->siteTPH = $tphResult;


        // Grab all equipment
        foreach ($equipmentCategoryList as $category) {
            $siteEquip = GetEquipmentForSite($_siteKey, $category);
            $siteEquip = json_decode($siteEquip);

            $tempEquipList = [];
            $index = 0;
            foreach ($siteEquip as $item) {
                if ($index > 0)
                    $tempEquipList[] = $item[0];
                $index++;
            }
            $this->siteEquipment[] = array($category => $tempEquipList);
        }

        json_encode($this->siteEquipment);
    }
}

// For a given site key and category, 
// collect all avilable equipment
function GetEquipmentForSite($_siteKey, $_equipCategory)
{
    $sqlPath = "../assets/sql/SP_MINELIST_MineEquipList.sql";
    $sqlTxt = SQLUtils::FileToQuery($sqlPath);

    // Inject variables
    $sqlTxt = str_replace("SLC", $_siteKey, $sqlTxt);
    $sqlTxt = str_replace("Loading", $_equipCategory, $sqlTxt);

    return SQLUtils::QueryToJSON($sqlTxt);
}


Debug::StartProfile("Get Sites");

$sqlPath = "";
$sqlTxt = "";

// Fetch site codes
$sqlPath = "../assets/sql/SP_MINELIST_MineCodes.sql";
$sqlTxt = SQLUtils::FileToQuery($sqlPath);
$allMineCodes = SQLUtils::QueryToText($sqlTxt);
unset($allMineCodes[0]);

// Fetch site titles
$sqlPath = "../assets/sql/SP_MINELIST_MineTitles.sql";
$sqlTxt = SQLUtils::FileToQuery($sqlPath);
$allMineTitles = SQLUtils::QueryToText($sqlTxt);
unset($allMineTitles[0]);
//print_r($allMineTitles);

$siteData = array();

// Collect equipment information
// from each site index
$index = 1;
foreach ($allMineTitles as $item) {
    $siteObj = new SiteInfo();
    $siteObj->Fill($item[0], $allMineCodes[$index][0]);
    $siteData[]  = $siteObj;
    $index++;
}

Debug::EndProfile();

echo json_encode($siteData);
