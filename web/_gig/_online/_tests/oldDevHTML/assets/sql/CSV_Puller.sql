--20181010
SELECT
    MTS.[EventDateTime] AS 'MEventDateTime'
   , ATS.[ShKey] AS 'Shift'
   , MTS.[MeasCode] AS 'Measure code'
   , MTS.[MeasureValue] AS 'Value'
   , RDE.[Equipment_Description] AS 'Equipment'
   , RDS.[Status_Description] AS 'Status Description'
   , RDF.[Equipment_FunctionCode] AS 'Primary Activity Type'
   , RDP.[Source_Category] AS 'Secondy Activity Type'
   , RDP.[Source_Material] AS 'Source Material'
   , ATS.[Location] AS 'Start Location'
   , RDP.[Source_MineArea_Code] AS 'Mine Start'
   , RDO.[Operator_Description] AS 'Operator'
   , RDD.[Destination_Code] AS 'Finished Area'
   , RTS.[Status_Type_Group_Code] AS 'Major Group'

FROM [dbo].[ALLOCTNTIMESTAMP] as ATS
    Join [dbo].[MEASURETIMESTAMP] as MTS on MTS.[TSKey] = ATS.[TSKey]
    Join [dbo].[RD_STATUS]        as RDS on RDS.[StatusCode] = ATS.[Status]
    Join [dbo].[RD_STATUS_CATEGORY] as RDC on RDC.[Status_CategoryCode] = RDS.[Status_Category_Code]
    Join [dbo].[RD_STATUS_TYPE] as RTS on RTS.[Status_TypeCode] = RDC.[Status_Category_Type_Code]
    Join [dbo].[RD_EQUIPMENT] as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
    Join [dbo].[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]
    Join [dbo].[RD_DESTINATIONS] as RDD on RDD.[DestinationCode] = ATS.[Destn]
    Join [dbo].[RD_EQUIPMENT_MODEL] as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
    Join [dbo].[RD_OPERATORS] as RDO on RDO.[OperatorCode] = ATS.Operator
    Join [dbo].[RD_EQUIPMENT_FUNCTION] as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
where left(ATS.[ShKey],8) between 'FromDate' and 'ToDate'
order by MTS.[EventDateTime] asc 