<?php

class SiteShiftData
{
    /** All metrics that come through the site are stored here */
    var $metricData = array();

    // Only the Production stuff is here
    var $productionTonnes = null;
    var $productionMetres = null;

    var $materialMovements = null;
}



class Site
{
    //var $key;
    var $name;

    var $tph24;
    var $uoaf24 = array();

    var $shiftData = [];

    // Movements out material of the mine
    var $materialMovement = array();

    var $equipmentByFunction = array();
    var $equipment = array();



    // List of possible functions an equipment can do at this site
    private $_equipFunction = array();

    function __construct($_name)
    {
        global $date;

        global $sqlMetricPerHour;
        global $sqlEquipEventList;
        global $sqlMineEquipmentList;

        //$this->key = $_key;
        $this->name = $_name;

        // Why have to do this, why can't PHP 
        // initialize with array length?
        $tempOp = [];
        $tempIdle = [];
        $tempDown = [];
        $this->tph24 = new SiteShiftData();
        $this->shiftData[] = new SiteShiftData();
        $this->shiftData[] = new SiteShiftData();

        // Why have to do this, why can't PHP 
        // initialize with array length?
        for ($i = 0; $i < 24; $i++) {

            $this->tph24->tph[$i] = 0;
            $this->tph24->cumulative[$i] = 0;

            array_push($tempOp, 0);
            array_push($tempIdle, 0);
            array_push($tempDown, 0);
        }

        array_push($this->uoaf24, $tempOp);
        array_push($this->uoaf24, $tempIdle);
        array_push($this->uoaf24, $tempDown);


        // MATT NEW STUFF

        // Get's the equipment belonging to this site
        $this->equipment = array();
        for ($i = 1; $i < count($sqlMetricPerHour); $i++) {
            $eID = $sqlMetricPerHour[$i][0];
            $eSiteKey = $sqlMetricPerHour[$i][1];
            $eSiteName = Config::Sites($eSiteKey); //$configSites[$eSiteKey];
            $eFunction = $sqlMineEquipmentList[$eID][1];

            // Name is valid 
            if ($eSiteName == $this->name) {
                // Add equipment to the site list
                $this->equipment[$eID] = $eFunction;

                // Add all equipment into their function category        
                if (!array_key_exists($eFunction, $this->equipmentByFunction))
                    $this->equipmentByFunction[$eFunction] = array();

                if (!in_array($eID, $this->equipmentByFunction[$eFunction]))
                    $this->equipmentByFunction[$eFunction][] = $eID;
            }
        }
        //Debug::Log($this->equipment);


        //foreach (array_keys($uniqueEquip) as $id) {
        //  $this->_equipFunction[$result[$i][0]] = $result[$i][1];
        //}

        //Debug::Log($this->name);

        return;




        // For this site, get the function that each 
        // equipment is currently performing

        // TODO - move this query back to the main and use site index 
        // on results?  This would be inline with the other queries 
        // $sqlTxt = "Select * from ALLMineEquipmentList(" . $date . ", '" . $this->key . "')";
        // $result = SQLUtils::QueryToText($sqlTxt);
        // for ($i = 1; $i < count($result); $i++) {
        //     $this->_equipFunction[$result[$i][0]] = $result[$i][1];
        // }

        //Debug::Log($sqlMetricPerHour);
    }


    public function GenerateMaterialMovements()
    {
        // TODO
        // Things like the sql text and the @Date should go into a 
        // SQL core settings class
        global $date;
        $str = SQLUtils::FileToQuery('..\assets\sql\Core\ALL_MaterialMovements.sql');
        for ($i = 0; $i < 2; $i++) {
            $sqlTxt = $str;
            $shift = "P" . ($i + 1);
            $sqlTxt = str_replace('@Date', "'" . $date . $shift . "'", $sqlTxt);
            $this->shiftData[$i]->materialMovements = SQLUtils::QueryToText($sqlTxt, "MM " . $shift);
        }
    }



