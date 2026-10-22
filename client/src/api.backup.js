export async function api(path,options={}){let r;try{r=await fetch('/api'+path,{credentials:'include',...options,headers:{'Content-Type':'application/json',...options.headers},body:options.body===undefined?undefined:JSON.stringify(options.body)});}catch{throw new Error('Cannot reach the API. Check that the Node server is running.');}const data=await r.json().catch(()=>({message:'Unexpected server response.'}));if(!r.ok){if(r.status===401&&!path.startsWith('/auth/'))window.dispatchEvent(new Event('session-expired'));throw new Error(data.message||'Request failed.');}return data;}
export const crops=['rice','maize','groundnut','cotton','tomato','millet'];
export const cap=s=>s?String(s).replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase()):'';
export const date=s=>s?new Date(s).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—';
export const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
