<?php


class ScrambleData
{
    public static function Scramble()
    {
        global $allSites;
        if ($allSites == null)
            return;

        ScrambleData::NamesInSites();
        ScrambleData::LocationsInMaterialMovements();
        ScrambleData::EventsInEquipment();

        ScrambleData::NamesInEquipment();
    }


    private static function NamesInSites()
    {
        global $allSites;

        for ($i = 0; $i < count($allSites) - 2; $i++) {
            $allSites[$i]->name = "MineSite " . ($i + 1);
        }
    }

    private static function LocationsInMaterialMovements()
    {
        global $allSites;
        for ($i = 0; $i < count($allSites) - 2; $i++) {
            $site = $allSites[$i];
            for ($x = 0; $x < 2; $x++) {
                $mm = $site->shiftData[$x]->materialMovements;
                //Debug::Log($mm);

                // Create random value for each unique location
                $uniqueLocations = array();
                for ($j = 0; $j < count($mm); $j++) {
                    if (!isset($uniqueLocations[$mm[$j][3]]))
                        $uniqueLocations[$mm[$j][3]] = "S" . round(rand());
                    if (!isset($uniqueLocations[$mm[$j][5]]))
                        $uniqueLocations[$mm[$j][5]] = "Loc" . round(rand() * 0.01);
                }

                //  Remap to original
                for ($j = 0; $j < count($mm); $j++) {
                    $mm[$j][3] = $uniqueLocations[$mm[$j][3]];
                    $mm[$j][5] = $uniqueLocations[$mm[$j][5]];
                }
                $allSites[$i]->shiftData[$x]->materialMovements = $mm;
                //Debug::Log($mm);
            }
        }
        //Debug::Log($allSites[0]->shiftData[0]->materialMovements);
    }

    private static function EventsInEquipment()
    {
        global $allSites;

        $equipIndex = count($allSites) - 2;
        $count = 1;
        $siteIndex = 1;
        foreach ($allSites[$equipIndex] as $e) {
            for ($i = 0; $i < count($e->events); $i++) {
                if ($e->events[$i]->operator != ".")
                    $e->events[$i]->operator = "Operator" . $count . $i;

                $e->events[$i]->mineArea = "Area" . $siteIndex;
                $e->events[$i]->location = $i . $count . $i * 2;
                $count++;
            }
            $siteIndex++;
        }
    }

    private static function NamesInEquipment()
    {
        global $allSites;

        $equipIndex = count($allSites) - 2;
        $count = 1;
        foreach ($allSites[$equipIndex] as $e) {

            $oldID = $e->id;
            $newID = "Asset";
            if ($e->function == "P") $newID = "Solo" . $count;
            if ($e->function == "D") $newID = "Jumbo" . $count;
            if ($e->function == "LOADING") $newID = "Bogger" . $count;
            if ($e->function == "HAULING") $newID = "Truck" . $count;

            // For each site
            for ($i = 0; $i < count($allSites) - 2; $i++) {
                // Change equipment list names
                for ($x = 0; $x < count($allSites[$i]->equipment); $x++) {
                    if ($allSites[$i]->equipment[$x] == $oldID)
                        $allSites[$i]->equipment[$x] = $newID;
                }

                // Change by function names
                foreach ($allSites[$i]->equipmentByFunction as &$ef) {
                    for ($x = 0; $x < count($ef); $x++) {
                        if ($ef[$x] == $oldID)
                            $ef[$x] = $newID;
                    }
                    //Debug::Log($ef);
                }
            }
            $e->id = $newID;
            $count++;
        }

        $newEquipArray = [];
        foreach ($allSites[$equipIndex] as $e) {
            $newEquipArray[$e->id] = $e;
        }

        $allSites[$equipIndex] = $newEquipArray;
    }
}