    /** See if a Metric exists with this Site for a particular shift **/
    private function FindMetric($_metric, $_site, $_activity, $_shift)
    {
        if (count($this->shiftData[$_shift]->metricData) == 0)
            return null;

        // Check if all the Metric params (metric, site, activity)
        // match up and return that Metric 
        for ($i = 0; $i < count($this->shiftData[$_shift]->metricData); $i++) {
            $m = $this->shiftData[$_shift]->metricData[$i];
            if (
                $m->metric == $_metric
                && $m->site == $_site
                && $m->activity == $_activity
            ) {
                return $this->shiftData[$_shift]->metricData[$i];
            }
        }
        return null;
    }



    /**
     * Go through the Metric data of a piece of 
     * equipment and add the values to the total
     * shift metric data of this Site 
     * 
     * @param Equipment $e
     * @return void
     */
    function AddMetricDataFromEquipment(Equipment $e)
    {
        // For each shift, get each Metric Data and
        // see if it exists yet with the Site
        for ($i = 0; $i < 2; $i++) {

            for ($j = 0; $j < count($e->shiftData[$i]->metricData); $j++) {

                // Metric from the Equipment
                $metric = $e->shiftData[$i]->metricData[$j];

                // This equipment metric entry doesn't belong to this site?
                if ($this->name != $metric->site)
                    continue;

                // See if this already exists...
                $md = $this->FindMetric($metric->metric, $metric->site, $metric->activity, $i);

                // If it can't be found, then create a new one 
                if ($md == null) { //
                    $md = new MetricData($metric->metric, $metric->key, $metric->activity);
                    MetricData::Add($metric, $md);
                    // Add a new array to keep track of 
                    // the Equip ID's that added to this metric
                    $md->equip = [];
                    $md->equip[] = $e->id;
                    $this->shiftData[$i]->metricData[] = $md;
                } else {
                    // Otherwise add to existing... 
                    $md->equip[] = $e->id;
                    MetricData::Add($metric, $md);
                }


                // If a Production TONNE
                // then add this to the production metrics
                if ($metric->metric == "TONNE") {

                    // The activity is production, this is
                    // what we want to record 
                    if (strpos($metric->activity, 'Production') !== false) {

                        // Create if haven't already 
                        if ($this->shiftData[$i]->productionTonnes == null)
                            $this->shiftData[$i]->productionTonnes = new MetricData($metric->metric, $metric->key, $metric->activity);

                        // Add this equipments metric (which is production)
                        // to this sites production Metric
                        MetricData::Add($metric, $this->shiftData[$i]->productionTonnes);
                    }
                }


                // If a Production METER
                // then add this to the production metrics
                if (strpos($metric->metric, 'PROD') !== false) {

                    // The activity is production, this is
                    // what we want to record 
                    if (strpos($metric->activity, 'Production') !== false) {

                        // Create if haven't already 
                        if ($this->shiftData[$i]->productionMetres == null)
                            $this->shiftData[$i]->productionMetres = new MetricData($metric->metric, $metric->key, $metric->activity);

                        // Add this equipments metric (which is production)
                        // to this sites production Metric
                        MetricData::Add($metric, $this->shiftData[$i]->productionMetres);
                    }
                }
            }
        }
    }





    function MakeArraysNumeric()
    {
        // Sort by keys so that they are all in same order
        //ksort($this->equipmentByFunction);

        // Convert to indexed arrays
        //$this->equipmentByFunction = array_values($this->equipmentByFunction);
        $tmp = [];
        foreach (array_keys($this->equipment) as $equip)
            $tmp[] = $equip;
        $this->equipment = $tmp;
        //$this->equipment = array_values($this->equipment);
    }







    // Adds equipment to the Site and maps it to its function
    function AddEquipment(Equipment $_equipmentObject)
    {
        // Add equipment to sites total list
        $this->equipment[$_equipmentObject->id] = $_equipmentObject;

        // Assign the equipment its function
        $_equipmentObject->function = $this->_equipFunction[$_equipmentObject->id];

        // Put equipment into array based on function        
        // If the entry doesn't exist,  create it as a new array 
        if (!array_key_exists($_equipmentObject->function, $this->equipmentByFunction))
            $this->equipmentByFunction[$_equipmentObject->function] = array();

        // Add all equipment into their function category         
        $this->equipmentByFunction[$_equipmentObject->function][] = $_equipmentObject->id;
    }
}
