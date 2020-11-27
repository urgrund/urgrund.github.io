/****** SQL Query for Production Boggers during Day Shift
******* Created by david Hollingsworth *************/

DECLARE @ASSETID AS VARCHAR(8), @SelectedDate AS VARCHAR(8), @DateShift AS VARCHAR(2), @QueryDate AS VARCHAR(10), @ActivityType as varchar(16)

/* Parameters to pass into Query */

SET @SelectedDate = '20181205'
SET @DateShift = 'P1'
SET @ASSETID = ?
--SET @ActivityType = '%Production%'

SET @QueryDate = @SelectedDate + @DateShift

SELECT
	VTH.[Shift]
	  , ATS.[Equipment]
	  , 'Tonnes Per Hour' as 'Metric'
      , sum(VTH.[3600 time] * VTH.[Value]) as '7am'
      , sum(VTH.[7200 time] * VTH.[Value]) as '8am'
      , sum(VTH.[10800 time] * VTH.[Value]) as '9am'
      , sum(VTH.[14400 time] * VTH.[Value]) as '10am'
      , sum(VTH.[18000 time] * VTH.[Value]) as '11am'
      , sum(VTH.[21600 time] * VTH.[Value]) as '12am'
      , sum(VTH.[25200 time] * VTH.[Value]) as '1pm'
      , sum(VTH.[28800 time] * VTH.[Value]) as '2pm'
      , sum(VTH.[32400 time] * VTH.[Value]) as '3pm'
      , sum(VTH.[36000 time] * VTH.[Value]) as '4pm'
      , sum(VTH.[39600 time] * VTH.[Value]) as '5pm'
      , sum(VTH.[43200 time] * VTH.[Value]) as '6pm'
	  , sum(VTH.[46800 time] * VTH.[Value]) as '7pm'
	  , sum(VTH.[50400 time] * VTH.[Value]) as '8pm'
	  , sum(VTH.[54000 time] * VTH.[Value]) as '9pm'
	  , sum(VTH.[57600 time] * VTH.[Value]) as '10pm'
	  , sum(VTH.[61200 time] * VTH.[Value]) as '11pm'
	  , sum(VTH.[64800 time] * VTH.[Value]) as '12pm'
	  , sum(VTH.[68400 time] * VTH.[Value]) as '1am'
	  , sum(VTH.[72000 time] * VTH.[Value]) as '2am'
	  , sum(VTH.[75600 time] * VTH.[Value]) as '3am'
	  , sum(VTH.[79200 time] * VTH.[Value]) as '4am'
	  , sum(VTH.[82800 time] * VTH.[Value]) as '5am'
	  , sum(VTH.[86400 time] * VTH.[Value]) as '6am'
FROM [UG_Trial].[dbo].[VI_TONNE_Hourly] AS VTH
	JOIN ALLOCTNTIMESTAMP AS ATS ON ATS.TSKey = VTH.tskey
	Join RD_PARENTLOCATIONS as RDP on RDP.[SourceCode] = ATS.[Location]
WHERE ATS.ShKey LIKE @QueryDate AND ATS.[Equipment] = @ASSETID
--and RDP.Source_Category like @ActivityType
GROUP BY VTH.[Shift], ATS.[Equipment]