<?php
// File to hold objects/classes related to Equipment

interface IFromJSON
{
    public static function FromJSON(Object $obj);
}


class EventBreakDown implements IFromJSON
{
    var $duration = 0;
    var $eventCount = 0;
    var $categories = array();
    public static function FromJSON(Object $obj)
    {
        $e = new EventBreakDown();
        $e->duration = $obj->duration;
        $e->eventCount = $obj->eventCount;
        foreach ($obj->categories as $key => $value) {
            $e->categories[$key] = $value;
        }
        return $e;
    }
}



// Container for each event
class EquipmentEvent
{
    var $operator;
    var $dayAhead;          // Is this in the next day (ie. 1am)
    var $eventTime;         // DT object
    var $location;          // sub-location
    var $mineArea;
    var $duration;          // duration in seconds
    var $status;            // minor group
    var $majorGroup;        // Such as Idle, Operating, Down
    var $shift;
    var $tumCategory;       // Time Usage Model category
    var $tumIndex;          // 0-5 index of the Tum category
}




class EquipmentUofAHour
{
    //var $dateTime;
    var $availability = 0;
    var $utilisation = 0;
    var $totalTime = 0;
    var $uofa = 0;

    //var $down = 0;
    //var $idle = 0;
    //var $operating = 0;

    // Set the DateTime to the current
    // data date and offset by 6 (the data phase is 6am -> 6am)
    //function __construct($_timeIndex, $_shiftIndex)
    //{
    //  global $date;
    // $this->dateTime = new DateTime($date);
    // if ($_shiftIndex == 0)
    //     $this->dateTime->setTime($_timeIndex + 6, 00, 00, 0);
    // else
    //     $this->dateTime->setTime($_timeIndex + 12, 00, 00, 0);
    //}
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

    //var $timeTotal;

    public AssetUtilisationPerDay $assetUtilisation;

    //var $tumTimings = array();
    //public TUMTimings $tumTimings;

    function __construct()
    {
        //$this->tumTimings = Config::CreateDistinctTUMArray();
        //$this->tumTimings = new TUMTimings();

        $this->assetUtilisation = new AssetUtilisationPerDay('00000000');

        //foreach ($this->tumTimings as $x => $x_value) {
        //  $this->tumTimings[$x] = new EventBreakDown();
        //}
    }
}


/**   
 * Class to hold timings in a TUM category
 * based on the particular config.  This will
 * store the categories for eac TUM activity 
 */
class TUMTimings
{
    function __construct()
    {
        $tmp = Config::CreateDistinctTUMArray();
        foreach ($tmp as $x => $x_value) {
            $this->$x = new EventBreakDown();
        }
    }
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



    /**
     * Construct new Metric data with the Metric, Site and Activity
     * @param string $_metric
     * @param string $_site
     * @return void
     */
    function __construct($_metric, $_site, $_activity, $_shift)
    {
        //Debug::Log("Creating Metric with " . $_site);
        $this->site = Config::Sites($_site);
        $this->key = $_site;
        $this->metric = $_metric;
        $this->shift = $_shift;
        //$this->value = $_value;
        $this->activity = $_activity;

        if (Config::MetricMap($_metric) != null)
            $this->name = Config::MetricMap($_metric);
    }


    // Add & increment the value array
    // whilst measure the cumulative value
    function AddValue(float $_value) //, int $_index = -1)
    {
        if ($_value == null)
            $_value = 0;

        $count = count($this->mph);
        // if ($_index > -1) {
        //     $this->mph[$_index] = $_value;
        // } else
        $this->mph[] = $_value;

        // Calculate cumulative
        $this->cph = [];
        if ($count > 0) {
            //$this->cph[] = $this->cph[$count - 1] + $_value;
            for ($i = 0; $i < count($this->mph); $i++) {
                $this->cph[] = ($i > 0) ? $this->cph[$i - 1] + $this->mph[$i] : $this->mph[$i];
            }
        } else
            $this->cph[] = $_value;

        // Just always sum totals 
        $this->total = $this->cph[$count];
        $this->average = round($this->total / ($count + 1), 2);
    }




    /**
     * Adds MetricData A values to B by merging their array values
     *
     * @param MetricData $a
     * @param MetricData $b
     * @return void
     **/
    public static function Merge(MetricData $a, MetricData &$b)
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



class AssetUtilisationPerDay
{
    // DAVES RATIOS
    // Available Time = Calendar Time – (Unplanned Breakdown + Planned Maintenance)
    // Availability% = available time / CT
    // U of A% = (Secondary Op + Primary Op) / Available Time
    // Efficiency% = Primary op / (Secondary Op + Primary Op)
    // Total AU% = Availability% X UofA% X Eff%
    // Or Total AU% = Primary OP / CT (do it both ways to check you got the math right, that’s what I do) :D

    public int $dateID;

    public int $calendarTime = 0;

    public float $availableTime = 0;
    public float $availability = 0;
    public float $uOfa = 0;
    public float $efficiency = 0;
    public float $totalAU = 0;

    //var $tumTimings = array();
    public TUMTimings $tumTimings;

    function __construct(int $_dateID)
    {
        $this->dateID = $_dateID;
        $this->calendarTime = 0;
        $this->tumTimings = new TUMTimings();
        //$this->tumTimings = Config::CreateDistinctTUMArray();
        //foreach ($this->tumTimings as $x => $x_value) {
        //  $this->tumTimings[$x] = new EventBreakDown();
        //}
    }

    public function GenerateUtilisationFromTUM()
    {
        if ($this->calendarTime == 0)
            return;

        // This maps the TUM index to a property so 
        // that it will work across different configs
        // and avoid any ambiguities with names/strings
        $propUPBRD = Config::Instance()->TUMIndex[0];
        $propPLMN = Config::Instance()->TUMIndex[1];
        $propSECOP = Config::Instance()->TUMIndex[4];
        $propPRIOP = Config::Instance()->TUMIndex[5];
        //Debug::Log($propUPBRD);


        // These are the common names for TUM categories, though 
        // may differ due to the config, but this keeps it consistent just here

        $unplannedBreakdown = $this->tumTimings->$propUPBRD->duration;
        $plannedMaintenance = $this->tumTimings->$propPLMN->duration;
        $primaryOperating = $this->tumTimings->$propPRIOP->duration;
        $secondaryOperating = $this->tumTimings->$propSECOP->duration;

        // $unplannedBreakdown = $this->tumTimings['Unplanned Breakdown']->duration;
        // $plannedMaintenance = $this->tumTimings['Planned Maintenance']->duration;
        // $primaryOperating = $this->tumTimings['Primary Operating']->duration;
        // $secondaryOperating = $this->tumTimings['Secondary Operating']->duration;

        $this->availableTime = $this->calendarTime - ($unplannedBreakdown + $plannedMaintenance);
        $this->availability = $this->availableTime / $this->calendarTime;

        if ($this->availableTime == 0)
            $this->uOfa = 0;
        else
            $this->uOfa = ($secondaryOperating + $primaryOperating) / $this->availableTime;

        if ($secondaryOperating + $primaryOperating == 0)
            $this->efficiency = 0;
        else
            $this->efficiency = $primaryOperating / ($secondaryOperating + $primaryOperating);

        $this->totalAU = $primaryOperating / $this->calendarTime;
    }
}
