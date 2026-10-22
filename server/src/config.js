import dotenv from 'dotenv';
import {fileURLToPath} from 'node:url';
dotenv.config({path:fileURLToPath(new URL('../.env',import.meta.url))});
export const config={port:Number(process.env.PORT)||5000,mongo:process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/smartkrishi',secret:process.env.JWT_SECRET,origin:process.env.CLIENT_ORIGIN||'http://localhost:5173',production:process.env.NODE_ENV==='production',liveWeather:process.env.LIVE_WEATHER!=='false'};
export function validateConfig(){if(!config.secret||config.secret.length<32||config.secret.startsWith('replace-')) throw new Error('Set JWT_SECRET in server/.env to a random string of at least 32 characters.');}
