<?php
//include_once('utils.php');
include_once('header.php');



// Uncomment this to run directly from this file
if (Debug::enabled() == true) {


    //try {
    //CreateSiteData::Run(new DateTime('20181231'));
    //} catch (Error $e) {
    // Handle error
    //  echo $e->getMessage(); // Call to a member function method() on string
    //}

    global $allSites;
    //CreateSiteData::Run(new DateTime('20181231'));
    CreateSiteData::Run(new DateTime('20210215'));
    Debug::Log($allSites);

    return;
}


/**   
 * Generates data for a given date for all 
 * equipment at all locations   
 */
final class CreateSiteData
{
    const INDEX_EQUIP = 2;

    private static $date;
    private static DateTime $dateTimeForData;

    /** The Date being used for this run of data generation */
    public static function DateForData(): DateTime
    {
        return self::$dateTimeForData;
    }

    public static function Run(DateTime $_date)
    {
        Debug::Log("Using date - " . $_date->format('Ymd'));
        self::$dateTimeForData = $_date;
        self::$date = $_date->format('Ymd');
        //date_default_timezone_set(Client::GetTimeZone()->getName());
        CreateSiteData::Create();
    }


    private static function Create()
    {
        Debug::StartProfile("TOTAL");

        global $generationStartTime;
        $generationStartTime = microtime(true);

        // Clean for each run 
        global $allSites;
        global $allEquipment;

        $allSites = array();
        $allEquipment = array();

        // Config instance 
        new Config();
        //$d = new Config();
        //Debug::Log($d);

        CreateSiteData::CreateSQLResults();

        Debug::StartProfile("PHP Total");

        CreateSiteData::CreateSitesAndEquipment();
        CreateSiteData::CreateDataForAllSites();
        CreateSiteData::CreateDataForAllEquip();


        // Summary tests
        Debug::StartProfile("PHP: Summarys");
        foreach ($allSites as $site) {
            //Debug::Log($site);
            $site->GenerateSummary();
        }
        Debug::EndProfile();




        Debug::EndProfile();

        // Make arrays numeric based for both 
        // the site lists inside a Mine Site 
        // and the Mine Site array as well        
        $tempAllSites = [];
        foreach (array_keys($allSites) as $site) {
            if ($allSites[$site]->equipment != null) {
                $allSites[$site]->MakeArraysNumeric();
                $tempAllSites[] = $allSites[$site];
            }
        }

        $allSites = $tempAllSites;

        // Add a list of all equipment        
        $allSites[] = $allEquipment;

        // Wrap up and submit
        CreateSiteData::AddMetaData();

        // Demo mode
        //ScrambleData::Scramble();

        Debug::EndProfile();
        Debug::Log("Finished...");
    }





    /**
     * Fetch the SQL results first so that 
     * all other functions can use the results
     */
    private static function CreateSQLResults()
    {
        Debug::StartProfile("SQL Total");
        //global $date;
        global $sqlMetricPerHour;
        global $sqlEquipEventList;
        global $sqlMineEquipmentList;
        global $sqlMaterialMovements;

        // ------------------------------------------------------------------------------------------
        // All metrics per hour for this date
        $sqlTxt = SQLUtils::FileToQuery(Client::SQLCorePath() . 'ALL_MetricPerHour.sql');
        $sqlTxt = str_replace(SQLUtils::DateVar, "'" . self::$date . "'", $sqlTxt);
        $sqlMetricPerHour = SQLUtils::QueryToText($sqlTxt, "All Metric");
        // Sanitize null values 
        for ($i = 0; $i < count($sqlMetricPerHour); $i++) {
            for ($j = 0; $j < count($sqlMetricPerHour[$i]); $j++)
                if ($j > 3 && ($sqlMetricPerHour[$i][$j] == null))
                    $sqlMetricPerHour[$i][$j] = 0;
        }
        //Debug::Log($sqlMetricPerHour[4]);
        // ------------------------------------------------------------------------------------------


        // ------------------------------------------------------------------------------------------
        // All events that have been logged for this date
        $sqlTxt = SQLUtils::FileToQuery(Client::SQLCorePath() . "ALL_EquipmentEventList.sql");
        $sqlTxt = str_replace(SQLUtils::DateVar, "'" . self::$date . "'", $sqlTxt);
        $sqlEquipEventList = SQLUtils::QueryToText($sqlTxt, "Event List");
        //Debug::Log($sqlEquipEventList);
        // ------------------------------------------------------------------------------------------


        // ------------------------------------------------------------------------------------------
        // All the equipment of the entire mine
        $sqlTxt = SQLUtils::FileToQuery(Client::SQLCorePath() . 'ALL_MineEquipmentList.sql');
        $sqlTxt = str_replace(SQLUtils::DateVar, "'" . self::$date . "'", $sqlTxt);
        $sqlMineEquipmentList = SQLUtils::QueryToText($sqlTxt, "All Mine Equip", false);

        // Set the asset ID as the index
        $new_array = [];
        foreach ($sqlMineEquipmentList as $value) {
            //Debug::Log($value);
            $new_array[$value[0]] = $value;
        }
        $sqlMineEquipmentList = $new_array;
        //Debug::Log($sqlMineEquipmentList);
        // ------------------------------------------------------------------------------------------



        // ------------------------------------------------------------------------------------------
        // Material Movements
        $sqlTxt = SQLUtils::FileToQuery(Client::SQLCorePath() . 'ALL_MaterialMovements.sql');
        $sqlTxt = str_replace(SQLUtils::DateVar, "'" . self::$date . "'", $sqlTxt);
        $sqlMaterialMovements = SQLUtils::QueryToText($sqlTxt, "Mat Movements", false);

        //Debug::Log($sqlMaterialMovements);
        // ------------------------------------------------------------------------------------------



        Debug::EndProfile();
    }


