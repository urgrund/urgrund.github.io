<?php
final class Version
{
    private static $_version = 1.01;
    final public static function current()
    {
        return self::$_version;
    }
}




//$serverName = "tcp:192.168.0.105\SQLEXPRESS, 1433";
// $serverName = "tcp:192.168.0.105\SQLEXPRESS, 1433";
// $uid = 'test';
// $pwd = "gigworth";
// $dbase = "test";

// /* Establish a Connection to the SQL Server  */
// $connectionInfo = array("Database" => $dbase, "UID" => $uid, "PWD" => $pwd, "CharacterSet" => "UTF-8", "ConnectionPooling" => "1", "MultipleActiveResultSets" => '0');
// $conn = sqlsrv_connect($serverName, $connectionInfo);

// if ($conn === false) {
//     //echo "Unable to connect.</br>";
//     Debug::Log(sqlsrv_errors());
//     die(print_r(sqlsrv_errors(), true));
// } else {
//     Debug::Log("Success");
//     $isConnected = true;
// }



//$sqlTxt = "Select * from ALLMetricPerHour(" . $date  . ")"; //," . "' TONNE')";

//$sqlFile = "ALL_EquipmentEventList.sql";
//$sqlFileTxt = SQLUtils::FileToQuery($sqlFile);
//Debug::Log(SQLUtils::QueryToText($sqlFileTxt));



//$sqlTxt = "Select * from [test].[dbo].[ALLOCTNTIMESTAMP]";
//$sqlTxt = "Select top (10000) [TSKey] from [test].[dbo].[ALLOCTNTIMESTAMP]";
//Debug::Log(SQLUtils::QueryToText($sqlTxt));
