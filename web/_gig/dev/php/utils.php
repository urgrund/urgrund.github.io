<?php

include_once('sql.php');


class Utils
{
    private static $rootFolder = "dev\\php\\";
    private static $rootFolderLive = "/dev/php/";
    public static function GetBackEndRoot()
    {
        if ($_SERVER['DOCUMENT_ROOT'] == "") {
            $fileSelf = $_SERVER['PHP_SELF'];
            $start = strpos($fileSelf, self::$rootFolder);
            $strLen = strlen(self::$rootFolder);

            return substr($fileSelf, 0, $start + $strLen);
        } else {
            return $_SERVER['DOCUMENT_ROOT'] . self::$rootFolderLive;
        }
    }


    public static function GetClientIP()
    {
        $ipaddress = '';
        if (isset($_SERVER['HTTP_CLIENT_IP']))
            $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
        else if (isset($_SERVER['HTTP_X_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
        else if (isset($_SERVER['HTTP_X_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
        else if (isset($_SERVER['HTTP_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
        else if (isset($_SERVER['HTTP_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_FORWARDED'];
        else if (isset($_SERVER['REMOTE_ADDR']))
            $ipaddress = $_SERVER['REMOTE_ADDR'];
        else
            $ipaddress = '0.0.0.0';
        return $ipaddress;
    }

    // Maps datetime day to full day name
    const dayNameMap = array(
        "Mon" => "Monday",
        "Tue" => "Tuesday",
        "Wed" => "Wednesday",
        "Thu" => "Thursday",
        "Fri" => "Friday",
        "Sat" => "Saturday",
        "Sun" => "Sunday"
    );
}




/**
 * Custom error response struct
 * */
class ErrorResponse
{
    public int $codeID;
    public string $codeMsg;
    public string $message;
    public array $details;
    function __construct(
        int $_codeID,       // Response header code (ie. 404)
        string $_codeMsg,   // Response header custom messsage
        string $_message,   // Nice, short message about the error
        array $_details     // Details collected by exception... etc
    ) {
        $this->codeID = $_codeID;
        $this->codeMsg = $_codeMsg;
        $this->message = $_message;
        $this->details = $_details;
    }

    /** Echo out the details of this error response
     * to be recieved by the calling http request
     * */
    public function Return()
    {
        header("HTTP/1.1 " . $this->codeID . " " . $this->codeMsg);
        echo json_encode([$this->message,  $this->details]);
    }
}


/**
 * Code to categorise the error response
 **/
class ErrorResponseCode
{
    public static $MONTLY = "Monthly";
    public static $CREATE_SITE_DATA = "";
}






class Debug
{
    //private static $_debugOff = false;
    private static $_debugOff = !true;
    private static $_debugOffMaster = false;

    public static function enabled()
    {
        return !(self::$_debugOff || self::$_debugOffMaster);
    }

    public static function DisableForSession()
    {
        self::$_debugOffMaster = true;
        self::$_debugOff = true;
    }

    public static function Disable()
    {
        if (self::$_debugOff || self::$_debugOffMaster)
            return;

        self::$_debugOff = true;
    }

    public static function Enable()
    {
        self::$_debugOff = false;
    }


    public static function Log($object)
    {
        if (self::$_debugOff || self::$_debugOffMaster)
            return;

        if ($object == null)
            $object = "NULL";

        print_r("\n");
        print_r($object);
    }

    public static function LogI($object)
    {
        if (self::$_debugOff || self::$_debugOffMaster)
            return;

        print_r($object);
    }

    public static function LogToHTML($data)
    {
        if (self::$_debugOff || self::$_debugOffMaster)
            return;

        $output = $data;
        if (is_array($output))
            $output = implode(',', $output);

        echo "<script>console.log( 'Debug Objects: " . $output . "' );</script>";
    }



    private static $profileEventList = array();

    /**
     * Start a Profiling entry with an event object, remember to end it with EndProfile
     **/
    public static function StartProfile($event)
    {
        if (self::$_debugOff || self::$_debugOffMaster)
            return;
        array_push(self::$profileEventList, array('Event' => $event, 'StartTime' => microtime(true)));
    }


    /**
     * End a Profiling entry and log its timing
     **/
    public static function EndProfile()
    {
        if (self::$_debugOff || self::$_debugOffMaster)
            return;

        $depthCount = count(self::$profileEventList);
        $depth = "\n";
        for ($i = 1; $i < count(self::$profileEventList); $i++)
            $depth .= "....";

        $event = array_pop(self::$profileEventList);
        echo $depth . " | " . $event['Event'] . ":  " . (number_format((microtime(true) - $event['StartTime']), 4) * 1000) . "ms";
    }
}







class HTMLTable
{
    public static function Create($result)
    {
        echo '<table id="customers">';
        self::tableHead($result);
        self::tableBody($result);
        echo '</table>';
    }

    private static function tableHead($result)
    {
        echo '<thead>';
        foreach ($result as $x) {
            echo '<tr>';
            foreach ($x as $k => $y) {
                echo '<th>' . ucfirst($k) . '</th>';
            }
            echo '</tr>';
            break;
        }
        echo '</thead>';
    }

    private static function tableBody($result)
    {
        echo '<tbody>';
        foreach ($result as $x) {
            echo '<tr>';
            foreach ($x as $y) {
                print_r('<td>' . json_encode($y) . '</td>');
            }
            echo '</tr>';
        }
        echo '</tbody>';
    }

    public static function CreateFromCSV($handle)
    {
        $row = 1;
        echo '<table border="1">';

        while (($data = fgetcsv($handle, 1000)) !== FALSE && $row < 100) {
            $num = count($data);
            if ($row == 1) {
                echo '<thead><tr>';
            } else {
                echo '<tr>';
            }

            for ($c = 0; $c < $num; $c++) {
                //echo $data[$c] . "<br />\n";
                if (empty($data[$c])) {
                    $value = "&nbsp;";
                } else {
                    $value = $data[$c];
                }
                if ($row == 1) {
                    echo '<th>' . $value . '</th>';
                } else {
                    echo '<td>' . $value . '</td>';
                }
            }

            if ($row == 1) {
                echo '</tr></thead><tbody>';
            } else {
                echo '</tr>';
            }
            $row++;
        }

        echo '</tbody></table>';
    }
}
