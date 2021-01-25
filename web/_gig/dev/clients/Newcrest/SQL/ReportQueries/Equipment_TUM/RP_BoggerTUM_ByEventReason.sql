

Declare @ReportStartDate as varchar(8)
Declare @ReportEndDate as varchar(8)
Declare @ReportStartShift as varchar(1)
Declare @ReportEndShift as varchar(1)

Declare @StartD_S as varchar(10)
Declare @EndD_S as varchar(10)

/*
--This block is for testing
SET @ReportStartDate ='20181010'  
SET @ReportEndDate ='20181010'
SET @ReportStartShift = 1 
SET @ReportEndShift = 2 
*/
		
/********** This bit is for the PHP **********/
		
		SET @ReportStartDate = @StartDate
		SET @ReportEndDate = @EndDate
		SET @ReportStartShift = @StartShift 
		SET @ReportEndShift = @EndShift 
		


SET @StartD_S = @ReportStartDate + 'P' + @ReportStartShift
SET @EndD_S = @ReportEndDate + 'P' + @ReportEndShift



/**********Testing again **********/
--select
--@StartD_S
--,@EndD_S




Select
Left(ATS.[ShKey],4) + '-' + substring(ATS.[ShKey],5,2) + '-' + substring(ATS.[ShKey],7,2) as 'Date'
,case when right(ATS.[ShKey],2) ='P1' then 'Day' else 'Night' end as 'Shift'
,ATS.[Equipment] 'Equipment'
		,MTS.[EventDateTime] as 'Event Time'
		,MeasCode as 'Metric'
		,MTS.[MeasureValue] AS 'Value'
		,RDS.[Status_Description] AS 'Status Description'
		,RTS.[Status_Type_Group_Code] AS 'Major Group'
		--,TUM.[TUM_Translator] as 'TUM Category'
FROM [dbo].[ALLOCTNTIMESTAMP] as ATS 
	Join [dbo].[MEASURETIMESTAMP] as MTS on MTS.[TSKey] = ATS.[TSKey]
	Join [dbo].[RD_STATUS]        as RDS on RDS.[StatusCode] = ATS.[Status]
	Join [dbo].[RD_STATUS_CATEGORY] as RDC on RDC.[Status_CategoryCode] = RDS.[Status_Category_Code]
    Join [dbo].[RD_STATUS_TYPE] as RTS on RTS.[Status_TypeCode] = RDC.[Status_Category_Type_Code]
	Join [dbo].[RD_EQUIPMENT] as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
    Join [dbo].[RD_EQUIPMENT_MODEL] as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
    Join [dbo].[RD_EQUIPMENT_FUNCTION] as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
	--Join [dbo].[RD_TUM_TABLE] as TUM on TUM.[Fleet_Event_Code] = RDS.[Status_Description] 
	WHERE MTS.MeasCode = 'SECONDS' and  ats.[shkey] between @StartD_S and @EndD_S   and RDF.[Equipment_FunctionCode] = 'LOADING' 

	



