<?php

include_once('..\header.php');



// ----------------------------------------------------------
// ----------------------------------------------------------
// ----------------------------------------------------------
// WEB REQUEST ENTRY POINT
// This data will be valid with a URL 
// request from the client
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

if (is_object($request)) {
    include_once('..\setDebugOff.php');


    new Config();


    if ($request->func == 0) {
        //echo $request->data;
        Monthly::WriteCSV($request->data, $request->year, $request->month);
    }

    if ($request->func == 1) {
        echo json_encode(Monthly::GetCSV($request->year, $request->month));
    }

    if ($request->func == 3) {
        echo json_encode(Monthly::GetActuals($request->year, $request->month));
    }

    if ($request->func == 4) {
        echo json_encode(Monthly::MapActualsToPlan($request->year, $request->month));
    }
}
// ----------------------------------------------------------
// ----------------------------------------------------------
// ----------------------------------------------------------
else {

    new Config();

    $data = Monthly::GetCSV('2018', '11', true);
    Monthly::WriteCSV($data, '2018', '10');

    //include_once('..\setDebugOff.php');    
    //Debug::Log(Monthly::GetActuals('2018', '11'));

    //$p = Monthly::MapActualsToPlan('2018', '10');
    //Debug::Log($p);
    //Monthly::MetaData($p);
    //echo 'poo';
}
// ----------------------------------------------------------


class MonthlyMeta
{
    var $totalMetricTarget = 0;
    var $totalMetricActual;

    var $averageCurrent;
    var $averageRequired;

    var $complianceSpatial;
    var $complianceVolumetric;

    var $timeRemaining;
    var $timePassedInMonth;
}


class Monthly
{
    private static $_fileDir = "";
    private static $_fileName = "Plan_";
    private static $_fileExt = ".csv";


    public static function WriteCSV($_data, $_year, $_month)
    {
        if ($_data == null)
            return;

        Monthly::SanitizeCSVData($_data);
        $fileName = self::$_fileName .  $_year . $_month . self::$_fileExt;

        try {
            if (is_readable($fileName)) {
                $file = @fopen($fileName, "w");
                if (!$file) {
                    throw new Exception('File open failed for ' . $fileName);
                }

                foreach ($_data as $line) {
                    fputcsv($file, $line);
                }
                fclose($file);
            }
            echo "Wrote file";
            Debug::Log("Wrote file: " . $fileName);
        } catch (Exception $e) {
            Debug::Log($e->getMessage());
            // Debug::Log($e->getFile());
            // Debug::LogI(" ln:" . $e->getLine());
            // Debug::Log($e->getTraceAsString());
        }
    }



    public static function GetCSV($_year, $_month)
    {
        $fileName = self::$_fileName .  $_year . $_month . self::$_fileExt;
        if (file_exists($fileName)) {
            $csv = array_map('str_getcsv', file($fileName));
            Monthly::SanitizeCSVData($csv);
            //Debug::Log($csv);
            return $csv;
        }
    }


    public static function GetActuals($_year, $_month)
    {
        $sqlTxt = SQLUtils::FileToQuery('..\..\assets\sql\Core\ALL_MonthlyProductionData.sql');
        $sqlTxt = str_replace('@YEAR', "'" . $_year . "'", $sqlTxt);
        $sqlTxt = str_replace('@MONTH', "'" . $_month . "'", $sqlTxt);

        $sqlResult = SQLUtils::QueryToText($sqlTxt, "Get Monthly Actuals");
        return $sqlResult;
        //Debug::Log($sqlResult);
    }



    private static function MetaData($_mappedActuals)
    {
        Debug::StartProfile("Meta");

        // To hold all the metadata
        $metas = [];

        $meta = new MonthlyMeta();

        // Get the days remaining 
        $d = cal_days_in_month(CAL_GREGORIAN, $_mappedActuals[0][4], $_mappedActuals[0][5]);

        $cdate = mktime(0, 0, 0, $_mappedActuals[0][4], $d, $_mappedActuals[0][5]);
        $today = time();
        //        $today = mktime(0, 0, 0, $_mappedActuals[0][4], 20, $_mappedActuals[0][5]);
        $difference = $cdate - $today;
        if ($difference < 0) {
            $difference = 0;
        }
        //$difference = floor($difference / 60 / 60 / 24);


        $meta->timeRemaining = $difference;
        $meta->timePassedInMonth = 1 - (floor($difference / 60 / 60 / 24) / $d);

        for ($i = 1; $i < count($_mappedActuals); $i++) {
            // Total site 
            $meta->totalMetricTarget += $_mappedActuals[$i][3];
            if (isset($_mappedActuals[$i][4]))
                $meta->totalMetricActual += $_mappedActuals[$i][4];
            // Per mine
            $siteName = Config::Sites($_mappedActuals[$i][0]);
            if (!isset($metas[$siteName]))
                $metas[$siteName] = new MonthlyMeta();
            $metas[$siteName]->totalMetricTarget += $_mappedActuals[$i][3];
            if (isset($_mappedActuals[$i][4]))
                $metas[$siteName]->totalMetricActual += $_mappedActuals[$i][4];
        }

        // Totals
        $meta->averageRequired = $meta->totalMetricTarget / $d;
        $meta->averageCurrent = $meta->totalMetricActual / ($d * $meta->timePassedInMonth);
        $meta->complianceSpatial = 0.5;
        $meta->complianceVolumetric = 0.5;

        // For each mine
        foreach ($metas as $m) {
            $m->timeRemaining = $meta->timeRemaining;
            $m->timePassedInMonth = $meta->timePassedInMonth;
            $m->averageRequired = $m->totalMetricTarget / $d;
            $m->averageCurrent = $m->totalMetricActual / ($d * $m->timePassedInMonth);
            $m->complianceSpatial = min($m->totalMetricTarget, $m->totalMetricActual) / $m->totalMetricTarget;
            $m->complianceVolumetric = $m->totalMetricActual / $m->totalMetricTarget;
        }

        //Debug::Log($metas);

        return $metas;

        Debug::EndProfile();
    }



