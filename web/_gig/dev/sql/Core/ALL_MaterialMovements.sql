SELECT 
	RDP.[Source_MineArea_Code] as 'Source Mine'
	,substring(ats.ShKey,10,1) as 'Shift'
	,RDP.[Source_Category] as 'Category'
    ,RDP.[Source_Description_Code] as 'Source Area'
	,RDP.[Source_Description] as 'Source Labels'
	,RDD.[Destination_Description_Code] AS 'Finished Area'
	,RDD.[Destination_Description] AS 'Finished Labels'
	,RDD.[Destination_MineArea_Code] as 'Destination Mine'
	,SUM(MTS.[MeasureValue]) AS 'Tonnes'
	,count(MTS.[MeasureValue]) AS 'Count'
	,case when RDP.[Source_Category] = 'Stockpile' then 1 else 0 end as 'Start position'
	,case when RDD.[Destination_Description] in ('U/G Crusher__O', 'M35 Surface Ore Stockpile', 'M35 Surface Waste Stockpile', 'M35 Surface Stope Stockpile') then 3 else case when RDP.[Source_Category] = 'Stockpile' then 2 else 1 end end as 'Finish position'
	FROM [dbo].[ALLOCTNTIMESTAMP]		as ATS 
	Join [dbo].[MEASURETIMESTAMP]		as MTS on MTS.[TSKey] = ATS.[TSKey]
    Join [dbo].[RD_EQUIPMENT]			as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
    Join [dbo].[RD_PARENTLOCATIONS]		as RDP on RDP.[SourceCode] = ATS.[Location]
	Join [dbo].[RD_DESTINATIONS]		as RDD on RDD.[DestinationCode] = ATS.[Destn]
	Join [dbo].[RD_EQUIPMENT_MODEL]		as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
	Join [dbo].[RD_EQUIPMENT_FUNCTION]	as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
	
	WHERE ATS.ShKey LIKE @Date + '%'
		--and left(RDP.[Source_MineArea_Code],3) Like 'SLC'
		and RDP.[Source_MineArea_Code] <> 'MISC' 
		and MTS.[MeasCode] = 'TONNE' 
		and RDF.[Equipment_FunctionCode] = 'Loading'
	GROUP BY RDP.[Source_Category], ats.shkey, RDP.[Source_MineArea_Code], RDP.[Source_Description_Code],RDP.[Source_Description], RDD.[Destination_Description_Code],RDD.[Destination_Description], RDD.[Destination_MineArea_Code] 