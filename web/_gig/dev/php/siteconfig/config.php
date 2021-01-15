<?php

// For local debug
//include_once('..\header.php');
//$c = new Config();

//Debug::Log(Config::CreateDistinctTUMArray());
//Debug::Log(Config::UniqueTUMCategories());



/**
 * An interface to the CSV files that are used 
 * to map site and equipment specific values to front-end
 * @author Matthew Bell 2020
 */
class Config
{
    public static $instance = null;

    //private static $localDir = "siteconfig\\";
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
    public $configMajorGroup;

    private static $uniqueTUMCategories = [];


    function __construct()
    {
        if (Config::$instance !== null)
            return;

        Debug::StartProfile("Create Config");

        Config::$instance = $this;
        $this->configSites = Config::GetConfigSites();
        $this->configTUM = Config::GetConfigTUM();
        $this->configMajorGroup = Config::GetConfigMajorGroup();
        Config::CreateUniqueTUMArray();

        Debug::EndProfile();

        //Debug::Log($this->configTUM);
    }

    public static function Sites($_key)
    {
        return isset(Config::$instance->configSites[$_key]) ? Config::$instance->configSites[$_key] : NULL;
    }

    public static function TUM($_key)
    {
        return isset(Config::$instance->configTUM[$_key]) ? Config::$instance->configTUM[$_key] : NULL;
    }

    public static function MajorGroup($_key)
    {
        return isset(Config::$instance->configMajorGroup[$_key]) ? strtoupper(Config::$instance->configMajorGroup[$_key]) : NULL;
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

    public static function UniqueTUMCategories(): array
    {
        return Config::$uniqueTUMCategories;
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

    private static function CreateUniqueTUMArray()
    {
        $result = array_unique(Config::$instance->configTUM);
        Config::$uniqueTUMCategories = array();
        foreach ($result as $x => $x_value) {
            Config::$uniqueTUMCategories[] = $x_value;
        }
        // Debug::Log($this->uniqueTUMCategories);
    }


    private static function GetConfigSites()
    {
        return Config::LoadCSVIntoAssociativeArray(Config::$filePrefix . Config::$fileSites);
    }

    private static function GetConfigTUM()
    {
        return Config::LoadCSVIntoAssociativeArray(Config::$filePrefix . Config::$fileTUM);
    }

    private static function GetConfigMajorGroup()
    {
        return Config::LoadCSVIntoAssociativeArray(Config::$filePrefix . Config::$fileTUM, 1, 2);
    }


    private static function LoadCSVIntoAssociativeArray($_file, $x = 0, $y = 1)
    {
        $_file = Utils::GetBackEndRoot() . Client::ConfigPath() . $_file . ".csv";

        if (file_exists($_file)) {
            $newArray = array();
            $file = fopen($_file, "r");

            // Skip first
            $line = fgetcsv($file);

            while (!feof($file)) {
                $line = fgetcsv($file);
                if ($line != NULL)
                    $newArray[$line[$x]] = $line[$y];
            }
            fclose($file);
            return $newArray;
        } else {
            Debug::Log(Utils::GetBackEndRoot());
            return null;
        }
    }

    // -------------------------------------------------------------------------
}
