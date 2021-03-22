<?php

//include_once('utils.php');
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
    include_once('create_site_data.php');

    try {
        if ($request->func == 0) {
            if (isset($request->date)) {
                echo (GetSiteData::GetDataForDate($request->date));
            }
        }

        if ($request->func == 1) {
            echo json_encode(GetSiteData::GetAvailableDates());
        }
    } catch (Exception $e) {
        $error = (new ErrorResponse(
            404,
            "Get Site Data",
            "Error in attempting to retrieve site data",
            array($e->getMessage())
        ));
        $error->Return();
    }
} else {
    // Debug path    
    include_once('create_site_data.php');
    GetSiteData::GetDataForDate(['20210208'], !true);
    //GetSiteData::GetDataForLongTerm();

    //Debug::Log(Client::CachePath());
    //GetSiteData::GetAvailableDates();
    //Debug::Log(GetSiteData::GetAvailableDates());
}
// ----------------------------------------------------------
// ----------------------------------------------------------


/**
 * GetSiteData will attempt to retrive data from 
 * a particular date and generate it if it does
 * not exist.   This should be used as the web
 * interface
 */
class GetSiteData
{
    //private static $_fileDir = "../sitedata/";
    //private static $_fileDir2 = Client::CachePath();


    private static $_fileExt = ".json";
    //private static $_fileExt = ".mmd";  // Mine Mage Data    

    private static function CacheDir(): string
    {
        return Client::CachePath();
        //return "../sitedata/";
    }

    public static function GetDataForDate($_date, $_forceRegen = false)
    {
        global $allSites;
        global $date;

        $date = $_date;

        //$forceRegenation = false;
        $preGenerated = GetSiteData::CheckGeneratedDataExists($date);

        $exists = ($preGenerated != null) ? True : False;
        //Debug::Log($exists);

        if ($preGenerated == null || $_forceRegen) {

            // If the data doesn't exist then generate and send back
            // to client whilst also saving this data to server 
            CreateSiteData::Run(new DateTime($_date));
            $resultAsJSON = json_encode($allSites);
            GetSiteData::WriteGeneratedDataToDisk($date, $resultAsJSON);

            return $resultAsJSON;
        } else {
            return $preGenerated;
        }
    }


    private static function CreateDataFolder()
    {
        if (!is_dir(self::CacheDir())) {
            mkdir(self::CacheDir(), 0777, true);
        }
    }


    public static function GetAvailableDates()
    {
        $sqlTxt = SQLUtils::FileToQuery(Client::SQLCorePath() . 'ALL_AvailableDates.sql');
        $result = SQLUtils::QueryToText($sqlTxt, "Available Dates");
        array_shift($result);
        //Debug::Log($result);
        $dates = array_map(fn ($x) => $x[0], $result);
        return ($dates);
    }


    public static function CheckGeneratedDataExists($_date)
    {
        GetSiteData::CreateDataFolder();


        // TODO - sanitise the date input?
        $json = @file_get_contents(self::CacheDir() . $_date . self::$_fileExt);

        if ($json === false) {
            Debug::Log("File not found for " . $_date);
            return null;
            //echo json_encode(["Error" => "File not found for " . $_date]);
        } else {
            return $json;
        }
        return null;
    }


    // Will write out the generated data for this day
    // and upload to the database 
    public static function WriteGeneratedDataToDisk($_date, $_data)
    {
        $myFile = $_date;
        if (file_put_contents(self::CacheDir() . $myFile . self::$_fileExt, $_data)) {
        }


        // THIS COULD GO INTO A LOCAL DATABASE SIDE BY SIDE WITH THE PHP

        //$sqlTxt = "INSERT INTO dbo.Test (DateKey, DateData) VALUES ('20181010', 'poooooo')";
        // $sqlTxt = "
        // BEGIN
        //     IF NOT EXISTS (SELECT * FROM dbo.Test WHERE DateKey =" . $_date . ")
        //     BEGIN
        //         INSERT INTO dbo.Test(DateKey, DateData)
        //         VALUES (" . $_date . ", " . $myFile . ")
        //     END
        // END
        // ";

        //SQLUtils::Query($sqlTxt);
    }
}
