<?php
include_once('header.php');

/** Final object with all generated data
 * for the last time the day was created **/
static $allSites = array();
static $allEquipment = array();
static $date = '20181010';




// Holds the resulting data 
// from the core SQL queries
static $sqlMetricPerHour;
static $sqlEquipEventList;
static $sqlMineEquipmentList;




// Maps datetime day to full day name
static $dayNameMap = array(
    "Mon" => "Monday",
    "Tue" => "Tuesday",
    "Wed" => "Wednesday",
    "Thu" => "Thursday",
    "Fri" => "Friday",
    "Sat" => "Saturday",
    "Sun" => "Sunday"
);



// Maps the SQL metric to a 'friendly' name
static $metricMap = array(
    "FACEMETRE" => "Face Metres",
    "INSMESHSTROVRLAP" => "Mesh Metres",
    "INSMESHGALVL" => "Install Mesh",
    "INSMESHGALV" => "Install Mesh",
    "TOTALBOLTS" => "Bolts",
    "TOTGSMTR" => "Ground Support Metres",
    "TOTOTHERMTRS" => "Jumbo Metres",
    "TONNE" => "Tonnes",
    "PRODMTRSDRILL" => "Production Metres"
);



// ------------------------------------------------------------------
// ENTRY POINT

// Uncomment this to run directly from this file
//Debug::Enable();
if (Debug::enabled() == true) {
    CreateSiteData::Run();
}


class CreateSiteData
{
    public static function SetDateForCreation($_date)
    {
        global $date;
        $date = $_date;
    }

    public static function Run()
    {
        Debug::StartProfile("TOTAL SITE GENERATION");

        // Clean for each run 
        global $allSites;
        global $allEquipment;

        $allSites = array();
        $allEquipment = array();

        // Config instance 
        new Config();

        // Get the SQL data we need first
        CreateSQLResults();



        // Generate Sites and Equipment
        CreateSitesAndEquipment();

        // Generate the data 
        CreateDataForAllSites();
        CreateDataForAllEquip();



        // Make arrays numeric based for both 
        // the site lists inside a Mine Site 
        // and the Mine Site array as well 
        //$tempAllSites = [];
        //$count = 0;
        foreach (array_keys($allSites) as $site) {
            $allSites[$site]->MakeArraysNumeric();
            $tempAllSites[] = $allSites[$site];
            //$count++;
        }
        $allSites = $tempAllSites;

        //$allSites[] = 

        // Make a list of all equipment
        //AddGlobalEquipList();
        $allSites[] = $allEquipment;

        // Wrap up and submit
        AddMetaData();

        //Debug::Log($allSites[0]->equipment);


        Debug::EndProfile();

        Debug::Log("Finished...");
    }
}

// ------------------------------------------------------------------





// ------------------------------------------------------------------





// Fetch the SQL results first so that 
// all other functions can use the results
function CreateSQLResults()
{
    Debug::StartProfile("Create SQL Results");
    global $date;
    global $sqlMetricPerHour;
    global $sqlEquipEventList;
    global $sqlMineEquipmentList;

    // ------------------------------------------------------------------------------------------
    // All metrics per hour for this date
    $sqlTxt = SQLUtils::FileToQuery('..\assets\sql\Core\ALL_MetricPerHour.sql');
    $sqlTxt = str_replace('@Date', "'" . $date . "'", $sqlTxt);
    $sqlMetricPerHour = SQLUtils::QueryToText($sqlTxt, "All Metric");
    // Sanitize null values 
    for ($i = 0; $i < count($sqlMetricPerHour); $i++) {
        for ($j = 0; $j < count($sqlMetricPerHour[$i]); $j++)
            if ($j > 3 && ($sqlMetricPerHour[$i][$j] == null))
                $sqlMetricPerHour[$i][$j] = 0;
    }
    //Debug::Log($sqlMetricPerHour[0]);
    // ------------------------------------------------------------------------------------------


    // ------------------------------------------------------------------------------------------
    // All events that have been logged for this date
    $sqlTxt = SQLUtils::FileToQuery('..\assets\sql\Core\ALL_EquipmentEventList.sql');
    $sqlTxt = str_replace('@Date', "'" . $date . "'", $sqlTxt);
    //$sqlTxt = "Select * from ALLEquipmentEventList(" . $date . ") order by[Equipment] asc, [Event Time] asc";
    $sqlEquipEventList = SQLUtils::QueryToText($sqlTxt, "Event List");
    // ------------------------------------------------------------------------------------------


    // ------------------------------------------------------------------------------------------
    // All the equipment of the entire mine
    $sqlTxt = SQLUtils::FileToQuery('..\assets\sql\Core\ALL_MineEquipmentList.sql');
    $sqlTxt = str_replace('@Date', "'" . $date . "'", $sqlTxt);
    $sqlMineEquipmentList = SQLUtils::QueryToText($sqlTxt, "All Mine Equip", false);

    // Set the asset ID as the index
    $new_array = [];
    foreach ($sqlMineEquipmentList as $value)
        $new_array[$value[0]] = $value;
    $sqlMineEquipmentList = $new_array;
    //Debug::Log($new_array);
    // ------------------------------------------------------------------------------------------

    Debug::EndProfile();
}
// ------------------------------------------------------------------





