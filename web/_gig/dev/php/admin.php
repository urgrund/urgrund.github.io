<?php



include_once('header.php');
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
        Admin::GenerateDataForDate($request->date);
    }

    return;
} else {
    //Admin::GetAllDateStatus();
    //Admin::GenerateDataForDate('20181001');

    $generateEverything = true;

    if ($generateEverything) {
        // Generate everything
        $tempStartDate = '2018-10-01';
        $tempEndDate = '2018-12-31';
        $period = new DatePeriod(
            new DateTime($tempStartDate),
            new DateInterval('P1D'),
            new DateTime($tempEndDate)
        );

        include_once('setDebugOff.php');
        foreach ($period as $key => $value) {
            $date = $value->format('Ymd');
            Admin::GetDateStatus($date, true);
        }
    }
}
// ----------------------------------------------------------
// ----------------------------------------------------------




class Admin
{
    public static function GenerateDataForDate($_date)
    {
        // This comes from create_site_data
        global $allSites;

        $metaData = new SiteMetaData();
        CreateSiteData::SetDateForCreation($_date);
        CreateSiteData::Run();

        // The last index of the generated data
        //Debug::Log($allSites);
        $metaTemp  = end($allSites);
        $metaData->FillFromData($metaTemp);

        // Encode and write to disk                
        GetSiteData::WriteGeneratedDataToDisk($_date, json_encode($allSites));

        $metaData->Date = $_date;

        // Might want this to not encode... as the recursive function could use it
        echo json_encode($metaData);
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
            $metaData->FillFromData(end($data));
        } else {
            if ($_generateIfMissing == true) {
                // Generate data for the missing date if possible
                CreateSiteData::SetDateForCreation($_date);
                CreateSiteData::Run();

                // The last index of the generated data
                $metaTemp = end($allSites);
                $metaData->FillFromData($metaTemp);

                // Encode and write to disk                
                GetSiteData::WriteGeneratedDataToDisk($_date, json_encode($allSites));
            } else
                $metaData->Date = $_date;
        }

        // Might want this to not encode... as the recursive function could use it
        echo json_encode($metaData);
    }


    public static function GetAllDateStatus()
    {
        //$pathInPieces = explode('/', $_SERVER['DOCUMENT_ROOT']);
        //Debug::Log($pathInPieces);

        global $allSites;

        $returnList = [];

        $period = new DatePeriod(
            new DateTime('2018-10-01'),
            new DateInterval('P1D'),
            new DateTime('2018-12-31')
        );


        foreach ($period as $key => $value) {
            $date = $value->format('Ymd');
            Debug::Log($date);

            $data = GetSiteData::CheckGeneratedDataExists($date);
            $metaData = new SiteMetaData();

            if ($data != null) {
                $data = json_decode($data);
                $metaData->FillFromData(end($data));
            } else {
                $metaData->Date = $date;
            }

            $returnList[$date] = $metaData;
        }
        echo json_encode($returnList);
    }
}
