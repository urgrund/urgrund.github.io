<?php
include_once('header.php');

/** Final object with all generated data
 * for the last time the day was created **/
static $allSites = array();
static $allEquipment = array();
static $date = '20181002';

static $generationStartTime;


// Holds the resulting data 
// from the core SQL queries
static $sqlMetricPerHour;
static $sqlEquipEventList;
static $sqlMineEquipmentList;
static $sqlMaterialMovements;



// ------------------------------------------------------------------
// ENTRY POINT

// Uncomment this to run directly from this file
//Debug::Enable();
if (Debug::enabled() == true) {
    CreateSiteData::Run();
}


/**   
 * Generates data for a given date for all 
 * equipment at all locations
 * @author Matthew Bell 2020  
 */
final class CreateSiteData
{
    const INDEX_EQUIP = 2;

    public static function SetDateForCreation($_date)
    {
        global $date;
        $date = $_date;
    }

    public static function Run()
    {
        Debug::StartProfile("TOTAL SITE GENERATION");

        global $generationStartTime;
        $generationStartTime = microtime(true);

        // Clean for each run 
        global $allSites;
        global $allEquipment;

        $allSites = array();
        $allEquipment = array();

        // Config instance 
        new Config();

        CreateSiteData::CreateSQLResults();
        CreateSiteData::CreateSitesAndEquipment();
        CreateSiteData::CreateDataForAllSites();
        CreateSiteData::CreateDataForAllEquip();

        // Make arrays numeric based for both 
        // the site lists inside a Mine Site 
        // and the Mine Site array as well         
        foreach (array_keys($allSites) as $site) {
            $allSites[$site]->MakeArraysNumeric();
            $tempAllSites[] = $allSites[$site];
        }
        $allSites = $tempAllSites;

        // Add a list of all equipment        
        $allSites[] = $allEquipment;

        // Wrap up and submit
        CreateSiteData::AddMetaData();

        // Demo mode
        ScrambleData::Scramble();

        Debug::EndProfile();
        Debug::Log("Finished...");
    }





    /**
     * Fetch the SQL results first so that 
     * all other functions can use the results
     */
    static function CreateSQLResults()
    {
        Debug::StartProfile("Create SQL Results");
        global $date;
        global $sqlMetricPerHour;
        global $sqlEquipEventList;
        global $sqlMineEquipmentList;
        global $sqlMaterialMovements;

        // ------------------------------------------------------------------------------------------
        // All metrics per hour for this date
        $sqlTxt = SQLUtils::FileToQuery('..\assets\sql\Core\ALL_MetricPerHour.sql');
        $sqlTxt = str_replace(SQLUtils::DateVar, "'" . $date . "'", $sqlTxt);
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
        $sqlTxt = str_replace(SQLUtils::DateVar, "'" . $date . "'", $sqlTxt);
        $sqlEquipEventList = SQLUtils::QueryToText($sqlTxt, "Event List");
        // ------------------------------------------------------------------------------------------


        // ------------------------------------------------------------------------------------------
        // All the equipment of the entire mine
        $sqlTxt = SQLUtils::FileToQuery('..\assets\sql\Core\ALL_MineEquipmentList.sql');
        $sqlTxt = str_replace(SQLUtils::DateVar, "'" . $date . "'", $sqlTxt);
        $sqlMineEquipmentList = SQLUtils::QueryToText($sqlTxt, "All Mine Equip", false);

        // Set the asset ID as the index
        $new_array = [];
        foreach ($sqlMineEquipmentList as $value)
            $new_array[$value[0]] = $value;
        $sqlMineEquipmentList = $new_array;
        //Debug::Log($new_array);
        // ------------------------------------------------------------------------------------------



        // ------------------------------------------------------------------------------------------
        // Material Movements
        $sqlTxt = SQLUtils::FileToQuery('..\assets\sql\Core\ALL_MaterialMovements.sql');
        $sqlTxt = str_replace(SQLUtils::DateVar, "'" . $date . "'", $sqlTxt);
        $sqlMaterialMovements = SQLUtils::QueryToText($sqlTxt, "Mat Movements", false);

        //Debug::Log($sqlMaterialMovements);
        // ------------------------------------------------------------------------------------------



        Debug::EndProfile();
    }


    // ------------------------------------------------------------------
    /** Information related to this dates data generation **/
    static function AddMetaData()
    {
        global $date;
        global $allSites;
        global $generationStartTime;

        $d = DateTime::createFromFormat('Ymd', $date);
        $day = Utils::dayNameMap[$d->format('D')];

        $updateTime = new DateTime();
        $timezone = new DateTimeZone('Asia/Singapore');
        $updateTime->setTimezone($timezone);

        $timeToGenerate = (number_format((microtime(true) - $generationStartTime), 4) * 1000);
        $timeToGenerate = round($timeToGenerate, 0);

        $metaData = new SiteMetaData();
        $metaData->Day = $day;
        $metaData->Date = $date;
        $metaData->LastUpdate = $updateTime;
        $metaData->IP = Utils::GetClientIP();
        $metaData->User = "User";
        $metaData->Version = Version::current();
        $metaData->EquipmentFunctionMap = CreateSiteData::GetEquipmentFunctionMap();
        $metaData->TimeToGenerate = $timeToGenerate;

        $allSites[] = $metaData;
    }




    // ------------------------------------------------------------------
    static function CreateSitesAndEquipment()
    {
        Debug::StartProfile("PHP Create Sites");

        global $allSites;
        global $allEquipment;
        global $date;

        global $sqlEquipEventList;
        global $sqlMetricPerHour;


        // Generate the Mine Sites for this day
        // This is filtered based on the client config
        $allSites = array();
        foreach (array_keys(Config::$instance->configSites) as $id) {
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
    }
    // ------------------------------------------------------------------





    // ------------------------------------------------------------------
    static function CreateDataForAllSites()
    {
        global $allSites;
        global $sqlMetricPerHour;
        global $sqlMaterialMovements;

        // -------------------------------------
        // Production Tonnes for site
        Debug::StartProfile("PHP: Per-mine Data");

        // Production tonnes for each site
        for ($i = 1; $i < count($sqlMetricPerHour); $i++) {
            $activity = $sqlMetricPerHour[$i][3];
            $siteName = Config::Sites($sqlMetricPerHour[$i][1]);
            if ($siteName != null || $siteName != '') {
                // Only interested if the activity was Production 
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


        Debug::StartProfile("Material Movements");
        for ($i = 1; $i < count($sqlMaterialMovements); $i++) {
            $siteName = Config::Sites($sqlMaterialMovements[$i][0]);
            if ($siteName != null || $siteName != '') {
                $allSites[$siteName]->AddMaterialMovements($sqlMaterialMovements[$i]);
            }
        }
        Debug::EndProfile();
    }
    // ------------------------------------------------------------------




    // ------------------------------------------------------------------
    static function CreateDataForAllEquip()
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
    }



    /** Array to map function to a descriptive name for front end  **/
    static function GetEquipmentFunctionMap()
    {
        $tmp = array();
        global $sqlMineEquipmentList;
        foreach (array_keys($sqlMineEquipmentList) as $id) {
            $tmp[$sqlMineEquipmentList[$id][1]] = $sqlMineEquipmentList[$id][2];
        }
        return $tmp;
        //Debug::Log($sqlMineEquipmentList);
    }
}
