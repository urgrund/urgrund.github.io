
SELECT Distinct
	  
	    C.PRIMARYMACHINENAME as 'Equipment'
		,c.PRIMARYMACHINECATEGORYname as 'Function'
		,c.PRIMARYMACHINECATEGORYname as 'Description'
	  	FROM [mshist].[dbo].[CYCLE] as C 
 
  JOIN (select * from [msmodel].[dbo].[SHIFT]) as B on C.STARTTIME_UTC between B.[STARTTIME_UTC] and B.[ENDTIME_UTC] and B.REPORTING_DATE = @Date    

 