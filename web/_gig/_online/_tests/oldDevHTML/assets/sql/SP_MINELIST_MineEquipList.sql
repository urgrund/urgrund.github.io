-- This query is to get the Equipment Names for a selected Mine [MINE START] doing a particular activity type [PRIMARY / SECONDARY ACTIVITY TYPE].
-- Created by David Hollingsworth 05/04/2019 
DECLARE @MINENAME AS VARCHAR(8), @SelectedDate AS VARCHAR(8), @DateShift AS VARCHAR(2), @QueryDate AS VARCHAR(10), @PrimActivityType as varchar(16), @SecActivityType as varchar(16)


SET @SelectedDate = '20181205'
SET @DateShift = 'P1'
SET @MINENAME = 'SLC'
-- Variables are SLC, WF, M% (% This is wild character) 
SET @PrimActivityType = 'Loading'
-- Variables are LOADING, (Boggers), HAULING (Haul Trucks), P (Production Drilling), D (Development Drilling / jumbos)
--SET @SecActivityType = '%PRODUCTION%'		-- This may not be needed I currenyl have it turned off

SET @QueryDate = @SelectedDate + @DateShift

Select
	[Equipment]
--,[Mine Start]

--Case When [Mine Start] = 'SLC' Then 'SLC'
--	When [Mine start] = 'WF' Then 'Western Flanks'
--   When left ([mine start],1) = 'M' Then 'M Reefs' 
--	Else 'Unknown Mine name' end as 'Mine Names'
--,sum([value]) as 'Total Tonnes' Uncomment this if we want the tonnes'
FROM [dbo].[View_OverView]

Where [Shift] Like @QueryDate
	and [Primary Activity Type] = @PrimActivityType
	--and [Secondy Activity Type] like @SecActivityType  
	AND [Mine Start] like @MINENAME
	and [Mine Start] <> 'MISC'

Group by 
	 [Equipment]
--  ,[Mine Start]
--,Case When [Mine Start] = 'SLC' Then 'SLC'
--	When [Mine start] = 'WF' Then 'Western Flanks'
--   When left ([mine start],1) = 'M' Then 'M Reefs' 
--	Else 'Unknown Mine name' end

Order By sum([Value]) Desc