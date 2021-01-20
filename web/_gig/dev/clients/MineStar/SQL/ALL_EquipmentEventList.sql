-- Getting the CYCLE DATA of the Fleet


/*Declare @Date as varchar(8)
--Declare @Equip as varchar(5)

Set @Date = '20201202';
--Set @Equip = 'Dt525';


*/
with FULLDATA as (
SELECT 
	   B.REPORTING_DATE as 'Date'
	  ,C.PRIMARYMACHINENAME as 'Equipment'
	  ,C.[PRIMARYOPERATORNAME] as 'Operator'
	 -- ,C.PRIMARYOPERATOR as 'Operator2'
	--  ,C.SECONDARYMACHINENAME as 'Operator2'
	 -- ,dateadd(second, -25200, A.[START_TIME_UTC]) as 'Start Time'
	 -- ,dateadd(second, -25200, A.[END_TIME_UTC]) as 'End Time'
	  
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
	  else dateadd(second, -28800,A.[START_TIME_UTC]) end as 'Start Time'
	  
	  ,case when (dateadd(second, -25200,A.[END_TIME_UTC]) between '2020-03-08 02:00:00.000' and '2020-11-01 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2021-03-14 02:00:00.000' and '2021-11-07 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2022-03-13 02:00:00.000' and '2022-11-06 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2023-03-12 02:00:00.000' and '2023-11-05 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2024-03-10 02:00:00.000' and '2024-11-03 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2025-03-09 02:00:00.000' and '2025-11-02 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2026-03-08 02:00:00.000' and '2026-11-01 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2027-03-14 02:00:00.000' and '2027-11-07 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2028-03-12 02:00:00.000' and '2028-11-05 02:00:00.000') or
				(dateadd(second, -25200,A.[END_TIME_UTC]) between '2029-03-11 02:00:00.000' and '2029-11-04 02:00:00.000') then dateadd(second, -25200,A.[END_TIME_UTC])
	  else dateadd(second, -28800,A.[END_TIME_UTC]) end as 'End Time'
	  
	  ,CDB.[Name] as 'Location'
	  ,CDB.[PHASE] as 'Mine Area'
	  ,case when B.SHIFTTYPE = 0 then 1
	        else 2 end as 'Shift'

      ,case when A.[NAME] = 'Machine.Delay' then x.[Event Reason]
			else A.[NAME] end as 'Event Reason'

	  ,case when A.[NAME] = 'Add.Steel' then 'Non Productive Time'
			when A.[NAME] = 'AUX' then 'Non Productive Time'
			when A.[NAME] = 'Digging' then 'Productive Time'
			when A.[NAME] = 'Drill' then 'Productive Time'
			when A.[NAME] = 'Drill Prep' then 'Non Productive Time'
			when A.[NAME] = 'Dumping' then 'Productive Time'
			when A.[NAME] = 'Grading' then 'Productive Time'
			when A.[NAME] = 'Hang.Time' then 'Non Productive Time'
			when A.[NAME] = 'Idle' then 'Operating Standby'
			when A.[NAME] = 'Level' then 'Productive Time'
			when A.[NAME] = 'LHD' then 'Productive Time'
			when A.[NAME] = 'Live Pile' then 'Productive Time'
			when A.[NAME] = 'Loading' then 'Productive Time' 
			when A.[NAME] = 'MillToGround' then 'Productive Time'
			when A.[NAME] = 'NOT_DETERMINED' then 'Operating Standby'
			when A.[NAME] = 'PoweredOff' then 'Unplanned Standby'
			when A.[NAME] = 'Propel' then 'Productive Time'
			when A.[NAME] = 'Pull Batters' then 'Non Productive Time'
			when A.[NAME] = 'Queuing.At.Sink' then 'Non Productive Time'
			when A.[NAME] = 'Queuing.At.Source' then 'Non Productive Time' 
			when A.[NAME] = 'Remove.Steel' then 'Operating Standby'
			when A.[NAME] = 'Road and Dump' then 'Productive Time'
			when A.[NAME] = 'Shovel Support' then 'Planned Maintenance'
			when A.[NAME] = 'Spotting.At.Sink' then 'Productive Time'
			when A.[NAME] = 'Spotting.At.Source' then 'Productive Time' 
			when A.[NAME] = 'Stemming' then 'Non Productive Time'
			when A.[NAME] = 'Travel.Empty.At.Source' then 'Productive Time'
			when A.[NAME] = 'Travel.Full.At.Source' then 'Productive Time'
			when A.[NAME] = 'Travelling.Empty' then 'Productive Time'
			when A.[NAME] = 'Travelling.Full' then 'Productive Time'
			when A.[NAME] = 'WaitForBarrier' then 'Non Productive Time'
			when A.[NAME] = 'WaitForDump' then 'Non Productive Time'
			when A.[NAME] = 'WaitForLoad' then 'Non Productive Time' 
			when A.[NAME] = 'WaitForSpot' then 'Non Productive Time' 
			when A.[NAME] = 'Walking' then 'Non Productive Time'
			when A.[NAME] = 'Water Drill' then 'Productive Time'
			when A.[NAME] = 'Water Road' then 'Productive Time'
			when A.[NAME] = 'Working' then 'Productive Time'
			when A.[NAME] = 'Machine.Delay' then x.[TUM Category]
			else x.[TUM Category] end as 'TUM Category'	
					
  FROM [mshist].[dbo].[CYCLEACTIVITYCOMPONENT] as A
  left JOIN [mshist].[dbo].[CYCLE] as C on C.[CYCLE_OID] = A.[oid]
  left JOIN [mssumm].[dbo].[CYCLE_DIM_BLOCK] as CDB on [GRADEBLOCKOID] = C.[SOURCEBLOCK]
  left JOIN (select * from [msmodel].[dbo].[SHIFT]) as B on A.START_TIME_UTC between B.[STARTTIME_UTC] and B.[ENDTIME_UTC] and B.REPORTING_DATE between convert(varchar(8), DATEADD(Day,-6, @Date),112) and @Date --convert(varchar(8), DATEADD(Day,1, @Date),112) 

  
  LEFT JOIN (
  
  SELECT  
	   E.REPORTING_DATE as 'Date'
	 -- ,case when E.SHIFTTYPE = 0 then 1
		--	else 2 end as 'Shift'
      ,MC.[Name] as 'Equipment'
	  ,D.[START_TIME_UTC] as 'Start Time'
	  
	  ,[DELAY_CLASS_NAME] as 'Event Reason'
	  
	  ,case when [DELAY_CATEGORY] in ('Automatic Delay','Dump Planning') then 'Unplanned Standby'
			when [DELAY_CATEGORY] = 'Non Productive' then 'Non Productive Time'
			when [DELAY_CATEGORY] = 'Planned' then 'Planned Maintenance'
			when [DELAY_CATEGORY] = 'Standby' then 'Operating Standby'
			when [DELAY_CATEGORY] = 'Unplanned' then 'Unplanned Breakdown'
			else 'ZZZZZZZZ' end as 'TUM Category'
  
  FROM [mshist].[dbo].[CYCLEDELAY] as D
   left JOIN [mshist].[dbo].[DELAY] as DY on DY.[DELAY_OID] = D.[DELAYOID]
  left JOIN [msmodel].[dbo].[MACHINE] as MC on MC.MACHINE_OID = DY.TARGET_MACHINE
  left JOIN (select * from [msmodel].[dbo].[SHIFT]) as E on D.START_TIME_UTC between E.[STARTTIME_UTC] and E.[ENDTIME_UTC]  --and MC.NAME ='DT527' and  E.[REPORTING_DATE] = '20201201' order by 'Start Time'
 ) as X on X.[Date] = B.[REPORTING_DATE] and X.[Equipment] = C.[PRIMARYMACHINENAME]  and X.[Start Time] = A.[START_TIME_UTC] and  X.[DATE] between convert(varchar(8), DATEADD(Day,-6, @Date),112) and @Date --convert(varchar(8), DATEADD(Day,1, @Date),112) 
),

