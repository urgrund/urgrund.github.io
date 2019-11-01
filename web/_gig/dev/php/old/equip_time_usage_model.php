<?php
include_once('header.php');

// ------------------------------------------------
// From web request
$assetID = "'LH020'";
if (isset($_POST["assetID"])) {
    $assetID = "'" . $_POST["assetID"] . "'";
}

$sqlPath = '../assets/sql/SP_EQUIP_TimeUsageModel.sql';
$sqlTxt = SQLUtils::FileToQuery($sqlPath);
$sqlTxt = str_replace("'LH020'", $assetID, $sqlTxt);
// ------------------------------------------------


// Execute the SQL and echo the results
$result = json_decode(SQLUtils::QueryToJSON($sqlTxt));
//print_r($result);

Debug::StartProfile("PHP Work");

// Arrays for the data
$availability = [];
$utilisation = [];
$UOfA = [];
$totalTime = [];


for ($i = 0; $i < count($result[0]); $i++) {
    $totalTime[$i] = 0;
    $availability[$i] = 0;
    $utilisation[$i] = 0;
    $UOfA[$i] = 0;
}


$totalTime[0] = "Total Time";
$availability[0] = "Availabilty";
$utilisation[0] = "Utilisation";
$UOfA[0] = "U of A";

// row flags
$hasDown = -1;
$hasIdle = -1;
$hasOperating = -1;

$decs = 4;

// Check which rows actually came in
// with this equipment result
for ($i = 0; $i < count($result); ++$i) {
    if ($i > 0) {
        $temp = $result[$i][count($result[$i]) - 1];
        if ($temp == "DOWN") $hasDown = $i;
        if ($temp == "IDLE") $hasIdle = $i;
        if ($temp == "OPERATING") $hasOperating = $i;
    }
}

// Pad out the array if certain rows don't 
// exist to help the client side 

// BUT - this might be adding to the wrong row??
if ($hasDown < 0)
    array_push($result, array_fill(0, count($result[0]), 0));




//echo ($hasDown . "\n");
//echo ($hasOperating . "\n");

// Get total time 
for ($i = 0; $i < count($result); ++$i) {
    for ($j = 0; $j < count($result[$i]); $j++) {
        if ($j > 1 && $i > 0) {
            $totalTime[$j] += round((float)$result[$i][$j], $decs);
        }
    }
}

// Now get all the rest...
for ($i = 0; $i < count($result); $i++) {
    for ($j = 0; $j < count($result[$i]); $j++) {
        if ($j > 1 && $j < (count($result[$i]) - 1) && $i > 0) {

            $dt = (float)($hasDown != -1 ? $result[$hasDown][$j] : 0);
            $ot = (float)($hasOperating != -1 ? $result[$hasOperating][$j] : 0);

            $availability[$j] = round(1 - ($dt / $totalTime[$j]), $decs);
            $utilisation[$j] = round($ot / $totalTime[$j], $decs);
            $UOfA[$j] = round(($totalTime[$j] - $dt <= 0) ? 0 : $ot / ($totalTime[$j] - $dt), $decs);
        }
    }
}


// Get the totals of everything 
// for the pie chart
$timeUsageSplit = [];

$allTime = array_sum($totalTime);
$allAvail = array_sum($availability) * ($allTime / 12);
$allUofA = array_sum($UOfA) / count($UOfA);

$timeUsageSplit[] = ($allAvail * $allUofA); // / $allTime; 
$timeUsageSplit[] = ($allAvail * (1 - $allUofA)); // / $allTime;
$timeUsageSplit[] = ($allTime - $allAvail); // / $allTime;

// echo (" Operating: " . $timeUsageSplit[0] . "   ");
// echo (" NonUtil: " . $timeUsageSplit[1] . "   ");
// echo (" Downtime: " . $timeUsageSplit[2] . "   ");



// Fill up the output array
$result[] = $availability;
$result[] = $utilisation;
$result[] = $UOfA;
$result[] = $totalTime;
$result[] =  $timeUsageSplit;

Debug::EndProfile();

print_r($result);
//echo json_encode($result);



//HTMLTable::Create($result);
