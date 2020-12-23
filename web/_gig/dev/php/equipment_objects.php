<?php
// File to hold objects/classes related to Equipment


class EventBreakDown
{
    var $majorGroup;
    var $duration;
    var $categories = array();
    var $eventCount;
}



// Container for each event
class EquipmentEvent
{
    var $operator;
    var $dayAhead;
    var $eventTime;         // DT object
    var $location;          // sub-location
    var $mineArea;
    var $duration;          // duration in seconds
    var $status;            // minor group
    var $majorGroup;        // Such as Idle, Operating, Down
    var $shift;
    var $tumCategory;       // Time Usage Model category
}




class EquipmentUofAHour
{
    var $dateTime;
    var $availability = 0;
    var $utilisation = 0;
    var $totalTime = 0;
    var $uofa = 0;

    var $down = 0;
    var $idle = 0;
    var $operating = 0;

    // Set the DateTime to the current
    // data date and offset by 6 (the data phase is 6am -> 6am)
    function __construct($_timeIndex, $_shiftIndex)
    {
        global $date;
        $this->dateTime = new DateTime($date);
        if ($_shiftIndex == 0)
            $this->dateTime->setTime($_timeIndex + 6, 00, 00, 0);
        else
            $this->dateTime->setTime($_timeIndex + 12, 00, 00, 0);
    }
}



class EquipmentShiftData
{
    //var $tph;
    //var $tphAvg;
    //var $tphTotal;

    var $eventFirstOp = null;
    var $events = array();
    var $eventBreakDown = array();
    var $uofa = array();

    var $metricData = array();

    var $timeTotal;

    // Exclusive states 
    var $timeExOperating;
    var $timeExIdle;
    var $timeExDown;
}



/** 
 * Holds data related to a specific Metric  
 */
class MetricData
{
    public $metric;
    public $name;
    public $activity;

    // New
    public $site;       // Friendly Site name from config
    public $key;        // Site key from DB
    public $shift;      // Shift this metric was recorded in

    public $mph = array();  // Metric per hour data
    public $cph = array();  // Cumulative per hour 
    public $average = 0;
    public $total = 0;



    /** Construct new Metric data with the Metric, Site and Activity
     */
    function __construct($_metric, $_site, $_activity, $_shift)
    {
        // Maps the metric abbrv to a 'nice name' 
        //global $metricMap;

        //Debug::Log("Creating Metric with " . $_site);
        $this->site = Config::Sites($_site);
        $this->key = $_site;
        $this->metric = $_metric;
        $this->shift = $_shift;
        //$this->value = $_value;
        $this->activity = $_activity;

        //if (array_key_exists($_metric, $metricMap))
        //  $this->name = $metricMap[$_metric];

        if (Config::MetricMap($_metric) != null)
            $this->name = Config::MetricMap($_metric);
    }


    // Add & increment the value array
    // whilst measure the cumulative value
    function AddValue(float $_value)
    {
        if ($_value == null)
            $_value = 0;

        //Debug::Log($_value);

        $count = count($this->mph);
        $this->mph[] = $_value;

        if ($count > 0)
            $this->cph[] = $this->cph[$count - 1] + $_value;
        else
            $this->cph[] = $_value;

        // Just always sum totals so it's current
        // and then don't need an extra function 
        $this->total = $this->cph[$count];
        $this->average = round($this->total / ($count + 1), 2);
    }




    /**
     * Adds MetricData A values to B
     *
     * @param MetricData $a
     * @param MetricData $b
     * @return void
     **/
    public static function Add(MetricData $a, MetricData &$b)
    {
        // Get a new array with the biggest size
        $newMph = [];
        $newSize = max(count($a->mph), count($b->mph));
        for ($i = 0; $i < $newSize; $i++) {
            $newMph[$i] = 0;
        }

        // Add both A & B to the total
        for ($i = 0; $i < count($a->mph); $i++)
            $newMph[$i] += $a->mph[$i];
        for ($i = 0; $i < count($b->mph); $i++)
            $newMph[$i] += $b->mph[$i];

        $b->mph = [];
        $b->cph = [];

        for ($i = 0; $i < count($newMph); $i++)
            $b->AddValue($newMph[$i]);
    }
}
