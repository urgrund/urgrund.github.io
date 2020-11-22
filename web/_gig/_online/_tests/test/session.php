<?php session_start(); ?>
<!DOCTYPE html>
<html>

<body>
    <style>
        /* Center the loader */
        #loader {
            /* position: inherit;
            left: 50%;
            top: 50%; */

            z-index: 1;

            /* width: 100px;*/
            height: 100px;
            margin: auto;
            margin-top: 25%;
            border: 16px solid #f3f3f3;
            border-radius: 50%;
            border-top: 16px solid #3498db;
            width: 120px;
            height: 120px;
            -webkit-animation: spin 2s linear infinite;
            animation: spin 2s linear infinite;
        }

        @-webkit-keyframes spin {
            0% {
                -webkit-transform: rotate(0deg);
            }

            100% {
                -webkit-transform: rotate(360deg);
            }
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }

        /* Add animation to "page content" */
        .animate-bottom {
            position: relative;
            -webkit-animation-name: animatebottom;
            -webkit-animation-duration: 0.5s;
            animation-name: animatebottom;
            animation-duration: 0.5s
        }

        @-webkit-keyframes animatebottom {
            from {
                bottom: -100px;
                opacity: 0
            }

            to {
                bottom: 0px;
                opacity: 1
            }
        }

        @keyframes animatebottom {
            from {
                bottom: -100px;
                opacity: 0
            }

            to {
                bottom: 0;
                opacity: 1
            }
        }

        #myDiv {
            display: none;
            text-align: center;
        }


        body {
            margin: auto;
            text-align: center;
            color: rgb(161, 170, 192);
            font-family: Arial, Helvetica, sans-serif;
            background: rgb(41, 41, 41);
        }

        .rcorners1 {
            border-radius: 5px;
            /* background: #535353dc; */
            border: 1px solid rgb(131, 168, 192);
            padding: 0px;
            width: 500px;
            height: 400px;
            margin: auto;
            margin-bottom: 3px;
            /* box-shadow: 0px 15px 15px rgba(0, 0, 0, 0.3); */
        }
    </style>

    <button onclick="GetData()">Create</button>
    <button onclick="CheckSession()">Check Session Data</button>



    <div class="rcorners1" id="chart">
    </div>





    <script src=" https://code.jquery.com/jquery-3.3.1.min.js"> </script>
    <script src="../web/vendors/jquery/dist/jquery.min.js"> </script>

    <script>
        console.log("Web page starting...");

        function GetData() {
            $.ajax({
                url: "../dev/php/get_site_data.php",
                type: "POST",
                data: {
                    date: '20181010'
                },
                dataType: 'json',
                success: function(data) {
                    console.log(data);
                }
            });
        }

        function CheckSession() {
            console.log("Clock");
            $.ajax({
                url: "session_get.php",
                type: "POST",
                dataType: 'json',
                success: function(data) {
                    console.log(data);
                }
            });
        }
    </script>



</body>

</html>