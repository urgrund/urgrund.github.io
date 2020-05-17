<?php

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

        //Debug::Log($this->configSites);
    }

    public static function Sites($_key)
    {
        return Config::$instance->configSites[$_key];
    }

    public static function TUM($_key)
    {
        return Config::$instance->configTUM[$_key];
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
        $_path = Config::$localDir . $_path . ".csv";

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
            // try {
            //     Debug::Log("Failed to open file - " . getcwd() . "\\" . $_path);
            // } catch (Exception $e) {
            //     echo "Hello";
            // }
            return null;
        }
    }
}
