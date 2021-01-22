<?php


/**
 * Equipment Class - deals with an equipment asset
 * storing its shift data & metrics 
 * @author Matt Bell
 */
class Equipment
{
    /** Asset ID */
    var $id;

    var $sites = [];
    var $function;
    var $events = array();
    var $shiftData = array();

    private $genComplete = false;

    function __construct($_id)
    {
        global $sqlMineEquipmentList;

        $this->id = $_id;

        // The shifts         
        $this->shiftData[] = new EquipmentShiftData();  // Day Shift
        $this->shiftData[] = new EquipmentShiftData();  // Night Shift
        $this->shiftData[] = new EquipmentShiftData();  // 24 Hour

        // Function key
        if (isset($sqlMineEquipmentList[$_id])) {
            $this->function = $sqlMineEquipmentList[$_id][1];
        } else {
            //Debug::Log("Not found for " . $_id);
        }
    }

    function AddEvent($_eventDataRow)
    {
        //global $date;

        $e = new EquipmentEvent();

        // See if this event takes place a day ahead (after midnight)
        $dataDate = CreateSiteData::DateForData();
        $eventDate = new DateTime($_eventDataRow[2]->format('Ymd'));
        $diff = date_diff($dataDate, $eventDate);
        $e->dayAhead = $diff->d;

        //Debug::Log($e->dayAhead . " | ");        
        //Debug::LogI($dataDate->format('Ymd') . "   ");
        //Debug::LogI($eventDate->format('Ymd'));


        $e->operator = $_eventDataRow[1];
        $e->eventTime = $_eventDataRow[2];
        $e->location = $_eventDataRow[3];
        $e->mineArea = $_eventDataRow[4];
        $e->duration = $_eventDataRow[5];
        $e->status = $_eventDataRow[6];
        $e->shift = $_eventDataRow[7] - 1;

        $e->tumCategory = Config::TUM($e->status);
        $e->majorGroup = Config::MajorGroup($e->tumCategory);
        $e->tumIndex = Config::TUMIndex($e->tumCategory);

        //Debug::Log($e->tumCategory);

        // In case the status hasn't been 
        // mapped to a TUM category yet
        if ($e->tumCategory == null) {
            //Debug::Log($this->id . " has no TUM for " . $e->status);
            //          $e->tumIndex = -1;
            $e->tumCategory = "NO TUM CATEGORY";
        } //else
        //            $e->tumIndex = Config::$instance->TUMKeys[$e->tumCategory];

        // Which shift does this event belong to?        
        // Store only the index of this event here
        //$shiftIndex = $e->shift == "P1" ? 0 : 1;
        $shiftIndex = $e->shift;
        //Debug::Log($e->shift);
        $this->shiftData[$shiftIndex]->events[] = count($this->events);

        // Store the event in the 24hr list
        $this->shiftData[2]->events[] = count($this->events);



        // Store the full event details 
        $this->events[] = $e;
    }


    private function GetSecondsInHour($dateTime)
    {
        return (intval($dateTime->format('i')) * 60) + (intval($dateTime->format('s')));
    }

    function GenerateUofAFromEvents()
    {
        // For each shift... 
        for ($q = 0; $q < 2; $q++) {

            // Prepare 12 UofA hours for the shift
            $hourDateObjs = [];
            for ($i = 0; $i < 12; $i++) {
                //$hourDateObjs[$i] = new EquipmentUofAHour($i, $q);
                $hourDateObjs[$i] = new EquipmentUofAHour();
            }

            // Easier ref
            $events = $this->shiftData[$q]->events;

            // Go through all events for this shift
            // and allocate seconds in each shift hour
            for ($i = 0; $i < count($events); $i++) {

                $event = $this->events[$events[$i]];
                //Debug::Log($event);

                // Get start and end dates
                $startDate = clone $event->eventTime;
                $endDate = clone $startDate;
                $endDate->add(new DateInterval('PT' . $event->duration . 'S'));

                $startHour = intval($startDate->format('H'));
                if ($event->dayAhead == 1)
                    $startHour += 24;

                $endHour = intval($endDate->format('H'));

                // Frustrating that the dateTime diff would not
                // show a day difference (ie. 11th to the 12th),
                // so this works but doesn't feel elegant
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
                    if ($event->majorGroup != Config::MajorGroupDown) {
                        $hourDateObj->availability += $secondsSpentInHour;
                        if ($event->majorGroup != Config::MajorGroupIdle)
                            $hourDateObj->utilisation +=  $secondsSpentInHour;
                    }


                    // Exclusive time of Down/Idle/Operating
                    // if ($event->majorGroup == Config::MajorGroupDown) {
                    //     $hourDateObj->down += $secondsSpentInHour;
                    // } else if ($event->majorGroup == Config::MajorGroupIdle) {
                    //     $hourDateObj->idle += $secondsSpentInHour;
                    // } else
                    //     $hourDateObj->operating += $secondsSpentInHour;
                }
            }

            // Assign the date objects 
            $this->shiftData[$q]->uofa =  $hourDateObjs;
        }

