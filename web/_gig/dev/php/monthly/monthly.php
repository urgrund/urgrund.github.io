<?php

include_once('..\header.php');


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
        Monthly::GetCSV($request->year, $request->month);
    }
}
// ----------------------------------------------------------


class Monthly
{
    private static $_fileDir = "";
    private static $_fileName = "Plan_";
    private static $_fileExt = ".json";

    function __construct()
    {
    }


    public static function GetDataActuals($_year, $_month)
    {
        $sqlTxt = SQLUtils::FileToQuery('..\..\assets\sql\Core\ALL_MonthlyProductionData.sql');
        $sqlTxt = str_replace('@YEAR', "'" . $_year . "'", $sqlTxt);
        $sqlTxt = str_replace('@MONTH', "'" . $_month . "'", $sqlTxt);

        $sqlResult = SQLUtils::QueryToText($sqlTxt, "All Metric");

        //Debug::Log($sqlResult);
    }


    public static function GetCSV($_year, $_month)
    {
        $fileName = self::$_fileName .  $_year . $_month;
        $json = @file_get_contents(self::$_fileDir . $fileName . self::$_fileExt);
        if ($json === false) {
            return "File not found...";
        } else {
            echo $json;
        }
    }

    public static function WriteCSV($_data, $_year, $_month)
    {
        $fileName = self::$_fileName .  $_year . $_month;
        $jsonData = json_encode($_data);
        file_put_contents(self::$_fileDir . $fileName . self::$_fileExt, $jsonData);
    }

    // public static function WriteGeneratedDataToDisk($_date, $_data)
    // {
    //     $myFile = $_date;
    //     if (file_put_contents(self::$_fileDir . $myFile . self::$_fileExt, $_data)) {
    //     }


}