    public static function MapActualsToPlan($_year, $_month)
    {
        // From the DB
        $actuals = Monthly::GetActuals($_year, $_month);

        // From the Plan CSV
        $plan = Monthly::GetCSV($_year, $_month);

        Debug::StartProfile("Map Actuals To Plan");

        $actualsMineIndex = 1;
        $actualsLocIndex = 2;

        $planMineIndex = 0;
        $planLocIndex = 1;
        $planTgtIndex = 3;


        // Build associate with totals for month
        $actualsTotals = [];

        for ($i = 1; $i < count($actuals); $i++) {
            $mine = ($actuals[$i][$actualsMineIndex]);
            $loc = $actuals[$i][$actualsLocIndex];

            if (!isset($actualsTotals[$mine][$loc]))
                $actualsTotals[$mine][$loc] = 0;

            $actualsTotals[$mine][$loc] += $actuals[$i][4];
        }


        // Set some more headings
        $plan[0][3] = "ACTUALS";
        $plan[0][4] = $_month;
        $plan[0][5] = $_year;

        for ($i = 1; $i < count($plan); $i++) {
            $mine = ($plan[$i][$planMineIndex]);

            //if ($mine == "WF") {
            foreach (array_keys($actualsTotals[$mine]) as $id) {
                $needle = $plan[$i][$planLocIndex];
                $haystack = $id;
                if (stripos($haystack, $needle) !== false) {
                    //Debug::Log("Found!  " . $plan[$i][$planMineIndex] . " " . $needle . "  " . $haystack . "  " . $actualsTotals[$mine][$id]);
                    if (count($plan[$i]) == 4)
                        $plan[$i][] = $actualsTotals[$mine][$id];
                    else
                        $plan[$i][4] += $actualsTotals[$mine][$id];
                }
            }
            //Debug::Log($plan[$i]);
            //}
        }

        $meta = Monthly::MetaData($plan);

        Debug::EndProfile();

        return [$plan, $meta];
        //Debug::Log($plan);
    }


    /** Check that there are no erronous cells 
     * in the CSV,  passed in as reference to clean up */
    private static function SanitizeCSVData(&$_data)
    {
        if ($_data == null)
            return;

        for ($i = 0; $i < count($_data); $i++) {

            if ($_data[$i] == NULL) {
                unset($_data[$i]);
                array_values($_data);
            } else {
                for ($j = 0; $j < count($_data[$i]); $j++) {
                    // Remove commas and whitespace
                    if (strpos($_data[$i][$j], ",") !== false) {
                        $_data[$i][$j] = str_replace(",", "", $_data[$i][$j]);
                        $_data[$i][$j] = str_replace(" ", "", $_data[$i][$j]);
                    }

                    // Make all uppercase
                    $_data[$i][$j] = strtoupper($_data[$i][$j]);
                }
                // Attempt int conversion
                $_data[$i][3] = intval($_data[$i][3]);
            }
            //unset($array[1]);

        }
        //Debug::Log(($_data[77])); // = intval($_data[$i][$j]);
    }
}




class Temp
{
    function Foo()
    {
        $input = 'carrrot';

        // array of words to check against
        $words  = array(
            'apple', 'pineapple', 'banana', 'orange',
            'radish', 'carrot', 'pea', 'bean', 'potato'
        );

        // no shortest distance found, yet
        $shortest = -1;

        // loop through words to find the closest
        foreach ($words as $word) {

            // calculate the distance between the input word,
            // and the current word
            $lev = levenshtein($input, $word);

            // check for an exact match
            if ($lev == 0) {

                // closest word is this one (exact match)
                $closest = $word;
                $shortest = 0;

                // break out of the loop; we've found an exact match
                break;
            }

            // if this distance is less than the next found shortest
            // distance, OR if a next shortest word has not yet been found
            if ($lev <= $shortest || $shortest < 0) {
                // set the closest match, and shortest distance
                $closest  = $word;
                $shortest = $lev;
            }
        }

        echo "Input word: $input\n";
        if ($shortest == 0) {
            echo "Exact match found: $closest\n";
        } else {
            echo "Did you mean: $closest?\n";
        }
    }
}
