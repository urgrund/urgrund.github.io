<?php
//include_once('utils.php');
include_once('header.php');
//include_once('client.php');

$isConnected = 0;
$conn;

//SQLUtils::OpenConnection();
//Debug::Log($conn);


final class SQLDBCredentials
{
    public string $server = "";
    public string $uid = "";
    public string $pwd = "";
    public string $db = "";
    function __construct(string $_server, string $_uid, string $_pwd, string $_db)
    {
        $this->server = $_server;
        $this->uid = $_uid;
        $this->pwd = $_pwd;
        $this->db = $_db;
    }
}



/**   
 * Manages connections and queries and helps convert
 * text to a query or json format 
 */
class SQLUtils
{
    public const DateVar = '@Date';
    public const MonthVar = '@Month';
    public const YearVar = '@Year';

    public const ReportStartDate = '@StartDate';
    public const ReportEndDate = '@EndDate';
    public const ReportStartShift = '@StartShift';
    public const ReportEndShift = '@EndShift';

    public const QUERY_DIRECTORY = "..\\sql\\";

    public static function OpenConnection()
    {
        Debug::StartProfile("Open Server Connection");

        global $isConnected;
        global $conn;

        //Debug::Log($isConnected);

        if ($isConnected == true)
            return true;



        /* Establish a Connection to the SQL Server  */
        $credentials = Client::instance()->SQLDBCredentials();
        //$connectionInfo = array("Database" => $dbase, "UID" => $uid, "PWD" => $pwd, "CharacterSet" => "UTF-8", "ConnectionPooling" => "1", "MultipleActiveResultSets" => '0');

        $connectionInfo = array(
            "Database" => $credentials->db,
            "UID" => $credentials->uid,
            "PWD" => $credentials->pwd,
            "CharacterSet" => "UTF-8",
            "ConnectionPooling" => "1",
            "MultipleActiveResultSets" => '0'
        );

        //$conn = sqlsrv_connect($serverName, $connectionInfo);
        $conn = sqlsrv_connect($credentials->server, $connectionInfo);

        Debug::EndProfile();


        if ($conn === false) {
            //SQLUtils::DisplayErrors();
            //die(print_r(sqlsrv_errors(), true));
        } else {
            $isConnected = true;
        }

        return $isConnected;
    }


    public static function CloseConnection()
    {
        global $conn;
        sqlsrv_close($conn);
    }



    /**
     * Open and read a file and return its contents
     **/
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
        //sqlsrv_configure('WarningsReturnAsErrors', 1);
        $stmt = sqlsrv_query($conn, $sql);



        if ($stmt === false) {
            if (($errors = sqlsrv_errors()) != null) {
                foreach ($errors as $error) {
                    //echo "SQLSTATE: " . $error['SQLSTATE'] . "<br />";
                    //echo "code: " . $error['code'] . "<br />";
                    //echo "message: " . $error['message'] . "<br />";
                    Debug::Log("SQLSTATE: " . $error['SQLSTATE']);
                    Debug::Log("code: " . $error['code']);
                    Debug::Log("message: " . $error['message']);
                }
            }
        }

        // Sum up the rows from the query result        
        $json = array();
        $sqlArrayResult = array();
        do {
            while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
                //Debug::Log($row);
                $sqlArrayResult[] = $row;
            }
        } while (sqlsrv_next_result($stmt));



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

        sqlsrv_free_stmt($stmt);

        Debug::EndProfile();

        return ($json);
    }

    /* ------------- Error Handling Functions --------------*/

    public static function HasErrors(): bool
    {
        return count(sqlsrv_errors(SQLSRV_ERR_ERRORS)) > 0;
    }


    public static function GetErrors(): array
    {
        $return = array();
        $errors = sqlsrv_errors(SQLSRV_ERR_ERRORS);
        if (!is_null($errors)) {
            foreach ($errors as $error) {
                $return[] = $error['message'];
            }
            return array_unique($return);
        } else
            return [];
    }

    public static function DisplayErrors()
    {
        $errors = sqlsrv_errors(SQLSRV_ERR_ERRORS);
        foreach ($errors as $error) {
            echo "\nError: " . $error['message'] . "\n";
        }
    }

    public static function DisplayWarnings()
    {
        $warnings = sqlsrv_errors(SQLSRV_ERR_WARNINGS);
        if (!is_null($warnings)) {
            foreach ($warnings as $warning) {
                echo "Warning: " . $warning['message'] . "\n";
            }
        }
    }
}
