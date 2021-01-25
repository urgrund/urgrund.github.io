
--Declare @Date as varchar(8)
--Set @Date = '20181010'


SELECT [Asset ID], [Mine Names], [Metric], [Secondy Activity Type], 
[6], [7] , [8] , [9] , [10] , [11] , [12] , [13] , [14] , [15] , [16] , [17] , [18] , [19] , [20] , [21] , [22] , [23] , [0] , [1] , [2] , [3]  , [4] , [5]  
FROM  
 
 (	Select
		ATS.[Equipment] as 'Asset ID'
		,RDP.[Source_MineArea_Code] as 'Mine Names'
		,mts.MeasCode as 'Metric'
		,MTS.[MeasureValue] as 'values'
		,datepart(hour, MTS.[EventDateTime]) as 'Timeblock'
		,RDP.[Source_Category] AS 'Secondy Activity Type'
		FROM dbo.ALLOCTNTIMESTAMP AS ATS JOIN
             dbo.MEASURETIMESTAMP AS MTS ON MTS.TSKey = ATS.TSKey
	    JOIN dbo.[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]
		JOIN dbo.[RD_EQUIPMENT] as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
		JOIN dbo.[RD_EQUIPMENT_MODEL] as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
		JOIN dbo.[RD_EQUIPMENT_FUNCTION] as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
		WHERE LEFT(ats.[shkey],8) = @Date and MTS.MeasCode in ('FACEMETRE','INSMESHSTROVRLAP','INSMESHGALVL', 'INSMESHGALV', 'TOTALBOLTS', 'TONNE', 'PRODMTRSDRILL', 'TOTGSMTR', 'TOTOTHERMTRS') and RDF.[Equipment_FunctionCode] in ('LOADING','HAULING','P','D') 
 ) as SC  
  PIVOT  
  (sum(SC.[values])  
	FOR  SC.[timeblock] IN ([6], [7], [8], [9], [10], [11], [12], [13], [14], [15], [16], [17], [18], [19], [20], [21], [22], [23], [0], [1], [2], [3], [4], [5])
) AS PVT order by [Asset ID] asc

