<?php
include_once('header.php');
include_once('get_site_data.php');

if (isset($_POST['date'])) {
    // include_once('setDebugOff.php');
}



class LongTermTumEvents
{
    var $tumCategories = array();
}

class LongTerm
{
    public static function Do()
    {
        // TODO - Memory limit reached with about 30days
        // could trim each entry?   
        // could build a 'longterm object' to return?
        $period = new DatePeriod(
            new DateTime('2018-10-01'),
            new DateInterval('P1D'),
            new DateTime('2018-10-16')
        );

        $data = [];

        $tempTUM = []; //new LongTermTumEvents();

        Debug::StartProfile("Generate TUM Times");
        foreach ($period as $key => $value) {

            $date = $value->format('Ymd');
            $fileData = json_decode(GetSiteData::CheckGeneratedDataExists($date));


            $equipment = $fileData[3];


            foreach ($equipment as $key => $value) {
                //Debug::Log($value);

                $events = $value->events;
                for ($i = 0; $i < count($events); $i++) {
                    $tumCat = $events[$i]->tumCategory;

                    // 
                    if (isset($tempTUM[$tumCat][$events[$i]->status])) {
                        Debug::Log($events[$i]);
                        $tempTUM[$tumCat][$events[$i]->status] += $events[$i]->duration;
                    } else {
                        $tempTUM[$tumCat][$events[$i]->status] = $events[$i]->duration;
                    }
                    //Debug::Log($events[$i]->tumCategory);
                }
            }
        }
        Debug::Log($tempTUM);


        Debug::EndProfile();



        //echo (GetSiteData::CheckGeneratedDataExists('20181010'));

        //Debug::Log(__DIR__);
    }
}


LongTerm::Do();
