-- This query is to get the Mine names that are in operation, produced tonnes on that day and was in a productive state.
-- This query is a generic Query that will return the Operating mine names with production tonnes associated with it.
-- Created by David Hollingsworth 23/03/2019 
Select 
	Case When [Mine Start] = 'SLC' Then 'SLC'
		When [Mine start] = 'WF' Then 'WF'
        When left ([mine start],1) = 'M' Then 'M%' 
		Else 'Unknown Mine name' end as 'Mine Names'
	--,sum([value]) as 'Total Tonnes' Uncomment this if we want the tonnes'
FROM [dbo].[View_OverView]
Where [dbo].[View_OverView].[Shift] Like '20181001%' and [Measure code]= 'TONNE' and [Primary Activity Type] = 'Loading' and [Secondy Activity Type] like '%Production%'
Group by Case When [Mine Start] = 'SLC' Then 'SLC'
		When [Mine start] = 'WF' Then 'WF'
        When left ([mine start],1) = 'M' Then 'M%' 
		Else 'Unknown Mine name' end
Order By sum([Value]) Desc