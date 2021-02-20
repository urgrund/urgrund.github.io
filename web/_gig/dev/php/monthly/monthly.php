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

    echo json_encode(Monthly::GenerateMonthlyPlanData());

    // new Config();


    // if ($request->func == 0) {
    //     Monthly::WriteCSV($request->data, $request->year, $request->month);
    // }

    // if ($request->func == 1) {
    //     echo json_encode(Monthly::GetCSV($request->year, $request->month));
    // }

    // if ($request->func == 3) {
    //     echo json_encode(Monthly::GetActuals($request->year, $request->month));
    // }

    // if ($request->func == 4) {
    //     echo json_encode(Monthly::MapActualsToPlan($request->year, $request->month));
    // }
}
// ----------------------------------------------------------
// ----------------------------------------------------------
// ----------------------------------------------------------
else {

    Monthly::GenerateMonthlyPlanData();
}

function compareDeepValue($val1, $val2)
{
    return strcmp($val1['value'], $val2['value']);
}
// ----------------------------------------------------------


class MonthlyMeta
{
    var $totalMetricTarget = 0;
    var $totalMetricActual = 0;

    var $averageCurrent = 0;
    var $averageRequired = 0;

    var $complianceSpatial = 0;
    var $complianceVolumetric = 0;

    var $timeRemaining = 0;
    var $timePassedInMonth = 0;
}



class MonthlyEntry
{
    public array $meta = [];
    public array $plan;

    public array $mapped;

    public float $timeRemaining = 0;
    public float $timePassedInMonth = 0;

    private array $_sql;
    private string $_date;



    private MonthlyMeta $tmpMeta;

    function __construct($_planFile, $_sql)
    {
        $this->plan = Monthly::PlanAsObject($_planFile);
        $this->_sql = $_sql;
        $this->_date = substr($_planFile, 0, 6);

        //Debug::Log($this->_date);
        //Debug::Log($this->plan[0]);

        for ($i = 0; $i < count($this->plan); $i++) {
            $site = Config::Sites($this->plan[$i][0]);
            //Debug::Log($site);
            if (!isset($this->meta[$site]) && $site != NULL)
                $this->meta[$site] = new MonthlyMeta();
        }

        $this->CalculateCalendarTime();
        $this->MapSQLToPlan();
        $this->CalculateMeta();
    }

    private function CalculateCalendarTime()
    {
        //Debug::Log($this->_date);
        $year = substr($this->_date, 0, 4);
        $month = substr($this->_date, 4, 2);

        // $year
        $d = cal_days_in_month(CAL_GREGORIAN, $month, $year);

        $cdate = mktime(0, 0, 0, $month, $d, $year);
        $today = time();

        $difference = doubleval($cdate - $today);
        // if ($difference < 0) {
        //     $difference = 0;
        // }
        //Debug::Log($difference = ($cdate - $today));
        Debug::Log(($difference));


        $this->timeRemaining = max($difference, 0);
        $this->timePassedInMonth = 1 - (floor($difference / 60 / 60 / 24) / $d);

        // $meta->timeRemaining = $difference;
        // $meta->timePassedInMonth = 1 - (floor($difference / 60 / 60 / 24) / $d);
    }

    private function MapSQLToPlan()
    {

        // Plan Index helper
        // 3 = Target
        // 5 = Will be actuals

        Debug::StartProfile("Map SQL");

        for ($i = 0; $i < count($this->plan); $i++) {
            //Debug::Log($this->plan[$i][4]);           
            $this->plan[$i][5] = 0;
            $this->plan[$i][6] = 0;

            // Make it a number
            $this->plan[$i][3] = intval($this->plan[$i][3]);

            $p = $this->plan[$i][4];
            for ($j = 0; $j < count($this->_sql); $j++) {

                if (substr($this->_sql[$j][0], 0, 6) === $this->_date) {
                    //Debug::Log($this->_sql[$j][0]);
                    $s = $this->_sql[$j][5];
                    if ($p === $s) {
                        $this->plan[$i][5] += $this->_sql[$j][4];
                    }
                }
            }

            // Add Spatial / Volumetric            
            if ($this->plan[$i][5] != 0)
                $this->plan[$i][6] = $this->plan[$i][3] / $this->plan[$i][5];

            $this->plan[$i][7] = Config::Sites($this->plan[$i][0]);
        }

        Debug::EndProfile();


        Debug::Log("Plan");
        Debug::Log($this->plan[0]);

        Debug::Log("sQ");
        Debug::Log($this->_sql[0]);
        //Debug::Log($this->plan);
    }


    private function CalculateMeta()
    {
        //foreach ($this->meta as $key => $value) {
        //  Debug::Log($key);
        //$this->tmpMeta = $key;
        //$key = $this->tmpMeta;
        for ($j = 0; $j < count($this->plan); $j++) {
            // Use the site name to index the meta
            $this->tmpMeta = $this->meta[$this->plan[$j][7]];
            $k = $this->tmpMeta;

            $k->totalMetricTarget += intval($this->plan[$j][3]);
            $k->totalMetricActual += intval($this->plan[$j][5]);
            //Debug::Log($j . " | " . intval($this->plan[$j][3]));
            //$site = Config::Sites($this->plan[$j][0]);
            //Debug::Log($site);

        }
        //$m->complianceSpatial = min($m->totalMetricTarget, $m->totalMetricActual) / $m->totalMetricTarget;
        //$m->complianceVolumetric = $m->totalMetricActual / $m->totalMetricTarget;
        //}
    }




    /** Similar to IComparable in C# **/
    //$result = array_intersect($this->_sql, $this->plan);
    function ComparePlanSegments($a, $b)
    {
        return strcmp($a['value'][4], $b['value'][5]);
    }
}







class Monthly
{
    //private static $_fileName = "Plan_";
    private const FILE_EXT = ".csv";

    private const SQL_QUERY = "ALL_MonthlyProductionDataPlanName.sql";

    private const INDEX_DATE = 0;
    private const INDEX_MINE = 1;
    private const INDEX_LOC = 2;
    private const INDEX_VALUE = 4;
    private const INDEX_SEGMENT = 5;


    // -----------------------------------------------------------------------------
    private static MonthlyEntry $_tempEntry;
    public static function GenerateMonthlyPlanData()
    {
        new Config();

        $plans = Monthly::GetAvailablePlans();
        $sql = Monthly::GetSQLData();
        $output = [];

        Debug::StartProfile("Generate");

        // For each plan, march through the 
        // actuals and see if there's a match up
        for ($i = 0; $i < count($plans); $i++) {
            $plan = $plans[$i];
            $planDate =  substr($plan, 0, 6);

            // This is where the big work happens
            $output[$planDate] =  new MonthlyEntry($plan, $sql);
        }

        return $output;
        Debug::EndProfile();
    }





    public static function GetAvailablePlans(): array
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

    public static function GetSQLData()
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


    public static function GetCSV($_year, $_month)
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
