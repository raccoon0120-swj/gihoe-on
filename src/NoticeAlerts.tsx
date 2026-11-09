import {useEffect,useState} from 'react';
import DeadlineBadge,{deadlineWarning} from './DeadlineBadge';
import {officialDeadline} from './Calendar';
import type {SavedOfficial} from './Calendar';
import {isClosed} from './opportunities';
import type {Opportunity} from './opportunities';
import './planning.css';

export default function NoticeAlerts({demo,opportunities,official,onPrep}:{demo:boolean;opportunities:Opportunity[];official:SavedOfficial[];onPrep:()=>void}){
 const [now,setNow]=useState(()=>new Date());
 useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),60_000);return()=>window.clearInterval(timer)},[]);
 const clock=demo?new Date('2026-11-10T12:00:00+09:00'):now;
 const items=[...opportunities.map(n=>({id:n.id,title:n.title,deadline:n.deadline,deadlineAt:n.deadlineAt,closed:isClosed(n,demo)})),...official.map(n=>({id:n.id,title:n.title,deadline:officialDeadline(n),deadlineAt:undefined,closed:false}))]
  .map(item=>({...item,warning:deadlineWarning(item.deadline,clock,item.deadlineAt,item.closed)})).filter(item=>item.warning).sort((a,b)=>(a.warning?.days||0)-(b.warning?.days||0));
 if(!items.length)return null;
 return <section className="home-deadlines" aria-label="마감이 다가오는 관심 공고"><div className="home-deadlines-head"><div><strong>마감이 다가오는 관심 공고</strong><p>확인된 마감일 기준 7일 이내 공고예요.</p></div><button onClick={onPrep}>내 준비함 →</button></div><ul>{items.slice(0,3).map(item=><li key={item.id}><span>{item.title}</span><DeadlineBadge deadline={item.deadline} deadlineAt={item.deadlineAt} demo={demo} closed={item.closed}/></li>)}</ul>{items.length>3&&<small>외 {items.length-3}건은 내 준비함에서 확인하세요.</small>}</section>;
}
