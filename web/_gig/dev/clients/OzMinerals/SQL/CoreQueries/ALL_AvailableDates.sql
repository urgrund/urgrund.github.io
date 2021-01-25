/****** Gets all unique available dates from the database ******/
SELECT distinct
substring([ShKey],0,9) as Dates
  FROM [dbo].[ALLOCTNTIMESTAMP]
ORDER BY [Dates] DESC



