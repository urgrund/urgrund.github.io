-- This query is to get the Mine names that are in operation, produced tonnes on that day and was in a productive state.
-- This query is specific to the customer as the Mine names are entered into the query. Removing the case statements and just using the column name [Mine Start] will produce a list of the Mine names in Pitram.
-- Created by David Hollingsworth 23/03/2019 
Select 
	Case When [Mine Start] = 'SLC' Then 'SLC'
		When [Mine start] = 'WF' Then 'Western Flanks'
        When left ([mine start],1) = 'M' Then 'M Reefs' 
		Else 'Unknown Mine name' end as 'Mine Names'
FROM [dbo].[View_OverView]
Where [dbo].[View_OverView].[Shift] Like '20181001%' and [Measure code]= 'TONNE' and [Primary Activity Type] = 'Loading' and [Secondy Activity Type] like '%Production%'
Group by 
Case When [Mine Start] = 'SLC' Then 'SLC'
		When [Mine start] = 'WF' Then 'Western Flanks'
        When left ([mine start],1) = 'M' Then 'M Reefs' 
		Else 'Unknown Mine name' end

Order By sum([Value]) Desc