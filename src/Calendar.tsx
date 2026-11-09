import { useState, type FormEvent } from 'react';
import DeadlineBadge from './DeadlineBadge';
import {isClosed} from './opportunities';
import type { Opportunity } from './opportunities';
import './calendar.css';

export type CalendarEvent = { id: string; title: string; date: string; endDate?: string; time?: string; planId?: string };
export type SavedOfficial = { id: string; title: string; kind: string; date: string; url: string; source: string; target?:string; condition?:string; year?:string; checkedAt?:string };
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function officialDeadline(item: SavedOfficial) {
  if (item.kind !== 'goodgil') return null;
  const m = item.date.match(/~\s*(\d{4})\.(\d{2})\.(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}
export function officialUrl(item: SavedOfficial) {
  return item.kind === 'goodgil' ? `https://goodgil.hknu.ac.kr/ptfol/imng/icmpNsbjtPgm/findIcmpNsbjtPgmInfo.do?encSddpbSeq=${item.id.replace('goodgil-', '')}` : item.url;
}
type Props = { demo: boolean; events: CalendarEvent[]; onEvents: (events: CalendarEvent[]) => void; opportunities: Opportunity[]; official: SavedOfficial[]; onDetail: (id: string) => void; onExplore: () => void };
export default function Calendar({ demo, events, onEvents, opportunities, official, onDetail, onExplore }: Props) {
  const today = demo ? '2026-11-10' : new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(today.slice(0,7));
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [editing, setEditing] = useState<string | null>(null);
  const [year, mo] = month.split('-').map(Number);
  const first = new Date(year,mo-1,1).getDay();
  const count = new Date(year,mo,0).getDate();
  const shift = (n: number) => { const d = new Date(year,mo-1+n,1); setMonth(dateKey(d).slice(0,7)); };
  const entries = [
    ...opportunities.map(n => ({id:n.id, title:n.title, date:n.deadline, type:'opportunity' as const, url:'', note:n.timeNote, deadlineAt:n.deadlineAt, closed:isClosed(n,demo)})),
    ...official.map(n => ({id:n.id, title:n.title, date:officialDeadline(n), type:'official' as const, url:officialUrl(n), closed:false})),
    ...events.map(n => ({...n, type:'personal' as const, url:''}))
  ];
  const occursOn = (entry: typeof entries[number], date: string) => !!entry.date && entry.date <= date && (entry.type === 'personal' ? (entry.endDate || entry.date) : entry.date) >= date;
  const selectedEntries = entries.filter(e=>occursOn(e,selected));
  const noDate = entries.filter(e=>!e.date);
  function submit(e: FormEvent) {
    e.preventDefault(); const clean=title.trim(); if(!clean || !startDate || !endDate || endDate < startDate)return;
    const previous=editing?events.find(item=>item.id===editing):undefined;
    const event={...previous,id:editing || crypto.randomUUID(),title:clean,date:startDate,endDate,time};
    onEvents(editing ? events.map(item=>item.id===editing?event:item) : [...events,event]);
    setSelected(startDate); setMonth(startDate.slice(0,7));
    setTitle(''); setTime(''); setEditing(null);
  }
  function selectDate(date: string) { setSelected(date); setStartDate(date); setEndDate(date); setEditing(null); setTitle(''); setTime(''); }
  return <section className="section calendar-section" aria-label="나의 일정">
    <div className="sectionhead"><div><span className="sectionnum">MY CALENDAR</span><h2>나의 일정</h2><p>관심 공고의 마감일과 나만의 일정을 한눈에 확인해요.</p></div><button className="text-link" onClick={onExplore}>공고 찾아보기 →</button></div>
    <div className="calendar-layout"><div className="calendar-main"><div className="calendar-toolbar"><button type="button" onClick={()=>shift(-1)} aria-label="이전 달">‹</button><h3>{year}년 {mo}월</h3><button type="button" onClick={()=>shift(1)} aria-label="다음 달">›</button><button className="calendar-today" type="button" onClick={()=>{setMonth(today.slice(0,7));selectDate(today)}}>오늘</button></div>
      <div className="calendar-grid calendar-weekdays">{['일','월','화','수','목','금','토'].map(d=><span key={d}>{d}</span>)}</div><div className="calendar-grid">{Array.from({length:first},(_,i)=><span key={'blank'+i}/>)}{Array.from({length:count},(_,i)=>{const day=i+1, date=`${month}-${String(day).padStart(2,'0')}`, dayEvents=entries.filter(e=>occursOn(e,date));return <button type="button" key={date} className={`calendar-day${dayEvents.some(e=>e.type==='personal' && e.endDate && e.endDate>e.date)?' has-range':''}${date===selected?' selected':''}${date===today?' today':''}`} aria-label={`${mo}월 ${day}일${date===today?", 오늘":""}, 일정 ${dayEvents.length}개`} aria-current={date===today?"date":undefined} aria-pressed={date===selected} onClick={()=>selectDate(date)}><span>{day}</span>{date===today&&<span className="calendar-today-label" aria-hidden="true">오늘</span>}<span className="calendar-dots">{dayEvents.some(e=>e.type!=='personal')&&<i className="dot-deadline"/>}{dayEvents.some(e=>e.type==='personal')&&<i className="dot-personal"/>}</span></button>})}</div><div className="calendar-legend"><span><i className="dot-deadline"/> 공고 마감</span><span><i className="dot-personal"/> 내 일정</span></div></div>
      <div className="calendar-side"><div className="calendar-side-title"><div><span className="sectionnum">SELECTED DAY</span><h3>{Number(selected.slice(5,7))}월 {Number(selected.slice(8,10))}일의 일정</h3></div><img src={import.meta.env.BASE_URL+'assets/hangyeong-read.png'} alt=""/></div>
      {selectedEntries.length ? <ul className="calendar-list">{selectedEntries.map(e=><li key={e.type+e.id}><span className={e.type==='personal'?'calendar-badge personal':'calendar-badge'}>{e.type==='personal'?'내 일정':'공고 마감'}</span><div>{e.type!=='personal'&&<DeadlineBadge deadline={e.date} deadlineAt={'deadlineAt' in e ? e.deadlineAt : undefined} demo={demo} closed={e.closed}/>}<strong>{e.title}</strong>{e.type==='personal'&&e.endDate&&e.endDate!==e.date&&<small>{e.date} ~ {e.endDate}</small>}{e.type==='personal'&&'time' in e&&e.time&&<small>{e.endDate&&e.endDate!==e.date?'시작 시간 ':''}{e.time}</small>}{e.type==='opportunity'&&<>{'note' in e&&e.note&&<small>{e.note}</small>}<button type="button" onClick={()=>onDetail(e.id)}>공고 상세 보기 →</button></>}{e.type==='official'&&<a href={e.url} target="_blank" rel="noreferrer">공식 공고 보기 ↗</a>}</div>{e.type==='personal'&&<div className="calendar-actions"><button type="button" onClick={()=>{const original=events.find(x=>x.id===e.id);if(original){setEditing(e.id);setTitle(original.title);setTime(original.time||'');setStartDate(original.date);setEndDate(original.endDate||original.date)}}}>수정</button><button type="button" onClick={()=>{onEvents(events.filter(x=>x.id!==e.id));if(editing===e.id){setEditing(null);setTitle('');setTime('');setStartDate(selected);setEndDate(selected)}}}>삭제</button></div>}</li>)}</ul>:<p className="calendar-empty">이 날에는 아직 일정이 없어요.</p>}
      {noDate.length>0&&<details className="calendar-undated"><summary><span className="calendar-undated-icon" aria-hidden="true">!</span><span><strong>마감일 미확인 공고</strong><small>관심 공고 {noDate.length}건 · 원문 확인 필요</small></span><span className="calendar-undated-chevron" aria-hidden="true">⌄</span></summary><div className="calendar-undated-content"><p>게시일은 마감일로 표시하지 않아요. 원문에서 일정을 확인해 주세요.</p>{noDate.map(e=><a key={e.id} href={e.url} target="_blank" rel="noreferrer">{e.title} ↗</a>)}</div></details>}
      <form className="calendar-form" onSubmit={submit}><strong>{editing?'일정 수정':'일정 추가'}</strong><label>일정 이름<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="예: 공모전 팀 회의" maxLength={80} required /></label><div className="calendar-date-fields"><label>시작일<input type="date" required value={startDate} onChange={e=>{const value=e.target.value;setStartDate(value);if(value && (!endDate || endDate<value))setEndDate(value)}}/></label><label>종료일<input type="date" required min={startDate || undefined} value={endDate} onChange={e=>setEndDate(e.target.value)}/></label></div><label><span>시작 시간 <small>(선택)</small></span><input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label><div><button className="primary" type="submit">{editing?'수정 저장':'+ 일정 추가'}</button>{editing&&<button type="button" className="calendar-cancel" onClick={()=>{setEditing(null);setTitle('');setTime('');setStartDate(selected);setEndDate(selected)}}>취소</button>}</div></form></div></div>
  </section>;
}