// ------------------------------------------------------------------
// Add equipment to global total list and then 
// reduce the data in the Sites for more compact result
//function AddGlobalEquipList()
//{
// global $allSites;
// global $allEquipment;
// for ($i = 0; $i < count($allSites); $i++) {
//     for ($j = 0; $j < count($allSites[$i]->equipment); $j++) {
//         $equip = $allSites[$i]->equipment[$j];
//         $allEquipment[$equip->id] = $equip;

//         // Nuke the sites equip list 
//         $allSites[$i]->equipment[$j] = $equip->id;
//     }
// }
// $allSites[] = $allEquipment;
//}
// ------------------------------------------------------------------





// ------------------------------------------------------------------
/** Information related to this dates data generation as well **/
function AddMetaData()
{
    global $date;
    global $allSites;
    global $dayNameMap;

    $d = DateTime::createFromFormat('Ymd', $date);
    $day = $dayNameMap[$d->format('D')];

    $updateTime = new DateTime();
    $timezone = new DateTimeZone('Asia/Singapore');
    $updateTime->setTimezone($timezone);

    // Append the array
    $allSites[] = array(
        "Day" => $day,
        "Date" => $date, //$d->format('d-m-Y'),
        "LastUpdate" => $updateTime, // $updateTime->format('d-m-Y'),
        "IP" => GetClientIP(),  // the client IP that generated this data
        "User" => "User",   // the user that generated this data
        "Version" => Version::current(),
        "EquipmentFunctionMap" => GetEquipmentFunctionMap()
    );
}

/** Array to map function to a descriptive name for front end  **/
function GetEquipmentFunctionMap()
{
    $tmp = array();
    global $sqlMineEquipmentList;
    foreach (array_keys($sqlMineEquipmentList) as $id) {
        $tmp[$sqlMineEquipmentList[$id][1]] = $sqlMineEquipmentList[$id][2];
    }
    return $tmp;
    //Debug::Log($sqlMineEquipmentList);
}

