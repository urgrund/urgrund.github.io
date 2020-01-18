<?php
include_once('header.php');
include_once('get_site_data.php');

if (isset($_POST['date'])) {
    // include_once('setDebugOff.php');
}



class LongTermTumEvents
{
    var $tumCategories = array();
}

class LongTerm
{
    // public static $TUM_CATEGORIES = [
    //     'Unplanned Breakdown',
    //     'Planned Maintenance',
    //     'Unplanned Standby',
    //     'Operating Standby',
    //     'Secondary Operating',
    //     'Primary Operating'
    // ];


    private static $TUM_EVENT = 'categories';
    private static $TUM_DURATION = 'duration';
    private static $TUM_DAILY = 'daily';

    public static function Do()
    {
        Debug::Enable();
        //Debug::Disable();


        $period = new DatePeriod(
            new DateTime('2018-10-01'),
            new DateInterval('P1D'),
            new DateTime('2018-12-31')
        );

        $numberOfDays = iterator_count($period);
        //Debug::Log($numberOfDays);


        // Data arrays 
        $tempTUM = [];
        $tempUofA = [];

        $finalObject = [];


        $equipFunctionFilter = 'LOADING';
        $equipIDFilter = 'BL082';

        Debug::StartProfile("Generate Data for " . $numberOfDays . " days");
        $dayIndex = 0;


        // Sum the time spent in each TUM category 
        // and sub-category status over all days    
        foreach ($period as $key => $value) {

            //Debug::Log($dayIndex);
            $date = $value->format('Ymd');
            $fileData = json_decode(GetSiteData::CheckGeneratedDataExists($date));

            // Array of equipment for this day
            $equipment = $fileData[3];

            // Get the times from each event 
            foreach ($equipment as $key => $value) {

                if (
                    $value->function == $equipFunctionFilter
                    //&& $value->id == $equipIDFilter
                ) {

                    //if (true) {
                    $events = $value->events;
                    for ($i = 0; $i < count($events); $i++) {
                        $tumCat = $events[$i]->tumCategory;

                        // Check if total exists
                        if (!isset($tempTUM[$tumCat][self::$TUM_DURATION]))
                            $tempTUM[$tumCat][self::$TUM_DURATION] = 0;

                        // Check if daily needs to be generated
                        if (!isset($tempTUM[$tumCat][self::$TUM_DAILY])) {
                            $tempTUM[$tumCat][self::$TUM_DAILY] = [];
                            for ($j = 0; $j < $numberOfDays; $j++)
                                $tempTUM[$tumCat][self::$TUM_DAILY][$j] = 0;
                        }

                        //Debug::Log("Day : " . $dayIndex);
                        //Debug::LogI(" E: " . $i);
                        if (isset($tempTUM[$tumCat][self::$TUM_EVENT][$events[$i]->status])) {
                            $tempTUM[$tumCat][self::$TUM_EVENT][$events[$i]->status] += $events[$i]->duration;
                        } else {
                            $tempTUM[$tumCat][self::$TUM_EVENT][$events[$i]->status] = $events[$i]->duration;
                        }

                        $tempTUM[$tumCat][self::$TUM_DURATION] += $events[$i]->duration;
                        $tempTUM[$tumCat][self::$TUM_DAILY][$dayIndex] += $events[$i]->duration;
                    }
                }
            }
            $dayIndex++;
        }

        // Sort TUM ready for pareto style chart
        foreach ($tempTUM as $key => $value) {
            arsort($tempTUM[$key][self::$TUM_EVENT]);
        }

        // Get U of A Stuff
        for ($i = 0; $i < $numberOfDays; $i++) {

            $unplannedBreakdown = $tempTUM[TimeUsageModel::$categories[0]][self::$TUM_DAILY][$i];
            $plannedMaintenance = $tempTUM[TimeUsageModel::$categories[1]][self::$TUM_DAILY][$i];
            $unplannedStandby = $tempTUM[TimeUsageModel::$categories[2]][self::$TUM_DAILY][$i];
            $operatingStandby = $tempTUM[TimeUsageModel::$categories[3]][self::$TUM_DAILY][$i];
            $secondaryOperating = $tempTUM[TimeUsageModel::$categories[4]][self::$TUM_DAILY][$i];
            $primaryOperating = $tempTUM[TimeUsageModel::$categories[5]][self::$TUM_DAILY][$i];


            $tempUofA['Availability'][$i] = ($unplannedStandby + $operatingStandby + $secondaryOperating + $primaryOperating)
                / ($unplannedBreakdown + $plannedMaintenance + $unplannedStandby + $operatingStandby + $secondaryOperating + $primaryOperating);


            $tempUofA['UofA'][$i] = ($secondaryOperating + $primaryOperating)
                / ($unplannedStandby + $operatingStandby + $secondaryOperating + $primaryOperating);


            if ($primaryOperating + $secondaryOperating == 0)
                $tempUofA['Efficiency'][$i] = 0;
            else
                $tempUofA['Efficiency'][$i] = $primaryOperating / ($primaryOperating + $secondaryOperating);


            $tempUofA['Total Asset Utilisation'][$i] = $primaryOperating
                / ($unplannedBreakdown + $plannedMaintenance + $unplannedStandby + $operatingStandby + $secondaryOperating + $primaryOperating);

            //$tempUofA['AUCheck'][$i] =  $tempUofA['Availability'][$i] * $tempUofA['UofA'][$i] * $tempUofA['Efficiency'][$i];
        }

        //Debug::Log($tempTUM);
        //Debug::Log($tempUofA);

        $finalObject[] = $tempTUM;
        $finalObject[] = $tempUofA;

        echo json_encode($finalObject);

        Debug::EndProfile();
    }
}


LongTerm::Do();
