<?php

class SiteShiftData
{
    /** All metrics that come through the site are stored here */
    var $metricData = array();

    // Only the Production stuff is here
    var $productionTonnes = null;
    var $productionMetres = null;

    var $materialMovements = array();

    var $assetUtilisationByFunction = array();

    public AssetUtilisationPerDay $assetUtilisationTotal;


    private EquipmentShiftData $_equipShiftData;
    function GenerateAssetUtilisation(Site $site, int $shift)
    {
        //global $sqlMineEquipmentList;
        global $allEquipment;
        $this->assetUtilisationTotal = new AssetUtilisationPerDay(0);

        foreach ($site->equipmentByFunction as  $key => $value) {
            $this->assetUtilisationByFunction[$key] = new AssetUtilisationPerDay(0);
            //Debug::Log($key);
            for ($i = 0; $i < count($value); $i++) {
                $this->_equipShiftData = $allEquipment[$value[$i]]->shiftData[$shift];
                $this->assetUtilisationByFunction[$key]->AddTUMValues($this->_equipShiftData->assetUtilisation->tumTimings);
                $this->assetUtilisationTotal->AddTUMValues($this->_equipShiftData->assetUtilisation->tumTimings);
            }

            $this->assetUtilisationByFunction[$key]->GenerateUtilisationFromTUM();
            $this->assetUtilisationTotal->GenerateUtilisationFromTUM();
        }

        //Debug::Log($this->assetUtilisationTotal);
    }
}



class SiteSummary
{
    // Phase 5 TMM Ex pit Tonnes = 
    // Asset ID = (Equipment ID’s that are Truck Classes), 
    // Mine Area = (5)
    // Metric = (Tonnes) 
    // Secondary Activity Type <> NULL

    // Phase 5 Ex-PIT Ore  =
    // Asset ID = (Equipment ID’s that are Truck Classes), 
    // Mine Area = (5)
    // Metric = (Tonnes)
    // Secondary Activity Type = Ore


    public float $TMMExPitTonnes = 0;
    public float $TotalExpPitOre = 0;
    public float $TotalExpPitWaste = 0;
    public float $DrillMeters = 0;

    //public array $summary = [];
    public array $materials = [];

    public function __construct(Site $site)
    {
        global $sqlMetricPerHour;
        global  $sqlMineEquipmentList;

        for ($i = 0; $i < count($sqlMetricPerHour); $i++) {
            $eventSite = Config::Sites($sqlMetricPerHour[$i][1]);
            $eventAssetID = $sqlMetricPerHour[$i][0];

            // Equipment belongs to this site
            $equipCount = 0;
            if ($eventSite == $site->name) {
                $equipCount++;
                $func = $sqlMineEquipmentList[$eventAssetID][1];
                $metric = $sqlMetricPerHour[$i][2];
                $second = $sqlMetricPerHour[$i][3];
                $matType = $sqlMetricPerHour[$i][28];

                // For Trucks & Tonnes
                if (
                    $func == "Truck Classes"
                    && $metric == "Tonnes"
                ) {
                    $rowTotal = 0;
                    for ($j = 4; $j < 28; $j++) {
                        if ($sqlMetricPerHour[$i][$j] != NULL) {
                            // The value for this hour in this row                            
                            $val =  $sqlMetricPerHour[$i][$j];
                            $rowTotal += $val;
                            // Where to add it to?
                            if ($second != null) {
                                $this->TMMExPitTonnes += $val;
                                if ($second == "Ore") {
                                    $this->TotalExpPitOre += $val;
                                }
                                if ($second == "Waste") {
                                    $this->TotalExpPitWaste += $val;
                                }
                            }
                        }
                    }

                    // For Truck Tonnes material types
                    // adding the sum of each row
                    if (!isset($this->materials[$matType]))
                        $this->materials[$matType] = $rowTotal;
                    else
                        $this->materials[$matType] += $rowTotal;
                }

                // For Track Drills
                if (
                    $func == "Track Drill"
                    && $metric == "Metres"
                ) {
                    for ($j = 4; $j < 28; $j++) {
                        if ($sqlMetricPerHour[$i][$j] != NULL) {
                            $this->DrillMeters +=  $sqlMetricPerHour[$i][$j];
                        }
                    }
                }
            }
        }

        // Add them to the final array 
        // to package for frontend
        $this->TMMExPitTonnes = round($this->TMMExPitTonnes, 2);
        $this->TotalExpPitOre = round($this->TotalExpPitOre, 2);
        $this->TotalExpPitWaste = round($this->TotalExpPitWaste, 2);
        $this->DrillMeters = round($this->DrillMeters, 2);

        // Debug::Log($site->name);
        // Debug::Log("TMMExPitTonnes : " . $this->TMMExPitTonnes);
        // Debug::Log("TotalExpPitOre : " . $this->TotalExpPitOre);
        // Debug::Log("TotalExpPitWaste : " . $this->TotalExpPitWaste);
        // Debug::Log("DrillMeters : " . $this->DrillMeters);

        // Debug::Log($this->materials);
        // Debug::Log("___");
        //Debug::Log($site->name);
    }
}