        // Get all the shift totals
        for ($q = 0; $q < 2; $q++) {

            // $this->shiftData[$q]->timeExOperating = 0;
            // $this->shiftData[$q]->timeExIdle = 0;
            // $this->shiftData[$q]->timeExDown = 0;

            for ($i = 0; $i < count($this->shiftData[$q]->uofa); $i++) {
                $hour = $this->shiftData[$q]->uofa[$i];

                // TODO phase this out as its old MajorGroup stuff
                // $this->shiftData[$q]->timeExOperating += $hour->operating;
                // $this->shiftData[$q]->timeExIdle += $hour->idle;
                // $this->shiftData[$q]->timeExDown += $hour->down;

                // Ratio for UofA
                if ($hour->availability > 0)
                    $hour->uofa =  $hour->utilisation /  $hour->availability;

                // For the 24 view
                $this->shiftData[2]->uofa[$i + ($q * 12)] = $hour;
            }
        }
    }




    /**
     * From an array of events this function will
     * split out the categories, minor events and 
     * the total time spent in each of these to see
     * how many of each type of event may have occurred
     * 
     * @param array $_eventsArray
     **/
    /*private function GetBreakDownOfEventsArray($_eventsArray)
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
    }*/




    private function GetTUMBreakDownOfEvents()
    {
        for ($i = 0; $i < 2; $i++) {
            $_shiftIndex = $i;
            $_eventsArray = $this->shiftData[$_shiftIndex]->events;
            $_tumTimings = $this->shiftData[$_shiftIndex]->tumTimings;
            $_tumTimings24 = $this->shiftData[2]->tumTimings;

            for ($j = 0; $j < count($_eventsArray); $j++) {
                $event = $this->events[$_eventsArray[$j]];

                // For events that aren't mapped properly 
                // to a TUM category 
                if (!isset($_tumTimings[$event->tumCategory]))
                    continue;

                $_tumTimings[$event->tumCategory]->eventCount++;
                $_tumTimings[$event->tumCategory]->duration += $event->duration;
                if (!isset($_tumTimings[$event->tumCategory]->categories[$event->status]))
                    $_tumTimings[$event->tumCategory]->categories[$event->status] = $event->duration;
                else
                    $_tumTimings[$event->tumCategory]->categories[$event->status] += $event->duration;


                // For the 24hr timings
                $_tumTimings24[$event->tumCategory]->eventCount++;
                $_tumTimings24[$event->tumCategory]->duration += $event->duration;
                if (!isset($_tumTimings24[$event->tumCategory]->categories[$event->status]))
                    $_tumTimings24[$event->tumCategory]->categories[$event->status] = $event->duration;
                else
                    $_tumTimings24[$event->tumCategory]->categories[$event->status] += $event->duration;

                $this->shiftData[$_shiftIndex]->timeTotal += $event->duration;
                $this->shiftData[2]->timeTotal += $event->duration;
            }
        }
    }



    // Generate the event breakdowns for both shifts
    function GenerateEventBreakDown()
    {
        //$this->shiftData[0]->eventBreakDown = $this->GetBreakDownOfEventsArray($this->shiftData[0]->events);
        //$this->shiftData[1]->eventBreakDown = $this->GetBreakDownOfEventsArray($this->shiftData[1]->events);
        $this->GetTUMBreakDownOfEvents();
    }


    /** For each shift, get the indices for
     * first call ups and last call up events */
    function GenerateShiftCallUps()
    {
        for ($i = 0; $i < count($this->shiftData); $i++) {
            for ($j = 0; $j < count($this->shiftData[$i]->events); $j++) {
                $event = $this->events[$this->shiftData[$i]->events[$j]];
                // if ($this->id == 'LH020') {
                //     Debug::Log($event);
                // }
                if ($this->shiftData[$i]->eventFirstOp == null) {
                    if ($event->majorGroup == "OPERATING") {
                        $this->shiftData[$i]->eventFirstOp = $j;
                    }
                }
            }
        }
    }

    // Metric per hour
    function GenerateMPH()
    {
        // Already generated data?
        if ($this->genComplete)
            return;

        global $allSites;
        global $sqlMetricPerHour;

        // Go through all events...
        // Record the hourly data based on shift
        // and based on Metric 
        for ($i = 0; $i < count($sqlMetricPerHour); $i++) {

            // It's an ID match for this Eqiup!
            if ($sqlMetricPerHour[$i][0] == $this->id) {

                // The metric record
                $e = $sqlMetricPerHour[$i];
                //Debug::Log($sqlMetricPerHour[$i]);

                // Metric Data for both shifts
                $_metric = $e[2];
                $_site = $e[1];
                $_activity = $e[3];

                $mdDay = new MetricData($_metric, $_site, $_activity, 0);
                $mdNight = new MetricData($_metric, $_site, $_activity, 1);
                $md24Hr = new MetricData($_metric, $_site, $_activity, 2);

                // This is where the hourly data 
                // starts from the SQL results
                $dataIdx = 4;

                // For each hour in the event                
                for ($j = $dataIdx; $j < count($e); $j++) {

                    // Which shift to assign?                         
                    if ($j > $dataIdx + 12 - 1)
                        $mdNight->AddValue($e[$j]); //, $j - $dataIdx);
                    else
                        $mdDay->AddValue($e[$j]); //, $j - $dataIdx);

                    $md24Hr->AddValue($e[$j]);
                }

                // Assign to the shifts
                $this->shiftData[0]->metricData[] = $mdDay;
                $this->shiftData[1]->metricData[] = $mdNight;
                $this->shiftData[2]->metricData[] = $md24Hr;
            }
        }



        // Attempt to merge and clean up empty Metrics
        for ($i = 0; $i < count($this->shiftData); $i++) {
            for ($j = 0; $j < count($this->shiftData[$i]->metricData); $j++) {
                if ($this->shiftData[$i]->metricData[$j]->total == 0) {
                    unset($this->shiftData[$i]->metricData[$j]);
                }
            }
        }

        // Fix up missing indexes
        for ($i = 0; $i < count($this->shiftData); $i++)
            $this->shiftData[$i]->metricData = array_values($this->shiftData[$i]->metricData);


        // Add this data to its site to tally totals
        for ($i = 0; $i < count($this->sites); $i++) {
            $allSites[$this->sites[$i]]->AddMetricDataFromEquipment($this);
        }

        // Completed MPH generation for this asset
        $this->genComplete = true;
        return;
    }


    /** See if a Metric is already registered with this equipment 
     * based on metric constructor parameters **/
    private function FindOrCreateMetric($_metric, $_site, $_activity, $_shift)
    {
        // Check if all the Metric params (metric, site, activity)
        // match up and return that Metric 
        for ($i = 0; $i < count($this->shiftData[$_shift]->metricData); $i++) {

            $m = $this->shiftData[$_shift]->metricData[$i];

            //Debug::Log("Finding: " . $_metric . "  " . $_activity . "  " . $_site);
            //Debug::Log("Exists:  " . $m->metric . "  " . $m->activity . "  " . $m->site);

            if (
                $m->metric == $_metric
                && $m->site == Config::Sites($_site)
                && $m->activity == $_activity
            ) {
                return $this->shiftData[$_shift]->metricData[$i];
            }
        }
        return new MetricData($_metric, $_site, $_activity, $_shift);
    }
}
