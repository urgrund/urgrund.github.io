DECLARE @MINEID AS VARCHAR(8), @SelectedDate AS VARCHAR(8), @DateShift AS VARCHAR(2), @QueryDate AS VARCHAR(10), @ActivityType as varchar(16)

/* Parameters to pass into Query */

SET @SelectedDate = '20181205'
SET @DateShift = 'P1'
SET @MineID = 'SLC'	
SET @ActivityType = '%Production%'

SET @QueryDate = @SelectedDate + @DateShift

SELECT 
      VTH.[Shift]
	  ,Case When RDP.[Source_MineArea_Code] = 'SLC' Then 'SLC'
		When RDP.[Source_MineArea_Code] = 'WF' Then 'Western Flanks'
        When left (RDP.[Source_MineArea_Code],1) = 'M' Then 'M Reefs' 
		Else 'Unknown Mine name' end as 'Mine Name'
	  ,'Tonnes Per Hour' as 'Metric'
      ,sum(VTH.[3600 time] * VTH.[Value]) as '7am'
      ,sum(VTH.[7200 time] * VTH.[Value]) as '8am'
      ,sum(VTH.[10800 time] * VTH.[Value]) as '9am'
      ,sum(VTH.[14400 time] * VTH.[Value]) as '10am'
      ,sum(VTH.[18000 time] * VTH.[Value]) as '11am'
      ,sum(VTH.[21600 time] * VTH.[Value]) as '12am'
      ,sum(VTH.[25200 time] * VTH.[Value]) as '1pm'
      ,sum(VTH.[28800 time] * VTH.[Value]) as '2pm'
      ,sum(VTH.[32400 time] * VTH.[Value]) as '3pm'
      ,sum(VTH.[36000 time] * VTH.[Value]) as '4pm'
      ,sum(VTH.[39600 time] * VTH.[Value]) as '5pm'
      ,sum(VTH.[43200 time] * VTH.[Value]) as '6pm'
FROM [UG_Trial].[dbo].[VI_TONNE_Hourly] AS VTH
JOIN ALLOCTNTIMESTAMP AS ATS ON ATS.TSKey = VTH.tskey
Join RD_PARENTLOCATIONS as RDP on RDP.[SourceCode] = ATS.[Location]
WHERE ATS.ShKey LIKE @QueryDate  AND RDP.[Source_MineArea_Code] LIKE @MineID AND RDP.[Source_MineArea_Code] <> 'MISC' AND RDP.Source_Category like @ActivityType
GROUP BY VTH.[Shift], Case When RDP.[Source_MineArea_Code] = 'SLC' Then 'SLC'
		When RDP.[Source_MineArea_Code] = 'WF' Then 'Western Flanks'
        When left (RDP.[Source_MineArea_Code],1) = 'M' Then 'M Reefs' 
		Else 'Unknown Mine name' end
