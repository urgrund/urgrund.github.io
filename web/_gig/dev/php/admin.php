<?php

//include_once('utils.php');
include_once('header.php');
//include_once('setDebugOff.php');
include_once('get_site_data.php');

// ----------------------------------------------------------
// ----------------------------------------------------------
// WEB REQUEST ENTRY POINT
// This data will be valid with a URL 
// request from the client
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

if (is_object($request)) {
    include_once('setDebugOff.php');
    Debug::DisableForSession();

    // Get all the dates and their status
    // Does not generate anything
    if ($request->func == 0) {
        Admin::GetAllDateStatus();
    }
    // Check a specific date
    else if ($request->func == 1) {
        Admin::GetDateStatus($request->date, $request->regen);
    }
    // Force regenerate data
    else if ($request->func == 2) {
        echo Admin::GenerateDataForDate($request->date);
    }
    // Download data
    else if ($request->func == 3) {
        Admin::DownloadDataForDate($request->date);
    }
    // Get CSV config docs
    else if ($request->func == 4) {
        Admin::GetCSVConfigs();
    }

    return;
} else {
    //include_once('setDebugOff.php');
    Admin::GetAllDateStatus();
    //Admin::GetCSVConfigs();
    //Admin::GenerateDataForDate('20181001');

    //$generateEverything = false;
    //Admin::GetAllDateStatus();
    //Admin::GenerateDataForDate('20181010');
    //Admin::DownloadDataForDate('20181010');
    return;
}
// ----------------------------------------------------------
// ----------------------------------------------------------




class Admin
{

    public static function GetCSVConfigs()
    {
        new Config();
        echo json_encode(Config::Instance());
    }

    public static function GenerateDataForDate($_date)
    {
        return GetSiteData::GetDataForDate($_date, true);
    }

    public static function DownloadDataForDate($_date)
    {
        $data = GetSiteData::CheckGeneratedDataExists($_date);
        if ($data != null) {
            echo $data;
        } else {
            echo json_encode(["Error" => "File not found for " . $_date]);
        }
    }


    /**
     * Check if this date exists and return the meta data.  If it doesn't exist, 
     * then pass the boolean option to attempt to generate the data
     **/
    public static function GetDateStatus($_date, $_generateIfMissing)
    {
        // This comes from create_site_data
        global $allSites;

        $data = GetSiteData::CheckGeneratedDataExists($_date);
        $metaData = new SiteMetaData();

        if ($data != null) {
            $data = json_decode($data);
            //$metaData->FillFromData(end($data));
            $metaData = end($data);
        } else {
            if ($_generateIfMissing == true) {
                $metaData = end($allSites);
                // Encode and write to disk                
                GetSiteData::WriteGeneratedDataToDisk($_date, json_encode($allSites));
            } else
                $metaData->Date = $_date;
        }

        echo json_encode($metaData);
    }


    public static function GetAllDateStatus()
    {
        //$pathInPieces = explode('/', $_SERVER['DOCUMENT_ROOT']);
        //Debug::Log($pathInPieces);

        //global $allSites;

        $returnList = [];

        $dates = GetSiteData::GetAvailableDates();

        // $period = new DatePeriod(
        //     new DateTime($dates[count($dates) - 1]),
        //     new DateInterval('P1D'),
        //     new DateTime($dates[0])
        // );


        for ($i = 0; $i < count($dates); $i++) {
            $date = $dates[$i];
            //Debug::Log($date);

            $data = GetSiteData::CheckGeneratedDataExists($date);
            $metaData = new SiteMetaData();

            if ($data != null) {
                $data = json_decode($data);
                $metaData = end($data);
            } else {
                $metaData->Date = $date;
            }

            if (array_key_exists($date, $returnList))
                Debug::Log($date . " already exists!");

            //$returnList[$date] = $metaData;
            $returnList[] = $metaData;
        }


        // foreach ($period as $key => $value) {
        //     $date = $value->format('Ymd');
        //     //Debug::Log($date);

        //     $data = GetSiteData::CheckGeneratedDataExists($date);
        //     $metaData = new SiteMetaData();

        //     if ($data != null) {
        //         $data = json_decode($data);
        //         $metaData = end($data);
        //     } else {
        //         $metaData->Date = $date;
        //     }

        //     if (array_key_exists($date, $returnList))
        //         Debug::Log($date . " already exists!");

        //     //$returnList[$date] = $metaData;
        //     $returnList[] = $metaData;
        // }

        //Debug::Log($returnList);
        echo json_encode($returnList);
    }
}
