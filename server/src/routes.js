import {Router} from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {User,Farm,Alert,Scan,Market} from './models.js';
import {auth,admin,wrap,fail,session,publicUser,rateLimit} from './middleware.js';
import {text,validEmail,password,farmInput,marketInput,imageInput} from './validation.js';
import {recommend,weatherAdvice,fertilizerAdvice,screenDisease,symptomOptions} from './engine.js';
import {getWeather} from './weather.js';
import {config} from './config.js';
export const api=Router();
const authLimiter=rateLimit(20,15*60000);
api.get('/health',(req,res)=>res.json({ok:mongoose.connection.readyState===1,service:'smartkrishi-api'}));
api.post('/auth/register',authLimiter,wrap(async(req,res)=>{const name=text(req.body.name,80),email=text(req.body.email,254).toLowerCase();if(!name||!validEmail(email))throw fail(400,'Enter your name and a valid email.');const hash=await bcrypt.hash(password(req.body.password),12);const u=await User.create({name,email,passwordHash:hash});session(res,u);res.status(201).json(publicUser(u));}));
api.post('/auth/login',authLimiter,wrap(async(req,res)=>{const email=text(req.body.email,254).toLowerCase();if(!validEmail(email)||typeof req.body.password!=='string'||req.body.password.length>200)throw fail(400,'Invalid sign-in details.');const u=await User.findOne({email}).select('+passwordHash');if(!u||!await bcrypt.compare(req.body.password,u.passwordHash))throw fail(401,'Incorrect email or password.');session(res,u);res.json(publicUser(u));}));
api.post('/auth/logout',(req,res)=>{res.clearCookie('session',{httpOnly:true,secure:config.production,sameSite:'strict',path:'/'});res.json({ok:true});});
api.use(auth);
api.get('/auth/me',(req,res)=>res.json(publicUser(req.user)));
api.patch('/auth/me',wrap(async(req,res)=>{const name=text(req.body.name,80);if(!name)throw fail(400,'Name is required.');req.user.name=name;await req.user.save();res.json(publicUser(req.user));}));
async function ownFarm(id,user){if(!mongoose.isValidObjectId(id))throw fail(400,'Invalid farm ID.');const f=await Farm.findOne({_id:id,owner:user._id});if(!f)throw fail(404,'Farm not found.');return f;}
api.get('/farms',wrap(async(req,res)=>res.json(await Farm.find({owner:req.user._id}).sort({createdAt:-1}))));
api.post('/farms',wrap(async(req,res)=>{if(await Farm.countDocuments({owner:req.user._id})>=50)throw fail(400,'Maximum 50 farms per account.');res.status(201).json(await Farm.create({...farmInput(req.body),owner:req.user._id}));}));
api.put('/farms/:id',wrap(async(req,res)=>{const f=await ownFarm(req.params.id,req.user);Object.assign(f,farmInput(req.body));await f.save();res.json(f);}));
api.delete('/farms/:id',wrap(async(req,res)=>{const f=await ownFarm(req.params.id,req.user);await Scan.deleteMany({farm:f._id,owner:req.user._id});await Alert.deleteMany({farm:f._id,owner:req.user._id});await f.deleteOne();res.json({ok:true});}));
async function recordAlerts(user,farm,items){const day=new Date().toISOString().slice(0,10);for(const a of items){const dedupe=`${user._id}:${farm._id}:${a.category}:${day}`;await Alert.updateOne({dedupe},{$setOnInsert:{...a,owner:user._id,farm:farm._id,dedupe,read:false}},{upsert:true});}}
api.get('/farms/:id/intelligence',wrap(async(req,res)=>{const f=await ownFarm(req.params.id,req.user),weather=await getWeather(f);res.json({weather,crops:recommend(f,weather),advisories:weatherAdvice(f,weather),fertilizer:fertilizerAdvice(f),disclaimer:'Educational decision support. Rule scores are not probabilities. Sample inputs must not guide real field decisions.'});}));
api.post('/farms/:id/alerts/refresh',wrap(async(req,res)=>{
 const f=await ownFarm(req.params.id,req.user),w=await getWeather(f);
 const items=weatherAdvice(f,w).map(a=>({...a,message:(w.sample?'[SAMPLE WEATHER] ':'')+a.message}));
 if(w.humidity>=80&&w.temperature>=25)items.push({category:'pest',level:'info',title:'Pest scouting reminder',message:(w.sample?'[SAMPLE WEATHER] ':'')+'Warm, humid conditions triggered an illustrative scouting rule. Inspect leaves for insects; this is not a pest forecast.'});
 if(['sowing','vegetative','flowering'].includes(f.stage))items.push({category:'fertilizer',level:'info',title:'Nutrient planning reminder',message:`Review your soil-test-based nutrient plan for the ${f.stage} stage. Confirm timing with an agronomist; this is not a direction to apply fertilizer.`});
 const quotes=await Market.find({crop:f.crop,district:f.district}).sort({date:-1}).limit(100);
 const groups=new Map();for(const q of quotes){const key=JSON.stringify([q.mandi,q.source]);if(!groups.has(key))groups.set(key,[]);const g=groups.get(key);if(g.length<2)g.push(q);}
 for(const [key,g]of groups){if(g.length===2&&g[1].modal>0){const change=(g[0].modal-g[1].modal)/g[1].modal*100;if(Math.abs(change)>=1){items.push({category:'market:'+key,level:'info',title:'Market quotation change',message:`${g[0].source==='sample'?'[SAMPLE PRICES] ':'[MANUAL PRICES] '}${g[0].mandi}: modal ${f.crop} price changed ${change.toFixed(1)}% between ${g[1].date.toISOString().slice(0,10)} and ${g[0].date.toISOString().slice(0,10)}. This is historical, not a price prediction.`});}}}
 await recordAlerts(req.user,f,items);res.json({ok:true,sample:w.sample});
}));
api.get('/scans',wrap(async(req,res)=>{const filter={owner:req.user._id};if(req.query.farm){await ownFarm(req.query.farm,req.user);filter.farm=req.query.farm;}res.json(await Scan.find(filter).select('-image').sort({createdAt:-1}).limit(30));}));
api.get('/scans/:id',wrap(async(req,res)=>{if(!mongoose.isValidObjectId(req.params.id))throw fail(400,'Invalid scan ID.');const s=await Scan.findOne({_id:req.params.id,owner:req.user._id});if(!s)throw fail(404,'Scan not found.');res.json(s);}));
api.post('/scans',rateLimit(20,3600000),wrap(async(req,res)=>{const f=await ownFarm(req.body.farm,req.user);const symptoms=Array.isArray(req.body.symptoms)?[...new Set(req.body.symptoms.filter(s=>symptomOptions.includes(s)))]:[];const image=imageInput(req.body.image);const visual={};for(const k of ['greenPercent','yellowPercent','brownPercent']){const v=Number(req.body.visual?.[k]);if(Number.isFinite(v)&&v>=0&&v<=100)visual[k]=v;}
 const result=screenDisease(f.crop,symptoms);const s=await Scan.create({owner:req.user._id,farm:f._id,image,symptoms,visual,result});await recordAlerts(req.user,f,[{category:'screening',title:'Leaf screening saved',level:'info',message:result.summary+' Expert confirmation is required.'}]);res.status(201).json(s);}));
