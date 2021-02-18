Select
		 ATS.[Equipment] 'Equipment'
		--,RDO.[Operator_Description] AS 'Operator'
		,MTS.[EventDateTime] as 'Event Time'
		--,ATS.[Location] AS 'Location'
		--,RDP.[Source_MineArea_Code] AS 'Mine Area'
		,MTS.[MeasureValue] AS 'Value'
		,RDS.[Status_Description] AS 'Status Description'
		--,RTS.[Status_Type_Group_Code] AS 'Major Group'
		,substring(ATS.[ShKey],10,1) as 'Shift'

FROM [dbo].[ALLOCTNTIMESTAMP] as ATS 
	Join [dbo].[MEASURETIMESTAMP] as MTS on MTS.[TSKey] = ATS.[TSKey]
	Join [dbo].[RD_STATUS]        as RDS on RDS.[StatusCode] = ATS.[Status]
	Join [dbo].[RD_STATUS_CATEGORY] as RDC on RDC.[Status_CategoryCode] = RDS.[Status_Category_Code]
    --Join [dbo].[RD_STATUS_TYPE] as RTS on RTS.[Status_TypeCode] = RDC.[Status_Category_Type_Code]
	--Join [dbo].[RD_OPERATORS] as RDO on RDO.[OperatorCode] = ATS.Operator
	Join [dbo].[RD_EQUIPMENT] as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
    Join [dbo].[RD_EQUIPMENT_MODEL] as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
    Join [dbo].[RD_EQUIPMENT_FUNCTION] as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
    --Join [dbo].[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]

	WHERE MTS.MeasCode = 'SECONDS' and RDF.[Equipment_FunctionCode] in ('LOADING','HAULING','P','D') and left(ats.[shkey],8) BETWEEN convert(varchar, getdate()-366, 112) AND convert(varchar, getdate(), 112)