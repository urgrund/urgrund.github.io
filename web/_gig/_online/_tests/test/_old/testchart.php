<?php


//Open our CSV file using the fopen function.
$fh = fopen("data.csv", "r");
 
//Setup a PHP array to hold our CSV rows.
$csvData = array();
 
//Loop through the rows in our CSV file and add them to
//the PHP array that we created above.
while (($row = fgetcsv($fh, 0, ",")) !== false) {
    $csvData[] = $row;
}
 
//Finally, encode our array into a JSON string format so that we can print it out.
echo json_encode($csvData);

// $file = "data.csv";
// $csv = file_get_contents($file);
// $array = array_map("str_getcsv", explode("\n", $csv));
// $json = json_encode($array);
// //print_r($json);
// print json_encode($json);

?>