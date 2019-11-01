
<?php

include_once('header.php');

// ------------------------------------------------
// From web request
$assetID = "'LH020'";
if (isset($_POST["assetID"])) {
    $assetID = "'" . $_POST["assetID"] . "'";
}

$sqlPath = '../assets/sql/SP_EQUIP_FullEventsandMajorGroups.sql';
$sqlTxt = SQLUtils::FileToQuery($sqlPath);
$sqlTxt = str_replace("'BL085'", $assetID, $sqlTxt);
// ------------------------------------------------


$eventDurationIndex = 2;
$eventNameIndex = 3;
$eventMajorGroupIndex = 4;

$allEvents = SQLUtils::QueryToText($sqlTxt);
print_r($allEvents);
return;

$uniqueEvents = array_unique(array_column($allEvents, $eventNameIndex));
$uniqueEvents = array_values($uniqueEvents);

// Get the available major groups
$majorGroups = array_unique(array_column($allEvents, $eventMajorGroupIndex));
unset($majorGroups[0]);
$majorGroups = array_values($majorGroups);


// Nightshift start date and time 
// used to filter out the events
$nightShift = new DateTime($allEvents[1][1]->format('m/d/Y'));
$nightShift->setTime(18, 00);


// Get the unique count and duration for each 
// type of event from this equipment
$eventUniqueData = [];
for ($i = 1; $i < count($uniqueEvents); $i++) {

    $tempEventDuration = 0;
    $tempEventCount = 0;
    $tempEventMajorGroup = "";


    // !!!!!!!!!!!!!!!
    // BROKEN 
    // !!!!!!!!!!!!!!!


    $tempEventDate = $uniqueEvents[$i][1];

    // if ($tempEventDate->format('H') < $nightShift->format('H')) {
    //     echo "Day Shift : " . $tempEventDate->format('H') . "\n";
    // } else {
    //     echo "Night Shift : " . $tempEventDate->format('H') . "\n";
    // }

    for ($x = 1; $x < count($allEvents); $x++) {
        if ($uniqueEvents[$i] == $allEvents[$x][$eventNameIndex]) {
            $tempEventMajorGroup = $allEvents[$x][$eventMajorGroupIndex];
            $tempEventDuration += $allEvents[$x][$eventDurationIndex];
            $tempEventCount++;
        }
    }
    $eventUniqueData[] = array(
        'Event' => $uniqueEvents[$i],
        'Count' => $tempEventCount,
        'Duration' => $tempEventDuration,
        'Major Group' => $tempEventMajorGroup
    );
}
//return;

//print_r($eventUniqueData);

// print_r(array_keys($eventUniqueData[0])[3]);

// Split out into available Major Groups
// for the different pareto charts
$finalData = [];
for ($i = 0; $i < count($majorGroups); $i++) {
    $tempArray = array();
    for ($x = 0; $x < count($eventUniqueData); $x++) {
        // Do not like having to reference keys with a string!! :\
        if ($eventUniqueData[$x]['Major Group'] == $majorGroups[$i]) {
            $tempArray[] = $eventUniqueData[$x];
        }
    }
    $finalData[$majorGroups[$i]] = $tempArray;
}


$finalData['All Events'] = $allEvents;

//echo json_encode($finalData);
print_r($finalData);
