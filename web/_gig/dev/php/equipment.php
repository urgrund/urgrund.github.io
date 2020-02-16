<?php


// --------------------------------
// Equipment Class
// --------------------------------
class Equipment
{
    // DB Code used to identify this equipment
    var $id;

    var $sites = [];
    //var $tphSites = [];

    //var $metric;
    var $function;
    var $events = array();

    var $shiftData = array();

    private $genComplete = false;

    function __construct($_id)
    {
        $this->id = $_id;
        $this->shiftData[] = new EquipmentShiftData();
        $this->shiftData[] = new EquipmentShiftData();
    }

    function AddEvent($_eventDataRow)
    {
        global $date;

        $e = new EquipmentEvent();

        // Set int based if the day is 1 ahead
        $dataDate = new DateTime($date);
        $diff = date_diff($dataDate, $_eventDataRow[2]);
        $e->dayAhead = $diff->d;

        $e->operator = $_eventDataRow[1];
        $e->eventTime = $_eventDataRow[2];
        $e->location = $_eventDataRow[3];
        $e->mineArea = $_eventDataRow[4];
        $e->duration = $_eventDataRow[5];
        $e->status = $_eventDataRow[6];
        $e->majorGroup = $_eventDataRow[7];
        $e->shift = $_eventDataRow[8];
        $e->tumCategory = $_eventDataRow[9];


        // Which shift does this event belong to?        
        if ($e->shift == "P1") {
            //$this->shiftData[0]->events[] = $e;
            $this->shiftData[0]->events[] = count($this->events);
        } else {
            //$this->shiftData[1]->events[] = $e;
            $this->shiftData[1]->events[] =  count($this->events);
        }


        // Store all events
        $this->events[] = $e;
        //Debug::Log($this->shiftData[0]->events);
        //Debug::Log($this->shiftData[1]->events);
    }



    private function GetSecondsInHour($dateTime)
    {
        return (intval($dateTime->format('i')) * 60) + (intval($dateTime->format('s')));
    }

    function GenerateUofAFromEvents()
    {
        //global $date;

        // For each shift... 
        for ($q = 0; $q < 2; $q++) {

            // Prepare 12 UofA hours for the shift
            $hourDateObjs = [];
            for ($i = 0; $i < 12; $i++) {
                $hourDateObjs[$i] = new EquipmentUofAHour($i, $q);
            }

            // Easier ref
            $events = $this->shiftData[$q]->events;

            // Go through all events for this shift
            // and allocate seconds in each shift hour
            for ($i = 0; $i < count($events); $i++) {
                //Debug::Log($events[$i]);
                $event = $this->events[$events[$i]];

                // Get start and end dates
                $startDate = clone $event->eventTime;
                $endDate = clone $startDate;
                $endDate->add(new DateInterval('PT' . $event->duration . 'S'));

                $startHour = intval($startDate->format('H'));
                if ($event->dayAhead == 1)
                    $startHour += 24;

                //$startHour = $startHour < 6  ? $startHour + 12 + 6 : $startHour  - 6;
                $endHour = intval($endDate->format('H'));

                // Frustrating that the dateTime diff would not
                // show a day difference (ie. 11th to the 12th),
                // so this works but doesn't feel elegent
                if ($endHour < $startHour)
                    $endHour += 24;

                // How many hours this event spans (1 based)
                $hours = ($endHour - $startHour) + 1;

                //Debug::Log($startHour . "  " . $endHour . "  " . $hours . "  D:" . $event->duration);

                // If there was no span of hours then just add the duration 
                // Otherwise loop through the span count            
                for ($k = 0; $k < $hours; $k++) {

                    $secondsSpentInHour = 0;

                    // If there's only one hour it spans then it's 
                    // the duration,  otherwise get the fraction/whole
                    // of each hour this event spans over
                    if ($hours == 1) {
                        $secondsSpentInHour = $event->duration;
                    } else {
                        if ($k == 0) {
                            $secondsSpentInHour = 3600 - $this->GetSecondsInHour($startDate);
                        } else if ($k == $hours - 1) {
                            $secondsSpentInHour = $this->GetSecondsInHour($endDate);
                        } else {
                            $secondsSpentInHour = 3600;
                        }
                    }

                    //Debug::Log("Event " . $i . "  Start Hour : " . $startHour . "  plus  " . $k);

                    // Get the 0-12 index based on shift 
                    // and whether it's the next day (P2 am) 
                    $hourIndex = ($startHour + $k);
                    $hourIndex = $q == 0 ? $hourIndex - 6 : $hourIndex - 18;

                    // As this is about values in each shift hour, 
                    // clamp the values between 0-11
                    $hourIndex = min(max($hourIndex, 0), 11);

                    //Debug::Log("---- " . $hourIndex . "  t: " . $secondsSpentInHour);

                    $hourDateObj = $hourDateObjs[$hourIndex]; //$startHour + $k];
                    $hourDateObj->totalTime += $secondsSpentInHour;

                    // Time for use in UofA
                    // TODO - I don't think this is used anymore?!
                    if ($event->majorGroup != "DOWN") {
                        $hourDateObj->availability += $secondsSpentInHour;
                        if ($event->majorGroup != "IDLE")
                            $hourDateObj->utilisation +=  $secondsSpentInHour;
                    }


                    // Exclusive time of Down/Idle/Operating
                    if ($event->majorGroup == "DOWN") {
                        $hourDateObj->down += $secondsSpentInHour;
                    } else if ($event->majorGroup == "IDLE") {
                        $hourDateObj->idle += $secondsSpentInHour;
                    } else
                        $hourDateObj->operating += $secondsSpentInHour;
                }
            }

            // Assign the date objects 
            $this->shiftData[$q]->uofa =  $hourDateObjs;
        }

        //Debug::Log($this->shiftData[1]->uofa);
        // Get all the shift totals
        for ($q = 0; $q < 2; $q++) {

            $this->shiftData[$q]->timeExOperating = 0;
            $this->shiftData[$q]->timeExIdle = 0;
            $this->shiftData[$q]->timeExDown = 0;

            for ($i = 0; $i < count($this->shiftData[$q]->uofa); $i++) {
                $hour = $this->shiftData[$q]->uofa[$i];
                $this->shiftData[$q]->timeTotal += $hour->totalTime;
                $this->shiftData[$q]->timeExOperating += $hour->operating;
                $this->shiftData[$q]->timeExIdle += $hour->idle;
                $this->shiftData[$q]->timeExDown += $hour->down;

                // Ratio for UofA
                if ($hour->availability > 0)
                    $hour->uofa =  $hour->utilisation /  $hour->availability;
            }
        }
    }