api.delete('/scans/:id',wrap(async(req,res)=>{if(!mongoose.isValidObjectId(req.params.id))throw fail(400,'Invalid scan ID.');const s=await Scan.findOneAndDelete({_id:req.params.id,owner:req.user._id});if(!s)throw fail(404,'Scan not found.');res.json({ok:true});}));
api.get('/markets',wrap(async(req,res)=>{const filter={};if(req.query.crop)filter.crop=text(req.query.crop,30);if(req.query.district)filter.district=text(req.query.district,80);res.json(await Market.find(filter).sort({date:-1,mandi:1}).limit(300));}));
api.post('/markets',admin,wrap(async(req,res)=>res.status(201).json(await Market.create(marketInput(req.body)))));
api.delete('/markets/:id',admin,wrap(async(req,res)=>{if(!mongoose.isValidObjectId(req.params.id))throw fail(400,'Invalid price ID.');const m=await Market.findByIdAndDelete(req.params.id);if(!m)throw fail(404,'Price not found.');res.json({ok:true});}));
api.get('/alerts',wrap(async(req,res)=>res.json(await Alert.find({owner:req.user._id}).sort({createdAt:-1}).limit(100))));
api.patch('/alerts/read-all',wrap(async(req,res)=>{await Alert.updateMany({owner:req.user._id,read:false},{$set:{read:true}});res.json({ok:true});}));
api.patch('/alerts/:id/read',wrap(async(req,res)=>{if(!mongoose.isValidObjectId(req.params.id))throw fail(400,'Invalid alert ID.');const a=await Alert.findOneAndUpdate({_id:req.params.id,owner:req.user._id},{$set:{read:true}},{new:true});if(!a)throw fail(404,'Alert not found.');res.json(a);}));
