<?php
include_once('header.php');

/** Final object with all generated data
 * for the last time the day was created **/
static $allSites = array();


// The global list of all equipment
static $allEquipment = array();



static $sites  = ["SLC", "WF", "M%"];
static $date = '20181010';



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
if (Debug::enabled() == true) {
    //CreateSiteData::Run();
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


        // Get the SQL data we need first
        CreateSQLResults();

        // Generate the sites and equipment
        CreateSitesAndEquipment();

        // Generate data 
        CreateDataForAllSites();
        CreateDataForAllEquip();

        // Make a list of all equipment
        AddGlobalEquipList();

        // Wrap up and submit
        AddMetaData();

        //Debug::Log($allSites[2]);


        Debug::EndProfile();
    }
}

// ------------------------------------------------------------------





// ------------------------------------------------------------------
static $sqlMetricPerHour;
static $sqlEquipEventList;

// Fetch the SQL results first so that 
// all other functions can use the results
function CreateSQLResults()
{
    Debug::StartProfile("Create SQL Results");
    global $date;

    global $sqlMetricPerHour;

    $sqlTxt = "Select * from ALLMetricPerHour(" . $date  . ")"; //," . "' TONNE')";

    $sqlMetricPerHour = SQLUtils::QueryToText($sqlTxt);


    global $sqlEquipEventList;
    $sqlTxt = "Select * from ALLEquipmentEventList(" . $date . ") order by[Equipment] asc, [Event Time] asc";
    $sqlEquipEventList = SQLUtils::QueryToText($sqlTxt);

    Debug::EndProfile();
}
// ------------------------------------------------------------------





// ------------------------------------------------------------------
// Add equipment to global total list and then 
// reduce the data in the Sites for more compact result
function AddGlobalEquipList()
{
    global $allSites;
    global $allEquipment;
    for ($i = 0; $i < count($allSites); $i++) {
        for ($j = 0; $j < count($allSites[$i]->equipment); $j++) {
            $equip = $allSites[$i]->equipment[$j];
            $allEquipment[$equip->id] = $equip;

            // Nuke the sites equip list 
            $allSites[$i]->equipment[$j] = $equip->id;
        }
    }
    $allSites[] = $allEquipment;
}
// ------------------------------------------------------------------





// ------------------------------------------------------------------
// Timestamp for when this stie data was generated
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

    $allSites[] = array(
        "Day" => $day,
        "Date" => $date, //$d->format('d-m-Y'),
        "LastUpdate" => $updateTime,
        "IP" => GetClientIP(),  // the client IP that generated this data
        "User" => "User",   // the user that generated this data
        "Version" => Version::current()
    );
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
    Debug::StartProfile("Create Sites");

    global $allSites;
    global $date;
    global $sqlEquipEventList;

    global $allEquipment;

    //$sqlTxt = "Select * from ALLEquipmentEventList(" . $date . ") order by[Equipment] asc, [Event Time] asc";
    $result = $sqlEquipEventList; //SQLUtils::QueryToText($sqlTxt);

    // IDEA - this array could be a per client object

    $allSites["SLC"] = new Site("SLC", "Sub Level Caves");
    $allSites["WF"] = new Site("WF", "Western Flanks");
    $allSites["M%"] = new Site("M%", "M-Reefs");
    //$allSites["MISC"] = new Site("MISC", "Workshop");




    Debug::StartProfile("PHP For Sites");

    // For each result, get unique equipment 
    // and their event data 
    $tempEquip = array();
    $currEventCount = 0;
    $totalEquipCount = 0;
    $currMineArea = "MISC";


    // Create a list of all equip and their events 
    for ($i = 1; $i < count($result); $i++) {

        // The mine area for this equip
        // Default to MISC
        $currMineArea = "MISC";
        if ($result[$i][4] != "MISC")
            $currMineArea = $result[$i][4];

        if (1 === preg_match('~[0-9]~', $currMineArea))
            $currMineArea = "M%";

        // Create Equip objects and add events 
        if (!isset($tempEquip[$result[$i][0]]))
            $tempEquip[$result[$i][0]] = new Equipment($result[$i][0]);
        $tempEquip[$result[$i][0]]->AddEvent($result[$i]);

        if ($currMineArea != "MISC")
            $tempEquip[$result[$i][0]]->sites[] = $currMineArea;
    }



    foreach (array_keys($tempEquip) as $id) {
        // Turns the sites this equip belongs to from assoc->numeric
        $tempEquip[$id]->sites = array_values(array_unique($tempEquip[$id]->sites));

        // Add this equip to each site it has visited        
        $sites  = $tempEquip[$id]->sites;

        for ($i = 0; $i < count($sites); $i++) {
            // At the moment, only accepting the manually
            // created keys in allSites, but there are other 
            // types (Null, SP) that come through... what
            // to do about these?
            if (array_key_exists($sites[$i], $allSites)) {
                if ($allSites[$sites[$i]] != null)
                    $allSites[$sites[$i]]->AddEquipment($tempEquip[$id]);
            }
        }
    }


    // Remove associative keys to make it 
    // a lot easier client side to iterate
    $tempAllSites = [];
    $count = 0;
    foreach ($allSites as $key => $value) {
        $tempAllSites[$count] = $value;
        $count++;
    }
    $allSites = $tempAllSites;

    // Turn array to index based
    // for ($i = 0; $i < count($allSites); $i++) {
    //     $allSites[$i]->DisassociateArrays();
    // }
    Debug::EndProfile();


    Debug::EndProfile();
}
// ------------------------------------------------------------------




