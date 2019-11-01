<?php
include_once('header.php');


// ------------------------------------------------
// From web request
$assetID = "'LH020'"; // <- set here as temp
if (isset($_POST["assetID"])) {
    $assetID = "'" . $_POST["assetID"] . "'";
}
// ------------------------------------------------


Debug::StartProfile("TPH");


// ------------------------------------------------

// Prepare the equip statement
$sqlPath = '../assets/sql/SP_EQUIP_TonnesPerHour.sql';
$sqlTxt = SQLUtils::FileToQuery($sqlPath);
$sqlTxt = str_replace("'HT099'", $assetID, $sqlTxt);
$result = SQLUtils::QueryToText($sqlTxt);



// Trim 
for ($i = 0; $i < count($result); $i++) {
    for ($j = 0; $j < 3; $j++) {
        unset($result[$i][$j]);
    }
}

$result[0] = array_values($result[0]);
$result[1] = array_values($result[1]);

// Cumulative
$cumulative = [];
$cumulativeTemp = 0;
for ($i = 0; $i < count($result[0]); $i++) {
    $cumulativeTemp += $result[1][$i];
    $cumulative[] = $cumulativeTemp;
}

$result[] = $cumulative;

Debug::EndProfile();

//print_r($result);
echo json_encode($result);
