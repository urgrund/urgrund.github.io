<?php
include_once('header.php');


// ----------------------------------------------------------
// ----------------------------------------------------------
// WEB REQUEST ENTRY POINT
// This data will be valid with a URL 
// request from the client
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

if (is_object($request)) {
    include_once('setDebugOff.php');

    if ($request->func == 0) {
        // Pass in the dates
        Reports::SetReportParams(
            $request->date[0],
            $request->date[1],
            $request->date[2],
            $request->date[3],
        );
        $result = Reports::RunReport($request->date[4]);
        echo json_encode($result);
    }
    if ($request->func == 1) {
        echo json_encode(Reports::GetAvailableReports());
    }

    return;
} else {

    Reports::SetReportParams(
        $_startDate = '20181001',
        $_endDate = '20181015',
        $_startShift = 1,
        $_endShift = 2
    );

    //Debug::Log(Reports::$_endDate);

    $result = Reports::RunReport('Hauled_Tonnes\\RP_DevelopmentTotalByMineByTime.sql');
    //$result = Reports::RunReport('Bogger_Tonnes\\RP_DevelopmentTotalByMineByTime.sql');
    Debug::Log($result);

    $result = Reports::GetAvailableReports();
    //Debug::Log($result);
}
// ----------------------------------------------------------
// ----------------------------------------------------------



final class Reports
{
    private static $_startDate;
    public static $_endDate;
    private static $_startShift;
    private static $_endShift;


    /**
     *  Return an array of available reports
     */
    public static function GetAvailableReports(): array
    {
        $files = [];
        Reports::OutputFilesAtPath(Client::SQLReportPath(), $files);
        return Reports::PrepareAvailableReports($files);
    }


    /** 
     * Execute SQL report and return the resulting table 
     */
    public static function RunReport(string $reportFile): array
    {
        $sqlTxt = SQLUtils::FileToQuery(Client::SQLReportPath() . $reportFile);
        //Debug::Log($sqlTxt);
        $sqlTxt = str_replace(SQLUtils::ReportStartDate, "'" . Reports::$_startDate . "'", $sqlTxt);
        $sqlTxt = str_replace(SQLUtils::ReportEndDate, "'" . Reports::$_endDate  . "'", $sqlTxt);
        $sqlTxt = str_replace(SQLUtils::ReportStartShift, "'" . Reports::$_startShift  . "'", $sqlTxt);
        $sqlTxt = str_replace(SQLUtils::ReportEndShift, "'" . Reports::$_endShift  . "'", $sqlTxt);

        //Debug::Log($sqlTxt);

        $result = SQLUtils::QueryToText($sqlTxt, "Report");

        if ($result == null) {
            $result[] = "No Result";
            $result[] = Reports::FileNameArray($reportFile)[1];
            $result[] = "No data was found for selected date range or shifts...";
        }
        //Debug::Log($result);
        return $result;
    }


    /**
     * Set the parameters used to generate reports
     */
    public static function SetReportParams($_startDate, $_endDate, $_startShift, $_endShift)
    {
        Reports::$_startDate = $_startDate;
        Reports::$_endDate = $_endDate;
        Reports::$_startShift = $_startShift;
        Reports::$_endShift = $_endShift;
    }




    private static function PrepareAvailableReports(array $filesArray): array
    {
        $reports = [];

        for ($i = 0; $i < count($filesArray); $i++) {
            $dir = $filesArray[$i][0];
            $folderIndex = strrpos($dir, "/") + 1;
            $folder = substr($dir, $folderIndex);

            // Make nice name of folder
            $folder = str_replace("_", " ", $folder);

            if (!isset($reports[$folder]))
                $reports[$folder] = [];
            $reports[$folder][]  = Reports::FileNameArray($filesArray[$i][1]);
            //ebug::Log($filesArray[$i][1]);
        }
        return $reports;
    }

    private static function FileNameArray($fileName): array
    {
        $names = [];
        $names[] = $fileName;

        //$word = explode("_", $fileName);
        //$word = $word[count($word) - 1];

        $word = str_replace("RP_", "", $fileName);
        $word = str_replace("_", "", $word);

        $word = substr($word, 0, strlen($word) - 4);
        $names[] = Reports::NewStringByUpperCaseSplit($word);
        //Debug::Log($names[1]);
        return $names;
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


    static function OutputFilesAtPath($path, &$filesArray)
    {
        // Check directory exists or not
        if (file_exists($path) && is_dir($path)) {
            // Scan the files in this directory
            $result = scandir($path);

            // Filter out the current (.) and parent (..) directories
            $files = array_diff($result, array('.', '..'));

            if (count($files) > 0) {
                // Loop through retuned array
                foreach ($files as $file) {
                    if (is_file("$path/$file")) {
                        //Debug::Log($path . "  |   " . $file);
                        $filesArray[] = [$path, $file];
                    } else if (is_dir("$path/$file")) {
                        // Recursively call the function if directories found
                        Reports::OutputFilesAtPath("$path/$file", $filesArray);
                    }
                }
            } else {
                Debug::Log("ERROR: No files found in the directory.");
            }
        } else {
            Debug::Log("ERROR: The directory does not exist.");
        }
    }
}
