<?php
include_once('header.php');


// ----------------------------------------------------------
// ----------------------------------------------------------
// WEB REQUEST ENTRY POINT
// This data will be valid with a URL 
// request from the client
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

if (is_object($request)) {
    include_once('setDebugOff.php');
    if ($request->func == 0) {
        echo LongTerm::Get(new DateTime(), new DateTime());
    }
} else {
    $result = LongTerm::Get(new DateTime(), new DateTime());
    //Debug::Log($result);
}
// ----------------------------------------------------------
// ----------------------------------------------------------



class LongTermAsset
{
    // For each asset
    var $assetUtilisation = array();

    // Totals of all assets
    public AssetUtilisationPerDay $totalAssetUtilisation;

    function __construct()
    {
        $this->totalAssetUtilisation = new AssetUtilisationPerDay(0);
    }

    public function GenerateUtilisationFromTUM()
    {
        $this->totalAssetUtilisation->GenerateUtilisationFromTUM();
        foreach ($this->assetUtilisation as $k => $v) {
            $v->GenerateUtilisationFromTUM();
        }
    }

    public function AssessEvent($event)
    {
        $tumCategory = Config::TUM($event[3]);
        $date = $event[1];
        $duration = $event[2];
        $status = $event[3];

        $f = $date->format('Ymd');
        //Debug::Log($f);

        if ($tumCategory != NULL) {

            // This is per-day 
            if (!isset($this->assetUtilisation[$f]))
                $this->assetUtilisation[$f] = new AssetUtilisationPerDay($f);

            $this->assetUtilisation[$f]->calendarTime += $duration;
            $this->assetUtilisation[$f]->tumTimings->$tumCategory->eventCount++;
            $this->assetUtilisation[$f]->tumTimings->$tumCategory->duration += $duration;
            if (!isset($this->assetUtilisation[$f]->tumTimings->$tumCategory->categories[$status]))
                $this->assetUtilisation[$f]->tumTimings->$tumCategory->categories[$status] = $duration;
            else
                $this->assetUtilisation[$f]->tumTimings->$tumCategory->categories[$status] += $duration;


            // --------------------------------------------------
            // This is for the totals for this long term asset
            $this->totalAssetUtilisation->calendarTime += $duration;

            $this->totalAssetUtilisation->tumTimings->$tumCategory->eventCount++;
            $this->totalAssetUtilisation->tumTimings->$tumCategory->duration += $duration;
            if (!isset($this->totalAssetUtilisation->tumTimings->$tumCategory->categories[$status]))
                $this->totalAssetUtilisation->tumTimings->$tumCategory->categories[$status] = $duration;
            else
                $this->totalAssetUtilisation->tumTimings->$tumCategory->categories[$status] += $duration;
        } //else
        //Debug::Log("Tum was null");
    }
}




/**
 * Generates long term data
 */
class LongTerm
{
    private static $TUM_CAT = 'categories';
    private static $TUM_DURATION = 'duration';
    private static $TUM_DAILY = 'daily';



    public static function Get(DateTime $_startDate, DateTime $_endDate)
    {
        //new Config();

        $period = new DatePeriod(
            $_startDate,
            new DateInterval('P1D'),
            $_endDate
        );

        $numberOfDays = iterator_count($period);
        $sqlTxt = SQLUtils::FileToQuery(Client::SQLCorePath() . "ALL_EquipmentEventListRange.sql");
        $sqlEquipEventList = SQLUtils::QueryToText($sqlTxt, "Event List Range");

        if ($sqlEquipEventList == NULL)
            return;
        //Debug::Log($sqlEquipEventList);


        $allEquip = [];
        $totals = new LongTermAsset();

        Debug::StartProfile("PHP Longterm");
        for ($i = 1; $i < count($sqlEquipEventList); $i++) {
            $id = $sqlEquipEventList[$i][0];
            if (!isset($allEquip[$id])) {
                $allEquip[$id] = new LongTermAsset();
            }
            $allEquip[$id]->AssessEvent($sqlEquipEventList[$i]);
            $totals->AssessEvent($sqlEquipEventList[$i]);
        }


        foreach ($allEquip as $k => $v) {
            $allEquip[$k]->GenerateUtilisationFromTUM();
            $allEquip[$k]->assetUtilisation = array_values($allEquip[$k]->assetUtilisation);
        }

        $totals->GenerateUtilisationFromTUM();
        $totals->assetUtilisation = array_values($totals->assetUtilisation);

        Debug::EndProfile();

        $result = [];
        $result[] = $allEquip;
        $result[] = $totals;

        return json_encode($result);
    }