--Select * from FULLDATA


 --Added Two index rows to get the next and previous shifts data
 FullRowNumber as (
  SELECT 
	  [Date]
	 ,[Operator]
	-- ,[Operator2]
	 ,[Mine Area]
	 ,[Location]
	 ,[Shift]
	 ,[Equipment]
	 ,[Start Time]
	 ,[End Time]
	 ,[Event Reason]
	 ,[TUM Category] 
	 ,Row_Number() Over (Partition by [Date], [Shift], [Equipment] order by [Start Time] ASC ) as 'Start Shift Row Number'
	 ,Row_Number() Over (Partition by [Date], [Shift], [Equipment] order by [End Time] DESC ) as 'End Shift Row Number'
	 ,Row_Number() Over (Partition by [Equipment] order by [Start Time] asc ) as 'Equipment Row Number'
from FullData
 ),
 --End of Adding Index data


-- Getting the Start of the Shift Correct
Start_of_Shift as (
  SELECT 
	  [Date]
	 ,[Operator]
--	 ,[Operator2]
	 ,[Mine Area]
	 ,[Location]
	 ,[Shift]
	 ,[Equipment]
	 ,case when  [Shift] = 1 then dateadd(SECOND,(6.5*3600),Convert(DateTime, DATEDIFF(DAY, 0, left([Date],8))))
		   when  [Shift] = 2 then dateadd(SECOND,(18.5*3600),Convert(DateTime, DATEDIFF(DAY, 0, left([Date],8))))
		   else [Start Time] end as 'New ST'
	 ,[Start Time]  as 'New ET'
	,Lag([Event Reason] , 1) OVER(ORDER BY [Equipment],[Equipment Row Number] ASC) as 'Event Reason'
--	,Lag([TUM Category] , 1) OVER(ORDER BY [Equipment],[Equipment Row Number] ASC) as 'TUM Category'
	,[Start Shift Row Number]
	,[End Shift Row Number]
	,[Equipment Row Number]
FROM FullRowNumber), 
--End of Start of Shift Data




