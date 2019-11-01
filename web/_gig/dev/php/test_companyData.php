<?php



class Company
{
    var $id;            // ID in our own DB
    var $nameLong;      // long name... ie.  MicroSoft
    var $nameShort;     // short name... ie. MS
    var $serverRoot;    // directory root for all content realted to this client (..\server\MS\)


    function __construct()
    {
        // $this->details = new CompanyDetails();
    }
}


interface iPoo
{
    public function GetPoo();
}

class Poo implements iPoo
{
    function GetPoo()
    {
        echo ("lots of poo");
    }
}

// $poo = new Poo();
//$poo->GetPoo();
