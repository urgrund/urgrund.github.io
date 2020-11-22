<?php
session_start();
echo (json_encode($_SESSION['test']));


// if (isset($_SESSION['test']) && $_SESSION['test'] == 1) {
//     //session is set
//     //header('Location: /index.php');
//     echo (json_decode("asdasd"));
// } else if (!isset($_SESSION['test']) || (isset($_SESION['test']) && $_SESSION['test'] == 0)) {
//     //session is not set
//     //header('Location: /login.php');
//     echo (json_decode("No"));
// }

// echo (json_decode("No"));
