SELECT 
	RDP.[Source_MineArea_Code] as 'Source Mine'
    ,RDP.[Source_Description_Code] as 'Source Area'
	,RDD.[Destination_Description] AS 'Finished Area'
	,RDD.[Destination_MineArea_Code] as 'Destination Mine'
	,SUM(MTS.[MeasureValue]) AS 'Tonnes'
	,count(MTS.[MeasureValue]) AS 'Count'
	FROM [dbo].[ALLOCTNTIMESTAMP]		as ATS 
	Join [dbo].[MEASURETIMESTAMP]		as MTS on MTS.[TSKey] = ATS.[TSKey]
    Join [dbo].[RD_EQUIPMENT]			as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
    Join [dbo].[RD_PARENTLOCATIONS]		as RDP on RDP.[SourceCode] = ATS.[Location]
	Join [dbo].[RD_DESTINATIONS]		as RDD on RDD.[DestinationCode] = ATS.[Destn]
	Join [dbo].[RD_EQUIPMENT_MODEL]		as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
	Join [dbo].[RD_EQUIPMENT_FUNCTION]	as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
	
	WHERE ATS.ShKey like '20181001P%' 
		--and left(RDP.[Source_MineArea_Code],3) Like 'SLC'
		and RDP.[Source_MineArea_Code] <> 'MISC' 
		and MTS.[MeasCode] = 'TONNE' 
		and RDF.[Equipment_FunctionCode] = 'Hauling'
	GROUP BY RDP.[Source_MineArea_Code], RDP.[Source_Description_Code], [Destination_Description], RDD.[Destination_MineArea_Code] 