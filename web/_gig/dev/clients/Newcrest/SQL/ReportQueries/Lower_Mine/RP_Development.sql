Declare @ReportStartDate as varchar(8)
Declare @ReportEndDate as varchar(8)
Declare @ReportStartShift as varchar(1)
Declare @ReportEndShift as varchar(1)

Declare @StartD_S as varchar(10)
Declare @EndD_S as varchar(10)

/*
--This block is for testing
SET @ReportStartDate ='20200510'  
SET @ReportEndDate ='20201231'
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
		DATENAME(weekday, LEFT(ATS.[SHkey],8)) AS 'Day of Week'
		,LEFT(ATS.[SHkey],8) as 'Date'
		,sum(MTS.[MeasureValue]) as 'Actuals'
		,round(case when DATENAME(weekday, LEFT(ATS.[SHkey],8)) = 'Wednesday' then avg(sum(MTS.[MeasureValue])) OVER (ORDER BY  LEFT(ATS.[SHkey],8) ROWS BETWEEN 0 PRECEDING AND 6 FOLLOWING) 
					when DATENAME(weekday, LEFT(ATS.[SHkey],8))  = 'Thursday' then avg(sum(MTS.[MeasureValue])) OVER (ORDER BY  LEFT(ATS.[SHkey],8) ROWS BETWEEN 1 PRECEDING AND 5 FOLLOWING) 
					when DATENAME(weekday, LEFT(ATS.[SHkey],8))  = 'Friday' then avg(sum(MTS.[MeasureValue])) OVER (ORDER BY  LEFT(ATS.[SHkey],8) ROWS BETWEEN 2 PRECEDING AND 4 FOLLOWING) 
					when DATENAME(weekday, LEFT(ATS.[SHkey],8))  = 'Saturday' then avg(sum(MTS.[MeasureValue])) OVER (ORDER BY  LEFT(ATS.[SHkey],8) ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING) 
					when DATENAME(weekday, LEFT(ATS.[SHkey],8))  = 'Sunday' then avg(sum(MTS.[MeasureValue])) OVER (ORDER BY  LEFT(ATS.[SHkey],8) ROWS BETWEEN 4 PRECEDING AND 2 FOLLOWING) 
					when DATENAME(weekday, LEFT(ATS.[SHkey],8))  = 'Monday' then avg(sum(MTS.[MeasureValue])) OVER (ORDER BY  LEFT(ATS.[SHkey],8) ROWS BETWEEN 5 PRECEDING AND 1 FOLLOWING) 
					when DATENAME(weekday, LEFT(ATS.[SHkey],8))  = 'Tuesday' then avg(sum(MTS.[MeasureValue])) OVER (ORDER BY  LEFT(ATS.[SHkey],8) ROWS BETWEEN 6 PRECEDING AND 0 FOLLOWING)
					else  0 end,1) as 'Weekly average'
	
	FROM dbo.ALLOCTNTIMESTAMP AS ATS 
	JOIN dbo.MEASURETIMESTAMP AS MTS ON MTS.TSKey = ATS.TSKey
    JOIN dbo.[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]
	Join [dbo].[RD_EQUIPMENT] as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
    WHERE ats.[shkey] between @StartD_S and @EndD_S and MTS.MeasCode = 'TOTDEVADV' and left(RDP.[Source_MineArea_Code],1) <>'M' --and  RDP.[Source_MineArea_Code] <> 'Areef'
	GROUP BY left(ats.[SHkey],8) 
		