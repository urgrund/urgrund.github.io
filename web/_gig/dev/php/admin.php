<!DOCTYPE HTML>
<html>

<head>

</head>

<body>

    <?php
    include_once('get_site_data.php');

    global $allSites;

    //$dates = ['20181010', '20181009', '20181008', '20181007', '20181006', '20181005', '20181004'];
    //$dates = ['20151007'];

    $period = new DatePeriod(
        new DateTime('2018-10-01'),
        new DateInterval('P1D'),
        new DateTime('2018-12-31')
    );

    //for ($i = 0; $i < count($dates); $i++) {
    foreach ($period as $key => $value) {

        Debug::Log($value->format('Ymd'));

        $date = $value->format('Ymd'); // $dates[$i];

        // echo "Creating for ";
        // echo $date;
        // echo "..... </br>";

        $data = GetSiteData::CheckGeneratedDataExists($date);




        if ($data != null) {
            echo ($date);
            echo " complete. (already generated) </br>";
        } else {
            CreateSiteData::SetDateForCreation($date);
            CreateSiteData::Run();
            $resultAsJSON = json_encode($allSites);
            GetSiteData::WriteGeneratedDataToDisk($date, $resultAsJSON);
            echo ($date);
            echo " complete. </br>";
        }

        //sleep(1);
    }

    ?>

</body>

</html>