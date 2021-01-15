/****** Gets all unique available dates from the database ******/
SELECT 
substring([ShKey],0,9) as Dates
  FROM [dbo].[ALLOCTNTIMESTAMP]
Group By substring([ShKey],0,9)
ORDER BY MAX([ShKey]) DESC



