import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Opportunity } from './opportunities';
import { feedClosed, isClosed, status } from './opportunities';
import type { CalendarEvent, SavedOfficial } from './Calendar';
import type {Profile} from './Profile';
import type {NoticeChange} from './noticeChanges';
import NoticeSummary from './NoticeSummary';
import PlanBuilder from './PlanBuilder';
import { officialDeadline, officialUrl } from './Calendar';
import DeadlineBadge from './DeadlineBadge';
import './prep.css';

type Props = {
  demo: boolean;
  opportunities: Opportunity[];
  official: SavedOfficial[];
  profile: Profile;
  calendarEvents: CalendarEvent[];
  changes: NoticeChange[];
  onAddPlans: (events: CalendarEvent[]) => void;
  onAcknowledge: (change: NoticeChange) => void;
  checks: Record<string, string[]>;
  ai: Record<string, boolean>;
  applied: Record<string, boolean>;
  onSave: (id: string) => void;
  onSaveOfficial: (item: SavedOfficial) => void;
  onDetail: (id: string) => void;
  onCheck: (id: string, item: string) => void;
  onAi: (id: string, checked: boolean) => void;
  onApplied: (id: string, checked: boolean) => void;
  onExplore: () => void;
  renderLink: (item: Opportunity) => ReactNode;
};
export default function PrepPage({ demo, opportunities, official, profile, calendarEvents, changes, onAddPlans, onAcknowledge, checks, ai, applied, onSave, onSaveOfficial, onDetail, onCheck, onAi, onApplied, onExplore, renderLink }: Props) {
  const [plan,setPlan]=useState<{id:string;title:string;deadline:string|null}|null>(null);
  const total=opportunities.length+official.length;
  const done=opportunities.filter(n=>applied[n.id]).length;
  return <section className="section prep-page">
    <div className="prep-heading"><div><span className="sectionnum">MY OPPORTUNITIES</span><h1>내 준비함</h1><p>관심 있는 기회를 모으고, 준비할 일을 하나씩 확인해 보세요.</p></div><button className="prep-explore" onClick={onExplore}>공고 찾아보기 <span aria-hidden="true">↗</span></button></div>
    {total>0?<>
      <div className="prep-summary"><div className="prep-summary-icon" aria-hidden="true">♡</div><div><span>나의 관심 공고</span><strong>{total}<small>건</small></strong></div><div className="prep-summary-divider"/><div><span>접수 완료 <small>직접 기록</small></span><strong>{done}<small>건</small></strong></div><p>마음에 담은 기회를<br/>차근차근 준비해요.</p><img src={import.meta.env.BASE_URL+'assets/hangyeong-read.png'} alt=""/></div>
      {changes.length>0&&<div className="notice-changes" role="status"><strong>저장한 공고의 마감일 정보가 달라요 · {changes.length}건</strong><p>저장 당시 정보와 현재 수집본을 비교했어요. 원문을 확인해 주세요. 기존 준비 일정은 자동으로 바뀌지 않아요.</p>{changes.map(change=><div className="notice-change" key={change.id}><span><b>{change.title}</b><small>{change.previous} → {change.current}</small></span><button onClick={()=>onAcknowledge(change)}>확인</button></div>)}</div>}
      <div className="prep-list-heading"><div><span className="sectionnum">SAVED OPPORTUNITIES</span><h2>저장한 공고 <span>{total}</span></h2></div><p>공고별 신청 조건과 일정은 원문에서 다시 확인해 주세요.</p></div>
      <div className="prep-grid">
        {opportunities.map(n=>{
          const items=[...n.items,...(n.conditional&&ai[n.id]?[n.conditional]:[])];
          const completed=items.filter(item=>(checks[n.id]||[]).includes(item)).length;
          const percent=items.length?Math.round(completed/items.length*100):0;
          const closed=isClosed(n,demo);
          return <article className="prep-item prepCard" key={n.id}>
            <div className="prep-item-top"><div className="prep-tags"><span className="prep-type">{n.scope} · {n.kind}</span><span className={'prep-status '+(closed?'is-closed':'')}>{status(n,demo)}</span></div><button className="prep-heart" onClick={()=>onSave(n.id)} aria-label={`${n.title} 저장 해제`} aria-pressed="true">♥</button></div>
            <DeadlineBadge deadline={n.deadline} deadlineAt={n.deadlineAt} demo={demo} closed={closed}/>
            <button className="prep-title" onClick={()=>onDetail(n.id)}>{n.title} <span aria-hidden="true">↗</span></button>
            <div className="prep-meta"><span>{n.department}</span><span>마감 {n.deadline.replace(/-/g,'.')}</span></div>
            {n.demoOnly&&<span className="prep-demo">발표 시연용</span>}
            <details className="notice-summary-toggle prep-summary-toggle"><summary>신청 정보 자세히 보기</summary><NoticeSummary item={n} profile={profile}/></details>
            <div className="prep-check-panel"><div className="prep-progress-heading"><strong>준비 현황</strong><span><b>{completed}</b> / {items.length}</span></div><div className="prep-progress-track" role="progressbar" aria-label={`${n.title} 준비 진행률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{width:`${percent}%`}}/></div>
              <div className="prep-checklist">{n.items.map(item=><label key={item}><input type="checkbox" checked={(checks[n.id]||[]).includes(item)} onChange={()=>onCheck(n.id,item)}/><span>{item}</span></label>)}{n.conditional&&<><label><input type="checkbox" checked={!!ai[n.id]} onChange={e=>onAi(n.id,e.target.checked)}/><span>AI를 사용했어요</span></label>{ai[n.id]&&<label><input type="checkbox" checked={(checks[n.id]||[]).includes(n.conditional)} onChange={()=>onCheck(n.id,n.conditional!)}/><span>{n.conditional}</span></label>}</>}</div>
            </div>
            <button className="plan-open" onClick={()=>setPlan({id:n.id,title:n.title,deadline:n.deadline})}>+ 준비 계획 만들기</button>
            <div className="prep-item-footer"><label className="prep-applied"><input type="checkbox" checked={!!applied[n.id]} onChange={e=>onApplied(n.id,e.target.checked)}/><span>공식 접수 완료 <small>직접 기록</small></span></label>{n.official&&<div className="prep-link">{renderLink(n)}</div>}</div>
          </article>;
        })}
        {official.map(item=>{const deadline=officialDeadline(item),closed=feedClosed(item,demo);return <article className="prep-item prep-official prepCard" key={item.id}>
          <div className="prep-item-top"><div className="prep-tags"><span className="prep-type">공식 공개 공고</span><span className={'prep-status '+(closed?'is-closed':'')}>{closed?'모집 마감':item.source}</span></div><button className="prep-heart" onClick={()=>onSaveOfficial(item)} aria-label={`${item.title} 저장 해제`} aria-pressed="true">♥</button></div>
          <DeadlineBadge deadline={deadline} demo={demo} closed={closed}/><a className="prep-title" href={officialUrl(item)} target="_blank" rel="noreferrer">{item.title} <span aria-hidden="true">↗</span></a>
          <div className="prep-meta"><span>{item.source}</span><span>{deadline?`마감 ${deadline.replace(/-/g,'.')}`:'마감일 원문 확인'}</span></div>
          <div className="prep-official-note"><strong>원문에서 확인해 주세요</strong><p>이 공고는 준비 체크리스트가 제공되지 않아요. 신청 대상과 제출 서류를 원문에서 확인해 주세요.</p></div><details className="notice-summary-toggle prep-summary-toggle"><summary>신청 정보 자세히 보기</summary><NoticeSummary item={item} profile={profile}/></details><button className="plan-open" onClick={()=>setPlan({id:item.id,title:item.title,deadline})}>+ 준비 계획 만들기</button><div className="prep-item-footer"><a className="prep-official-link" href={officialUrl(item)} target="_blank" rel="noreferrer">공식 공고 보기 ↗</a></div>
        </article>})}
      </div>
    </>:<div className="prep-empty"><img src={import.meta.env.BASE_URL+'assets/hangyeong-happy.png'} alt=""/><span className="sectionnum">YOUR OPPORTUNITIES</span><h2>아직 저장한 공고가 없어요</h2><p>마음에 드는 공고의 ♡를 누르면<br/>이곳에서 다시 확인할 수 있어요.</p><button className="primary" onClick={onExplore}>공고 찾아보기 →</button></div>}
    {plan&&<PlanBuilder key={plan.id} {...plan} demo={demo} events={calendarEvents} onAdd={onAddPlans} onClose={()=>setPlan(null)}/>}
  </section>;
}
