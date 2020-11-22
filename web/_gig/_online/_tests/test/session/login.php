<?php
if (isset($_SESSION))
    session_destroy();

session_start(); // Starting Session

include_once("../../dev/php/setDebugOff.php");
include_once("../../dev/php/sql.php");

$error = ''; // Variable To Store Error Message
if (isset($_POST['submit'])) {
    $error = "Username or Password is invalid";

    if (empty($_POST['username']) || empty($_POST['password'])) {
        // Bad user or pw
    } else {
        // Define $username and $password
        $username = $_POST['username'];
        $password = $_POST['password'];

        // To protect SQL injection
        $username = stripslashes($username);
        $password = stripslashes($password);
        $username = str_replace("'", "''", $username);
        $password = str_replace("'", "''", $password);


        // Get users from the database
        $sql = "SELECT * FROM [dbo].[TestLogin] WHERE [user] = '$username' AND [pw] = '$password'";
        $result = SQLUtils::QueryToText($sql);
        Debug::Log($username);
        Debug::Log($password);

        if (empty($result)) {
            Debug::Log("Log-in attempt returned nothing");
        } else {

            // Only on correct log-in
            if ($result[1] === null) {
                Debug::Log("Nothing on server");
                SQLUtils::CloseConnection();
            } else {
                // Results match what was asked for 
                if ($result[1][0] == $username && $result[1][1] == $password) {
                    Debug::Log($result);
                    $_SESSION['login_user'] = $username;

                    SQLUtils::CloseConnection();

                    // Move onto next page
                    header("location: profile.php");
                }
            }
        }

        SQLUtils::CloseConnection();
    }
}
