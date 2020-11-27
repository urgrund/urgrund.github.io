Select [Destination_MineLevel] 
from [dbo].[RD_DESTINATIONS]
Where [Destination_MineArea] = 'Western Flanks'
Group by [Destination_MineLevel] 
order by [Destination_MineLevel]  asc 