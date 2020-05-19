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

    if ($request->func == 0) {
        Monthly::WriteCSV($request->data, $request->year, $request->month);
    }

    if ($request->func == 1) {
        echo json_encode(Monthly::GetCSV($request->year, $request->month));
    }

    if ($request->func == 3) {
        echo json_encode(Monthly::GetActuals($request->year, $request->month));
    }
}
// ----------------------------------------------------------
// ----------------------------------------------------------
// ----------------------------------------------------------
else {
    $data = Monthly::GetCSV('2018', '11', true);
    Monthly::WriteCSV($data, '2018', '10');
    //Monthly::GetActuals('2018', '11');
    //Monthly::MapActualsToPlans('2018', '10');
    echo 'poo';
}
// ----------------------------------------------------------




class Monthly
{
    private static $_fileDir = "";
    private static $_fileName = "Plan_";
    private static $_fileExt = ".csv";

    function __construct()
    {
    }


    public static function WriteCSV($_data, $_year, $_month)
    {
        if ($_data == null)
            return;

        Monthly::SanitizeCSVData($_data);
        $fileName = self::$_fileName .  $_year . $_month . self::$_fileExt;

        $file = fopen($fileName, "w");
        foreach ($_data as $line) {
            fputcsv($file, $line);
        }
        fclose($file);
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
        echo json_encode($sqlResult);
        //Debug::Log($sqlResult);
    }


    public static function MapActualsToPlans($_year, $_month)
    {
        //$actuals = Monthly::GetActuals($_year, $_month);
        //$plan = Monthly::GetCSV($_year, $_month);

        $fileName = self::$_fileName .  $_year . $_month;
        $arr = Config::LoadCSVIntoAssociativeArray($fileName);

        // Debug::Log($arr);
    }


    /** Check that there are no erronous cells 
     * in the CSV,  passed in as reference to clean up */
    private static function SanitizeCSVData(&$_data)
    {
        if ($_data == null)
            return;

        for ($i = 0; $i < count($_data); $i++) {
            for ($j = 0; $j < count($_data[$i]); $j++) {
                if (strpos($_data[$i][$j], ",") !== false) {
                    $_data[$i][$j] = str_replace(",", "", $_data[$i][$j]);
                }
            }
        }

        //Debug::Log($_data);
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
