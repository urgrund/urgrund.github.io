<?php

include_once('..\\header.php');



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

    try {
        if ($request->func == 0) {
            echo json_encode(Monthly::GenerateMonthlyPlanData());
        }

        if ($request->func == 1) {
            echo json_encode(Monthly::WriteMonthlyPlanData($request->data));
        }
    } catch (Exception $e) {
        $error = (new ErrorResponse(
            404,
            "Montly Plan",
            "Error in file read write for Plan",
            array($e->getMessage())
        ));
        $error->Return();
    }
}
// ----------------------------------------------------------
// ----------------------------------------------------------
// ----------------------------------------------------------
else {
    $foo = Monthly::GenerateMonthlyPlanData();
    //Debug::Log($foo['202102']->sites["M-Reefs"]);
    //Monthly::WriteMonthlyPlanData($dummyData);
}

// function compareDeepValue($val1, $val2)
// {
//     return strcmp($val1['value'], $val2['value']);
// }
// ----------------------------------------------------------





class Monthly
{
    private const FILE_EXT = ".csv";
    private const SQL_QUERY = "ALL_MonthlyProductionDataPlanName.sql";


    // -----------------------------------------------------------------------------
    //private static MonthlyEntry $_tempEntry;
    public static function GenerateMonthlyPlanData()
    {
        new Config();

        $plans = Monthly::GetAvailablePlans();
        $sql = Monthly::GetSQLData();
        $output = [];

        Debug::StartProfile("PHP Generate");

        $temp = [];
        for ($i = 0; $i < count($sql); $i++) {
            // Check same date as this Month entry
            $sqlDate = substr($sql[$i][0], 0, 6);
            if (!isset($temp[$sqlDate]))
                $temp[$sqlDate] = null;
        }

        //Debug::Log($temp);
        $output = $temp;

        // For each plan, march through the 
        // actuals and see if there's a match up
        for ($i = 0; $i < count($plans); $i++) {
            $plan = $plans[$i];
            $planDate =  substr($plan, 0, 6);

            // This is where the big work happens
            $output[$planDate] = new MonthlyEntry($plan, $sql);
        }

        // There may not have been plans created
        // for all the SQL data, so fill out the null ones
        foreach ($output as $key => $value) {
            if ($value == null) {
                //Debug::Log($key);
                $output[$key] =  new MonthlyEntry(null, $sql);
            }
        }

        // NEED TO SANITIZE
        //Monthly::SanitizeCSVData();

        Debug::EndProfile();

        return $output;
    }

    public static function WriteMonthlyPlanData($_data)
    {
        //$date = $_data[1]; //date("Y-m-d H:i:s", substr($_data[1], 0, 10));
        $date = date("Y-m", substr($_data[1], 0, 10));
        $year = substr($date, 0, 4);
        $month = substr($date, 5, 7);

        //Debug::Log($year . $month);
        //Debug::Log($_data[0]);

        Monthly::WriteCSV($_data[0], $year, $month);
        return  [$year, $month];
    }

    // -----------------------------------------------------------------------------



    // -----------------------------------------------------------------------------

    private static function GetAvailablePlans(): array
    {
        Debug::StartProfile("Get Available Plans");
        $path = Utils::GetBackEndRoot() . "/monthly";
        $files = array_diff(scandir($path), array('.', '..'));
        $files = array_values($files);
        $plans = [];
        for ($i = 0; $i < count($files); $i++) {
            if (strpos($files[$i], Monthly::FILE_EXT) !== false) {
                $plans[] = $files[$i];
            }
        }
        Debug::EndProfile();
        return $plans;
    }

    private static function GetSQLData()
    {
        $sqlTxt = SQLUtils::FileToQuery(Utils::GetBackEndRoot() . Client::SQLCorePath() . Monthly::SQL_QUERY);
        $sqlResult = SQLUtils::QueryToText($sqlTxt, "Get Monthly Actuals");

        // Kock off the headings 
        array_shift($sqlResult);
        return $sqlResult;
    }


    public static function PlanAsObject(string $_fileName)
    {
        $year = substr($_fileName, 0, 4);
        $month = substr($_fileName, 4, 2);
        $csv = Monthly::GetCSV($year, $month);
        array_shift($csv);
        return $csv;
    }
    // -----------------------------------------------------------------------------







    // -----------------------------------------------------------------------------
    // CSV Related Stuff


    private static function GetCSV($_year, $_month)
    {
        $fileName = $_year . $_month . Monthly::FILE_EXT;
        //Debug::Log($fileName);
        if (file_exists($fileName)) {
            $csv = array_map('str_getcsv', file($fileName));
            //Monthly::SanitizeCSVData($csv);
            //Debug::Log($csv);
            return $csv;
        }
    }



    private static function WriteCSV($_data, $_year, $_month)
    {
        if ($_data == null)
            return;

        //Monthly::SanitizeCSVData($_data);
        $fileName = Client::MonthlyPlanPath() . $_year . $_month . Monthly::FILE_EXT;

        try {
            //if (is_readable($fileName)) {
            $file = fopen($fileName, "w");
            if (!$file) {
                throw new Exception('File open failed for ' . $fileName);
            }

            foreach ($_data as $line) {
                fputcsv($file, $line);
            }

            fclose($file);
            Debug::Log("Wrote file: " . $fileName);

            //throw new Exception("Test exception");
        } catch (Exception $e) {
            //Debug::Log($e->getMessage());
            //Debug::Log($e);
            $error = (new ErrorResponse(
                404,
                "Plan Upload",
                "Error in file read write for Plan",
                array($e->getMessage())
            ));
            $error->Return();
        }
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
        }
    }
}









// This is an interesting way to find nearest word 
// match,  could be used to hint at incorrect plan locations
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
