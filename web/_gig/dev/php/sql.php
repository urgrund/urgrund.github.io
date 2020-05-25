<?php
include_once('utils.php');

$isConnected = 0;
$conn;
//print($isConnected);
//SQLUtils::OpenConnection();
//print($isConnected);


/**   
 * Manages connections and queries and helps convert
 * text to a query or json format
 * @author Matthew Bell 2020  
 */
class SQLUtils
{
    public static function OpenConnection()
    {
        Debug::StartProfile("Open Server Connection");
        //echo "Connecting...";
        global $isConnected;
        global $conn;

        //Debug::Log($isConnected);

        if ($isConnected == true)
            return;

        // $serverName = "tcp:giggsworthtest.database.windows.net,1433";
        // $uid = 'test@giggsworthtest';
        // $pwd = "GigWorth666";
        // $dbase = "ug_trial";

        //$serverName = "tcp:192.168.0.100\SQLEXPRESS, 1433";
        $serverName = "tcp:LAPTOP\SQLEXPRESS, 1433"; // <- takes longer but can resolve by name if IP changes
        $uid = 'test';
        $pwd = "gigworth";
        $dbase = "test";

        /* Establish a Connection to the SQL Server  */
        $connectionInfo = array("Database" => $dbase, "UID" => $uid, "PWD" => $pwd, "CharacterSet" => "UTF-8", "ConnectionPooling" => "1", "MultipleActiveResultSets" => '0');
        $conn = sqlsrv_connect($serverName, $connectionInfo);

        if ($conn === false) {
            //echo "Unable to connect.</br>";
            //Debug::Log(sqlsrv_errors());
            die(print_r(sqlsrv_errors(), true));
        } else {
            //Debug::Log("Success");
            $isConnected = true;
        }

        Debug::EndProfile();
    }


    public static function CloseConnection()
    {
        global $conn;
        sqlsrv_close($conn);
    }


    public static function FileToQuery($path)
    {
        $sqltxt = array();
        $fh = fopen($path, 'r');
        while ($line = fgets($fh)) {
            $sqltxt[] = $line;
        }
        fclose($fh);
        $sqltxt = implode(" ", $sqltxt);
        return $sqltxt;
    }


    private static $preparedStatements = array();
    public static function PrepareStatement($sql)
    {
        if (in_array($sql, self::$preparedStatements)) {
            echo ("Already Exists");
            return;
        }
        global $conn;
        global $isConnected;
        if ($isConnected == false)
            SQLUtils::OpenConnection();
        return;
    }


    /**
     * Execute a Query with no return results            
     */
    public static function Query($sql)
    {
        global $conn;
        global $isConnected;
        if (!$isConnected)
            SQLUtils::OpenConnection();

        Debug::StartProfile("(" . $sql . ")");
        $stmt = sqlsrv_query($conn, $sql);

        if ($stmt === false) {
            if (($errors = sqlsrv_errors()) != null) {
                foreach ($errors as $error) {
                    echo "SQLSTATE: " . $error['SQLSTATE'] . "<br />";
                    echo "code: " . $error['code'] . "<br />";
                    echo "message: " . $error['message'] . "<br />";
                }
            }
        }
        Debug::EndProfile();
    }


    /**
     * Execute a Query and return it as a JSON            
     */
    public static function QueryToJSON($sql, $includeKeys = true)
    {
        return json_encode(SQLUtils::QueryToText($sql, $includeKeys));
    }


    /**
     * Execute a Query and return as raw data      
     */
    public static function QueryToText($sql, $debugName = "Query", $includeKeys = true)
    {
        global $conn;
        global $isConnected;
        if (!$isConnected)
            SQLUtils::OpenConnection();

        Debug::StartProfile("SQL " . $debugName);
        $stmt = sqlsrv_query($conn, $sql);

        if ($stmt === false) {
            if (($errors = sqlsrv_errors()) != null) {
                foreach ($errors as $error) {
                    echo "SQLSTATE: " . $error['SQLSTATE'] . "<br />";
                    echo "code: " . $error['code'] . "<br />";
                    echo "message: " . $error['message'] . "<br />";
                }
            }
        }
        // if (!$stmt) {
        //     echo "Error executing query.</br>";
        //     die(print_r(sqlsrv_errors(), true));
        // }


        // Sum up the rows from the query result        
        $json = array();
        $sqlArrayResult = array();
        do {
            while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
                // while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_NUMERIC)) {
                $sqlArrayResult[] = $row;
            }
        } while (sqlsrv_next_result($stmt));

        Debug::EndProfile();




        //return $sqlArrayResult;
        //print_r("\n" . " Result : " . count($sqlArrayResult) . "\n");

        // If there was a result
        //Debug::StartProfile("JSON Array");

        if (count($sqlArrayResult) > 0) {
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
        }

        // Debug::EndProfile();
        /* Free statement and connection resources. */
        //sqlsrv_free_stmt($stmt);

        return ($json);
    }
}
