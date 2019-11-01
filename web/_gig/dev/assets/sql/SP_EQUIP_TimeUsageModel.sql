DECLARE @ASSETID AS VARCHAR(8), @SelectedDate AS VARCHAR(8), @DateShift AS VARCHAR(2), @QueryDate AS VARCHAR(10), @ActivityType as varchar(16)

/* Parameters to pass into Query */

SET @SelectedDate = '20181205'
SET @DateShift = 'P1'
SET @ASSETID = 'LH020'
--or 'LH070'

SET @QueryDate = @SelectedDate + @DateShift

SELECT
	VOV.[Equipment]
		, 'All Time' as 'Category Time'
		, sum(convert(decimal (10,4),VTS.[3600 time] * VTS.[Value]))  as '7am'
		, sum(convert(decimal (10,4),VTS.[7200 time] * VTS.[Value]))	as '8am'
		, sum(convert(decimal (10,4),VTS.[10800 time] * VTS.[Value]))	as '9am'
		, sum(convert(decimal (10,4),VTS.[14400 time] * VTS.[Value]))	as '10am'
		, sum(convert(decimal (10,4),VTS.[18000 time] * VTS.[Value]))	as '11am'
		, sum(convert(decimal (10,4),VTS.[21600 time] * VTS.[Value]))	as '12pm'
		, sum(convert(decimal (10,4),VTS.[25200 time] * VTS.[Value]))	as '1pm'
		, sum(convert(decimal (10,4),VTS.[28800 time] * VTS.[Value]))	as '2pm'
		, sum(convert(decimal (10,4),VTS.[32400 time] * VTS.[Value]))	as '3pm'
		, sum(convert(decimal (10,4),VTS.[36000 time] * VTS.[Value]))	as '4pm'
		, sum(convert(decimal (10,4),VTS.[39600 time] * VTS.[Value]))	as '5pm'
		, sum(convert(decimal (10,4),VTS.[43200 time] * VTS.[Value]))	as '6pm'
		, VOV.[Major Group]

FROM [dbo].[VI_SECONDS_Hourly]		as VTS
	Join [dbo].[View_OverView]			as VOV on VOV.MTS_TSKEY = VTS.[MTS_TSKEY]
WHERE VTS.Shift = @QueryDate and VOV.Equipment = @ASSETID and VOV.[Measure code] = 'SECONDS'
GROUP BY VOV.[Equipment], VOV.[Major Group]

	
