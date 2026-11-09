import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {CalendarEvent} from './Calendar';
import './planning.css';

type Step={key:string;title:string;date:string};
const todayKst=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function validDate(date:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;const parsed=new Date(`${date}T00:00:00Z`);return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===date;}
function shiftDate(date:string,days:number){const value=new Date(`${date}T00:00:00Z`);value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10)}
function buildSteps(deadline:string,today:string):Step[]{return [
 {key:'conditions',title:'참가 조건과 신청 방법 확인',date:shiftDate(deadline,-7)},
 {key:'materials',title:'제출물과 준비 일정 확인',date:shiftDate(deadline,-3)},
 {key:'submit',title:'신청·제출 여부 확인',date:deadline},
].map(step=>({...step,date:step.date<today?today:step.date}));}
type Props={id:string;title:string;deadline:string|null;demo:boolean;events:CalendarEvent[];onAdd:(events:CalendarEvent[])=>void;onClose:()=>void};
export default function PlanBuilder({id,title,deadline,demo,events,onAdd,onClose}:Props){
 const today=demo?'2026-11-10':todayKst();
 const usable=deadline&&validDate(deadline)&&deadline>=today?deadline:'';
 const [target,setTarget]=useState(usable);
 const [steps,setSteps]=useState<Step[]>(()=>usable?buildSteps(usable,today):[]);
 const [error,setError]=useState('');
 const [done,setDone]=useState('');
 const dialog=useRef<HTMLElement>(null);
 useEffect(()=>{const old=document.activeElement as HTMLElement|null;dialog.current?.focus();function onKey(e:KeyboardEvent){if(e.key==='Escape'){onClose();return}if(e.key==='Tab'){const items=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled])')||[]);if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}document.addEventListener('keydown',onKey);return()=>{document.removeEventListener('keydown',onKey);old?.focus()}},[]);
 const existing=new Set(events.map(e=>e.planId).filter(Boolean));
 const fresh=steps.filter(s=>!existing.has(`${id}:${s.key}`));
 function createPreview(){if(!validDate(target)||target<today){setError('오늘 이후의 기준 날짜를 선택해 주세요.');return}setSteps(buildSteps(target,today));setDone('');setError('')}
 function submit(e:FormEvent){e.preventDefault();if(!fresh.length){setError('추가할 새 일정이 없어요. 이미 추가된 일정은 캘린더에서 수정할 수 있어요.');return}if(fresh.some(s=>!s.title.trim()||!validDate(s.date)||s.date<today)){setError('추가할 일정의 이름과 오늘 이후 날짜를 확인해 주세요.');return}onAdd(fresh.map(s=>({id:crypto.randomUUID(),title:`${title} · ${s.title.trim()}`,date:s.date,endDate:s.date,planId:`${id}:${s.key}`})));setError('');setDone(`${fresh.length}개의 일정을 캘린더에 추가했어요.`)}
 return <div className="plan-overlay"><section ref={dialog} className="plan-dialog" role="dialog" aria-modal="true" aria-labelledby="plan-title" tabIndex={-1}><div className="plan-dialog-head"><div><span className="sectionnum">MY PLAN</span><h2 id="plan-title">준비 계획 만들기</h2><p>{title}</p></div><button className="plan-close" type="button" onClick={onClose} aria-label="준비 계획 닫기">×</button></div>
 <div className="plan-info">공고에 공통으로 적용할 수 있는 <strong>수정 가능한 일정 초안</strong>이에요. 제출물과 실제 마감 시각은 원문에서 확인해 주세요.</div>
 <label className="plan-target">기준 날짜 <small>{deadline?'수집된 마감일은 원문에서 재확인':'원문을 확인한 후 직접 입력'}</small><input type="date" value={target} min={today} onChange={e=>{setTarget(e.target.value);setSteps([]);setError('');setDone('')}}/></label><button type="button" className="plan-preview-button" onClick={createPreview}>일정 초안 만들기</button>
 {deadline&&deadline<today&&<p className="plan-helper">저장된 공고의 마감일이 지났어요. 변경·연장 여부는 원문에서 확인해 주세요.</p>}
 <form onSubmit={submit}><div className="plan-steps">{steps.map((step,i)=>{const added=existing.has(`${id}:${step.key}`);return <div className="plan-step" key={step.key}><span>{String(i+1).padStart(2,'0')}</span><label>준비할 일<input value={step.title} disabled={added} maxLength={80} onChange={e=>setSteps(old=>old.map(x=>x.key===step.key?{...x,title:e.target.value}:x))}/></label><label>날짜<input type="date" disabled={added} min={today} value={step.date} onChange={e=>setSteps(old=>old.map(x=>x.key===step.key?{...x,date:e.target.value}:x))}/></label><button type="button" disabled={added} onClick={()=>setSteps(old=>old.filter(x=>x.key!==step.key))} aria-label={`${step.title} 초안에서 제외`}>×</button>{added&&<small>캘린더에 추가됨</small>}</div>})}</div>
 {error&&<p className="plan-error" role="alert">{error}</p>}{done&&<p className="plan-success" role="status">{done}</p>}
 <div className="plan-actions"><button type="button" className="secondary" onClick={onClose}>닫기</button><button type="submit" className="primary" disabled={!steps.length||!fresh.length}>선택한 일정 캘린더에 추가</button></div></form>
 </section></div>;
}
