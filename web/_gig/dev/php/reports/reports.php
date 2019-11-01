<?php
include_once('../header.php');

static $CALL_QUERY = '_CALLQUERY';
static $REPORT_DIR = "../../assets/sql/reports/";

static $OUTPUT_DIR_LOCAL = "php/reports/";


// The variables used in the queries
static $START_DATE_VAR = '_startDate';
static $END_DATE_VAR = '_endDate';
static $START_SHIFT = '_startShift';
static $END_SHIFT = '_endShift';


static $hasBuiltData = false;

// Generated data for report functions
static $reportGroups = [];
static $reportSQLMap = [];


//static $startShiftMap = ['P1', 'P1', 'P2'];
//static $endShiftMap = ['P2', 'P1', 'P2'];

// ----------------------------------------------------------
// This data will be valid with a URL 
// request from the client
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

if (is_object($request)) {
    // Turn off debug for this as it's from
    // client request 
    include_once('../setDebugOff.php');

    if ($request->func == 0) {
        Reports::GetReportData();
    }
    if ($request->func == 1) {
        //Reports::GetReportData();
        //$r = [];
        //$r[] = $request->idxA;
        //$r[] = $request->idxB;

        Reports::$userStartDate = $request->dateStart;
        Reports::$userEndDate = $request->dateEnd;

        Reports::$userStartShift = $request->shiftStart == 0 ? 'P1' : 'P2';
        Reports::$userEndShift = $request->shiftEnd == 0 ? 'P1' : 'P2';
        //Reports::$userStartShift = $request->shiftStart; //$request->shifts == 2 ? 'P2' : 'P1';
        //Reports::$userEndShift = $request->shiftEnd; //$request->shifts == 1 ? 'P1' : 'P2';


        Reports::GetGeneratedReport($request->category, $request->report);
    }
    return;
} else {
    Reports::$userStartDate = '20181003';
    Reports::GetGeneratedReport(0, 0);
    //include_once('../setDebugOff.php');
    //Reports::GetReportData();
}

// ----------------------------------------------------------









class Reports
{
    public static $userStartDate = '20181001';
    public static $userEndDate = '20181010';
    public static $userStartShift = 'P1';
    public static $userEndShift = 'P2';


    public static function GetReportData()
    {
        global $reportGroups;
        Reports::BuildReportData();
        echo json_encode($reportGroups); //, JSON_UNESCAPED_UNICODE);
    }


    // Builds report and returns info about the file (dl link)
    public static function GetGeneratedReport($catIndex, $reportIndex)
    {
        global $reportGroups;
        global $OUTPUT_DIR_LOCAL;

        Reports::BuildReportData();

        $result = Reports::RunReportQuery($catIndex, $reportIndex);

        if (!empty($result)) {
            Debug::StartProfile("PHP: Build CSV");

            $index = 0;
            $reportName = '';
            $catName = '';
            $keyName = '';
            foreach ($reportGroups as $key => $value) {
                if ($index == $catIndex) {
                    $reportName = $value[$reportIndex];
                    $catName = $key;
                    $keyName = $key;
                    break;
                }
                $index++;
            }

            // Build filename for user
            $reportName = str_replace(" ", "", $reportName);
            $catName = str_replace(" ", "", $catName);
            $filename = "Report_" . $catName . "_" . $reportName . "_" . Reports::$userStartDate . "_" . Reports::$userEndDate;

            // Add shift tag
            // $shiftTag = "";
            // if (Reports::$userStartShift == 'P1' && Reports::$userEndShift == 'P1')
            //     $shiftTag = "Day";
            // if (Reports::$userStartShift == 'P2' && Reports::$userEndShift == 'P2')
            //     $shiftTag = "Night";
            // if (Reports::$userStartShift == 'P1' && Reports::$userEndShift == 'P2')
            //     $shiftTag = "Both";

            // $filename .= "_" . $shiftTag;


            // Add extension
            $filename = $filename;
            $ext = ".csv";


            // Create file on the server
            $file = fopen($filename . $ext, "w");

            // Start building the CSV
            $returnTable = array();
            for ($i = 0; $i < count($result); $i++) {
                $row = array();
                for ($j = 0; $j < count($result[$i]); $j++) {

                    // If it's a DT object, only interested in the time
                    if (is_a($result[$i][$j], 'DateTime')) {
                        array_push($row, $result[$i][$j]->format('Y-m-d H:i:s'));
                    } else {
                        array_push($row, $result[$i][$j]);
                    }
                }
                $returnTable[] = $row;
                fputcsv($file, $row);
            }
            fclose($file);


            // Get file size
            $size = round(filesize($filename . $ext) / 1024);
            if ($size > 1024)
                $size = (string) round($size / 1024, 2) . "mb";
            else
                $size  = (string) $size . "k";
            //Debug::Log($size);

            // Return the link and the table to client
            $returnData = [];
            $returnData[] = $filename;
            $returnData[] = $keyName;
            $returnData[] = file_get_contents($filename . $ext); //$returnTable;
            $returnData[] = $size;
            $returnData[] = $OUTPUT_DIR_LOCAL;
            //$returnData[] = Reports::$userStartDate;

            echo json_encode($returnData);

            Debug::EndProfile();
        } else {
            Debug::Log("Couldn't write to file...  can't be opened?");
        }
    }