    // ------------------------------------------------------------------
    /** Information related to this dates data generation **/
    private static function AddMetaData()
    {
        //global $date;
        global $allSites;
        global $generationStartTime;

        $d = DateTime::createFromFormat('Ymd', self::$date);
        $day = 'NULL';
        if ($d != null)
            $day = Utils::dayNameMap[$d->format('D')];

        $updateTime = new DateTime();
        //$timezone = new DateTimeZone('Australia/Perth'); 
        $timezone = Client::instance()->TimeZone();
        $updateTime->setTimezone($timezone);

        $timeToGenerate = (number_format((microtime(true) - $generationStartTime), 4) * 1000);
        $timeToGenerate = round($timeToGenerate, 0);

        $metaData = new SiteMetaData();
        $metaData->Day = $day;
        $metaData->Date = self::$date;
        $metaData->LastUpdate = $updateTime;
        $metaData->IP = Utils::GetClientIP();
        $metaData->User = "User";
        $metaData->Version = Version::current();
        $metaData->EquipmentFunctionMap = CreateSiteData::GetEquipmentFunctionMap();
        $metaData->TimeToGenerate = $timeToGenerate;

        $allSites[] = $metaData;
    }







    // ------------------------------------------------------------------
    private static function CreateSitesAndEquipment()
    {
        Debug::StartProfile("PHP Create Sites");

        global $allSites;
        global $allEquipment;
        //global $date;

        global $sqlEquipEventList;
        global $sqlMetricPerHour;


        // Generate the Mine Sites for this day
        // This is filtered based on the client config
        $allSites = array();
        foreach (array_keys(Config::Instance()->Sites) as $id) {
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
    private static function CreateDataForAllSites()
    {
        global $allSites;
        global $sqlMetricPerHour;
        global $sqlMaterialMovements;

        // -------------------------------------
        // Production Tonnes for site
        Debug::StartProfile("PHP: Per-mine Data");

        Debug::Log("Need Metric filter here to know Production");

        // Production tonnes for each site
        for ($i = 1; $i < count($sqlMetricPerHour); $i++) {
            $activity = $sqlMetricPerHour[$i][3];
            $siteName = Config::Sites($sqlMetricPerHour[$i][1]);
            if ($siteName != null || $siteName != '') {

                // NEED CONFIG FILTER HERE TO DETERMINE WHAT IS 

                // Only interested if the activity was Production 
                // if (preg_match("/production/i", $activity)) {

                //     // TODO - this is used a few times, so maybe a site wide static config?
                //     $metricIndexOffset = 4;
                //     foreach (array_keys($allSites) as $site) {
                //         for ($k = 0; $k < 24; $k++) {
                //             $allSites[$site]->tph24->tph[$k] += $sqlMetricPerHour[$i][$k + $metricIndexOffset];
                //         }
                //     }
                // }
            }
        }
        Debug::EndProfile();


        Debug::StartProfile("PHP: Material Movements");
        for ($i = 1; $i < count($sqlMaterialMovements); $i++) {
            $siteName = Config::Sites($sqlMaterialMovements[$i][0]);

            if ($siteName != NULL || $siteName != '') {
                $_mm = $sqlMaterialMovements[$i];

                if ($_mm[1] == NULL)
                    Debug::Log($_mm);

                //$allSites[$siteName]->AddMaterialMovements($sqlMaterialMovements[$i]);
                $allSites[$siteName]->shiftData[$_mm[1] - 1]->materialMovements[] = $_mm;
                $allSites[$siteName]->shiftData[2]->materialMovements[] = $_mm;
            }
        }
        Debug::EndProfile();
    }
    // ------------------------------------------------------------------



    // Annoying, just to get intellisense to work
    private static Equipment $e;

    static function sortById($x, $y)
    {
        return ($x->timeStamp - $y->timeStamp);
    }



    // ------------------------------------------------------------------
    private static function CreateDataForAllEquip()
    {
        global $allEquipment;

        Debug::StartProfile("PHP: All Equipment Data");
        foreach ($allEquipment as $key => $equip) {
            self::$e = $equip;

            // DEBUG
            //if ($key != 'DD058')
            //  continue;

            self::$e->SortEventsAndAllocateToShifts();
            self::$e->GenerateMPH();
            self::$e->GenerateUofAFromEvents();
            self::$e->GenerateEventBreakDown();
            self::$e->GenerateShiftCallUps();


            //usort(self::$e->events, array('CreateSiteData', 'sortById'));
            //Debug::Log(self::$e->events);
            //eventFirstOp
        }

        Debug::EndProfile();
    }



    /** Array to map function to a descriptive name for front end  **/
    private static function GetEquipmentFunctionMap()
    {
        $tmp = array();
        global $sqlMineEquipmentList;
        foreach (array_keys($sqlMineEquipmentList) as $id) {
            //Debug::Log($id);
            $tmp[$sqlMineEquipmentList[$id][1]] = $sqlMineEquipmentList[$id][2];
        }
        //Debug::Log($sqlMineEquipmentList);
        return $tmp;
    }
}
