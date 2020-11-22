<?php
include 'QueryToJSON.php';


$sqltxt =
    "    
Select 
	Case When [Mine Start] = 'SLC' Then 'SLC'
		When [Mine start] = 'WF' Then 'Western Flanks'
        When left ([mine start],1) = 'M' Then 'M Reefs' 
		Else 'Unknown Mine name' end as 'Mine Names'
	--,sum([value]) as 'Total Tonnes' Uncomment this if we want the tonnes'
FROM [dbo].[View_OverView]
Where [dbo].[View_OverView].[Shift] Like '20181001%' and [Measure code]= 'TONNE' and [Primary Activity Type] = 'Loading' and [Secondy Activity Type] like '%Production%'
Group by 
Case When [Mine Start] = 'SLC' Then 'SLC'
		When [Mine start] = 'WF' Then 'Western Flanks'
        When left ([mine start],1) = 'M' Then 'M Reefs' 
		Else 'Unknown Mine name' end

Order By sum([Value]) Desc
    ";


// Execute the SQL and echo the results
echo (QueryToJSON($sqltxt));