    private static function SplitAtUpperCase($s)
    {
        return preg_split('/(?=[A-Z])/', $s, -1, PREG_SPLIT_NO_EMPTY);
    }



    private static function NewStringByUpperCaseSplit($s)
    {
        $arr = Reports::SplitAtUpperCase($s);
        $newString = "";
        for ($i = 0; $i < count($arr); $i++)
            $newString = $newString . $arr[$i] . " ";
        return $newString;
    }

    private static function RunReportQuery($catIndex, $reportIndex)
    {
        global $REPORT_DIR;

        global $START_DATE_VAR;
        global $END_DATE_VAR;
        global $START_SHIFT;
        global $END_SHIFT;

        global $reportGroups;
        global $reportSQLMap;

        //Reports::BuildReportData();

        $index = 0;
        $sqlFileName = '';
        foreach ($reportSQLMap as $key => $value) {
            if ($index == $catIndex) {
                $sqlFileName = $REPORT_DIR . $key . "/" . $value[$reportIndex];
                break;
            }
            $index++;
        }

        if ($sqlFileName == '') {
            return;
        }

        //Debug::Log($sqlFileName);

        $sqlTxt = SQLUtils::FileToQuery($sqlFileName);
        $sqlTxt = str_replace($START_DATE_VAR, Reports::$userStartDate, $sqlTxt);
        $sqlTxt = str_replace($END_DATE_VAR, Reports::$userEndDate, $sqlTxt);
        $sqlTxt = str_replace($START_SHIFT, Reports::$userStartShift, $sqlTxt);
        $sqlTxt = str_replace($END_SHIFT, Reports::$userEndShift, $sqlTxt);
        //Debug::Log($sqlTxt);

        Debug::StartProfile("SQL: Report Query");
        $result = SQLUtils::QueryToText($sqlTxt);
        Debug::EndProfile();

        //Debug::Log($result);
        return $result;
    }





    // Builds the data needed for the reports
    // such as the front-end names as well
    // as a map for the SQL functions
    private static function BuildReportData()
    {
        Debug::StartProfile("PHP: Build Report Array");

        global $REPORT_DIR;
        global $CALL_QUERY;

        global $hasBuiltData;
        global $reportGroups;
        global $reportSQLMap;

        global $reportGroups;
        global $reportSQLMap;

        // Folders containing report files
        $reportFolders = scandir($REPORT_DIR);

        for ($i = 0; $i < count($reportFolders); $i++) {
            if ($reportFolders[$i] != '.' && $reportFolders[$i] != '..') {

                // Create category name based
                // on the folder name delimited by '_'
                $catName = $reportFolders[$i];
                $catName = str_replace("_", " ", $catName);

                // Get the SQL files that will be used 
                // to run the function calls
                $fileScan = scandir($REPORT_DIR . $reportFolders[$i]);
                $reportNames = [];
                $sqlNames = [];
                for ($j = 0; $j < count($fileScan); $j++) {
                    if ($fileScan[$j] != '.' && $fileScan[$j] != '..') {

                        // If it has callquery, its the one we want
                        // Get the cleaned name for it to be the report name
                        if (strpos($fileScan[$j], $CALL_QUERY) !== false) {
                            // Add the specific file
                            $sqlNames[] = $fileScan[$j];

                            // Clean up the front-end name
                            $offset = 4 + strlen($CALL_QUERY);
                            $cleanFileName = substr($fileScan[$j], 0, strlen($fileScan[$j]) - $offset);
                            $split = explode("_", $cleanFileName);
                            $reportName = Reports::NewStringByUpperCaseSplit($split[count($split) - 1]);
                            $reportNames[] = $reportName;
                            //$reportNames[$reportName] = 0;
                        }
                    }
                }

                $reportGroups[$catName] = $reportNames;
                $reportSQLMap[$reportFolders[$i]] = $sqlNames;
            }
        }
        $hasBuiltData = true;

        //Debug::Log($reportGroups);
        //Debug::Log($reportSQLMap);
        Debug::EndProfile();
    }
}
