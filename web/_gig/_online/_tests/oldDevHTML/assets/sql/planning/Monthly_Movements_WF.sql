
SELECT DISTINCT 

SC.[Source_Material] as 'Material Type'
,SC.[Source_Category] as 'Category'
,substring(ats.Location,5,3) as 'drive number'
,SUM(MTS.[MeasureValue]) as 'Tonnes'

FROM  [dbo].[ALLOCTNTIMESTAMP] AS ATS
	LEFT JOIN [dbo].[MEASURETIMESTAMP] AS MTS ON MTS.TSKey = ATS.TSKey
	LEFT JOIN [dbo].RD_PARENTLOCATIONS as SC on SC.Source_Code = ATS.Location
	LEFT JOIN[dbo].[RD_STATUS] AS ST ON ST.[StatusCode] = ATS.[Status] 

WHERE left(ATS.[ShKey],6) = 201810
	AND SC.[Source_MineArea_Code] = 'WF'
	AND MTS.[MeasCode] = 'TONNE'
	AND SC.[Source_Material] = 'Ore'
	AND SC.[Source_Category] <> 'stockpile'
group by SC.[Source_Material], substring(ats.Location,5,3), SC.[Source_Category]
order by substring(ats.Location,5,3)