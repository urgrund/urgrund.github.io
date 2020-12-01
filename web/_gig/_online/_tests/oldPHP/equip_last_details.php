<?php
include_once('header.php');


// ------------------------------------------------
// From web request
$assetID = "'LH020'"; // <- set here as temp
if (isset($_POST["assetID"])) {
    $assetID = "'" . $_POST["assetID"] . "'";
}
// ------------------------------------------------




// ------------------------------------------------
// Prepare the operator statement
$sqlOpPath = '../assets/sql/SP_EQUIP_LastDetails.sql';
$sqlOpTxt = SQLUtils::FileToQuery($sqlOpPath);
$sqlOpTxt = str_replace("'TH004'", $assetID, $sqlOpTxt);
$resultOp = SQLUtils::QueryToText($sqlOpTxt);

//print_r($sqlOpTxt);

// Put all into 1 array with top row as keys
$operatorData = [];
for ($i = 0; $i < count($resultOp[0]); $i++) {
    //$operatorData[$resultOp[0][$i]] = $resultOp[1][$i];
    $operatorData[$i] = $resultOp[1][$i];
}
//print_r($operatorData);
//return;
// ------------------------------------------------


//print_r($result);
echo json_encode($operatorData);
