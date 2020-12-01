<?php

// Temp for now


/**
 * Company Information 
 */
class CompanyInfo
{
    var $companyName = "";

    // Customer wide data like the monthly report
    // can be stored here and on our customer DB

}

$c = new CompanyInfo();
$c->companyName = "GiggsWorth";

echo json_encode($c);
