<?php
include_once('header.php');
include_once('create_site_data.php');


// Date should be sent from the client
if (isset($_POST['date'])) {
    include_once('setDebugOff.php');
    Debug::DisableForSession();
    $date = $_POST['date'];
    new GetSiteData();
}


//$date = '20181001';
//new GetSiteData();


// This is the main function to manage the 
// generation of a days data 
class GetSiteData
{
    private static $_fileDir = "../sitedata/";
    private static $_fileExt = ".json";

    function __construct()
    {
        global $allSites;
        global $date;

        $forceRegenation = false; //false;



        $preGenerated = GetSiteData::CheckGeneratedDataExists($date);

        if ($preGenerated == null || $forceRegenation) {

            // If the data doesn't exist then generate and send back
            // to client whilst also saving this data to server 
            CreateSiteData::Run();
            $resultAsJSON = json_encode($allSites);
            GetSiteData::WriteGeneratedDataToDisk($date, $resultAsJSON);

            echo $resultAsJSON;
        } else {
            // pre-generated data already exists!
            echo $preGenerated;
        }
    }



    public static function CheckGeneratedDataExists($_date)
    {
        // TODO - sanitise the date input?
        $json = @file_get_contents(self::$_fileDir . $_date . self::$_fileExt);
        if ($json === false) {
            Debug::Log("File not found for" . $_date);
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
        if (file_put_contents(self::$_fileDir . $myFile . self::$_fileExt, $_data)) {
        }


        // THIS MAY NEED TO GO INTO DATABASE IN REAL SCENARIO


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