class Site
{
    //var $key;
    var $name;

    //var $tph24;
    //var $uoaf24 = array();

    var $shiftData = [];

    var $equipmentByFunction = array();
    var $equipment = array();

    // List of possible functions an equipment can have at this site
    private $_equipFunction = array();

    public SiteSummary $summary;

    function __construct($_name)
    {
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
        //$this->tph24 = new SiteShiftData();

        $this->shiftData[] = new SiteShiftData();
        $this->shiftData[] = new SiteShiftData();
        $this->shiftData[] = new SiteShiftData();

        // Why have to do this, why can't PHP 
        // initialize with array length?
        for ($i = 0; $i < 24; $i++) {

            //$this->tph24->tph[$i] = 0;
            //$this->tph24->cumulative[$i] = 0;

            array_push($tempOp, 0);
            array_push($tempIdle, 0);
            array_push($tempDown, 0);
        }

        //array_push($this->uoaf24, $tempOp);
        //array_push($this->uoaf24, $tempIdle);
        //array_push($this->uoaf24, $tempDown);


        // Get's the equipment belonging to this site
        $this->equipment = array();
        for ($i = 1; $i < count($sqlMetricPerHour); $i++) {

            $eID = $sqlMetricPerHour[$i][0];
            $eSiteKey = $sqlMetricPerHour[$i][1];
            $eSiteName = Config::Sites($eSiteKey); //$configSites[$eSiteKey];

            $eFunction = "";
            if (isset($sqlMineEquipmentList[$eID]))
                $eFunction = $sqlMineEquipmentList[$eID][1];

            //Debug::Log("[" . $eSiteKey . "]   [" . $eSiteName . "]   [" .  $this->name . "]");
            // The equipment site name matches this site
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
    }




    public function GenerateSummary()
    {
        // This whole thing is temporary for now
        if (Client::instance()->Name() == "MineStar") {
            $this->summary = new SiteSummary($this);
        }

        //if ($this->name == "Western Flanks") {
        for ($i = 0; $i < count($this->shiftData); $i++) {
            $this->shiftData[$i]->GenerateAssetUtilisation($this, $i);
        }
        //}
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
        for ($i = 0; $i < count($this->shiftData); $i++) {

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
                    $md = new MetricData($metric->metric, $metric->key, $metric->activity, $i);
                    MetricData::Merge($metric, $md);
                    // Add a new array to keep track of 
                    // the Equip ID's that added to this metric
                    $md->equip = [];
                    $md->equip[] = $e->id;
                    $this->shiftData[$i]->metricData[] = $md;
                } else {
                    // Otherwise add to existing... 
                    $md->equip[] = $e->id;
                    MetricData::Merge($metric, $md);
                }


                // If a Production TONNE
                // then add this to the production metrics
                if ($metric->metric == Config::productionMetricTonne()) {

                    // The activity is production, this is
                    // what we want to record 
                    if (strpos($metric->activity, Config::productionActivity()) !== false) {

                        // Create if haven't already 
                        if ($this->shiftData[$i]->productionTonnes == null)
                            $this->shiftData[$i]->productionTonnes = new MetricData($metric->metric, $metric->key, $metric->activity, $i);

                        // Add this equipments metric (which is production)
                        // to this sites production Metric
                        MetricData::Merge($metric, $this->shiftData[$i]->productionTonnes);
                    }
                }


                // If a Production METER
                // then add this to the production metrics
                if (strpos($metric->metric, Config::productionMetricMetre()) !== false) {

                    // The activity is production, this is
                    // what we want to record 
                    if (strpos($metric->activity, Config::productionActivity()) !== false) {

                        // Create if haven't already 
                        if ($this->shiftData[$i]->productionMetres == null)
                            $this->shiftData[$i]->productionMetres = new MetricData($metric->metric, $metric->key, $metric->activity, $i);

                        // Add this equipments metric (which is production)
                        // to this sites production Metric
                        MetricData::Merge($metric, $this->shiftData[$i]->productionMetres);
                    }
                }
            }
        }
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


    function MakeArraysNumeric()
    {
        $tmp = [];
        foreach (array_keys($this->equipment) as $equip)
            $tmp[] = $equip;
        $this->equipment = $tmp;
    }
}
