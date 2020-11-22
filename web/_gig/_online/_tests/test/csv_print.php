<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" type="text/css" href="csv.css">
</head>

<body>
    <?php

    include_once('../dev/php/header.php');
    include_once('../dev/php/setDebugOff.php');


    // Will need some good security here to make 
    // sure the file can't be opened by unathorised client
    $row = 1;
    if (($handle = fopen("report.csv", "r")) !== FALSE) {
        HTMLTable::CreateFromCSV($handle);
        fclose($handle);
    }
    ?>
</body>

</html>