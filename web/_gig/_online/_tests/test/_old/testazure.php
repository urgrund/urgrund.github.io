<?php
 // PHP Data Objects(PDO) Sample Code:
try {
    $conn = new PDO("sqlsrv:server = tcp:giggsworthtest.database.windows.net,1433; Database = ug_trial", "test", "GiggsWorth666");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    print("Error connecting to SQL Server.");
    die(print_r($e));
}

// SQL Server Extension Sample Code:
$connectionInfo = array("UID" => "test@giggsworthtest", "pwd" => "GiggsWorth666", "Database" => "ug_trial", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:giggsworthtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

$stmt = sqlsrv_query($conn, "SELECT *  FROM [dbo].[RD_STATUS_GROUP]");


while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    foreach ($row as $arrayItem) {
        echo ('<br/>');
        echo ($arrayItem);
    }
}
