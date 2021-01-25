
--Declare @Date as varchar(8)
--Set @Date = '20201204';

with FULLDATA as ( 

SELECT 
	    C.PRIMARYMACHINENAME as 'Equipment'
	   ,C.[PRIMARYOPERATORNAME] as 'Operator' 
	   ,case when (dateadd(second, -25200,A.[START_TIME_UTC]) between '2020-03-08 02:00:00.000' and '2020-11-01 02:00:00.000') or
				(dateadd(second, -25200,A.[START_TIME_UTC]) between '2021-03-14 02:00:00.000' and '2021-11-07 02:00:00.000') or
				(dateadd(second, -25200,A.[START_TIME_UTC]) between '2022-03-13 02:00:00.000' and '2022-11-06 02:00:00.000') or
				(dateadd(second, -25200,A.[START_TIME_UTC]) between '2023-03-12 02:00:00.000' and '2023-11-05 02:00:00.000') or
				(dateadd(second, -25200,A.[START_TIME_UTC]) between '2024-03-10 02:00:00.000' and '2024-11-03 02:00:00.000') or
				(dateadd(second, -25200,A.[START_TIME_UTC]) between '2025-03-09 02:00:00.000' and '2025-11-02 02:00:00.000') or
				(dateadd(second, -25200,A.[START_TIME_UTC]) between '2026-03-08 02:00:00.000' and '2026-11-01 02:00:00.000') or
				(dateadd(second, -25200,A.[START_TIME_UTC]) between '2027-03-14 02:00:00.000' and '2027-11-07 02:00:00.000') or
				(dateadd(second, -25200,A.[START_TIME_UTC]) between '2028-03-12 02:00:00.000' and '2028-11-05 02:00:00.000') or
				(dateadd(second, -25200,A.[START_TIME_UTC]) between '2029-03-11 02:00:00.000' and '2029-11-04 02:00:00.000') then dateadd(second, -25200,A.[START_TIME_UTC])
	   else dateadd(second, -28800,A.[START_TIME_UTC]) end as 'Event Time'

	  ,CDB.[Name] as 'Location'
	  ,CDB.[PHASE] as 'Mine Area'
	  ,datediff(SECOND, A.[START_TIME_UTC],A.[END_TIME_UTC]) as 'Value' 
	  
	  ,case when A.[NAME] = 'Machine.Delay' then D.[DELAY_CLASS_NAME]
			else A.[NAME] end as 'Event Reason'
	  ,case when B.SHIFTTYPE = 0 then 1
			else 2 end as 'Shift'

/*	    ,case when (dateadd(second, -25200,A.[END_TIME_UTC]) between '2020-03-08 02:00:00.000' and '2020-11-01 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2021-03-14 02:00:00.000' and '2021-11-07 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2022-03-13 02:00:00.000' and '2022-11-06 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2023-03-12 02:00:00.000' and '2023-11-05 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2024-03-10 02:00:00.000' and '2024-11-03 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2025-03-09 02:00:00.000' and '2025-11-02 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2026-03-08 02:00:00.000' and '2026-11-01 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2027-03-14 02:00:00.000' and '2027-11-07 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2028-03-12 02:00:00.000' and '2028-11-05 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2029-03-11 02:00:00.000' and '2029-11-04 02:00:00.000') then dateadd(second, -25200,A.[END_TIME_UTC])
	  else dateadd(second, -28800,A.[END_TIME_UTC]) end as 'End Time'*/

	 ,Row_Number() Over (Partition by B.REPORTING_DATE, B.SHIFTTYPE, C.PRIMARYMACHINENAME order by A.[START_TIME_UTC] ASC ) as 'Start Shift Row Number'
	 ,Row_Number() Over (Partition by B.REPORTING_DATE, B.SHIFTTYPE, C.PRIMARYMACHINENAME order by A.[END_TIME_UTC] DESC ) as 'End Shift Row Number'
	 ,Row_Number() Over (Partition by C.PRIMARYMACHINENAME order by A.[START_TIME_UTC] asc ) as 'Equipment Row Number'
		
  FROM [mshist].[dbo].[CYCLEACTIVITYCOMPONENT] as A
  LEFT JOIN [mshist].[dbo].[CYCLE] as C on C.[CYCLE_OID] = A.[oid]
  LEFT JOIN [mssumm].[dbo].[CYCLE_DIM_BLOCK] as CDB on [GRADEBLOCKOID] = C.[SOURCEBLOCK]
  LEFT JOIN [mshist].[dbo].[CYCLEDELAY] as D on (D.OID = A.[oid] and D.START_TIME_UTC = A.START_TIME_UTC and D.END_TIME_UTC = A.END_TIME_UTC)
  JOIN (select * from [msmodel].[dbo].[SHIFT]) as B on A.START_TIME_UTC between B.[STARTTIME_UTC] and B.[ENDTIME_UTC] and B.REPORTING_DATE   = @Date       --    between convert(varchar(8), DATEADD(Day,-1, @Date),112) and @Date
  ),

Start_of_Shift as (
  
  SELECT 
	--[Date]
	 [Equipment]
	 ,[Operator]
	 ,case when  [Shift] = 1 then dateadd(SECOND,(6.5*3600),Convert(DateTime, DATEDIFF(DAY, 0, left(@Date,8))))
		   when  [Shift] = 2 then dateadd(SECOND,(18.5*3600),Convert(DateTime, DATEDIFF(DAY, 0, left(@Date,8))))
		   else [Event Time] end as 'New Event Time'
	 ,[Location]
	 ,[Mine Area]
	 ,DateDiff(SECOND,case when  [Shift] = 1 then dateadd(SECOND,(6.5*3600),Convert(DateTime, DATEDIFF(DAY, 0, left(@Date,8))))
		   when  [Shift] = 2 then dateadd(SECOND,(18.5*3600),Convert(DateTime, DATEDIFF(DAY, 0, left(@Date,8))))
		   else [Event Time] end,[Event Time]) as 'Value2'
		   ,Lag([Event Reason] , 1) OVER(ORDER BY [Equipment],[Equipment Row Number] ASC) as 'Event Reason'
	,[Shift]
FROM FULLDATA Where [Start Shift Row Number]=1),

End_of_Shift as (
  SELECT
	  [Equipment]
	 ,[Operator]
	 ,[Event Time]
	 ,[Location]
	 ,[Mine Area]
	 ,Datediff(SECOND,[Event Time], case when  [Shift] = 1 then dateadd(SECOND,(18.5*3600),Convert(DateTime, DATEDIFF(DAY, 0, left(@Date,8))))
		    when  [Shift] = 2 then dateadd(SECOND,(30.5*3600),Convert(DateTime, DATEDIFF(DAY, 0, left(@Date,8))))
		    else [Event Time] end) as 'Value3' 
	 ,[Event Reason]
	 ,[Shift]
 FROM FULLDATA Where [End Shift Row Number]=1)
 
 --AllData as (
 Select Equipment
		,Operator
		,[Event Time]
		,[Location]
		,[Mine Area]
		,[value]
		,[Event Reason]
		,[Shift] 
 from FULLDATA Where [End Shift Row Number] <> 1 
 Union
 Select * from End_of_Shift 
 Union
 Select * from Start_of_Shift 
 
 --)Select [Equipment],SUM([Value]) from AllData Group by [Equipment] order by [Equipment]
 

 