function GetClientIP()
{
    $ipaddress = '';
    if (isset($_SERVER['HTTP_CLIENT_IP']))
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    else if (isset($_SERVER['HTTP_X_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    else if (isset($_SERVER['HTTP_X_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    else if (isset($_SERVER['HTTP_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    else if (isset($_SERVER['HTTP_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    else if (isset($_SERVER['REMOTE_ADDR']))
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}
// ------------------------------------------------------------------




// ------------------------------------------------------------------
function CreateSitesAndEquipment()
{
    Debug::StartProfile("PHP Create Sites");

    global $allSites;
    global $allEquipment;
    global $date;

    global $sqlEquipEventList;
    global $sqlMetricPerHour;



    //$result = $sqlEquipEventList;


    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // -------------------------------------------------------
    // TEST MATT NEW

    // Generate the Mine Sites for this day
    // This is filtered based on the client config
    $allSites = array();
    foreach (array_keys(Config::$instance->resultSites) as $id) {
        if (Config::Sites($id) != "")
            $allSites[Config::Sites($id)] = "";
    }

    foreach (array_keys($allSites) as $id) {
        $allSites[$id] = new Site($id);
    }

    // Create a list of all equip and their events 
    $tempEquip = array();
    for ($i = 1; $i < count($sqlEquipEventList); $i++) {
        $eID = $sqlEquipEventList[$i][0];
        $eSiteName = $sqlEquipEventList[$i][4];
        $eSiteName = Config::Sites($eSiteName);

        // Create equipment if it doesn't exist
        if (!isset($tempEquip[$eID]))
            $tempEquip[$eID] = new Equipment($sqlEquipEventList[$i][0]);

        // Add the events site name to the list of sites this equipment visited
        if ($eSiteName != '')
            $tempEquip[$eID]->sites[] = $eSiteName;

        $tempEquip[$eID]->AddEvent($sqlEquipEventList[$i]);
    }

    // Turns the sites this equip belongs to from assoc->numeric
    foreach (array_keys($tempEquip) as $id) {
        $tempEquip[$id]->sites = array_values(array_unique($tempEquip[$id]->sites));
    }

    $allEquipment = $tempEquip;
    //Debug::Log($tempEquip['BL085']->events);

    Debug::EndProfile();

    return;

    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------




    // For each result, get unique equipment 
    // and their event data 
    // $tempEquip = array();
    // $currEventCount = 0;
    // $totalEquipCount = 0;
    // $currMineArea = "MISC";


    // // Create a list of all equip and their events 
    // for ($i = 1; $i < count($result); $i++) {

    //     // The mine area for this equip
    //     // Default to MISC
    //     $currMineArea = "MISC";
    //     if ($result[$i][4] != "MISC")
    //         $currMineArea = $result[$i][4];

    //     if (1 === preg_match('~[0-9]~', $currMineArea))
    //         $currMineArea = "M%";

    //     // Create Equip objects and add events 
    //     if (!isset($tempEquip[$result[$i][0]]))
    //         $tempEquip[$result[$i][0]] = new Equipment($result[$i][0]);
    //     $tempEquip[$result[$i][0]]->AddEvent($result[$i]);

    //     if ($currMineArea != "MISC")
    //         $tempEquip[$result[$i][0]]->sites[] = $currMineArea;
    // }



    // foreach (array_keys($tempEquip) as $id) {
    //     // Turns the sites this equip belongs to from assoc->numeric
    //     $tempEquip[$id]->sites = array_values(array_unique($tempEquip[$id]->sites));

    //     // Add this equip to each site it has visited        
    //     $sites  = $tempEquip[$id]->sites;

    //     for ($i = 0; $i < count($sites); $i++) {
    //         // At the moment, only accepting the manually
    //         // created keys in allSites, but there are other 
    //         // types (Null, SP) that come through... what
    //         // to do about these?
    //         if (array_key_exists($sites[$i], $allSites)) {
    //             if ($allSites[$sites[$i]] != null)
    //                 $allSites[$sites[$i]]->AddEquipment($tempEquip[$id]);
    //         }
    //     }
    // }


    // // Remove associative keys to make it 
    // // a lot easier client side to iterate
    // $tempAllSites = [];
    // $count = 0;
    // foreach ($allSites as $key => $value) {
    //     $tempAllSites[$count] = $value;
    //     $count++;
    // }
    // $allSites = $tempAllSites;


    //Debug::EndProfile();
}
// ------------------------------------------------------------------




// ------------------------------------------------------------------
function CreateDataForAllSites()
{
    global $allSites;
    global $sqlMetricPerHour;



    // -------------------------------------
    // Production Tonnes for site
    Debug::StartProfile("PHP: Per-mine Data");

    // Production tonnes for each site
    for ($i = 1; $i < count($sqlMetricPerHour); $i++) {
        $activity = $sqlMetricPerHour[$i][3];
        $siteName = Config::Sites($sqlMetricPerHour[$i][1]);

        // Only interested if the activity was Production 
        if ($siteName != null || $siteName != '') {
            if (preg_match("/production/i", $activity)) {

                // TODO - this is used a few times, so maybe a site wide static config?
                $metricIndexOffset = 4;
                foreach (array_keys($allSites) as $site) {
                    for ($k = 0; $k < 24; $k++) {
                        $allSites[$site]->tph24->tph[$k] += $sqlMetricPerHour[$i][$k + $metricIndexOffset];
                    }
                }
            }
        }
    }
    Debug::EndProfile();


    Debug::StartProfile("SQL Material Movements");
    foreach (array_keys($allSites) as $site) {
        $allSites[$site]->GenerateMaterialMovements();
    }
    //Debug::Log($allSites["Western Flanks"]->shiftData[0]->materialMovements);
    Debug::EndProfile();


    return;
    // -------------------------------------






    Debug::StartProfile("Create All Site Data");
    // ----------------------
    // Material Movements 
    // Debug::StartProfile("SQL: Mat Movement");
    // Debug::Disable();

    // $sqlPath = "../assets/sql/mine/SP_MATERIAL_ALL_Sankey.sql";
    // $sqlTxt = SQLUtils::FileToQuery($sqlPath);
    // $result = SQLUtils::QueryToText($sqlTxt);
    // Debug::Enable();
    // Debug::EndProfile();

    // Debug::StartProfile("PHP: Mat Movement");

    // // WTF is this hack?!
    // for ($i = 1; $i < count($result); $i++) {
    //     if ($result[$i][0] == "WF")
    //         $allSites[1]->materialMovement[] = $result[$i];

    //     if ($result[$i][0] == "SLC")
    //         $allSites[0]->materialMovement[] = $result[$i];

    //     if (1 === preg_match('~[0-9]~',  $result[$i][0]))
    //         $allSites[2]->materialMovement[] = $result[$i];
    // }


    // ----------------------
    // TPH and total Availability of Site

    // For each site, for each equipment, sum the TPH
    // of each hour of both shifts into a 24hr summary
    for ($i = 0; $i < count($allSites); $i++) {
        for ($j = 0; $j < count($allSites[$i]->equipment); $j++) {
            $equip = $allSites[$i]->equipment[$j];

            // For each shift
            for ($k = 0; $k < 2; $k++) {

                // Get the Operating/Idle/Down % from each event
                for ($z = 0; $z < count($equip->shiftData[$k]->uofa); $z++) {

                    $uofaI = ($k * 12) + $z;

                    $event = $equip->shiftData[$k]->uofa[$z];
                    $allSites[$i]->uoaf24[0][$uofaI] += $event->operating / 3600;
                    $allSites[$i]->uoaf24[1][$uofaI] += $event->idle / 3600;
                    $allSites[$i]->uoaf24[2][$uofaI] += $event->down / 3600;
                }
            }
        }
        //Debug::Log($allSites[$i]->uoaf24[0]);
    }
    Debug::EndProfile();

    Debug::EndProfile();
}
// ------------------------------------------------------------------




// ------------------------------------------------------------------
function CreateDataForAllEquip()
{
    global $allEquipment;

    Debug::StartProfile("PHP: All Equipment Data");
    foreach ($allEquipment as $key => $equip) {
        //if ($key == 'BL085') {
        //Debug::Log("Generating " . $key);
        $equip->GenerateMPH();
        $equip->GenerateUofAFromEvents();
        $equip->GenerateEventBreakDown();
        $equip->GenerateShiftCallUps();
        //}
    }

    Debug::EndProfile();
    //Debug::Log($allEquipment['BL085']->shiftData[0]->events);
    //Debug::Log($allEquipment['BL085']);
    //Debug::Log($allEquipment['BP019']);
    //Debug::Log($allSites['Sub Level Caves']);
    return;



    //Debug::StartProfile("Create All Equip Data");
    //Debug::StartProfile("PHP");

    // Make associative
    // $tphResults = array();
    // for ($i = 0; $i < count($result); $i++) {
    //     $tphResults[$result[$i][0]] = $result[$i];
    // }

    // -----------------
    //Debug::StartProfile("PHP: TPH");
    // DEBUG
    // for ($i = 0; $i < count($allSites[0]->equipment); $i++) {
    //     if ($allSites[0]->equipment[$i]->id == "LH020") {
    //         $allSites[0]->equipment[$i]->GenerateMPH($sqlMetricPerHour);
    //     }
    // }

    // foreach ($allSites as $key => $site) {
    //     for ($i = 0; $i < count($site->equipment); $i++) {
    //         $site->equipment[$i]->GenerateMPH();
    //     }
    // }
    // Debug::EndProfile();
    // -----------------



    // -----------------
    //Debug::StartProfile("PHP: UOFA");
    // DEBUG
    //for ($i = 0; $i < count($allSites[0]->equipment); $i++) {
    //if ($allSites[0]->equipment[0]->id == "BL085")
    //  $allSites[0]->equipment[0]->GenerateUofAFromEvents();
    //}

    // foreach ($allSites as $key => $site) {
    //     for ($i = 0; $i < count($site->equipment); $i++) {
    //         $site->equipment[$i]->GenerateUofAFromEvents();
    //     }
    // }
    // Debug::EndProfile();
    // -----------------    



    // -----------------    
    // DEBUG
    // for ($i = 0; $i < count($allSites[0]->equipment); $i++) {
    //     if ($allSites[0]->equipment[$i]->id == "HL154")
    //         $allSites[0]->equipment[$i]->GenerateEventBreakDown();
    // }

    // Debug::StartProfile("PHP: Event Break Down");
    // foreach ($allSites as $key => $site) {
    //     for ($i = 0; $i < count($site->equipment); $i++) {
    //         $site->equipment[$i]->GenerateEventBreakDown();
    //         $site->equipment[$i]->GenerateShiftCallUps();
    //     }
    // }
    // Debug::EndProfile();
    // -----------------



    // -----------------    
    // DEBUG   

    // Debug::StartProfile("PHP: Site per-type totals");
    // foreach ($allSites as $key => $site) {
    //     $site->GeneratePerTypeTotals();
    // }
    // Debug::EndProfile();
    // -----------------



    // Debug::EndProfile();
    // Debug::EndProfile();

    //print_r($result);
}
