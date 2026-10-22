import {fail} from './middleware.js';
export const text=(v,max=100)=>typeof v==='string'?v.trim().slice(0,max):'';
export function validEmail(v){return typeof v==='string'&&v.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
export function password(v){if(typeof v!=='string'||v.length<10||Buffer.byteLength(v)>72)throw fail(400,'Password must be at least 10 characters and at most 72 UTF-8 bytes.');return v;}
export function farmInput(b){
 const f={};for(const k of ['name','district','state','soil','crop','previousCrop','stage','season'])f[k]=text(b[k],k==='previousCrop'?40:80);
 for(const k of ['latitude','longitude','areaHa','ph','n','p','k']){if(b[k]===''||b[k]===null||b[k]===undefined)throw fail(400,`Enter ${k}; use 0 for an unprovided soil nutrient.`);f[k]=Number(b[k]);if(!Number.isFinite(f[k]))throw fail(400,`Invalid ${k}.`);}
 if(!/^\d{4}-\d{2}-\d{2}$/.test(b.sowingDate||''))throw fail(400,'Enter a valid sowing date.');f.sowingDate=new Date(b.sowingDate);if(!Number.isFinite(+f.sowingDate))throw fail(400,'Invalid sowing date.');
 if(!f.name||!f.district||!f.state)throw fail(400,'Farm name, district and state are required.');return f;
}
export function marketInput(b){const m={};for(const k of ['crop','mandi','district','state'])m[k]=text(b[k],80);for(const k of ['min','modal','max']){if(b[k]===''||b[k]==null)throw fail(400,'All price fields are required.');m[k]=Number(b[k]);if(!Number.isFinite(m[k])||m[k]<0)throw fail(400,'Invalid price.');}if(!(m.min<=m.modal&&m.modal<=m.max))throw fail(400,'Require minimum ≤ modal ≤ maximum.');m.date=new Date(b.date);if(!Number.isFinite(+m.date)||!m.mandi||!m.district||!m.state)throw fail(400,'Enter market, location and a valid date.');m.source='manual';return m;}
export function imageInput(v){if(typeof v!=='string'||v.length>4200000)throw fail(400,'Upload a JPEG or PNG under 3 MB.');const m=v.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/);if(!m)throw fail(400,'Only PNG and JPEG images are accepted.');const b=Buffer.from(m[2],'base64');const ok=m[1]==='png'?b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):b[0]===255&&b[1]===216&&b[2]===255;if(!ok||b.length>3*1024*1024||b.length<16)throw fail(400,'Invalid image or image too large.');return v;}
