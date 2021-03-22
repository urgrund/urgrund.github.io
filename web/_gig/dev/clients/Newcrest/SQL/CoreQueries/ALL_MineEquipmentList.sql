--Declare @Date as varchar(8)
--Set @Date = '20210101'

Select 
	 ATS.[Equipment]
	 ,RDF.[Equipment_FunctionCode]
	 ,RDF.[Equipment_Function_Description]
FROM [dbo].[ALLOCTNTIMESTAMP] as ATS 
Join [dbo].[RD_EQUIPMENT] as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
Join [dbo].[RD_EQUIPMENT_MODEL] as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
Join [dbo].[RD_EQUIPMENT_FUNCTION] as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
Join [dbo].[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]
Join [dbo].[RD_STATUS] as RDS on RDS.[StatusCode] = ATS.[Status]

Where left(ATS.[Shkey],8) = @Date
	and RDF.[Equipment_FunctionCode] in ('LOADING','HAULING','P','D') 
	--AND RDP.[Source_MineArea_Code] like '%'
	and RDP.[Source_MineArea_Code] <> 'MISC'
	and RDS.[Status_Description] <> 'Offsite'

Group by ATS.[Equipment], RDF.[Equipment_FunctionCode],RDF.[Equipment_Function_Description]

