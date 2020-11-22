<?php

include_once('data.php');
include_once('../../dev/php/header.php');
//include_once('../../dev/php/setDebugOff.php');


// ----------------------------------------------------------
// This data will be valid with a URL 
// request from the client
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);


if (is_object($request)) {
    // Turn off debug for this as it's from
    // client request 
    include_once('../../dev/php/setDebugOff.php');

    // Return montlhly material movements
    if ($request->func == 0) {
        MonthlyCompliance::GetMonthlyMovements();
    }
    // Return the user CSV entries
    else if ($request->func == 1) {
        MonthlyCompliance::GetUserCSVEntries();
    }
    // Write new CSV data from client
    else if ($request->func == 3) {
        MonthlyCompliance::WriteUserCSVEntries($request->data);
        print_r($request->data);
    }
    // Get chart data for client side
    else if ($request->func == 4) {
        MonthlyCompliance::GetMontlyComplianceChartData();
    }



    return;
}
// ----------------------------------------------------------

MonthlyCompliance::GetMontlyComplianceChartData();
//MonthlyCompliance::WriteUserCSVEntries($testMonthly);
//MonthlyCompliance::ReadMonthlyMovements();
//MonthlyCompliance::GetMonthlyMovements();
//MonthlyCompliance::ReadUserCSVEntries();
//MonthlyCompliance::GetUserCSVEntries();
//MonthlyCompliance::GetComplianceBuilderOptions();


class ComplianceTotals
{
    // Site summary 
    public $target = 0;
    public $actual = 0;
    public $overmined = 0;

    public $avgRequired = 0;
    public $avgCurrent = 0;

    public $spatialCompliance = 0;
    public $volumetricCompliance = 0;
}


class MonthlyCompliance
{
    static $monthlyComplianceData;
    static $csvData;

    static $date = '201801010';
    static $day = 10;


    public static function ReadMonthlyMovements()
    {
        global $testMonthly; // pre fetched data
        global $monthlyComplianceData;


        $result = ($testMonthly);
        //Debug::Log($result);

        $idIndex = 7;
        $uniqueID = [];
        for ($i = 1; $i < count($result); $i++) {
            // The unique location ID
            $id = $result[$i][$idIndex];

            // Using location ID as unique key,
            // assemble all date entries into their location
            $uniqueID[$id][] = $result[$i];
        }

        //Debug::Log(count($result));
        $monthlyComplianceData = $uniqueID;
        //Debug::Log($monthlyComplianceData);
    }


    // Read the CSV Data
    public static function ReadUserCSVEntries()
    {
        global $csvData;
        $_filename = "test.csv";
        try {
            if (!file_exists($_filename)) {
                throw new Exception("{$_filename} not found");
            } else {
                // File exists
                if (($handle = fopen($_filename, "r")) !== FALSE) {
                    // Build array from the CSV
                    $csvData = array();
                    while (($data = fgetcsv($handle, 0, ",")) !== FALSE) {
                        //Debug::Log($data);
                        $csvData[$data[0]] = $data;
                    }
                    //Debug::Log($csvData);
                    fclose($handle);

                    //return $csvData;
                }
            }
        } catch (Exception $e) {
            echo $e->getMessage();
        }
    }


    public static function WriteUserCSVEntries($data)
    {
        //return;


        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="test.csv"');

        //Site,Target,Active,Locked
        //WF4540D13,222,1,0
        //WF4555D30,333,1,1
        //WF4490HD0,1111,0,1

        $file = fopen("test.csv", "w");

        foreach ($data as $line) {
            fputcsv($file, $line);
        }

        fclose($file);
    }




    public static function GetMonthlyMovements()
    {
        global $monthlyComplianceData;
        MonthlyCompliance::ReadMonthlyMovements();
        //Debug::Log($monthlyComplianceData);
        echo json_encode($monthlyComplianceData);
    }




