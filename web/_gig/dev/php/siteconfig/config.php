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
    private static $instance;
    public static function Instance(): Config
    {
        if (Config::$instance == null)
            return new Config();
        return Config::$instance;
    }

    // Var representation of the major group
    const MajorGroupDown = "Down";
    const MajorGroupIdle = "Idle";
    const MajorGroupOperating = "Operating";

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



    public array $Sites;

    // For TUM related 
    public array $TUM;
    public array $TUMIndex;
    public array $TUMKeys;
    public array $MajorGroup;

    public ClientFrontEndData $ClientData;


    private static $uniqueTUMCategories = [];


    function __construct()
    {
        //if (Config::$instance !== null)
        //  return;

        Debug::StartProfile("Create Config");

        Config::$instance = $this;
        $this->CreateSites();
        $this->CreateTUM();
        Config::CreateUniqueTUMArray();

        $this->ClientData = Client::GetFrontEndData();

        Debug::EndProfile();

        //Debug::Log($this->TUM);
    }

    public static function Sites($_key)
    {
        return isset(Config::Instance()->Sites[$_key]) ? Config::Instance()->Sites[$_key] : NULL;
    }

    public static function TUM($_key)
    {
        return isset(Config::Instance()->TUM[$_key]) ? Config::Instance()->TUM[$_key] : NULL;
    }

    public static function MajorGroup($_key)
    {
        return isset(Config::Instance()->MajorGroup[$_key]) ? Config::Instance()->MajorGroup[$_key] : NULL;
    }

    public static function TUMIndex($_key): int
    {
        return isset(Config::Instance()->TUMKeys[$_key]) ? Config::Instance()->TUMKeys[$_key] : -1;
    }


    /**
     * Creates an associative array with the unique TUM categories as the
     * keys with zeroed out values
     */
    public static function CreateDistinctTUMArray(): array
    {
        $result = array_unique(Config::Instance()->TUM);
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
        $result = array_unique(Config::$instance->TUM);
        Config::$uniqueTUMCategories = array();
        foreach ($result as $x => $x_value) {
            Config::$uniqueTUMCategories[] = $x_value;
        }
        // Debug::Log($this->uniqueTUMCategories);
    }


    private function CreateSites()
    {
        //return Config::LoadCSVIntoAssociativeArray(Config::$filePrefix . Config::$fileSites);
        $_file = Config::$filePrefix . Config::$fileSites;
        $_file = Utils::GetBackEndRoot() . Client::ConfigPath() . $_file . ".csv";

        if (file_exists($_file)) {
            $newArray = array();
            $file = fopen($_file, "r");

            // Skip first
            $line = fgetcsv($file);

            while (!feof($file)) {
                $line = fgetcsv($file);
                if ($line != NULL)
                    $newArray[$line[0]] = $line[1];
            }
            fclose($file);
            $this->Sites = $newArray;
        } else {
            //Debug::Log(Utils::GetBackEndRoot());
            $this->Sites = null;
        }
    }


    private function CreateTUM()
    {
        //return Config::LoadCSVIntoAssociativeArray(Config::$filePrefix . Config::$fileTUM);


        $_file = Config::$filePrefix . Config::$fileTUM;
        $_file = Utils::GetBackEndRoot() . Client::ConfigPath() . $_file . ".csv";

        if (file_exists($_file)) {
            $this->TUM = [];
            $this->TUMIndex = [];
            $this->MajorGroup = [];

            $newArray = array();
            $file = fopen($_file, "r");

            // Skip first
            $line = fgetcsv($file);

            while (!feof($file)) {
                $line = fgetcsv($file);
                if ($line != NULL) {
                    $newArray[$line[0]] = $line[1];
                    $this->TUM[$line[0]] = $line[1];
                    $this->MajorGroup[$line[1]] = $line[2];
                    $this->TUMIndex[$line[3]] = $line[1];
                    $this->TUMKeys[$line[1]] = $line[3];
                }
            }
            fclose($file);

            //sort($this->TUMIndex);
            //return $newArray;
        } else {
            Debug::Log(Utils::GetBackEndRoot());
            //return null;
        }
    }

    private static function GetMajorGroup()
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
