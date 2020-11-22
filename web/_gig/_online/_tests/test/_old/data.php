<?php
$serverName = "localhost";
//$serverName = "58.182.32.57";
//$serverName = "127.0.0.1";
$userName = "test";
$password = "catacomb";
$dataBase = "mattTest";

$connection = mysqli_connect($serverName, $userName, $password, $dataBase)
    or die("Can't connect: " . mysqli_connect_error());


$query = "SELECT * FROM `table` WHERE 1";
$result = mysqli_query($connection, $query);

if (mysqli_num_rows($result) > 0) {

    $data = array();
    foreach ($result as $row) {
        $data[] = $row;
    }

    $result->close();

    //close connection
    $connection->close();

    //now print the data
    print json_encode($data);

} else {
    echo ("Empty");
}

?>
