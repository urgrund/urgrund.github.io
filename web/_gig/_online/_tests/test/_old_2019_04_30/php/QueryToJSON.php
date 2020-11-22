<?php

// Executes an SQL query and returns 
// the result formated as JSON
function QueryToJSON($sql, $includeKeys = true)
{
    $serverName = "tcp:giggsworthtest.database.windows.net,1433";
    $uid = 'test@giggsworthtest';
    $pwd = "GiggsWorth666";
    $dbase = "ug_trial";

    /* Establish a Connection to the SQL Server  */
    $connectionInfo = array("Database" => $dbase, "UID" => $uid, "PWD" => $pwd);
    $conn = sqlsrv_connect($serverName, $connectionInfo);

    if ($conn === false) {
        echo "Unable to connect.</br>";
        die(print_r(sqlsrv_errors(), true));
    }

    $stmt = sqlsrv_query($conn, $sql);
    if (!$stmt) {
        echo "Error executing query.</br>";
        die(print_r(sqlsrv_errors(), true));
    }

    // Sum up the rows from the query result
    $json = array();
    $sqlArrayResult = array();
    do {
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            // while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_NUMERIC)) {
            $sqlArrayResult[] = $row;
        }
    } while (sqlsrv_next_result($stmt));


    // Fetch Keys (headers) 
    if ($includeKeys) {
        $keys = array();
        $temp = $sqlArrayResult[0];

        foreach ($temp as $k => $v) {
            $keys[]  = $k;
        }

        $json[] = $keys;
    }

    // Acculmulate the Row Values
    for ($i = 0; $i < count($sqlArrayResult); ++$i) {
        $tempRow = array();

        foreach ($sqlArrayResult[$i] as $k => $v) {
            $tempRow[] = $v;
        }

        $json[] = $tempRow;
    }


    return json_encode($json);

    /* Free statement and connection resources. */
    sqlsrv_free_stmt($stmt);
    sqlsrv_close($conn);
}
