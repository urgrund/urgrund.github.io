DECLARE @ASSETID AS VARCHAR(8), @SelectedDate AS VARCHAR(8), @DateShift AS VARCHAR(2), @QueryDate AS VARCHAR(10)


SET @SelectedDate = '20181205'
SET @DateShift = 'P1'
SET @ASSETID = 'TH004'

SET @QueryDate = @SelectedDate + @DateShift

SELECT
	RDO.[Operator_Description] AS 'Operator'
	, MTS.[EventDateTime] AS 'Last Radio Call-in'
	
	--,CASE WHEN left(ATS.[shkey],8) = CONVERT(VARCHAR(10), getdate(), 112) THEN		
	, CASE WHEN '20190504' = CONVERT(VARCHAR(10), getdate(), 112) THEN		
		--CONVERT(VARCHAR(25), DATEADD(SECOND, DATEDIFF(SECOND,MTS.[EventDateTime], '2018-12-05 18:00:00'),0), 108)
		CONVERT(VARCHAR(8), DATEADD(SECOND, DATEDIFF(SECOND,MTS.[EventDateTime], getdate()),0), 108)
	Else 'N/A' END as 'Time Since Last Call'

	
	, RDP.[Source_MineArea_Code] AS 'Mine Area'
	, ATS.[Location] AS 'Location'
	, RDS.[Status_Description] AS 'Current Status'


FROM [dbo].[ALLOCTNTIMESTAMP] as ATS
	Join [dbo].[MEASURETIMESTAMP] as MTS on MTS.[TSKey] = ATS.[TSKey]
	Join [dbo].[RD_OPERATORS] as RDO on RDO.[OperatorCode] = ATS.Operator
	Join [dbo].[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]
	Join [dbo].[RD_STATUS]        as RDS on RDS.[StatusCode] = ATS.[Status]

WHERE ATS.[Equipment] = @ASSETID and [MeasCode] in ('TONNE','SECONDS') and MTS.[EventDateTime] = (
									SELECT MAX(MTS.[EventDateTime])
	FROM [dbo].[ALLOCTNTIMESTAMP] as ATS
		Join [dbo].[MEASURETIMESTAMP] as MTS on MTS.[TSKey] = ATS.[TSKey]
	WHERE ATS.ShKey LIKE @QueryDate AND ATS.[Equipment] = @ASSETID)