    // Breaks the location into it's smaller parts 
    // for drop down menus and similar 
    public static function GetComplianceBuilderOptions()
    {
        global $monthlyComplianceData;
        global $csvData;

        if (!isset($monthlyComplianceData))
            MonthlyCompliance::ReadMonthlyMovements();
        //throw new Exception("Monthly Compliance Data not created yet...");

        // Need to abstract this and 
        // will change per-mine
        $idxMine = 3;
        $idxLevel = 4;
        $idxDrive = 5;

        $builderOptions = [];
        foreach ($monthlyComplianceData as $key => $value) {
            $d = $monthlyComplianceData[$key][0];
            $builderOptions[$d[$idxMine]][$d[$idxLevel]][$d[$idxDrive]] = 0;
        }
        echo json_encode($builderOptions);
    }


    // Gets the montly data,  then prepares it for 
    // chart presentation filtered by the user data
    public static function GetMontlyComplianceChartData()
    {
        Debug::StartProfile("Get Chart Data");
        global $monthlyComplianceData;
        global $csvData;

        // import dates
        global $date;
        global $day;

        MonthlyCompliance::ReadUserCSVEntries();
        MonthlyCompliance::ReadMonthlyMovements();


        // TODO - Doesn't matter if not set,  will always show 
        // all the stopes just with no targets
        // $result = [];
        // foreach ($monthlyComplianceData as $key => $value) {
        //     if (isset($csvData[$key])) {
        //         $result[$key] = $value;
        //     }
        // }

        $final = [];
        $totals = new ComplianceTotals();

        // This is expensive! (like many date funcs)
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, 10, 2018);



        $count = 0;
        //foreach ($result as $key => $value) {
        foreach ($monthlyComplianceData as $key => $value) {

            //if ($count > 0) continue;

            $count++;

            // Create clean arrays for the month
            $tpd = [];
            $cumulative = [];
            for ($i = 0; $i < $daysInMonth; $i++) {
                $tpd[$i + 1] = 0;
                $cumulative[$i + 1] = 0;
            }

            // Get tonnes per day
            for ($i = 0; $i < count($value); $i++) {
                $day = (int) substr($value[$i][0], 6);
                $tpd[$day] = $value[$i][6];
            }

            // Cumulative
            for ($i = 0; $i < $daysInMonth; $i++) {
                if ($i == 0)
                    $cumulative[$i + 1] = $tpd[$i + 1];
                else
                    $cumulative[$i + 1] = $cumulative[$i] + $tpd[$i + 1];
            }


            // Get target, if set
            $target = 0;
            if (isset($csvData[$key])) {
                $target = $csvData[$key][1];
            }


            // This is just an entry from the original data
            // to have the breakdown of 'drive' or 'stope' 
            // as well as to inject the target into [0] 
            $tagData = $value[0];
            $tagData[0] = $target;

            $final[$key] = array(array_values($tpd), array_values($cumulative), $tagData);

            // Accumulate Totals
            $totals->target += $target;
            $totals->actual += $cumulative[count($cumulative) - 1];
            $totals->overmined += max($cumulative[count($cumulative) - 1] - $target, 0);
        }

        // Set totals
        // Spatial = sum of blue / sum of targets
        // Volume = sum of blue + sum of red / sum of targets
        $totals->spatialCompliance = round($totals->actual / $totals->target, 4);
        $totals->volumetricCompliance = round(($totals->actual + $totals->overmined) / $totals->target, 4);

        $totals->avgRequired = round($totals->target / $daysInMonth, 2);
        $totals->avgCurrent = round($totals->actual / $day, 2);

        // Pack and return
        $return = [];
        $return[] = $final;
        $return[] = $totals;

        //Debug::Log($totals);

        echo json_encode($return);
        Debug::EndProfile();
    }


    public static function GetUserCSVEntries()
    {
        global $monthlyComplianceData;
        global $csvData;

        MonthlyCompliance::ReadUserCSVEntries();
        MonthlyCompliance::ReadMonthlyMovements();

        $result = [];
        foreach ($monthlyComplianceData as $key => $value) {
            if (isset($csvData[$key])) {
                $result[$key] = $csvData[$key];
            }
        }

        echo json_encode($result);
    }
}
