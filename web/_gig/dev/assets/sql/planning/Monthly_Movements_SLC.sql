
SELECT DISTINCT 
left(ats.ShKey,8) as 'Date'
,SC.[Source_Material] as 'Material Type'
,SC.[Source_Category] as 'Category'
,case when left(ATS.[Location],4) = '4440' and (substring(ats.Location,7,3) >= '308' or substring(ats.Location,7,3) ='010') then SUM(MTS.[MeasureValue]) else 0 end as '4440 North Quadrant'
,case when left(ATS.[Location],4) = '4440' and ((substring(ats.Location,7,3) between '258' and '307') or substring(ats.Location,7,3) ='008') then SUM(MTS.[MeasureValue]) else 0 end as '4400 South Quadrant'
,case when left(ATS.[Location],4) = '4475' and (substring(ats.Location,7,3) >= '301' or substring(ats.Location,7,3) ='005') then SUM(MTS.[MeasureValue]) else 0 end as '4475 North Quadrant'
,case when left(ATS.[Location],4) = '4475' and substring(ats.Location,7,3) <= '299' then SUM(MTS.[MeasureValue]) else 0 end as '4475 South Quadrant'
,case when left(ATS.[Location],4) = '4500' then SUM(MTS.[MeasureValue]) else 0 end as '4500 South Quadrant'

FROM  [dbo].[ALLOCTNTIMESTAMP] AS ATS
	LEFT JOIN [dbo].[MEASURETIMESTAMP] AS MTS ON MTS.TSKey = ATS.TSKey
	LEFT JOIN [dbo].RD_PARENTLOCATIONS as SC on SC.Source_Code = ATS.Location
	LEFT JOIN[dbo].[RD_STATUS] AS ST ON ST.[StatusCode] = ATS.[Status] 

WHERE left(ATS.[ShKey],6) = 201810
	AND SC.[Source_MineArea_Code] = 'SLC'
	AND MTS.[MeasCode] = 'TONNE'
	AND SC.[Source_Material] = 'Ore'
	AND SC.[Source_Category] <> 'stockpile'
group by left(ats.ShKey,8), SC.[Source_Material], SC.[Source_Category], left(ATS.[Location],4), substring(ats.Location,7,3)
--order by ats.ShKey