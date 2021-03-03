<?php

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
    public array $plan = [];

    //public array $mapped;

    public float $timeRemaining = 0;
    public float $timePassedInMonth = 0;
    public float $daysInMonth = 0;
    public int $month = 0;
    public int $year = 0;

    private array $_sql;
    private string $_date;

    function __construct($_planFile, $_sql)
    {
        if ($_planFile != null) {
            $this->plan = Monthly::PlanAsObject($_planFile);
            $this->_date = substr($_planFile, 0, 6);
        } else
            $this->_date = substr($_sql[0][0], 0, 6);

        $this->_sql = $_sql;
        $this->CalculateCalendarTime();
        //Debug::Log($this->_date);
        //Debug::Log($this->plan[0]);

        if ($_planFile != null) {
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
        }


        // foreach ($this->sites as $key => $value) {
        //     Debug::Log($key);
        // }

        // For each entry in the SQL results, see if a plan segment 
        // matches up with a sites Plan segment and add the value
        for ($i = 0; $i < count($this->_sql); $i++) {
            // Check same date as this Month entry
            $sqlDate = $this->_sql[$i][0];

            if (substr($sqlDate, 0, 6) == $this->_date) {
                $sqlSegment = $this->_sql[$i][5];
                $sqlSite = Config::Sites($this->_sql[$i][1]);

                // Totals for the month per-segment
                // If it exists, add to it,  if not 
                // create a new one based on the SQL segment with 0 target                
                foreach ($this->sites as $key => $value) {
                    if (isset($value->planSegments[$sqlSegment]))
                        $value->planSegments[$sqlSegment][1] += $this->_sql[$i][4];
                    else if ($key === $sqlSite)
                        $value->planSegments[$sqlSegment] = [0, $this->_sql[$i][4]];
                }

                // Totals for each day for the entire site

                if ($sqlSite != NULL) {
                    if (!isset($this->sites[$sqlSite]))
                        $this->sites[$sqlSite] = new MonthlySite($this->_date, $this->daysInMonth);

                    if (!isset($this->sites[$sqlSite]->dailyTotals[$sqlDate]))
                        $this->sites[$sqlSite]->dailyTotals[$sqlDate] = 0;

                    //Debug::Log($sqlSite . "  " .  $this->_date);
                    //Debug::Log( "  " .  $this->_date);
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
        $today = mktime(0, 0, 0, $month, 9, $year);
        //Debug::Log($today);

        $difference = doubleval($cdate - $today);
        // if ($difference < 0) {
        //     $difference = 0;
        // }
        //Debug::Log($difference = ($cdate - $today));
        //Debug::Log(($difference));

        $this->daysInMonth = $d;
        $this->month = $month;
        $this->year = $year;
        $this->timeRemaining = max($difference, 0);
        $this->timePassedInMonth = min(1 - (floor($difference / 60 / 60 / 24) / $d), 1);
    }



    //private MonthlySite $tmpMeta;
    private function CalculateMeta()
    {
        // Segment data
        /** 0 = Plan,  1 = Actual */

        foreach ($this->sites as $key => $value) {
            // Annoying hack to type cast 
            //$this->tmpMeta = $value;
            $m = $value; //$this->tmpMeta;

            $spatialTotals = 0;
            foreach ($m->planSegments as $k => $segment) {
                $m->totalMetricTarget += $segment[0];

                // Get fractionals of segment progress
                if ($segment[0] > 0)
                    $spatialTotals += min($segment[1] / $segment[0], 1) * $segment[0];
            }

            // Turn the daily totals into indexed array
            $value->dailyTotals = array_values($value->dailyTotals);

            // Sum daily totals
            $m->totalMetricActual = array_sum($value->dailyTotals);


            if ($m->totalMetricTarget > 0) {
                //$m->complianceSpatial = min($m->totalMetricTarget, $m->totalMetricActual) / $m->totalMetricTarget;
                $m->complianceSpatial = $spatialTotals / $m->totalMetricTarget;
                $m->complianceVolumetric = $m->totalMetricActual / $m->totalMetricTarget;
            }


            $daysSoFar = floatval($this->daysInMonth * $this->timePassedInMonth);
            $daysRemaining = floatval($this->daysInMonth * (1 - $this->timePassedInMonth));
            $m->averageCurrent = $m->totalMetricActual / $daysSoFar;
            $m->averageRequired = max(0, $m->totalMetricTarget - $spatialTotals) / $daysRemaining;
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


$dummyData = [
    [
        [
            "Mine",
            "Location",
            "Activity",
            "Target",
            "Mining Area"
        ],
        [
            "M30",
            "M30_5125_ST_N",
            "PROD",
            "5087.3",
            "M30 5125 N"
        ],
        [
            "M30",
            "M30_5125_ST_S",
            "PROD",
            " ",
            "M30 5125 S"
        ],
        [
            "M30",
            "M30_5140_ST_S",
            "PROD",
            "3045.8",
            "M30 5140 S"
        ],
        [
            "M30",
            "M30_5155_ST_S",
            "PROD",
            " ",
            "M30 5155 S"
        ],
        [
            "M30",
            "M30_5170_ST_N",
            "PROD",
            "2243.5",
            "M30 5170 N"
        ],
        [
            "M40",
            "M40_4969_ST_N",
            "PROD",
            "3136.3",
            "M40 4969 N"
        ],
        [
            "M40",
            "M40_4984_ST_N",
            "PROD",
            "3550.1",
            "M40 4984 N"
        ],
        [
            "M40",
            "M40_4984_ST_S",
            "PROD",
            "1650.4",
            "M40 4984 S"
        ],
        [
            "M40",
            "M40_5077_ST_S",
            "PROD",
            "7948",
            "M40 5077 S"
        ],
        [
            "M50",
            "M50_4855_ST_N",
            "PROD",
            "3706.2",
            "M50 4855 N"
        ],
        [
            "SLC",
            "4440SN10",
            "PROD",
            "19825",
            "North 4440"
        ],
        [
            "SLC",
            "4440XC278",
            "PROD",
            "9281",
            "South 4440"
        ],
        [
            "SLC",
            "4440XC280",
            "PROD",
            "5400",
            "South 4440"
        ],
        [
            "SLC",
            "4440XC282",
            "PROD",
            "5400",
            "South 4440"
        ],
        [
            "SLC",
            "4440XC284",
            "PROD",
            "5400",
            "South 4440"
        ],
        [
            "SLC",
            "4440XC286",
            "PROD",
            "4707.5",
            "South 4440"
        ],
        [
            "SLC",
            "4440XC322",
            "PROD",
            "4970.4",
            "North 4440"
        ],
        [
            "SLC",
            "4440XC324",
            "PROD",
            "13672.4",
            "North 4440"
        ],
        [
            "SLC",
            "4440XC326",
            "PROD",
            "16574.1",
            "North 4440"
        ],
        [
            "SLC",
            "4440XC328",
            "PROD",
            "10263.6",
            "North 4440"
        ],
        [
            "SLC",
            "4440XC330",
            "PROD",
            "8903.7",
            "North 4440"
        ],
        [
            "SLC",
            "4440XC332",
            "PROD",
            "0",
            "North 4440"
        ],
        [
            "SLC",
            "4440XC334",
            "PROD",
            "0",
            "North 4440"
        ],
        [
            "SLC",
            "4440XC336",
            "PROD",
            "0",
            "North 4440"
        ],
        [
            "SLC",
            "4475SD005",
            "PROD",
            "11750",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC241",
            "PROD",
            "1800",
            "South 4475"
        ],
        [
            "SLC",
            "4475XC243",
            "PROD",
            "0",
            "South 4475"
        ],
        [
            "SLC",
            "4475XC245",
            "PROD",
            "10300",
            "South 4475"
        ],
        [
            "SLC",
            "4475XC247",
            "PROD",
            "0",
            "South 4475"
        ],
        [
            "SLC",
            "4475XC249",
            "PROD",
            "0",
            "South 4475"
        ],
        [
            "SLC",
            "4475XC251",
            "PROD",
            "1800",
            "South 4475"
        ],
        [
            "SLC",
            "4475XC253",
            "PROD",
            "3600",
            "South 4475"
        ],
        [
            "SLC",
            "4475XC255",
            "PROD",
            "1800",
            "South 4475"
        ],
        [
            "SLC",
            "4475XC325",
            "PROD",
            "11588.8",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC327",
            "PROD",
            "3421.7",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC329",
            "PROD",
            "10432.4",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC331",
            "PROD",
            "4000",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC333",
            "PROD",
            "0",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC335",
            "PROD",
            "0",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC337",
            "PROD",
            "0",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC339",
            "PROD",
            "5946.5",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC341",
            "PROD",
            "4785.8",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC343",
            "PROD",
            "7028.3",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC345",
            "PROD",
            "9911.2",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC347",
            "PROD",
            "17238.7",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC349",
            "PROD",
            "20804.3",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC351",
            "PROD",
            "9947.6",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC353",
            "PROD",
            "1920.9",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC355",
            "PROD",
            "1847.2",
            "North 4475"
        ],
        [
            "SLC",
            "4475XC357",
            "PROD",
            "0",
            "North 4475"
        ],
        [
            "SLC",
            "4500PD01N",
            "PROD",
            "0",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC230",
            "PROD",
            "6098.3",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC232",
            "PROD",
            "2585.9",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC234",
            "PROD",
            "3656.8",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC236",
            "PROD",
            "5638.9",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC238",
            "PROD",
            "0",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC240",
            "PROD",
            "0",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC242",
            "PROD",
            "0",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC244",
            "PROD",
            "0",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC246",
            "PROD",
            "1804.8",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC248",
            "PROD",
            "0",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC250",
            "PROD",
            "0",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC252",
            "PROD",
            "0",
            "South 4500"
        ],
        [
            "SLC",
            "4500XC332",
            "PROD",
            "0",
            "South 4500"
        ],
        [
            "WF",
            "4540D11",
            "PROD",
            "0",
            "4540 D11"
        ],
        [
            "WF",
            "4540D17",
            "PROD",
            "11637.48732",
            "4540 D17"
        ],
        [
            "WF",
            "4540D19",
            "PROD",
            "9199.702813",
            "4540 D19"
        ],
        [
            "WF",
            "4555D30",
            "PROD",
            "23671.94075",
            "4555 D30"
        ],
        [
            "WF",
            "4555D32",
            "PROD",
            "12865.02263",
            "4555 D32"
        ],
        [
            "WF",
            "4555D34",
            "PROD",
            "11044.53758",
            "4555 D34"
        ],
        [
            "WF",
            "4555D36",
            "PROD",
            "9341.532778",
            "4555 D36"
        ],
        [
            "WF",
            "4570D26",
            "PROD",
            "15722.74964",
            "4570 D26"
        ],
        [
            "WF",
            "4570D28",
            "PROD",
            "14159.83537",
            "4570 D28"
        ]
    ],
    1614507533601
];
