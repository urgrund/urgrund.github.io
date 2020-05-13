<?php


class ScrambleData
{
    public static function Scramble()
    {
        ScrambleData::EventsInEquipment();
        ScrambleData::NamesInSites();
    }


    private static function NamesInSites()
    {
        global $allSites;
        if ($allSites == null)
            return;

        for ($i = 0; $i < count($allSites) - 2; $i++) {
            $allSites[$i]->name = "MineSite " . ($i + 1);
        }
    }

    private static function EventsInEquipment()
    {
        global $allSites;
        if ($allSites == null)
            return;

        $equipIndex = count($allSites) - 2;
        $count = 1;
        $siteIndex = 1;
        foreach ($allSites[$equipIndex] as $e) {
            for ($i = 0; $i < count($e->events); $i++) {
                if ($e->events[$i]->operator != ".")
                    $e->events[$i]->operator = "Operator" . $count . $i;

                $e->events[$i]->mineArea = "Area" . $siteIndex;
                $e->events[$i]->location = $i . $count . $i * 2;
                //$allSites[$equipIndex][$e->id]->events[$i]->operator = "Operator" . $count . $i;
                //Debug::Log($allSites[$equipIndex][$e->id]->events[$i]->location);
                $count++;
            }
            $siteIndex++;
        }
    }
}
