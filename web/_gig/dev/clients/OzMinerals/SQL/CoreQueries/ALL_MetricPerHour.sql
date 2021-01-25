
SELECT [Asset ID], [Mine Names], [Metric], [Secondy Activity Type], 
[7] , [8] , [9] , [10] , [11] , [12] , [13] , [14] , [15] , [16] , [17] , [18] , [19] , [20] , [21] , [22] , [23] , [0] , [1] , [2] , [3]  , [4] , [5],  [6]
FROM  
 
 (	Select distinct
		ATS.[Equipment] as 'Asset ID'
		,RDP.[Source_MineArea_Code] as 'Mine Names'
		,mts.MeasCode as 'Metric'
		,RDF.[Equipment_FunctionCode]
		,MTS.[MeasureValue] as 'values'
		,datepart(hour, MTS.[EventDateTime]) as 'Timeblock'
		--,RDP.[Source_DevPrd] AS 'Secondy Activity Type'
		,RDP.[Source_Envelope]  AS 'Secondy Activity Type'
		
		FROM dbo.ALLOCTNTIMESTAMP AS ATS JOIN
             dbo.MEASURETIMESTAMP AS MTS ON MTS.TSKey = ATS.TSKey
	    JOIN dbo.[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]
		JOIN dbo.[RD_EQUIPMENT] as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
		JOIN dbo.[RD_EQUIPMENT_MODEL] as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
		JOIN dbo.[RD_EQUIPMENT_FUNCTION] as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
		WHERE LEFT(ats.[shkey],8) = @Date  and MTS.MeasCode in ('BOLT15SPLITSET','BOLT24RESIN','BOLT24SPLITSET', 'BOLT24STIFF', 'BOLT30RESIN', 'TONNE','DRILLED102MM','DRILLREAM4.6','TOTALDEVBOLTMETRES','TOTALDEVFACEMETRES','TOTALDEVMETRES','TOTALPRIMPRODMETRES','TOTALPRODMETRES' )  and  RDF.[Equipment_FunctionCode] in ('LOADING','HAULING', 'PRODDRILL','DEVDRILL') 
 ) as SC  
  PIVOT  
  (sum(SC.[values])  
	FOR  SC.[timeblock] IN ( [7], [8], [9], [10], [11], [12], [13], [14], [15], [16], [17], [18], [19], [20], [21], [22], [23], [0], [1], [2], [3], [4], [5], [6])
) AS PVT order by [Asset ID] asc