    /**
     * Generate long term data based on a series of inputs
     * This function loads up previous data cache and if it 
     * doesn't exist it will generate that dates dat
     */
    public static function Generate(
        $_equipFunctionFilter,
        $_equipIDFilter,
        $_siteFilter
    ) {
        Debug::Enable();
        //Debug::Disable();

        $tempStartDate = '2018-10-01';
        $tempEndDate = '2018-12-31';


        // Construct date time period 
        $period = new DatePeriod(
            new DateTime($tempStartDate),
            new DateInterval('P1D'),
            new DateTime($tempEndDate)
        );

        $numberOfDays = iterator_count($period);
        $validDays = 0;

        // Data arrays 
        $tempTUM = [];
        $tempUofA = [];

        $finalObject = [];



        Debug::StartProfile("Generate Data for " . $numberOfDays . " days");


        Debug::StartProfile("TUM Values");

        $dayIndex = 0;
        // Sum the time spent in each TUM category 
        // and sub-category status over all days    
        foreach ($period as $key => $value) {
            $date = $value->format('Ymd');

            //Debug::StartProfile("Get data from disk");
            $fileData = (GetSiteData::CheckGeneratedDataExists($date));
            //Debug::EndProfile();

            if ($fileData == null) {
                Debug::Log("File was NULL, date invalid? " . $date);
                continue;
            }

            // Continue on as the date file was valid
            $validDays++;
            $fileData = json_decode($fileData);

            // Array of equipment for this day
            $equipment = $fileData[count($fileData) - CreateSiteData::INDEX_EQUIP];

            // Get the times from each event 
            foreach ($equipment as $key => $value) {

                // Filter by equipment function (ie. HAULING) 
                // and equipment ID if needed
                if ($value->function == $_equipFunctionFilter || $_equipFunctionFilter == null) {
                    $events = $value->events;

                    // For all events, grab tum data 
                    for ($i = 0; $i < count($events); $i++) {
                        $tumCat = $events[$i]->tumCategory;

                        // Checks to see if new arrays need to be generated
                        // ---------------------------------------------------------
                        // Check if total exists
                        if (!isset($tempTUM[$tumCat][self::$TUM_DURATION]))
                            $tempTUM[$tumCat][self::$TUM_DURATION] = 0;

                        // Check if daily TUM totals need to be generated
                        if (!isset($tempTUM[$tumCat][self::$TUM_DAILY])) {
                            $tempTUM[$tumCat][self::$TUM_DAILY] = [];
                            for ($j = 0; $j < $numberOfDays; $j++)
                                $tempTUM[$tumCat][self::$TUM_DAILY][$j] = 0;
                        }


                        // Check if daily category status needs to be generated
                        if (!isset($tempTUM[$tumCat][$events[$i]->status])) {
                            $tempTUM[$tumCat][$events[$i]->status] = [];
                            for ($j = 0; $j < $numberOfDays; $j++)
                                $tempTUM[$tumCat][$events[$i]->status][$j] = 0;
                        }
                        // ---------------------------------------------------------


                        // Actually generating the data
                        // ---------------------------------------------------------
                        //Debug::Log("Day : " . $dayIndex);
                        //Debug::LogI(" E: " . $i);
                        if (isset($tempTUM[$tumCat][self::$TUM_CAT][$events[$i]->status])) {
                            $tempTUM[$tumCat][self::$TUM_CAT][$events[$i]->status] += $events[$i]->duration;
                        } else {
                            $tempTUM[$tumCat][self::$TUM_CAT][$events[$i]->status] = $events[$i]->duration;
                        }

                        $tempTUM[$tumCat][self::$TUM_DURATION] += $events[$i]->duration;
                        $tempTUM[$tumCat][self::$TUM_DAILY][$dayIndex] += $events[$i]->duration;
                        $tempTUM[$tumCat][$events[$i]->status][$dayIndex] += $events[$i]->duration;
                        // ---------------------------------------------------------
                    }
                }
            }
            $dayIndex++;
        }

        Debug::EndProfile();


        Debug::StartProfile("U of A");

        // Generate U of A if there was
        // data put into the temporary array
        if (count($tempTUM)) {
            // Sort TUM ready for pareto style chart
            foreach ($tempTUM as $key => $value) {
                arsort($tempTUM[$key][self::$TUM_CAT]);
            }

            // Get U of A Stuff
            for ($i = 0; $i < $numberOfDays; $i++) {

                $unplannedBreakdown = $tempTUM[TimeUsageModel::$categories[0]][self::$TUM_DAILY][$i];
                $plannedMaintenance = $tempTUM[TimeUsageModel::$categories[1]][self::$TUM_DAILY][$i];
                $unplannedStandby = $tempTUM[TimeUsageModel::$categories[2]][self::$TUM_DAILY][$i];
                $operatingStandby = $tempTUM[TimeUsageModel::$categories[3]][self::$TUM_DAILY][$i];
                $secondaryOperating = $tempTUM[TimeUsageModel::$categories[4]][self::$TUM_DAILY][$i];
                $primaryOperating = $tempTUM[TimeUsageModel::$categories[5]][self::$TUM_DAILY][$i];

                // Set to zero first... then check if sum isn't
                // to avoid divide by zero when calculating
                $tempUofA['Availability'][$i] = 0;
                $tempUofA['UofA'][$i] = 0;
                $tempUofA['Efficiency'][$i] = 0;
                $tempUofA['Total Asset Utilisation'][$i] = 0;

                $sumOfTUM = ($unplannedBreakdown + $plannedMaintenance + $unplannedStandby + $operatingStandby + $secondaryOperating + $primaryOperating);
                $sumOfUofA = ($unplannedStandby + $operatingStandby + $secondaryOperating + $primaryOperating);

                // Generate Availability               
                if ($sumOfTUM > 0)
                    $tempUofA['Availability'][$i] = ($unplannedStandby + $operatingStandby + $secondaryOperating + $primaryOperating)
                        / ($unplannedBreakdown + $plannedMaintenance + $unplannedStandby + $operatingStandby + $secondaryOperating + $primaryOperating);

                // Generate UofA
                if ($sumOfUofA > 0)
                    $tempUofA['UofA'][$i] = ($secondaryOperating + $primaryOperating)
                        / ($unplannedStandby + $operatingStandby + $secondaryOperating + $primaryOperating);

                // Efficency
                if ($primaryOperating + $secondaryOperating == 0)
                    $tempUofA['Efficiency'][$i] = 0;
                else
                    $tempUofA['Efficiency'][$i] = $primaryOperating / ($primaryOperating + $secondaryOperating);

                // Total Utilisation
                if ($sumOfTUM > 0)
                    $tempUofA['Total Asset Utilisation'][$i] = $primaryOperating
                        / ($unplannedBreakdown + $plannedMaintenance + $unplannedStandby + $operatingStandby + $secondaryOperating + $primaryOperating);

                // Temp check as per Daveo's excel sheet
                //$tempUofA['AUCheck'][$i] =  $tempUofA['Availability'][$i] * $tempUofA['UofA'][$i] * $tempUofA['Efficiency'][$i];
            }
        }

        Debug::EndProfile();
        Debug::Log("\n");
        //Debug::Log($tempTUM);
        //Debug::Log($tempUofA);

        // Summary
        $summary = array(
            "DateStart" => $tempStartDate,
            "DateEnd" => $tempEndDate,
            "DaysRequested" => $numberOfDays,
            "DaysProcessed" => $validDays,
            "Filter" => array(
                "ByEquipmentFunction" => $_equipFunctionFilter == null ? "none" : $_equipFunctionFilter
            )
        );

        //Debug::Log($summary);
        //Debug::Log($tempTUM);

        $finalObject[] = $tempTUM;
        $finalObject[] = $tempUofA;
        $finalObject[] = $summary;

        //echo json_encode($finalObject);

        Debug::EndProfile();
    }
}
