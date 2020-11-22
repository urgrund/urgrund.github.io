<?php
/*    Using "mysqli" instead of "mysql" that is obsolete.
 * Change the value of parameter 3 if you have set a password on the root userid
 * Add port number 3307 in parameter number 5 to use MariaDB instead of MySQL
 */
//$mysqli = new mysqli('127.0.0.1', 'root', '', '');

$mysqli = new mysqli('58.182.32.57', 'test', 'catacomb', 'ug_trial');

if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') '
        . $mysqli->connect_error);
}
echo '<p>Connection OK ' . $mysqli->host_info . '   Server ' . $mysqli->server_info . '</p>';


?>


<style>
    #customers {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
    }

    #customers td,
    #customers th {
        border: 1px solid #ddd;
        padding: 8px;
    }

    #customers tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    #customers tr:hover {
        background-color: #ddd;
    }

    #customers th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #4CAF50;
        color: white;
    }
</style>



<html>

<body>

    <form action="testsql.php" method="get">
        <h3>Query:<br>
            <textarea name="qform" rows="10" cols="100"><?php echo CheckGet(); ?></textarea>
            </br>
            <input type="submit">
        </h3>
    </form>

</body>

</html>




<?php

function CheckGet()
{
    if (isset($_GET["qform"])) {
        return $_GET["qform"];
    } else {
        return "SELECT * FROM `rd_equipment`";
    }
}

function RunQuery()
{

    if (isset($_GET["qform"])) echo $_GET["qform"] . "<br>"; //"a is set\n";


    //$query = "SELECT * FROM `rd_equipment`";
    $query = CheckGet(); //$_GET["qform"];

    $result = $GLOBALS['mysqli']->query($query);
    table($result);
    // if ($result->num_rows > 0) {
    //     while ($row = $result->fetch_assoc()) {
    //     //print json_encode($row);
    //         echo implode(" ", $row) . "<br>";
    //     }
    // }
}
RunQuery();



function table($result)
{
    $result->fetch_array(MYSQLI_ASSOC);
    echo '<table id="customers">';
    tableHead($result);
    tableBody($result);
    echo '</table>';
}

function tableHead($result)
{
    echo '<thead>';
    foreach ($result as $x) {
        echo '<tr>';
        foreach ($x as $k => $y) {
            echo '<th>' . ucfirst($k) . '</th>';
        }
        echo '</tr>';
        break;
    }
    echo '</thead>';
}

function tableBody($result)
{
    echo '<tbody>';
    foreach ($result as $x) {
        echo '<tr>';
        foreach ($x as $y) {
            echo '<td>' . $y . '</td>';
        }
        echo '</tr>';
    }
    echo '</tbody>';
}

$mysqli->close();
?>