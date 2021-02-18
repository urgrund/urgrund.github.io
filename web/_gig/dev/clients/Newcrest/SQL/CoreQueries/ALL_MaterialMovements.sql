--Declare @Date as varchar(8)
--Set @Date = '20181010'

SELECT 
	RDP.[Source_MineArea_Code] as 'Source Mine'
	,substring(ats.ShKey,10,1) as 'Shift'
	,RDP.[Source_Category] as 'Category'
 	,replace(RDP.[Source_Description],'_','') as 'Source Labels'
		,replace(RDD.[Destination_Description],'_','') AS 'Finished Labels'
	,SUM(MTS.[MeasureValue]) AS 'Tonnes'
	,RDP.[Source_Material] as 'Material Type'
	FROM [dbo].[ALLOCTNTIMESTAMP]		as ATS 
	Join [dbo].[MEASURETIMESTAMP]		as MTS on MTS.[TSKey] = ATS.[TSKey]
    Join [dbo].[RD_EQUIPMENT]			as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
    Join [dbo].[RD_PARENTLOCATIONS]		as RDP on RDP.[SourceCode] = ATS.[Location]
	Join [dbo].[RD_DESTINATIONS]		as RDD on RDD.[DestinationCode] = ATS.[Destn]
	Join [dbo].[RD_EQUIPMENT_MODEL]		as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
	Join [dbo].[RD_EQUIPMENT_FUNCTION]	as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
	
	WHERE LEFT(ats.[shkey],8) = @Date
		--and left(RDP.[Source_MineArea_Code],3) Like 'SLC'
		and RDP.[Source_MineArea_Code] <> 'MISC' 
		and MTS.[MeasCode] = 'TONNE' 
		and RDF.[Equipment_FunctionCode] = 'Loading'
	GROUP BY RDP.[Source_Category], ats.shkey, RDP.[Source_MineArea_Code], RDP.[Source_Description], RDD.[Destination_Description], RDP.Source_Material