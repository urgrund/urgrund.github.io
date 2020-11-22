<?php

// From an SQL file,  filter out a CSV
// write it to the server disk and return
// the filename and size ready for download

include_once('../dev/php/header.php');
include_once('../dev/php/setDebugOff.php');


$dF = '20181009';
$dT = '20181010';

// Get the To and From dates from the submitted html
if (!empty($_POST['dateFrom']) && !empty($_POST['dateTo'])) {
    $dF = $_POST['dateFrom'];
    $dT = $_POST['dateTo'];

    $dF = str_replace('-', '', $dF);
    $dT = str_replace("-", "", $dT);

    //$return = $dT . $dF;
    //echo json_encode($return);
    //return;
}


// The SQL 
$sqlPath = "../dev/assets/sql/CSV_Puller.sql";
$sqlTxt = SQLUtils::FileToQuery($sqlPath);
$sqlTxt = str_replace("FromDate", $dF, $sqlTxt);
$sqlTxt = str_replace("ToDate", $dT, $sqlTxt);
$result = SQLUtils::QueryToText($sqlTxt);


// output headers so that the file is downloaded rather than displayed
//header('Content-Type: text/csv; charset=utf-8');
//header('Content-Disposition: attachment; filename=csvfile.csv');

// Create file on the server
$filename = "report.csv";
$file = fopen($filename, "w");

// Start building the CSV
for ($i = 0; $i < count($result); $i++) {
    $row = array();
    for ($j = 0; $j < count($result[$i]); $j++) {

        // If it's a DT object, only interested in the time
        if (is_a($result[$i][$j], 'DateTime')) {
            array_push($row, $result[$i][$j]->format('Y-m-d H:i:s'));
        } else
            array_push($row, $result[$i][$j]);
    }
    fputcsv($file, $row);
}
fclose($file);

// Depending on size, change the format
$size = round(filesize($filename) / 1024);
if ($size > 1024)
    $size = (string) round($size / 1024, 2) . "mb";
else
    $size  = (string) $size . "k";

$returnData = [];
$returnData[] = $filename;
$returnData[] = $size;

//print_r($result);
echo json_encode($returnData);
