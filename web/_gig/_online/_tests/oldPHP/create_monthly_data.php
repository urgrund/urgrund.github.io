<?php
include_once('header.php');
include_once('setDebugOff.php');

static $planningTargets = [];


//CreatePlanningTargets();
CreateMonthlyData();

function CreateMonthlyData()
{
    Debug::StartProfile("Monthyl Data");
    $m_wf = "../assets/sql/planning/Monthly_Movements_WF.sql";
    // $m_slc = "../assets/sql/planning/Monthly_Movements_SLC.sql";


    $data_wf = SQLUtils::QueryToText(SQLUtils::FileToQuery($m_wf));
    //$data_slc = SQLUtils::QueryToText(SQLUtils::FileToQuery($m_slc));

    $monthlyData = [];
    $monthlyData[] = $data_wf;
    //$monthlyData[] = $data_slc;

    echo (json_encode($monthlyData));
}




function CreatePlanningTargets()
{
    Debug::StartProfile("Planning Targets");

    // Disable to avoid console spam
    Debug::Disable();

    global $planningTargets;

    $mineAreaFile = "../assets/sql/planning/PlanningTargets_01_MineArea.sql";
    $mineLevelFile = "../assets/sql/planning/PlanningTargets_02_MineLevel.sql";
    $mineDirectionFile = "../assets/sql/planning/PlanningTargets_03_MineDirection.sql";

    // Get all the available areas
    $sqlTxt = SQLUtils::FileToQuery($mineAreaFile);
    $mineAreas = SQLUtils::QueryToText($sqlTxt);
    unset($mineAreas[0]);

    // Prepare for levels & direction
    $sqlLevel = SQLUtils::FileToQuery($mineLevelFile);
    $sqlDirection = SQLUtils::FileToQuery($mineDirectionFile);



    for ($i = 1; $i < count($mineAreas); $i++) {
        // Get all levels for this mine area        
        $levelResult =  SQLUtils::QueryToText($sqlLevel);
        unset($levelResult[0]);

        // Add them to array 
        $mineAreaLevelsList = [];
        for ($j = 1; $j < count($levelResult); $j++) {
            $directionResult = SQLUtils::QueryToText($sqlDirection);
            //$planningTargets[$mineAreas[$i]] = $levelResult[$j];
            //Debug::Log($levelResult[$j][0]);
            $mineAreaLevelsList[$levelResult[$j][0]] = $directionResult[1];
        }
        //Debug::Log($mineAreas[$i]);
        $planningTargets[$mineAreas[$i][0]] = $mineAreaLevelsList;
    }
    Debug::Enable();

    //Debug::Log($planningTargets);

    Debug::EndProfile();
}

//echo json_encode($planningTargets);
/*
$eventUniqueData[] = array(
    'Event' => $uniqueEvents[$i],
    'Count' => $tempEventCount,
    'Duration' => $tempEventDuration,
    'Major Group' => $tempEventMajorGroup
);*/
