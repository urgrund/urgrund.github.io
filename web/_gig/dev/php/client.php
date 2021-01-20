<?php
include_once('sql.php');

// This defines the root directory
// of the client root as well as 
// assuming the base Client implementation

//$clientRoot = "Newcrest";
$clientRoot = "MineStar";
//$clientRoot = "OzMinerals";



// Includes the client implementation 
include_once("..\clients\\" . $clientRoot . "\\" . $clientRoot . ".php");

abstract class Client
{

    // To implement
    abstract public function Name(): string;
    abstract public function Path(): string;
    abstract public function SQLDBCredentials(): SQLDBCredentials;
    abstract public function TimeZone(): DateTimeZone;
    abstract public function ShiftStart(): int;




    // For general MineMage access 
    private static $client;
    private static $path = "..\\clients\\";
    private static $config = "\\Config\\";
    private static $sql = "\\SQL\\";
    private static $cache = "\\Cache\\";

    public static function instance(): Client
    {
        global $clientRoot;
        if (self::$client == null)
            self::$client = new  $clientRoot();
        return self::$client;
    }

    public static function SQLPath(): string
    {
        return self::$path . Client::instance()->Path() . self::$sql;
    }

    public static function ConfigPath(): string
    {
        return self::$path . Client::instance()->Path() . self::$config;
    }

    public static function CachePath(): string
    {
        return self::$path . Client::instance()->Path() . self::$cache;
    }
}