-- Getting the End of the Shift Correct
End_of_Shift as (
  SELECT
	  [Date]
	 ,[Operator]
	-- ,[Operator2]
	 ,[Mine Area]
	 ,[Location]
	 ,[Shift]
	 ,[Equipment]
	 ,[Start Time] as 'New ST'
	  ,case when  [Shift] = 1 then dateadd(SECOND,(18.5*3600),Convert(DateTime, DATEDIFF(DAY, 0, left([Date],8))))
		    when  [Shift] = 2 then dateadd(SECOND,(30.5*3600),Convert(DateTime, DATEDIFF(DAY, 0, left([Date],8))))
		    else [Start Time] end as 'End ST'
	 ,[Event Reason]
	-- ,[TUM Category]
	 ,[Start Shift Row Number]
	 ,[End Shift Row Number]
	 ,[Equipment Row Number]
  from FullRowNumber ),
 --End of End of Shift Data
 
 
 





 CorrectTimes as (

 SELECT 
	  [Date]
	 ,[Operator]
--	 ,[Operator2]
	 ,[Mine Area]
	 ,[Location]
	 ,[Shift]
	 ,[Equipment]
	 ,[New ST]
	 ,[New ET]
	 ,[Event Reason]
--	 ,[TUM Category] 
	 ,Datediff(SECOND,[New ST],[New ET]) as 'Duration' 
	 ,'Start of Shift Adjustment' as 'Correcting Time Table'
	 ,[Start Shift Row Number]
	 ,[End Shift Row Number]
	 ,[Equipment Row Number]
 FROM  Start_of_Shift
 WHERE [Start Shift Row Number] = 1
 
 UNION 

 SELECT 
	  [Date]
	 ,[Operator]
	-- ,[Operator2]
	 ,[Mine Area]
	 ,[Location]
	 ,[Shift]
	 ,[Equipment]
	 ,[New ST]
	 ,[End ST]
	 ,[Event Reason]
--	 ,[TUM Category] 
	 ,Datediff(SECOND,[New ST],[End ST]) as 'Duration' 
	 ,'End of Shift Adjustment' as 'Correcting Time Table'
	 ,[Start Shift Row Number]
	 ,[End Shift Row Number]
	 ,[Equipment Row Number]
 FROM  End_of_Shift
 WHERE [End Shift Row Number] = 1
  
UNION

 SELECT 
	  [Date]
	 ,[Operator]
--	 ,[Operator2]
	 ,[Mine Area]
	 ,[Location]
	 ,[Shift]
	 ,[Equipment]
	 ,[Start Time]
	 ,[End Time]
	 ,[Event Reason]
	-- ,[TUM Category] 
	 ,Datediff(SECOND,[Start Time],[End Time]) as 'Duration' 
	 ,'No Adjustment' as 'Correcting Time Table'
	 ,[Start Shift Row Number]
	 ,[End Shift Row Number]
	 ,[Equipment Row Number]
 from FullRowNumber
 where [End Shift Row Number] <> 1  
  )

 
 Select 
	   [Equipment]
	  ,[Operator]
--	  ,[Operator2] as 'Digger'
	  ,[New ST]  as 'Event Time'
	--  ,[New ET] as 'End Time'
	  ,[Location] --as 'Location'
	  ,[Mine Area] --as 'Mine Area'
	  ,[Duration] as 'Value'
	  ,[Event Reason]
	--  ,[TUM Category]
	  ,[Shift]
	 -- ,[Date]
	--  
  FROM CorrectTimes
 Where [Date] = @Date --and left([Equipment],2) = 'DT'
 Order BY [equipment], [New ST]    --[Event reason] desc,
 
 
 
 
 



 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
   
 
 