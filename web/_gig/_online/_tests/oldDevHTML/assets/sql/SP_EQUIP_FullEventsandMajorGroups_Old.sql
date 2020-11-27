DECLARE @ASSETID AS VARCHAR(8), @SelectedDate AS VARCHAR(8), @DateShift AS VARCHAR(2), @QueryDate AS VARCHAR(10), @ActivityType as varchar(16)

/* Parameters to pass into Query */

SET @SelectedDate = '20181205'
SET @DateShift = 'P1'
SET @ASSETID = 'BL085'
--SET @ActivityType = '%Production%'

SET @QueryDate = @SelectedDate + @DateShift

SELECT   [Equipment]
		,[MEventDateTime]
		,[Value]
		,[Status Description]
		,[Major Group]

FROM [dbo].[View_OverView]
	WHERE [Shift] LIKE @QueryDate  AND [Equipment] = @ASSETID and [Measure code] = 'SECONDS'
	ORDER BY MEventDateTime ASC
