
Select 
	 ATS.[Equipment]
	 ,RDF.[Equipment_FunctionCode]
	 ,RDF.[Equipment_Function_Description]
FROM [dbo].[ALLOCTNTIMESTAMP] as ATS 
Join [dbo].[RD_EQUIPMENT] as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
Join [dbo].[RD_EQUIPMENT_MODEL] as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
Join [dbo].[RD_EQUIPMENT_FUNCTION] as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
Join [dbo].[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]

Where left(ATS.[Shkey],8) = @Date
	
	and RDF.[Equipment_FunctionCode] in ('LOADING','HAULING','PRODDRILL','DEVDRILL') 
	
	--AND RDP.[Source_MineArea_Code] like '%'
	
	and RDP.[Source_MineArea_Code] <> 'MISC'

Group by ATS.[Equipment], RDF.[Equipment_FunctionCode],RDF.[Equipment_Function_Description]

