<html class="no-js" lang="en">


<?php include_once("php/session.php"); ?>


<body ng-app="myApp" ng-controller="myCtrl">

    <!-- Modal Forms -->
    <?php include_once("adjust_targets.html"); ?>
    <?php /*include_once("reportFirstCallUp.html")*/; ?>

    <!-- Header -->
    <div class="sicHeader">
        <?php include_once("header.html"); ?>
    </div>

    <!-- Content -->
    <div class="sicDash">
        <?php include_once("menu.html"); ?>
        <div>
            <div ng-view></div>
        </div>
    </div>

    <!-- JS includes -->
    <?php include_once("scripts.html"); ?>
</body>

</html>