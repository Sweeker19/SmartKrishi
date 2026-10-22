import React from 'react';
import {cap} from './api';
export function Field({label,children,hint}){return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;}
export function Select({value,onChange,options,...props}){return <select value={value} onChange={onChange} {...props}>{options.map(o=><option key={typeof o==='string'?o:o.value} value={typeof o==='string'?o:o.value}>{typeof o==='string'?cap(o):o.label}</option>)}</select>;}
export function Notice({children,type='info'}){return <div className={'notice '+type} role={type==='danger'?'alert':'status'}>{children}</div>;}
export function Empty({title,children}){return <div className="empty"><div className="empty-icon">♧</div><h3>{title}</h3><p>{children}</p></div>;}
export function Heading({eyebrow='YOUR FARM, CONNECTED',title,children,action}){return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{children&&<p>{children}</p>}</div>{action}</div>;}
export function Panel({title,tag,children,className=''}){return <section className={'panel '+className}><div className="panel-head"><h2>{title}</h2>{tag&&<span className="badge">{tag}</span>}</div>{children}</section>;}
export function Metric({label,value,unit,icon}){return <div className="metric"><span className="metric-icon">{icon}</span><small>{label}</small><strong>{value}<em>{unit}</em></strong></div>;}
export function SourceTag({sample}){return <span className={'badge '+(sample?'amber':'green')}>{sample?'SAMPLE DATA':'LIVE WEATHER'}</span>;}
export function Busy(){return <div className="loading" role="status"><span className="spinner"/> Loading your farm workspace…</div>;}
