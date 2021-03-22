--Declare @Year as varchar(4)
--Set @Year = '2021'

--Declare @Month as varchar(2)
--Set @Month = '01'


Select
		 LEFT(ATS.[SHkey],8) as 'Date'
		,RDP.[Source_MineArea_Code] as 'Mine Names'
		,ATS.[Location] AS 'Location'
		,RDP.[Source_Category] AS 'Secondy Activity Type'
		,sum(MTS.[MeasureValue]) as 'Values'
		,case when RDP.[Source_MineArea_Code] = 'SLC' and left(ATS.[Location],4) = '4500' then 'South 4500'
		      when RDP.[Source_MineArea_Code] = 'SLC' and left(ATS.[Location],4) = '4475' and (substring(ATS.[Location],7,3) >=301 or substring(ATS.[Location],7,3) = 5) then 'North 4475'
			  when RDP.[Source_MineArea_Code] = 'SLC' and left(ATS.[Location],4) = '4410' and (substring(ATS.[Location],7,3) >=325 or substring(ATS.[Location],7,3) = 2) then 'North 4410'
			  when RDP.[Source_MineArea_Code] = 'SLC' and left(ATS.[Location],4) = '4410' and (substring(ATS.[Location],7,3) between 307 and 323 or substring(ATS.[Location],7,3) = 8)then 'South 4410'
			  when RDP.[Source_MineArea_Code] = 'SLC' and left(ATS.[Location],4) = '4475' and substring(ATS.[Location],7,3) < 300 then 'South 4475'
			  when RDP.[Source_MineArea_Code] = 'SLC' and left(ATS.[Location],4) = '4440' and (substring(ATS.[Location],7,3) >=308 or substring(ATS.[Location],7,3) = 10) then 'North 4440'
			  when RDP.[Source_MineArea_Code] = 'SLC' and left(ATS.[Location],4) = '4440' and (substring(ATS.[Location],7,3) between 258 and 307 or substring(ATS.[Location],7,3) = 8)then 'South 4440'
			  when RDP.[Source_MineArea_Code] = 'WF' then left(ATS.[Location],4) + ' D' + substring(ats.[location],6,2)+ ' ' + substring(ats.[location],8,3)
			  when RDP.[Source_MineArea_Code] = 'OAKOVER' then left(ATS.[Location],4) + ' 0' + substring(ats.[location],6,2)+ ' ' + substring(ats.[location],8,3)
			  when RDP.[Source_MineArea_Code] = 'FINN' then left(ATS.[Location],4) + ' 0' + substring(ats.[location],6,2)+ ' ' + substring(ats.[location],8,3)
			  when RDP.[Source_MineArea_Code] = 'B30' then left(ATS.[Location],4) + ' 0' + substring(ats.[location],6,2)+ ' ' + substring(ats.[location],8,3)
			  when RDP.[Source_MineArea_Code] = 'TARKIN' then left(ATS.[Location],4) + ' 0' + substring(ats.[location],6,2)+ ' ' + substring(ats.[location],8,3)
			  when RDP.[Source_MineArea_Code] = 'WEDGE' then left(ATS.[Location],4) + ' 0' + substring(ats.[location],6,2)+ ' ' + substring(ats.[location],8,3)
			  when RDP.[Source_MineArea_Code] = 'AReef' then left(ATS.[Location],4) + ' 0' + substring(ats.[location],6,2)+ ' ' + substring(ats.[location],8,3)
			  when RDP.[Source_MineArea_Code] = 'Kylo' then left(ATS.[Location],4) + ' 0' + substring(ats.[location],6,2)+ ' ' + substring(ats.[location],8,3)
			  when left(RDP.[Source_MineArea_Code],1) = 'M' then rtrim(left(RDP.[Source_MineArea_Code],3)) + ' ' + left(ATS.[Location],4) + ' ' + substring(ATS.[Location], CHARINDEX('_', ATS.[Location])-1,1) 
			  else RDP.[Source_MineArea_Code] End as  'Plan Segment'
	   --,LEFT(ATS.[SHkey],4) as 'Year'
	   --,substring(ats.[shkey],5,2) as 'Month' 
	FROM dbo.ALLOCTNTIMESTAMP AS ATS JOIN
         dbo.MEASURETIMESTAMP AS MTS ON MTS.TSKey = ATS.TSKey
    JOIN dbo.[RD_PARENTLOCATIONS] as RDP on RDP.[SourceCode] = ATS.[Location]
    JOIN dbo.[RD_EQUIPMENT] as RDE on RDE.[EquipmentCode] = ATS.[Equipment]
    JOIN dbo.[RD_EQUIPMENT_MODEL] as RDM on RDM.[Equipment_ModelCode] = RDE.[Equipment_Model_Code]
	JOIN dbo.[RD_EQUIPMENT_FUNCTION] as RDF on RDF.[Equipment_FunctionCode] = RDM.[Equipment_Model_Function_Code]
	WHERE substring(ats.[shkey],1,4) > 2018 /*@Year and substring(ats.[shkey],5,2) = @Month*/ and MTS.MeasCode ='TONNE' and RDF.[Equipment_FunctionCode] = 'LOADING' and RDP.[Source_Category] like '%Production%' --and RDP.[Source_MineArea_Code] like '%reef%' -- 
	GROUP BY RDP.[Source_MineArea_Code] 
			,ATS.[Location] 
			,left(ats. [SHkey],8) 
			,RDP.[Source_Category]  
			,LEFT(ATS.[SHkey],4)
	 --  ,substring(ats.[shkey],5,2)
	ORDER BY left(ats. [SHkey],8), RDP.[Source_MineArea_Code] desc , ats.Location desc --,  RDP.[Source_MineArea_Code] desc 