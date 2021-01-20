
SELECT 
	CDB.[PHASE] as 'Source Mine'
	,B.SHIFTTYPE as 'Shift'
	,'Ex-Pit Hauling' as 'Category'
    ,CDB.[Name] as 'Location'
	,CDB.[Name] as 'Source Labels'
	,A.[endProcessorName] AS 'Finished Area'
	,A.[endProcessorName] AS 'Destinatio Labels'
	,A.[endProcessorClassName] as 'Destination Mine'
	,A.PAYLOAD / 1000 as 'Tonnes'
	   
  FROM [mshist].[dbo].[CYCLE] as A
       Join [mssumm].[dbo].[CYCLE_DIM_BLOCK] as CDB on [GRADEBLOCKOID] = A.[SOURCEBLOCK]
       join (select * from [msmodel].[dbo].[SHIFT]) as B on A.ENDTIME_UTC between B.[STARTTIME_UTC] and B.[ENDTIME_UTC] where B.REPORTING_DATE = @Date
 
 and a.PRIMARYMACHINECATEGORYNAME = 'Truck Classes' 
