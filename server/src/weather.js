import {config} from './config.js';
const cache=new Map();
export async function getWeather(farm){
 const key=`${farm.latitude.toFixed(2)},${farm.longitude.toFixed(2)}`;
 const hit=cache.get(key);if(hit&&Date.now()-hit.at<600000)return hit.value;
 if(config.liveWeather){try{
 const url=new URL('https://api.open-meteo.com/v1/forecast');
 url.search=new URLSearchParams({latitude:String(farm.latitude),longitude:String(farm.longitude),current:'temperature_2m,relative_humidity_2m,wind_speed_10m',daily:'precipitation_sum',timezone:'auto',forecast_days:'3'}).toString();
 const res=await fetch(url,{signal:AbortSignal.timeout(6500)});if(!res.ok)throw new Error('Weather provider unavailable');const d=await res.json();
 const w={temperature:d.current.temperature_2m,humidity:d.current.relative_humidity_2m,wind:d.current.wind_speed_10m,rainfall:d.daily.precipitation_sum[0],forecast:d.daily.time.map((date,i)=>({date,rainfall:d.daily.precipitation_sum[i]})),source:'Open-Meteo live forecast',sample:false,observedAt:d.current.time,timezone:d.timezone};
 if(![w.temperature,w.humidity,w.wind,w.rainfall].every(Number.isFinite))throw new Error('Invalid provider response');
 cache.set(key,{at:Date.now(),value:w});if(cache.size>500)cache.delete(cache.keys().next().value);return w;
 }catch{ return demo('Live provider unavailable; illustrative fallback');}}
 return demo('Offline illustrative weather; not local observations');
}
function demo(source){return {temperature:31,humidity:82,wind:12,rainfall:12,forecast:[],source,sample:true,observedAt:null,timezone:null};}
