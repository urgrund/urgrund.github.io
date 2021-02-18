
--Declare @Date as varchar(8)
--Set @Date = '20201205'



SELECT [Asset ID], /* [DPD],*/ [Mine Names], [Metric], [Secondy Activity Type], 
[7] , [8] , [9] , [10] , [11] , [12] , [13] , [14] , [15] , [16] , [17] , [18] , [19] , [20] , [21] , [22] , [23] , [0] , [1] , [2] , [3]  , [4] , [5],  [6], [MaterialType]
FROM  
 
 (	
 Select
		A.[PRIMARYMACHINENAME] as 'Asset ID'
		,Case when  A.PRIMARYMACHINECATEGORYNAME = 'Track Drill' and left(dh.PATTERN_DESIGN,2) = '14' then '5'
			  when  A.PRIMARYMACHINECATEGORYNAME = 'Track Drill' and left(dh.PATTERN_DESIGN,2) = '13' then '4'
		      else CDB.[PHASE] end as 'Mine Names'
		,Case when  A.PRIMARYMACHINECATEGORYNAME = 'Track Drill' then 'Metres' else 'Tonnes' end as 'Metric'
		,Case when  A.PRIMARYMACHINECATEGORYNAME ='Track Drill' then  round(DH.DEPTH_ACTUAL,2) else round(A.[PAYLOAD] / 1000,2) end as 'values'
		
		 -- DAYLIGHT SAVING ADJUSTMENT uncomment line above to take it out and comment out the case statement
		 ,case when (dateadd(second, -25200,A.[ENDTIME_UTC]) between '2020-03-08 02:00:00.000' and '2020-11-01 02:00:00.000') or
					(dateadd(second, -25200,A.[ENDTIME_UTC]) between '2021-03-14 02:00:00.000' and '2021-11-07 02:00:00.000') or
					(dateadd(second, -25200,A.[ENDTIME_UTC]) between '2022-03-13 02:00:00.000' and '2022-11-06 02:00:00.000') or
					(dateadd(second, -25200,A.[ENDTIME_UTC]) between '2023-03-12 02:00:00.000' and '2023-11-05 02:00:00.000') or
					(dateadd(second, -25200,A.[ENDTIME_UTC]) between '2024-03-10 02:00:00.000' and '2024-11-03 02:00:00.000') or
					(dateadd(second, -25200,A.[ENDTIME_UTC]) between '2025-03-09 02:00:00.000' and '2025-11-02 02:00:00.000') or
					(dateadd(second, -25200,A.[ENDTIME_UTC]) between '2026-03-08 02:00:00.000' and '2026-11-01 02:00:00.000') or
					(dateadd(second, -25200,A.[ENDTIME_UTC]) between '2027-03-14 02:00:00.000' and '2027-11-07 02:00:00.000') or
					(dateadd(second, -25200,A.[ENDTIME_UTC]) between '2028-03-12 02:00:00.000' and '2028-11-05 02:00:00.000') or
					(dateadd(second, -25200,A.[ENDTIME_UTC]) between '2029-03-11 02:00:00.000' and '2029-11-04 02:00:00.000') then datepart(hour,dateadd(second, -25200,A.[ENDTIME_UTC]))
		  else datepart(hour,dateadd(second, -28800,A.[ENDTIME_UTC])) end as 'Timeblock'	
		,case when A.PRIMARYMACHINECATEGORYNAME = 'Track Drill' then 'Drilling' else CDB.MATERIALGROUPLEVEL1 end AS 'Secondy Activity Type'
		,CDB.MATERIAL 'MaterialType' 
		FROM [mshist].[dbo].[CYCLE] as A
       left Join [mssumm].[dbo].[CYCLE_DIM_BLOCK] as CDB on [GRADEBLOCKOID] = A.[SOURCEBLOCK]
	   left Join [mshist].[dbo].[DRILL_HOLE_INFORMATION] as DH on DH.[OID] = A.[CYCLE_OID]
       join (select * from [msmodel].[dbo].[SHIFT]) as B on A.ENDTIME_UTC between B.[STARTTIME_UTC] and B.[ENDTIME_UTC] where A.PRIMARYMACHINECATEGORYNAME in ('Truck Classes', 'Shovel Classes', 'Track Drill', 'Loader Classes') and B.REPORTING_DATE = @Date
 ) as SC  
  PIVOT  
  (sum(SC.[values])  
	FOR  SC.[timeblock] IN ( [7], [8], [9], [10], [11], [12], [13], [14], [15], [16], [17], [18], [19], [20], [21], [22], [23], [0], [1], [2], [3], [4], [5], [6])
) AS PVT order by [Asset ID] asc

