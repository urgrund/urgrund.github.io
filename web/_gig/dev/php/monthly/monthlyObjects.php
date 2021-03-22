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

        $today = time();
        //$today = mktime(0, 0, 0, $month, 9, $year);


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

            if ($daysRemaining == 0)
                $m->averageRequired = 0;
            else
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
