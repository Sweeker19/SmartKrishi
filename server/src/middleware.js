import jwt from 'jsonwebtoken';
import {User} from './models.js';
import {config} from './config.js';
export const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
export const fail=(status,message)=>Object.assign(new Error(message),{status});
export const auth=wrap(async(req,res,next)=>{let token;try{token=jwt.verify(req.cookies.session||'',config.secret,{algorithms:['HS256'],issuer:'smartkrishi',audience:'smartkrishi-web'});}catch{throw fail(401,'Please sign in.');}req.user=await User.findById(token.sub);if(!req.user)throw fail(401,'Account not found.');next();});
export function admin(req,res,next){if(req.user.role!=='admin')return next(fail(403,'Administrator access required.'));next();}
export function session(res,user){const token=jwt.sign({},config.secret,{subject:String(user._id),expiresIn:'7d',issuer:'smartkrishi',audience:'smartkrishi-web'});res.cookie('session',token,{httpOnly:true,secure:config.production,sameSite:'strict',maxAge:7*86400000,path:'/'});}
export function publicUser(u){return {id:u.id,name:u.name,email:u.email,role:u.role};}
export function rateLimit(limit,windowMs){const hits=new Map();const cleanup=setInterval(()=>{const now=Date.now();for(const[k,v]of hits)if(v.until<now)hits.delete(k);},60000);cleanup.unref();return(req,res,next)=>{const key=req.ip,now=Date.now();let h=hits.get(key);if(!h||h.until<now)h={n:0,until:now+windowMs};h.n++;hits.set(key,h);if(h.n>limit){res.set('Retry-After',String(Math.ceil((h.until-now)/1000)));return next(fail(429,'Too many requests. Try again later.'));}next();};}
export function checkOrigin(req, res, next) {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.get("origin");

    if (origin && origin !== config.origin) {
      console.warn("ORIGIN MISMATCH:", {
        received: origin,
        allowed: config.origin,
        method: req.method,
        path: req.originalUrl
      });

      return next(
        fail(403, "Request origin not allowed.")
      );
    }
  }

  next();
}
