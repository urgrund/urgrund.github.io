<?php
include_once('header.php');


static $sites  = ["SLC", "WF", "M%"];
static $date = '20181001';
static $allSites = array();

class __Equipment
{
    var $id;
    var $function;
    var $tph;
    var $timeUsage;


    function __construct($_id, $_function)
    {
        $this->id = $_id;
        $this->function = $_function;
    }

    private function GenerateTPH()
    {
        global $date;
        $sqlTPH = "Select * from TonnesPerHour('" . $this->id . "', " . $date . ", 'TONNE')";
        $result = SQLUtils::QueryToText($sqlTPH);

        // If no data, return 
        if (count($result) == 0) {
            $this->tph = $result;
            return;
        }

        // Trim uneeded columns 
        for ($i = 0; $i < count($result); $i++) {
            for ($j = 0; $j < 2; $j++) {
                unset($result[$i][$j]);
            }
        }

        $result[0] = array_values($result[0]);
        $result[1] = array_values($result[1]);

        // Cumulative
        $cumulative = [];
        $cumulativeTemp = 0;
        for ($i = 0; $i < count($result[0]); $i++) {
            $cumulativeTemp += $result[1][$i];
            $cumulative[] = $cumulativeTemp;
        }

        $result[] = $cumulative;
        $this->tph = $result;
    }

    function GenerateData()
    {
        Debug::StartProfile("Equipment Data Generation");
        global $date;


        $this->GenerateTPH();

        // Put below in private function simlar to TPH
        $sqlTU = "Select * from EquipmentTimeUsage(" . $date . ",'" . $this->id . "')";
        $this->timeUsage = SQLUtils::QueryToText($sqlTU);
        Debug::EndProfile();
    }
}


class __Site
{
    var $key;
    var $name;
    var $tonnesPerHour;
    var $equipment = array();

    function __construct($_siteKey)
    {
        global $date;
        $this->key = $_siteKey;
        $sqlTxt = "Select * from ALLMineEquipmentList(" . $date . ", '" . $_siteKey . "')";
        $result = SQLUtils::QueryToText($sqlTxt);
        for ($i = 1; $i < count($result); $i++) {
            $this->equipment[] = new Equipment($result[$i][0], $result[$i][1]);
        }
    }

    function GenerateDataForAllEquipment()
    {
        if ($this->equipment != null) {
            for ($i = 1; $i < count($this->equipment); $i++) {
                $this->equipment[$i]->GenerateData();
            }
        }
    }
}






CreateEverything();


function SetDateForData($_date)
{
    $date = $_date;
}

function CreateSitesAndEquipmentList()
{
    Debug::StartProfile("Get All Sites and Equipment ID's");
    global $sites;
    global $allSites;
    for ($i = 0; $i < count($sites); $i++) {
        $p = new Site($sites[$i]);
        $allSites[] = $p;
    }
    Debug::EndProfile();
}

function CreateEquipDataForAllSites()
{
    Debug::StartProfile("Get All Data for All Equip");
    global $sites;
    global $allSites;
    for ($i = 0; $i < count($allSites); $i++) {
        $allSites[$i]->GenerateDataForAllEquipment();
    }
    Debug::EndProfile();
}

function CreateEverything()
{
    //session_start();

    // Check first if already generated
    // or out of date by some measure

    Debug::StartProfile("Create Everything");

    global $allSites;
    global $date;

    CreateSitesAndEquipmentList();
    CreateEquipDataForAllSites();

    // $getAllTPH = "Select * from ALLMetricPerHour('20181001', 'TONNE')";
    // $result = SQLUtils::QueryToText($getAllTPH);
    // print_r($allSites[0]);



    // Add some info at the end
    $allSites[] = array("DataDate" => $date, "LastUpdate" => new DateTime());
    $_SESSION["allSiteData"] = $allSites;

    Debug::EndProfile();
}




class CompanyDetails
{
    var $id;
    var $name;
}

class Company
{
    var $details;
    function __construct()
    {
        $this->details = new CompanyDetails();
    }
}
