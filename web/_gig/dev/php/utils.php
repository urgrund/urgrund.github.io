<?php

include_once('sql.php');

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
