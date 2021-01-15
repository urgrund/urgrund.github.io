Select
		 LEFT(ATS.[SHkey],8) as 'Date'
		,RDP.[Source_MineArea_Code] as 'Mine Names'
		,ATS.[Location] AS 'Location'
		,RDP.[Source_DevPrd] AS 'Secondy Activity Type'
		,sum(MTS.[MeasureValue]) as 'Values'
	FROM dbo.ALLOCTNTIMESTAMP AS ATS JOIN
         dbo.MEASURETIMESTAMP AS MTS ON MTS.TSKey = ATS.TSKey
    left JOIN dbo.[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]
    left JOIN dbo.[RD_EQUIPMENT] as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
    left JOIN dbo.[RD_EQUIPMENT_MODEL] as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
	left JOIN dbo.[RD_EQUIPMENT_FUNCTION] as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
	WHERE substring(ats.[shkey],1,4) = @Year and substring(ats.[shkey],5,2) = @Month and MTS.MeasCode ='TONNE' and RDF.[Equipment_FunctionCode] = 'LOADING' and RDP.[Source_DevPrd] like '%Production%'
	GROUP BY RDP.[Source_MineArea_Code] 
			,ATS.[Location] 
			,left(ats. [SHkey],8) 
			,RDP.[Source_DevPrd] 
	ORDER BY left(ats. [SHkey],8),  RDP.[Source_MineArea_Code] desc 