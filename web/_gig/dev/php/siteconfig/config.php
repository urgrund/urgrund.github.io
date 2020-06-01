<?php

// include_once('..\header.php');
// new Config();
// Debug::Log(Config::$instance->configSites);

class Config
{
    public static $instance = null;

    private static $localDir = "siteconfig\\";
    private static $filePrefix = 'Config_';

    private static $fileTUM = 'TUM';
    private static $fileSites = 'Sites';

    public $configTUM;
    public $configSites;

    function __construct()
    {
        Config::$instance = $this;
        $this->configSites = Config::GetConfigSites();
        $this->configTUM = Config::GetConfigTUM();
    }

    public static function Sites($_key)
    {
        return isset(Config::$instance->configSites[$_key]) ? Config::$instance->configSites[$_key] : NULL;
        //return Config::$instance->configSites[$_key];
    }

    public static function TUM($_key)
    {
        return isset(Config::$instance->configTUM[$_key]) ? Config::$instance->configTUM[$_key] : NULL;

        //if (!isset(Config::$instance->configTUM[$_key]))
        //  var_dump(debug_backtrace());
        //return Config::$instance->configTUM[$_key];
    }




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
                $newArray[$line[0]] = $line[1];
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
}
