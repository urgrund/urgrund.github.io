/****** Gets all unique available dates from the database ******/
SELECT distinct
REPORTING_DATE as 'Dates'
  FROM [msmodel].[dbo].[SHIFT]
  order by [Dates] desc




