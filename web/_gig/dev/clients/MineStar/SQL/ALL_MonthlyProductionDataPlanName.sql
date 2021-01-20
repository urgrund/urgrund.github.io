SELECT 
	b.REPORTING_DATE as 'Date'
	,CDB.[PHASE] as 'Mine Names'

	--PLAN SEMENT NEEDS TO BE ADDED AS PER THE OTHER CORE QUERIES
	,'Plan Segment is missing' as 'Plan Segment'
	 ,CDB.[Name] as 'Location'
	 ,('Phase ' + CDB.[PHASE] + ' ' + CDB.[MATERIAL]) as 'Category'
	 ,Round(sum(A.PAYLOAD / 1000),2) as 'Material Type'
	FROM [mshist].[dbo].[CYCLE] as A
       Join [mssumm].[dbo].[CYCLE_DIM_BLOCK] as CDB on [GRADEBLOCKOID] = A.[SOURCEBLOCK]
       join (select * from [msmodel].[dbo].[SHIFT]) as B on A.ENDTIME_UTC between B.[STARTTIME_UTC] and B.[ENDTIME_UTC] 
	   WHERE substring(B.REPORTING_DATE,1,4) = @Year and substring(B.REPORTING_DATE,5,2) = @Month
  and a.PRIMARYMACHINECATEGORYNAME = 'Shovel Classes' 

  GROUP BY CDB.[PHASE]
			,CDB.[Name]
			,B.REPORTING_DATE 
			,('Phase ' + CDB.[PHASE] + ' ' + CDB.[MATERIAL])
	ORDER BY B.REPORTING_DATE,  CDB.[PHASE] desc 


