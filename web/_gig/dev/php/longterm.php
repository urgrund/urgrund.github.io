<?php
include_once('header.php');
include_once('get_site_data.php');


// ----------------------------------------------------------
// ----------------------------------------------------------
// WEB REQUEST ENTRY POINT
// This data will be valid with a URL 
// request from the client
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

if (is_object($request)) {
    include_once('setDebugOff.php');
}
// ----------------------------------------------------------
// ----------------------------------------------------------




abstract class LongTermGenerationType
{
    const EquipID = 0;
    const EquipFunction = 1;
    const Site = 2;
}


// Do the stuff
// Will need a more flexible interface
// What about combinations? ie) P & HAULING ?
LongTerm::Generate('HAULING', null, null);


/**
 * Generates long term data
 */
class LongTerm
{
    private static $TUM_CAT = 'categories';
    private static $TUM_DURATION = 'duration';
    private static $TUM_DAILY = 'daily';


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
        $tempEndDate = '2018-10-31';


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

            //Debug::Log($dayIndex);
            $date = $value->format('Ymd');
            $fileData = (GetSiteData::CheckGeneratedDataExists($date));

            if ($fileData == null) {
                Debug::Log("File was NULL, date invalid? " . $date);
                continue;
            }

            // Continue on as the date file was valid
            $validDays++;
            $fileData = json_decode($fileData);


            // Array of equipment for this day
            $equipment = $fileData[3];

            // Get the times from each event 
            foreach ($equipment as $key => $value) {

                // Filter by equipment function (ie. HAULING) 
                // and equipment ID if needed
                if (
                    ($value->function == $_equipFunctionFilter || $_equipFunctionFilter == null)
                    //&& $value->id == $equipIDFilter
                ) {
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

        echo json_encode($finalObject);

        Debug::EndProfile();
    }
}
