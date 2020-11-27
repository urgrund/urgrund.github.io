Select [Destination_MineArea] 
from [dbo].[RD_DESTINATIONS]
Where [Destination_MineArea] <> 'null'
Group by [Destination_MineArea]
order by [Destination_MineArea] asc