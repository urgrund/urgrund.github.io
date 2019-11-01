SELECT 
    RDP.[Source_Description_Code]
	,RDD.[Destination_Description] AS 'Finished Area'
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
		and left(RDP.[Source_MineArea_Code],3) = 'SLC'

		and RDP.[Source_MineArea_Code] <> 'MISC' 
		and MTS.[MeasCode] = 'TONNE' 
		and RDF.[Equipment_FunctionCode] = 'HAULING'
	GROUP BY RDP.[Source_Description_Code], [Destination_Description] 