// Transparent educational rules, NOT trained ML models or agronomic prescriptions.
export const cropProfiles=[
 {crop:'rice',soil:['clay','loamy'],seasons:['kharif'],temp:[22,35],ph:[5.5,7.5],rain:[5,40],note:'Water availability and local variety selection are critical.'},
 {crop:'maize',soil:['loamy','red'],seasons:['kharif','rabi'],temp:[18,33],ph:[5.5,7.5],rain:[1,15],note:'Check drainage and locally recommended planting windows.'},
 {crop:'groundnut',soil:['sandy','red','loamy'],seasons:['kharif','summer'],temp:[22,32],ph:[6,7.5],rain:[0,10],note:'Avoid waterlogging; consult local guidance on calcium needs.'},
 {crop:'cotton',soil:['black','loamy'],seasons:['kharif'],temp:[21,35],ph:[6,8],rain:[1,15],note:'Assess pest history and water supply before selection.'},
 {crop:'tomato',soil:['loamy','red'],seasons:['rabi','summer'],temp:[18,29],ph:[6,7],rain:[0,8],note:'Plan drainage, disease monitoring and access to a nearby market.'},
 {crop:'millet',soil:['sandy','red','loamy'],seasons:['kharif','summer'],temp:[24,36],ph:[5.5,8],rain:[0,8],note:'Consider locally adapted varieties and seasonal water availability.'}
];
const inside=(x,[a,b])=>x>=a&&x<=b;
export function recommend(farm,weather){
 return cropProfiles.map(p=>{let score=0;const reasons=[];const add=(ok,n,reason)=>{if(ok){score+=n;reasons.push(reason)}};
 add(p.soil.includes(farm.soil),30,'Soil type matches the example crop profile');
 add(p.seasons.includes(farm.season),25,'Season matches the example planting profile');
 add(inside(farm.ph,p.ph),20,'Entered soil pH is within the example range');
 add(inside(weather.temperature,p.temp),15,'Current temperature matches the example range');
 add(inside(weather.rainfall,p.rain),10,'Today’s rainfall matches the simple weather heuristic');
 if(farm.previousCrop===p.crop){score=Math.max(0,score-10);reasons.push('10-point repeated-crop penalty; review rotation needs');}
 return {crop:p.crop,score,reasons,note:p.note};}).sort((a,b)=>b.score-a.score);
}
export function weatherAdvice(farm,w){const out=[];const add=(category,level,title,message)=>out.push({category,level,title,message});
 if(w.rainfall>=10)add('rain','warning','Rainfall precaution','Postpone non-essential spraying and inspect drainage; verify the local forecast.');
 if(w.temperature>=35)add('heat','warning','Heat-stress watch','Inspect the crop for stress; consider cooler hours for field work.');
 if(w.wind>=20)add('spray','warning','Windy conditions','Avoid spraying during strong wind; follow product labels and local advice.');
 if(w.humidity>=80)add('disease','warning','Humid-condition disease watch','Inspect both sides of leaves for new lesions. Weather alone cannot diagnose disease.');
 if(w.rainfall<2&&w.temperature>=30)add('irrigation','info','Check soil moisture','Inspect root-zone moisture before deciding whether irrigation is needed.');
 if(farm.stage==='flowering')add('crop','info','Flowering-stage check','Inspect moisture stress and pest activity; avoid unnecessary crop disturbance.');
 if(!out.length)add('weather','info','Routine field check','No example weather threshold is triggered. Continue field inspection and local forecast checks.');
 return out;
}
export function fertilizerAdvice(f){
 const levels={n:f.n===0?'not supplied':f.n<100?'low in this demo':f.n<250?'medium in this demo':'high in this demo',p:f.p===0?'not supplied':f.p<20?'low in this demo':f.p<50?'medium in this demo':'high in this demo',k:f.k===0?'not supplied':f.k<100?'low in this demo':f.k<250?'medium in this demo':'high in this demo'};
 return {levels,units:'N, P and K inputs are soil-test values in kg/ha. Demo thresholds are not calibrated to a laboratory method.',suggestions:[{nutrient:'Nitrogen',type:'Nitrogen source such as urea, only if recommended by a local agronomist',schedule:f.stage==='maturity'?'Do not infer a late nitrogen need from this tool.':'Ask about split applications appropriate to crop and stage.'},{nutrient:'Phosphorus',type:'Phosphorus-containing fertilizer selected using the soil-test report',schedule:'Confirm basal application needs before sowing; do not automatically repeat an application.'},{nutrient:'Potassium',type:'Potassium source only where a validated soil test indicates a need',schedule:'Confirm timing and dose for the crop, soil and local recommendations.'}],warning:'No fertilizer dose is calculated. Crop-specific soil-test calibration, nutrient form, irrigation and local guidance are required. Zero means not supplied, not a verified deficiency.'};
}
const conditions=[
 {name:'Leaf-spot-like symptoms',symptoms:['spots','yellowing'],crops:['rice','maize','groundnut','cotton','tomato','millet'],action:'Photograph both sides of affected leaves and ask a local plant clinic to identify the cause.'},
 {name:'Blight-like symptoms',symptoms:['spots','browning','wilting'],crops:['tomato','rice','maize'],action:'Inspect progression, avoid moving affected plant material, and seek expert confirmation.'},
 {name:'Powdery-coating symptoms',symptoms:['powder','yellowing'],crops:['tomato','cotton','groundnut'],action:'Check whether the white material rubs off; submit clear close-up photographs for expert review.'},
 {name:'Possible sucking-pest injury',symptoms:['insects','curling','yellowing'],crops:['cotton','tomato','groundnut','rice','maize','millet'],action:'Inspect leaf undersides for insects; confirm pest identity before selecting any treatment.'},
 {name:'Possible water or root stress',symptoms:['wilting','yellowing'],crops:['rice','maize','groundnut','cotton','tomato','millet'],action:'Check soil moisture and root condition. Both too much and too little water can look similar.'}
];
export const symptomOptions=['spots','yellowing','browning','wilting','powder','curling','insects'];
export function screenDisease(crop,symptoms){
 const matches=conditions.filter(c=>c.crops.includes(crop)).map(c=>({...c,matched:c.symptoms.filter(s=>symptoms.includes(s))})).filter(c=>c.matched.length).sort((a,b)=>b.matched.length-a.matched.length).slice(0,3).map(c=>({name:c.name,matched:c.matched,score:Math.round(c.matched.length/c.symptoms.length*100),action:c.action}));
 return {method:'Symptom-rule screening; image stored for review, not used to diagnose disease',matches,summary:matches.length?'Possible symptom patterns, not a diagnosis.':'No symptom rule matched. This does not mean the plant is healthy.',warning:'Scores are rule coverage, NOT AI confidence or disease probability. Image colour metrics are client-generated and not trusted for diagnosis. A trained, validated image model is not included.'};
}
