<?php


class ScrambleData
{
    public static function Scramble()
    {
        global $allSites;
        if ($allSites == null)
            return;

        ScrambleData::EventsInEquipment();
        ScrambleData::NamesInSites();
        ScrambleData::NamesInEquipment();
    }


    private static function NamesInSites()
    {
        global $allSites;

        for ($i = 0; $i < count($allSites) - 2; $i++) {
            $allSites[$i]->name = "MineSite " . ($i + 1);
        }
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
