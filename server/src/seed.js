import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {config} from './config.js';
import {Market,User} from './models.js';
import {password,validEmail} from './validation.js';
try {
 await mongoose.connect(config.mongo,{serverSelectionTimeoutMS:10000});
 const crops={rice:2300,maize:2100,groundnut:6200,cotton:7000,tomato:1800,millet:2600};
 const mandis=[['Koyambedu','Chennai',1.04],['Gandhipuram','Coimbatore',1],['Dindigul market','Dindigul',0.98]];
 let inserted=0;
 for(const [crop,base]of Object.entries(crops))for(const[mandi,district,factor]of mandis)for(let i=6;i>=0;i--){const date=new Date();date.setUTCHours(0,0,0,0);date.setUTCDate(date.getUTCDate()-i);const modal=Math.round(base*factor*(1+(3-i)*0.012));const r=await Market.updateOne({crop,mandi,date,source:'sample'},{$setOnInsert:{crop,mandi,district,state:'Tamil Nadu',date,source:'sample',min:Math.round(modal*.9),modal,max:Math.round(modal*1.1)}},{upsert:true});inserted+=r.upsertedCount;}
 if(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD){const email=process.env.ADMIN_EMAIL.trim().toLowerCase();if(!validEmail(email))throw new Error('Invalid ADMIN_EMAIL');password(process.env.ADMIN_PASSWORD);const existing=await User.findOne({email});if(existing){console.log('Existing account not modified. Use a new ADMIN_EMAIL to create an administrator.');}else{await User.create({name:'Market administrator',email,passwordHash:await bcrypt.hash(process.env.ADMIN_PASSWORD,12),role:'admin'});console.log('Administrator created.');}}
 console.log(`${inserted} illustrative market rows inserted. These are not real market quotations.`);
} catch(e){console.error(e.message);process.exitCode=1;}finally{await mongoose.disconnect();}