// ------------------------------------------------------------------
function CreateDataForAllSites()
{
    global $allSites;
    global $sqlMetricPerHour;

    Debug::StartProfile("Create All Site Data");

    // -------------------------------------
    // Production Tonnes for site
    Debug::StartProfile("PHP: Per-site TPH");

    // Production tonnes for each site
    for ($i = 1; $i < count($sqlMetricPerHour); $i++) {
        $act = $sqlMetricPerHour[$i][count($sqlMetricPerHour[$i]) - 1];

        // Only interested if this event was Production 
        if (preg_match("/production/i", $act)) {

            $currMineArea = "";
            $currMineArea = $sqlMetricPerHour[$i][1];

            if ($currMineArea == "M-Reefs")
                $currMineArea = "M%";

            // Check which site this event belongs to
            for ($j = 0; $j < count($allSites); $j++) {
                if ($allSites[$j]->key == $currMineArea) {

                    // Add to the site TPH 
                    for ($k = 0; $k < 24; $k++) {
                        $allSites[$j]->tph24->tph[$k] += $sqlMetricPerHour[$i][$k + 3];
                    }
                }
            }
        }
    }

    Debug::EndProfile();
    // -------------------------------------




    for ($i = 0; $i < count($allSites); $i++) {
        $allSites[$i]->DisassociateArrays();
    }


    // ----------------------
    // Material Movements 
    Debug::StartProfile("SQL: Mat Movement");
    Debug::Disable();
    //$sqlPath = "../assets/sql/mine/SP_MATERIAL_ALL_Bogging.sql";
    $sqlPath = "../assets/sql/mine/SP_MATERIAL_ALL_Sankey.sql";
    $sqlTxt = SQLUtils::FileToQuery($sqlPath);
    $result = SQLUtils::QueryToText($sqlTxt);
    Debug::Enable();
    Debug::EndProfile();

    Debug::StartProfile("PHP: Mat Movement");

    // WTF is this hack?!
    for ($i = 1; $i < count($result); $i++) {
        if ($result[$i][0] == "WF")
            $allSites[1]->materialMovement[] = $result[$i];

        if ($result[$i][0] == "SLC")
            $allSites[0]->materialMovement[] = $result[$i];

        if (1 === preg_match('~[0-9]~',  $result[$i][0]))
            $allSites[2]->materialMovement[] = $result[$i];
    }


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
    global $date;
    global $allSites;
    global $sqlMetricPerHour;


    //Debug::Log($sqlMetricPerHour);

    Debug::StartProfile("Create All Equip Data");



    Debug::StartProfile("PHP");

    // Make associative
    // $tphResults = array();
    // for ($i = 0; $i < count($result); $i++) {
    //     $tphResults[$result[$i][0]] = $result[$i];
    // }

    // -----------------
    Debug::StartProfile("PHP: TPH");
    // DEBUG
    // for ($i = 0; $i < count($allSites[0]->equipment); $i++) {
    //     if ($allSites[0]->equipment[$i]->id == "LH020") {
    //         $allSites[0]->equipment[$i]->GenerateMPH($sqlMetricPerHour);
    //     }
    // }

    foreach ($allSites as $key => $site) {
        for ($i = 0; $i < count($site->equipment); $i++) {
            $site->equipment[$i]->GenerateMPH($sqlMetricPerHour);
        }
    }
    Debug::EndProfile();
    // -----------------



    // -----------------
    Debug::StartProfile("PHP: UOFA");
    // DEBUG
    //for ($i = 0; $i < count($allSites[0]->equipment); $i++) {
    //if ($allSites[0]->equipment[0]->id == "BL085")
    //  $allSites[0]->equipment[0]->GenerateUofAFromEvents();
    //}

    foreach ($allSites as $key => $site) {
        for ($i = 0; $i < count($site->equipment); $i++) {
            $site->equipment[$i]->GenerateUofAFromEvents();
        }
    }
    Debug::EndProfile();
    // -----------------    



    // -----------------    
    // DEBUG
    // for ($i = 0; $i < count($allSites[0]->equipment); $i++) {
    //     if ($allSites[0]->equipment[$i]->id == "HL154")
    //         $allSites[0]->equipment[$i]->GenerateEventBreakDown();
    // }

    Debug::StartProfile("PHP: Event Break Down");
    foreach ($allSites as $key => $site) {
        for ($i = 0; $i < count($site->equipment); $i++) {
            $site->equipment[$i]->GenerateEventBreakDown();
            $site->equipment[$i]->GenerateShiftCallUps();
        }
    }
    Debug::EndProfile();
    // -----------------



    // -----------------    
    // DEBUG   

    // Debug::StartProfile("PHP: Site per-type totals");
    // foreach ($allSites as $key => $site) {
    //     $site->GeneratePerTypeTotals();
    // }
    // Debug::EndProfile();
    // -----------------



    Debug::EndProfile();
    Debug::EndProfile();

    //print_r($result);
}
