<?php

/**
 * Equipment Class - deals with an equipment asset
 * storing its shift data & metrics 
 * @author Matt Bell
 */
class Equipment
{
    // Asset ID
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
        $this->shiftData[] = new EquipmentShiftData();
        $this->shiftData[] = new EquipmentShiftData();


        // Function key
        if (isset($sqlMineEquipmentList[$_id])) {
            $this->function = $sqlMineEquipmentList[$_id][1];
        } else {
            //Debug::Log("Not found for " . $_id);
        }
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
        $e->tumCategory = Config::TUM($e->status);


        // Which shift does this event belong to?        
        // Store only the index of this event here
        if ($e->shift == "P1") {
            $this->shiftData[0]->events[] = count($this->events);
        } else {
            $this->shiftData[1]->events[] = count($this->events);
        }


        // Store the full event details 
        $this->events[] = $e;
        //Debug::Log(count($this->events));
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

                $event = $this->events[$events[$i]];
                //Debug::Log($event);

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




    /**
     * From an array of events this function will
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

                // Metric Data for both shifts
                $mdDay = new MetricData($e[2], $e[1], $e[3], 0); //$e[count($e) - 1]);
                $mdNight = new MetricData($e[2], $e[1], $e[3], 1); //$e[count($e) - 1]);

                // Data start index... for convenience 
                $dataIdx = 4;
                // For each hour in the event
                for ($j = $dataIdx; $j < count($e); $j++) {
                    // To offset in the SQL data, after dataIdx is where hourly data starts
                    //if ($j > $dataIdx && $j < count($e) - 1) {
                    // Which shift to assign?                         
                    if ($j > $dataIdx + 12 - 1)
                        $mdNight->AddValue($e[$j]);
                    else
                        $mdDay->AddValue($e[$j]);
                    //}
                }

                //Debug::Log($e[count($e) - 1]);

                // Assign to the shifts
                $this->shiftData[0]->metricData[] = $mdDay;
                $this->shiftData[1]->metricData[] = $mdNight;
            }
        }

        //Debug::Log($this->shiftData[1]);

        // Add this data to its site to tally totals
        for ($i = 0; $i < count($this->sites); $i++) {
            $allSites[$this->sites[$i]]->AddMetricDataFromEquipment($this);
        }

        $this->genComplete = true;
        return;
    }
}