    /** From an array of events this function will
     * split out the categories, minor events and 
     * the total time spent in each of these to see
     * how many of each type of event may have occurred
     **/
    private function GetBreakDownOfEventsArray($_eventsArray)
    {
        $breakDown = [];
        //Debug::Log($_eventsArray);
        for ($i = 0; $i < count($_eventsArray); $i++) {

            $event = $this->events[$_eventsArray[$i]];
            // Check if major group is already set...   
            // if or if not,  set the event details 
            if (!isset($breakDown[strval($event->majorGroup)])) {
                $e = new EventBreakDown();
                $e->majorGroup = strval($event->majorGroup);
                $e->duration += $event->duration;
                $e->categories[($event->status)] = $event->duration; // 1;
                $e->eventCount++;

                $breakDown[strval($event->majorGroup)] = $e;
            } else {

                $e = $breakDown[strval($event->majorGroup)];
                $e->duration += $event->duration;
                $e->eventCount++;

                // If a sub-category doesn't exist then add it
                // otherwise increment its count 
                if (!isset($e->categories[($event->status)])) {
                    $e->categories[($event->status)] = $event->duration; //1;
                } else
                    $e->categories[($event->status)] += $event->duration;
            }
        }
        return $breakDown;
    }


    // Generate the event breakdowns for both shifts
    function GenerateEventBreakDown()
    {
        $this->shiftData[0]->eventBreakDown = $this->GetBreakDownOfEventsArray($this->shiftData[0]->events);
        $this->shiftData[1]->eventBreakDown = $this->GetBreakDownOfEventsArray($this->shiftData[1]->events);
    }


    /** For each shift, get the indices for
     * first call ups and last call up events */
    function GenerateShiftCallUps()
    {
        for ($i = 0; $i < count($this->shiftData); $i++) {
            for ($j = 0; $j < count($this->shiftData[$i]->events); $j++) {
                $event = $this->events[$this->shiftData[$i]->events[$j]];
                if ($this->shiftData[$i]->eventFirstOp == null) {
                    if ($event->majorGroup == "OPERATING")
                        $this->shiftData[$i]->eventFirstOp = $j;
                }
            }
        }
    }



