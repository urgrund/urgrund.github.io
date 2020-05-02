<?php

//include_once('..\header.php');
//Debug::Log(Config::GetConfigSites());

/**
 * Simple class to retrive and store site
 * configuration files 
 **/
class Config
{

    public static $instance = null;

    private static $localDir = "siteconfig\\";
    private static $filePrefix = 'Config_';

    private static $fileTUM = 'TUM';
    private static $fileSites = 'Sites';

    public $resultTUM;
    public $resultSites;


    function __construct()
    {
        Config::$instance = $this;
        $this->resultSites = Config::GetConfigSites();
        $this->resultTUM = Config::GetConfigTUM();

        //Debug::Log($this->resultSites);
    }

    public static function Sites($_key)
    {
        return Config::$instance->resultSites[$_key];
    }

    public static function TUM($_key)
    {
        return Config::$instance->resultTUM[$_key];
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
            Debug::Log("Failed to open file - " . getcwd() . "\\" . $_path);
            return null;
        }
    }
}
