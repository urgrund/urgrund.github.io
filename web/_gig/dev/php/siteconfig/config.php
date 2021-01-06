<?php

// For local debug
//include_once('..\header.php');
//new Config();
//Debug::Log(Config::CreateDistinctTUMArray());



/**
 * An interface to the CSV files that are used 
 * to map site and equipment specific values to front-end
 * @author Matthew Bell 2020
 */
class Config
{
    public static $instance = null;

    private static $localDir = "siteconfig\\";
    private static $filePrefix = 'Config_';

    private static $fileTUM = 'TUM';
    private static $fileSites = 'Sites';


    // This should probably be a config file
    private static $metricMap = array(
        "FACEMETRE" => "Face Metres",
        "INSMESHSTROVRLAP" => "Mesh Metres",
        "INSMESHGALVL" => "Install Mesh",
        "INSMESHGALV" => "Install Mesh",
        "TOTALBOLTS" => "Bolts",
        "TOTGSMTR" => "Ground Support Metres",
        "TOTOTHERMTRS" => "Jumbo Metres",
        "TONNE" => "Tonnes",
        "PRODMTRSDRILL" => "Production Metres"
    );

    private static $productionActivity = 'Production';
    private static $productionMetricTonne = 'TONNE';
    private static $productionMetricMetre = 'PROD';


    public $configTUM;
    public $configSites;
    public $uniqueTUMCategories;

    function __construct()
    {
        Config::$instance = $this;
        $this->configSites = Config::GetConfigSites();
        $this->configTUM = Config::GetConfigTUM();
        $this->uniqueTUMCategories = Config::GetUniqueTUMCategories();
    }

    public static function Sites($_key)
    {
        return isset(Config::$instance->configSites[$_key]) ? Config::$instance->configSites[$_key] : NULL;
    }

    public static function TUM($_key)
    {
        return isset(Config::$instance->configTUM[$_key]) ? Config::$instance->configTUM[$_key] : NULL;
    }

    /**
     * Creates an associative array with the unique TUM categories as the
     * keys with zeroed out values
     */
    public static function CreateDistinctTUMArray()
    {
        $result = array_unique(Config::$instance->configTUM);
        $tumDistinct = array();
        foreach ($result as $x => $x_value) {
            $tumDistinct[$x_value] = 0;
        }
        return ($tumDistinct);
    }


    public static function productionActivity()
    {
        return Config::$productionActivity;
    }
    public static function productionMetricTonne()
    {
        return Config::$productionMetricTonne;
    }
    public static function productionMetricMetre()
    {
        return Config::$productionMetricMetre;
    }

    public static function MetricMap(string $_metric)
    {
        return isset(Config::$metricMap[$_metric]) ? Config::$metricMap[$_metric] : NULL;
    }




    // -------------------------------------------------------------------------

    private static function GetConfigSites()
    {
        return Config::LoadCSVIntoAssociativeArray(Config::$filePrefix . Config::$fileSites);
    }

    private static function GetConfigTUM()
    {
        return Config::LoadCSVIntoAssociativeArray(Config::$filePrefix . Config::$fileTUM);
    }

    private static function LoadCSVIntoAssociativeArray($_path)
    {
        $_path = Utils::GetBackEndRoot() . Config::$localDir . $_path . ".csv";
        //$_path = "D:\wamp64\www\dev\php\siteconfig\Config_Sites.csv";


        if (file_exists($_path)) {
            $newArray = array();
            $file = fopen($_path, "r");

            // Skip first
            $line = fgetcsv($file);

            while (!feof($file)) {
                $line = fgetcsv($file);
                if ($line != NULL)
                    $newArray[$line[0]] = $line[1];
                //Debug::Log($line);
            }
            fclose($file);
            return $newArray;
        } else {

            Debug::Log(Utils::GetBackEndRoot());
            //Debug::Log("Failed to open file - " . $_path);
            echo "<br/>";
            return null;
        }
    }

    private static function GetUniqueTUMCategories()
    {
    }
    // -------------------------------------------------------------------------
}
