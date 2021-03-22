Declare @ReportStartDate as varchar(8)
Declare @ReportEndDate as varchar(8)
Declare @ReportStartShift as varchar(1)
Declare @ReportEndShift as varchar(1)

Declare @StartD_S as varchar(10)
Declare @EndD_S as varchar(10)

/*
--This block is for testing
SET @ReportStartDate ='20210101'  
SET @ReportEndDate ='20210131'
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
		 LEFT(ATS.[SHkey],8) as 'Date'
	    ,right(ats.[shkey],2) as 'Shift'
	--	,RDP.[Source_MineArea_Code]
		,sum(case when MTS.MeasCode = 'FACEHOLES' then MTS.[MeasureValue] else 0 end) as 'Face Holes'
		,sum(case when MTS.MeasCode = 'DRILL43MMRH' then MTS.[MeasureValue] else 0 end) as 'Bolt Holes'
		,sum(case when MTS.MeasCode not in ('DRILL43MMRH','FACEHOLES') then MTS.[MeasureValue] else 0 end) as 'FRS'  
	FROM dbo.ALLOCTNTIMESTAMP AS ATS JOIN
         dbo.MEASURETIMESTAMP AS MTS ON MTS.TSKey = ATS.TSKey
    JOIN dbo.[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]
   WHERE ats.[shkey] between @StartD_S and @EndD_S and (MTS.MeasCode in ('FACEHOLES','DRILL43MMRH') or MTS.MeasCode like 'SPRAYFIBTY%' ) and left(RDP.[Source_MineArea_Code],1) <>'M' --and  RDP.[Source_MineArea_Code] = 'Areef'  
   GROUP BY 
		 ATS.[SHkey]
		-- ,RDP.[Source_MineArea_Code]
   ORDER BY
	     ATS.[SHkey], right(ats.[shkey],2)