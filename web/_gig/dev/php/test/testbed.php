
<?php

include_once('..\header.php');



// Only works when live
$path = $_SERVER['DOCUMENT_ROOT'];

$path .= "LKSJDLKAJ";
//echo $path;


static $date = "20181010";


echo 'poo';

$pathInPieces = explode('/', $_SERVER['DOCUMENT_ROOT']);
echo $pathInPieces[0];





function Test()
{
    Debug::StartProfile("Open Server Connection");

    //echo "Connecting...";
    global $isConnected;
    global $conn;

    //Debug::Log($isConnected);

    if ($isConnected == true)
        return;

    $serverName = "tcp:giggsworthtest.database.windows.net,1433";
    $uid = 'test@giggsworthtest';
    $pwd = "GigWorth666";
    $dbase = "ug_trial";

    /* Establish a Connection to the SQL Server  */
    $connectionInfo = array("Database" => $dbase, "UID" => $uid, "PWD" => $pwd, "CharacterSet" => "UTF-8", "ConnectionPooling" => "1", "MultipleActiveResultSets" => '0');
    $conn = sqlsrv_connect($serverName, $connectionInfo);
    echo ($conn);
    Debug::EndProfile();
}

// [PHP_PDO_SQLSRV]
// extension=pdo_sqlsrv_73_ts_x86
// extension=pdo_sqlsrv_73_ts_x64

// [PHP_SQLSRV]
// extension=sqlsrv_73_ts_x86
// extension=sqlsrv_73_ts_x64




//Debug::Log($period);




//SomeSQL();
function SomeSQL()
{
    Debug::StartProfile("Some SQL");

    include_once('setDebugOff.php');
    //$sqlTxt = "Select * from [dbo].[View_OverView] where shift like ' 20181010 P % '";

    // TUM & Longterm stuff
    $sqlTxt = "Select * from[dbo].[EquipmentNewTUM]('20181001', '20181231') order by[Date] asc";
    $sqlTxt = "Select * from ALLMetricPerHour('20181010')";

    $final = SQLUtils::QueryToJSON($sqlTxt);
    echo ($final);

    Debug::EndProfile();
}





function TodaysDate()
{
    Debug::StartProfile("Test");

    for ($x = 0; $x < 100000; $x++) {
        $date = new DateTime();
        $timezone = new DateTimeZone('Asia/Singapore');
        $date->setTimezone($timezone);
        //Debug::Log($date);
    }

    Debug::EndProfile();
}

function Bla()
{
    global $date;
    //$nightShift = new DateTime($allEvents[1][1]->format('m/d/Y'));
    //$d = new DateTime('2011-01-01T15:03:01.012345Z');

    //$nightShift = new DateTime('20181010');
    $nightShift = new DateTime($date);
    $nightShift->setTime(25, 00);

    print_r($date);
    print_r($nightShift);
    //$sqlTxt = "Select * from ALLMineEquipmentList('20181001', 'M%')";
    //$sqlTxt = "Select * from TonnesPerHour('LH020', '20181001', 'TONNE')";
    //$sqlTxt = "Select * from ALLEquipmentEventList('20181010') order by[Equipment] asc, [Event Time] asc";

    //$result = SQLUtils::QueryToText($sqlTxt);
    //print_r($result);
    //echo $result;
}







//TestStuff();
function TestStuff()
{
    Debug::Disable();
    $sqlPath = "../assets/sql/mine/SP_MATERIAL_ALL_Bogging.sql";
    $sqlTxt = SQLUtils::FileToQuery($sqlPath);
    $final = SQLUtils::QueryToJSON($sqlTxt);
    echo ($final);

    echo ("</ br>");
    echo ("</ br>");
    echo ("</ br>");
    echo ("</ br>");

    $sqlPath = "../assets/sql/mine/SP_MATERIAL_ALL_Trucks2.sql";
    $sqlTxt = SQLUtils::FileToQuery($sqlPath);
    $final = SQLUtils::QueryToJSON($sqlTxt);
    echo ($final);
}


//AllDayData();
function AllDayData()
{
    //$sqlTxt = "Select * from [dbo].[View_OverView] where shift like ' 20181010 P % '";
    $sqlTxt = "Select * From FullDataSet ('20181010', '20181010')";
    $final = SQLUtils::QueryToJSON($sqlTxt);
    echo ($final);
}







// Example of prepared function
// consider use later! 
//PreparedStatement();
//NormalStatement();
function PreparedStatement()
{
    $sqlPath = ' . . / assets / sql / SP_EQUIP_TPH_Prep . sql ';
    $sqlTxt = SQLUtils::FileToQuery($sqlPath);

    SQLUtils::OpenConnection();
    global $conn;

    $id = "LH020";
    $stmt = sqlsrv_prepare($conn, $sqlTxt, array(&$id));

    //print_r($stmt);
    if (!$stmt) {
        die(print_r(sqlsrv_errors(), true));
    }

    Debug::StartProfile("Preapred Statement Execute");
    $results = [];
    $names = ["LH020", "LH007", "BL005", "HL154", "HLH06", "HT009", "TH005", "TH057", "TH003", "TH010"];

    for ($x = 0; $x < 10; $x++) {
        for ($i = 0; $i < count($names); $i++) {

            $id = $names[$i];
            sqlsrv_execute($stmt);

            $sqlArrayResult = array();
            do {
                while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
                    //while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_NUMERIC)) {
                    $sqlArrayResult[] = $row;
                }
            } while (sqlsrv_next_result($stmt));

            //$results[] = $sqlArrayResult;
        }
    }

    Debug::EndProfile();

    //echo json_encode($results);
    // $allEvents = SQLUtils::QueryToText($sqlTxt);
    //print_r($allEvents);
}


function NormalStatement()
{
    $sqlPath = ' . . / assets / sql / SP_EQUIP_TonnesPerHour . sql ';
    $sqlTxt = SQLUtils::FileToQuery($sqlPath);

    SQLUtils::OpenConnection();
    global $conn;


    $id = "LH020";
    $stmt = sqlsrv_prepare($conn, $sqlTxt, array(&$id));

    //print_r($stmt);
    if (!$stmt) {
        die(print_r(sqlsrv_errors(), true));
    }

    Debug::StartProfile("Statement Execute");
    $results = [];
    $names = ["LH020", "LH007", "BL005", "HL154", "HLH06", "HT009", "TH005", "TH057", "TH003", "TH010"];



    for ($x = 0; $x < 10; $x++) {
        for ($i = 0; $i < count($names); $i++) {
            $sqlTxt = str_replace("' HT099 '", "' " . $names[$i] . "'", $sqlTxt);
            $results[] = SQLUtils::QueryToText($sqlTxt);
            //$results[] = $sqlArrayResult;
        }
    }

    Debug::EndProfile();

    //echo json_encode($results);
    // $allEvents = SQLUtils::QueryToText($sqlTxt);
    //print_r($allEvents);
}