    // Metric per hour
    function GenerateMPH($_allTPHData)
    {
        // Already generated data?
        if ($this->genComplete)
            return;

        global $allSites;

        // Go through all events...
        // Record the hourly data based on shift
        // and based on Metric 
        for ($i = 0; $i < count($_allTPHData); $i++) {

            // It's an ID match for this Eqiup!
            if ($_allTPHData[$i][0] == $this->id) {

                // The metric record
                $e = $_allTPHData[$i];

                // Metric Data for both shifts
                $mdDay = new MetricData($e[2], $e[1], $e[count($e) - 1]);
                $mdNight = new MetricData($e[2], $e[1], $e[count($e) - 1]);

                // Data start index... for convenience 
                $dataIdx = 2;

                // For each hour in the event
                for ($j = 0; $j < count($e); $j++) {
                    // To offset in the SQL data, Index >2 is where hourly data starts
                    if ($j > $dataIdx && $j < count($e) - 1) {
                        // Which shift to assign?                         
                        if ($j > $dataIdx + 12)
                            $mdNight->AddValue($e[$j]);
                        else
                            $mdDay->AddValue($e[$j]);
                    }
                }

                //Debug::Log($e[count($e) - 1]);

                // Assign to the shifts
                $this->shiftData[0]->metricData[] = $mdDay;
                $this->shiftData[1]->metricData[] = $mdNight;
            }
        }

        // Add this data to its site to tally totals
        for ($i = 0; $i < count($this->sites); $i++) {
            for ($j = 0; $j < count($allSites); $j++) {

                // I don't think this IF is even needed?
                // if ($this->sites[$i] == $allSites[$j]->key) {

                //if ($this->id == 'LH020')

                //if ($allSites[$j]->key == 'M%')
                //  Debug::Log($allSites[$j]->key);

                //Debug::Log("AKLSJDLKASD");
                //if ($allSites[$j]->key == 'SLC')
                $allSites[$j]->AddMetricDataFromEquipment($this);
                //}
            }
        }


        //Debug::Log($this->shiftData[0]->metricData);
        $this->genComplete = true;
        return;
    }
}








    /*
    function GenerateUofAFromEvents_OLD()
    {
        Debug::Log("OLD FUNCTION BEING USED");
        return;

        global $date;

        $hourcount = 24;
        $hourDateObjs = [];
        for ($i = 0; $i < $hourcount; $i++) {
            $hourDateObjs[$i] = new EquipmentUofAHour($i);
        }

        // Trim the first entry to 6am in case it's just before 6am  (Is this ok?)
        // if (intval($this->events[0]->eventTime->format('H') == 5)) {
        //     $this->events[0]->eventTime = new DateTime($date);
        //     $this->events[0]->eventTime->setTime(6, 00, 00, 0);
        // }


        //Debug::Log("\nEvent Count : " . count($this->events) . "\n");

        for ($i = 0; $i < count($this->events); $i++) {

            // Get start and end dates
            $startDate = clone $this->events[$i]->eventTime;
            $endDate = clone $startDate;
            $endDate->add(new DateInterval('PT' . $this->events[$i]->duration . 'S'));

            // Get start and end hours to determine
            // how many hours this event spans
            $startHour = intval($startDate->format('H'));
            $startHour = $startHour < 6  ? $startHour + 12 + 6 : $startHour  - 6;
            $endHour = intval($endDate->format('H'));
            $endHour = $endHour < 6  ? $endHour + 12 + 6 : $endHour  - 6;

            // How many hours this event spans (1 based)
            $hours = ($endHour - $startHour) + 1;

            // Debug::Log($this->events[$i]->majorGroup . " " . $this->events[$i]->duration . "  Span: " . $hours);
            // Debug::LogI("   Start: " . $startHour . "   End: " . $endHour);
            // Debug::LogI("   Start date : " . $startDate->format("h:i:s"));
            // Debug::LogI("   End date : " . $endDate->format("h:i:s"));

            // If there was no span of hours then just add the duration 
            // Otherwise loop through the span count            
            for ($k = 0; $k < $hours; $k++) {

                $secondsSpentInHour = 0;

                // If there's only one hour it spans then it's 
                // the duration,  otherwise get the fraction/whole
                // of each hour this event spans over
                if ($hours == 1) {
                    $secondsSpentInHour = $this->events[$i]->duration;
                } else {
                    if ($k == 0) {
                        $secondsSpentInHour = 3600 - $this->GetSecondsInHour($startDate);
                    } else if ($k == $hours - 1) {
                        $secondsSpentInHour = $this->GetSecondsInHour($endDate);
                    } else {
                        $secondsSpentInHour = 3600;
                    }
                }

                // If the start hour is at shift end
                // allow the full duration 
                // if ($startHour == 11 || $startHour == 23) {
                //     Debug::Log($this->events[$i]->eventTime->format("H:i"));
                //     Debug::LogI("  " . $this->events[$i]->mineArea . "  " . $startHour . "  " . $this->events[$i]->duration);
                //     Debug::LogI("  " . $this->events[$i]->majorGroup);
                //     $secondsSpentInHour = $this->events[$i]->duration;
                // }

                // Add time to appropriate hour
                $hourDateObj = $hourDateObjs[$startHour + $k];
                $hourDateObj->totalTime += $secondsSpentInHour;

                // Add time to appropriate category
                if ($this->events[$i]->majorGroup != "DOWN") {
                    $hourDateObj->availability += $secondsSpentInHour;
                    if ($this->events[$i]->majorGroup != "IDLE")
                        $hourDateObj->utilisation +=  $secondsSpentInHour;
                }


                // var $down = 0;
                // var $idle = 0;
                // var $operating = 0;
                if ($this->events[$i]->majorGroup == "DOWN") {
                    $hourDateObj->down += $secondsSpentInHour;
                } else if ($this->events[$i]->majorGroup == "IDLE") {
                    $hourDateObj->idle += $secondsSpentInHour;
                } else
                    $hourDateObj->operating += $secondsSpentInHour;


                // Debug::LogI($this->id . " : " . $secondsSpentInHour . "   " . $whichHour);
                // Debug::LogI("   D: " . $this->events[$i]->duration . "   S: " . $this->events[$i]->majorGroup);
                // Debug::LogI(" (" . $startHour . "-" . $endHour . ") ");
                // Debug::LogI($hours);
                // Debug::Log("");
            }
        }

        //Debug::Log($hourDateObjs);

        // Split for shift
        // for ($i = 0; $i < count($hourDateObjs); $i++) {
        //     if ($i < 12)
        //         array_push($this->shiftData[0]->uofa, $hourDateObjs[$i]);
        //     else
        //         array_push($this->shiftData[1]->uofa, $hourDateObjs[$i]);
        // }

        $this->shiftData[0]->uofa =  array_slice($hourDateObjs, 0, 12);
        $this->shiftData[1]->uofa =  array_slice($hourDateObjs, 12, 12);



        //Debug::Log($this->id);
        for ($i = 0; $i < count($this->shiftData); $i++) {
            $this->shiftData[$i]->timeUtilised = 0;
            $this->shiftData[$i]->timeDown = 0;
            $this->shiftData[$i]->timeAvailable = 0;

            // Debug::Log("Shift " . $i . " hours : " . count($this->shiftData[$i]->uofa));
            for ($j = 0; $j < count($this->shiftData[$i]->uofa); $j++) {
                $hour = $this->shiftData[$i]->uofa[$j];
                $this->shiftData[$i]->timeUtilised += $hour->utilisation;
                $this->shiftData[$i]->timeDown += $hour->totalTime - $hour->availability;;
                $this->shiftData[$i]->timeAvailable += $hour->availability;
                $this->shiftData[$i]->timeTotal += $hour->totalTime;



                // Debug::Log("  Util: " . $this->shiftData[$i]->timeUtilised);
                // Debug::LogI("     Down: " . $this->shiftData[$i]->timeDown);
                // Debug::LogI("      Avail: " . $this->shiftData[$i]->timeAvailable);
                // Debug::LogI("      T: " . $this->shiftData[$i]->timeTotal);

                // // Ratio for UofA
                if ($hour->availability > 0)
                    $hour->uofa =  $hour->utilisation /  $hour->availability;

                // Debug::Log("   Avail: " . $hour->availability);
                // Debug::LogI("     Util: " . $hour->utilisation);
                // Debug::LogI("      Down: " . $hour->uofa);

                // Normalize for UofA graph
                //$hour->availability = min(3600,  $hour->availability) / 3600;
                //$hour->utilisation = min(3600,  $hour->utilisation) / 3600;
            }
        }

        // Get the UOFA after all time assignments from 
        // events and also tally totals for each category
        $this->timeUtilised = 0;
        $this->timeDown = 0;
        $this->timeAvailable = 0;
        for ($i = 0; $i < count($hourDateObjs); $i++) {

            $this->timeUtilised += $hourDateObjs[$i]->utilisation;
            $this->timeDown += $hourDateObjs[$i]->totalTime - $hourDateObjs[$i]->availability;
            $this->timeAvailable += $hourDateObjs[$i]->availability;

            // Ratio for UofA
            if ($hourDateObjs[$i]->availability > 0)
                $hourDateObjs[$i]->uofa = $hourDateObjs[$i]->utilisation / $hourDateObjs[$i]->availability;

            // Normalize 
            $hourDateObjs[$i]->availability = min(3600, $hourDateObjs[$i]->availability) / 3600;
            $hourDateObjs[$i]->utilisation = min(3600, $hourDateObjs[$i]->utilisation) / 3600;
        }

        $this->uofa = $hourDateObjs;
    }
*/
