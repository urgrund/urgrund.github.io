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

    if ($request->func == 0) {
        echo json_encode(Monthly::GenerateMonthlyPlanData());
    }

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


class MonthlySite
{
    public float $totalMetricTarget = 0;
    public float $totalMetricActual = 0;

    public float $averageCurrent = 0;
    public float $averageRequired = 0;

    public float $complianceSpatial = 0;
    public float $complianceVolumetric = 0;

    /** 0 = Plan,  1 = Actual */
    public array $planSegments = [];
    public array $dailyTotals = [];

    function __construct($_date, $_daysInMonth)
    {
        for ($i = 0; $i < $_daysInMonth; $i++) {
            $name = $_date . ($i < 9 ? "0" : "") . strval($i + 1);
            //Debug::Log($name);
            $this->dailyTotals[$name] = 0;
        }
    }
}



class MonthlyEntry
{
    public array $sites = [];
    public array $plan;

    public array $mapped;

    public float $timeRemaining = 0;
    public float $timePassedInMonth = 0;
    public float $daysInMonth = 0;

    private array $_sql;
    private string $_date;

    function __construct($_planFile, $_sql)
    {
        $this->plan = Monthly::PlanAsObject($_planFile);
        $this->_sql = $_sql;
        $this->_date = substr($_planFile, 0, 6);

        $this->CalculateCalendarTime();
        //Debug::Log($this->_date);
        //Debug::Log($this->plan[0]);

        for ($i = 0; $i < count($this->plan); $i++) {

            // Make the target a number
            $this->plan[$i][3] = intval($this->plan[$i][3]);

            $site = Config::Sites($this->plan[$i][0]);
            $segment = $this->plan[$i][4];
            //Debug::Log($site);

            // Add new MonthlySite and get
            // distinct list of plan segments
            if ($site != NULL) {
                if (!isset($this->sites[$site]))
                    $this->sites[$site] = new MonthlySite($this->_date, $this->daysInMonth);

                if (!isset($this->sites[$site]->planSegments[$segment]))
                    $this->sites[$site]->planSegments[$segment] = [0, 0];

                $this->sites[$site]->planSegments[$segment][0] += $this->plan[$i][3];
            }
        }

        // For each entry in the SQL results, see if a plan segment 
        // matches up with a sites Plan segment and add the value
        for ($i = 0; $i < count($this->_sql); $i++) {
            // Check same date as this Month entry
            $sqlDate = $this->_sql[$i][0];

            if (substr($sqlDate, 0, 6) == $this->_date) {
                $sqlSegment = $this->_sql[$i][5];
                $sqlSite = Config::Sites($this->_sql[$i][1]);

                // Totals for the month per-segment
                foreach ($this->sites as $key => $value) {
                    if (isset($value->planSegments[$sqlSegment]))
                        $value->planSegments[$sqlSegment][1] += $this->_sql[$i][4];
                }

                // Totals for each day for the entire site
                //Debug::Log($sqlSite);
                if ($sqlSite != NULL) {
                    if (!isset($this->sites[$sqlSite]->dailyTotals[$sqlDate]))
                        $this->sites[$sqlSite]->dailyTotals[$sqlDate] = 0;
                    $this->sites[$sqlSite]->dailyTotals[$sqlDate] += $this->_sql[$i][4];
                }
            }
        }


        $this->CalculateMeta();

        // Debug::Log("Plan");
        // Debug::Log($this->plan[0]);

        // Debug::Log("sQ");
        // Debug::Log($this->_sql[0]);
    }



    private function CalculateCalendarTime()
    {
        //Debug::Log($this->_date);
        $year = substr($this->_date, 0, 4);
        $month = substr($this->_date, 4, 2);

        // $year
        $d = cal_days_in_month(CAL_GREGORIAN, $month, $year);

        $cdate = mktime(0, 0, 0, $month, $d, $year);
        //$today = time();
        $today = mktime(0, 0, 0, $month, 15, $year);
        //Debug::Log($today);

        $difference = doubleval($cdate - $today);
        // if ($difference < 0) {
        //     $difference = 0;
        // }
        //Debug::Log($difference = ($cdate - $today));
        //Debug::Log(($difference));

        $this->daysInMonth = $d;
        $this->timeRemaining = max($difference, 0);
        $this->timePassedInMonth = min(1 - (floor($difference / 60 / 60 / 24) / $d), 1);
    }



    private MonthlySite $tmpMeta;
    private function CalculateMeta()
    {
        // Segment data
        /** 0 = Plan,  1 = Actual */

        foreach ($this->sites as $key => $value) {
            // Annoying hack to type cast 
            $this->tmpMeta = $value;
            $m = $this->tmpMeta;

            $spatialTotals = 0;
            foreach ($m->planSegments as $k => $segment) {
                $m->totalMetricTarget += $segment[0];
                $m->totalMetricActual += $segment[1];

                // Get fractionals of segment progress
                if ($segment[0] > 0)
                    $spatialTotals += min($segment[1] / $segment[0], 1) * $segment[0];
            }

            if ($m->totalMetricTarget > 0) {
                //$m->complianceSpatial = min($m->totalMetricTarget, $m->totalMetricActual) / $m->totalMetricTarget;
                $m->complianceSpatial = $spatialTotals / $m->totalMetricTarget;
                $m->complianceVolumetric = $m->totalMetricActual / $m->totalMetricTarget;
            }


            $daysSoFar = floatval($this->daysInMonth * $this->timePassedInMonth);
            $daysRemaining = floatval($this->daysInMonth * (1 - $this->timePassedInMonth));
            $m->averageCurrent = $m->totalMetricActual / $daysSoFar;
            $m->averageRequired = max(0, $m->totalMetricTarget - $spatialTotals) / $daysRemaining;

            // Turn the daily totals back to indexed array
            $value->dailyTotals = array_values($value->dailyTotals);
        }
    }


    /** Similar to IComparable in C# **/
    //$result = array_intersect($this->_sql, $this->plan);
    // This might be interesting for custom comparing
    // for an array merge/sort
    function ComparePlanSegments($a, $b)
    {
        return strcmp($a['value'][4], $b['value'][5]);
    }
}







class Monthly
{
    private const FILE_EXT = ".csv";
    private const SQL_QUERY = "ALL_MonthlyProductionDataPlanName.sql";


    // -----------------------------------------------------------------------------
    private static MonthlyEntry $_tempEntry;
    public static function GenerateMonthlyPlanData()
    {
        new Config();

        $plans = Monthly::GetAvailablePlans();
        $sql = Monthly::GetSQLData();
        $output = [];

        Debug::StartProfile("PHP Generate");

        // For each plan, march through the 
        // actuals and see if there's a match up
        for ($i = 0; $i < count($plans); $i++) {
            $plan = $plans[$i];
            $planDate =  substr($plan, 0, 6);

            // This is where the big work happens
            $output[$planDate] =  new MonthlyEntry($plan, $sql);
        }

        // NEED TO SANITIZE
        //Monthly::SanitizeCSVData();

        Debug::EndProfile();

        return $output;
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
