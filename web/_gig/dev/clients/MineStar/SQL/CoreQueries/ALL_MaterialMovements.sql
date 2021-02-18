--Declare @Date as varchar(8)
--Set @Date = '20201204'

SELECT 
	CDB.[PHASE] as 'Source Mine'
	,case when B.SHIFTTYPE = 0 then 1
	        else 2 end as 'Shift'
	,'Ex-Pit Hauling' as 'Category'
   	,CDB.[Name] as 'Source Labels'
	,A.[endProcessorName] AS 'Destination Labels'
	,A.PAYLOAD / 1000 as 'Tonnes'
	,CDB.[MATERIALGROUPLEVEL1] as 'Material Type'
	--,CDB.[MATERIAL] as 'Material Type1'
	   
  FROM [mshist].[dbo].[CYCLE] as A
       Join [mssumm].[dbo].[CYCLE_DIM_BLOCK] as CDB on [GRADEBLOCKOID] = A.[SOURCEBLOCK]
       join (select * from [msmodel].[dbo].[SHIFT]) as B on A.ENDTIME_UTC between B.[STARTTIME_UTC] and B.[ENDTIME_UTC] where B.REPORTING_DATE = @Date
 
 and a.PRIMARYMACHINECATEGORYNAME = 'Truck Classes' 
