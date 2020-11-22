<?php

// Temp for now


/**
 * Company Information 
 */
class CompanyInfo
{
    var $companyName = "";
}

$c = new CompanyInfo();
$c->companyName = "GiggsWorth";

echo json_encode($c);
