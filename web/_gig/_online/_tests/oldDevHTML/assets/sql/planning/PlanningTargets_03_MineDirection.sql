Select substring([DestinationCode],8,1)
from [dbo].[RD_DESTINATIONS]
Where [Destination_MineArea] = 'Western Flanks' and [Destination_MineLevel] = '4555' and substring([DestinationCode],8,1) between 'a' and 'z'
Group by substring([DestinationCode],8,1)
order by substring([DestinationCode],8,1)  asc 