

Declare @ReportStartDate as varchar(8)
Declare @ReportEndDate as varchar(8)
Declare @ReportStartShift as varchar(1)
Declare @ReportEndShift as varchar(1)

Declare @StartD_S as varchar(10)
Declare @EndD_S as varchar(10)

/*
--This block is for testing
SET @ReportStartDate ='20181010'  
SET @ReportEndDate ='20181231'
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




SELECT [Date], [Shift], [Asset ID], [Mine Names], [Metric], [Secondy Activity Type], 
[6], [7] , [8] , [9] , [10] , [11] , [12] , [13] , [14] , [15] , [16] , [17] , [18] , [19] , [20] , [21] , [22] , [23] , [0] , [1] , [2] , [3]  , [4] , [5]  
FROM  
 
 (	Select
Left(ATS.[ShKey],4) + '-' + substring(ATS.[ShKey],5,2) + '-' + substring(ATS.[ShKey],7,2) as 'Date'
,case when right(ATS.[ShKey],2) ='P1' then 'Day' else 'Night' end as 'Shift'

,ATS.[Equipment] as 'Asset ID'
,Case When RDP.[Source_MineArea_Code] = 'SLC' Then 'SLC'
		When RDP.[Source_MineArea_Code] = 'WF' Then 'WF'
        When left (RDP.[Source_MineArea_Code],1) = 'M' Then 'M-Reefs' 
		Else RDP.[Source_MineArea_Code] end as 'Mine Names'
,mts.MeasCode as 'Metric'
,MTS.MeasureValue as 'Values'
 ,RDP.[Source_Category] AS 'Secondy Activity Type'
		,datepart(hour, MTS.[EventDateTime]) as 'Timeblock'
		
		FROM dbo.ALLOCTNTIMESTAMP AS ATS JOIN
             dbo.MEASURETIMESTAMP AS MTS ON MTS.TSKey = ATS.TSKey
	    JOIN dbo.[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]
		JOIN dbo.[RD_EQUIPMENT] as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
		JOIN dbo.[RD_EQUIPMENT_MODEL] as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
		JOIN dbo.[RD_EQUIPMENT_FUNCTION] as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
		WHERE ats.[shkey] between @StartD_S and @EndD_S  and MTS.MeasCode = 'TONNE' and RDF.[Equipment_FunctionCode] = 'HAULING' and RDP.[Source_Category] like '%Production%'
 ) as SC  
  PIVOT  
  (sum(SC.[Values])  
	FOR  SC.[timeblock] IN ([6], [7], [8], [9], [10], [11], [12], [13], [14], [15], [16], [17], [18], [19], [20], [21], [22], [23], [0], [1], [2], [3], [4], [5])
) AS PVT order by [Shift], [Asset ID]  asc
