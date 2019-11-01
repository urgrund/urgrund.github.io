DECLARE @ASSETID AS VARCHAR(8), @QueryDate AS VARCHAR(10)


SET @ASSETID = 'BL085'
SET @QueryDate = '20181205'

SELECT   [Equipment]
		,[MEventDateTime]
		,[Value]
		,[Status Description]
		,[Major Group]

FROM [dbo].[View_OverView]
	WHERE left([Shift],8) = @QueryDate  AND [Equipment] = @ASSETID and [Measure code] = 'SECONDS'
	ORDER BY MEventDateTime ASC
