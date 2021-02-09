<?php
include_once('utils.php');

// This defines the root directory
// of the client root as well as 
// assuming the base Client implementation

$clientRoot = "Newcrest";
//$clientRoot = "MineStar";






// Includes the client implementation 
include_once(Utils::GetBackEndRoot() .  "..\clients\\" . $clientRoot . "\\" . $clientRoot . ".php");

class ClientFrontEndData
{
    public string $name;
    public float $shiftStart;
}

abstract class Client
{
    // To implement per-client
    abstract public function Name(): string;
    abstract public function Path(): string;
    abstract public function SQLDBCredentials(): SQLDBCredentials;
    abstract public function TimeZone(): DateTimeZone;
    abstract public function ShiftStart(): float;




    // For general MineMage access 
    private static $client;
    private static $path = "..\\clients\\";
    private static $config = "\\Config\\";
    private static $cache = "\\Cache\\";

    private static $sql = "\\SQL\\";
    private static $coreSQL = "CoreQueries\\";
    private static $reportSQL = "ReportQueries\\";

    public static function instance(): Client
    {
        global $clientRoot;
        if (self::$client == null)
            self::$client = new $clientRoot();
        return self::$client;
    }

    private static function SQLPath(): string
    {
        return self::$path . Client::instance()->Path() . self::$sql;
    }


    // Public accessors

    public static function SQLCorePath(): string
    {
        return  Client::SQLPath() .  self::$coreSQL;
    }

    public static function SQLReportPath(): string
    {
        return  Client::SQLPath() .  self::$reportSQL;
    }

    public static function ConfigPath(): string
    {
        return self::$path . Client::instance()->Path() . self::$config;
    }

    public static function CachePath(): string
    {
        return self::$path . Client::instance()->Path() . self::$cache;
    }


    /** Get a safe chunk of data about the client
     * to send to the front end */
    public static function GetFrontEndData(): ClientFrontEndData
    {
        $data = new ClientFrontEndData();
        $data->name = Client::instance()->Name();
        $data->shiftStart = Client::instance()->ShiftStart();
        return $data;
    }
}
