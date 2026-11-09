import {useState} from 'react';
import DeadlineBadge from './DeadlineBadge';
import {feedClosed,isClosed,visibleOpportunities} from './opportunities';
import type {Opportunity} from './opportunities';
import type {SavedOfficial} from './Calendar';
import type {Profile} from './Profile';
import NoticeSummary from './NoticeSummary';
import {officialDeadline,officialUrl} from './Calendar';
import officialData from './official.json';
import './planning.css';

type Goal={id:string; title:string; keywords:string[]; description:string};
const goals:Goal[]=[
 {id:'data',title:'데이터·AI 경험',keywords:['데이터','인공지능','ai','빅데이터','머신러닝','data','machine learning'],description:'데이터 분석과 AI 활용 주제의 기회를 찾아요.'},
 {id:'dev',title:'개발 프로젝트',keywords:['개발','코딩','프로그래밍','소프트웨어','해커톤','hackathon','coding','software','developer'],description:'개발과 프로젝트 관련 기회를 찾아요.'},
 {id:'design',title:'디자인·콘텐츠',keywords:['디자인','콘텐츠','영상','디자이너','design','creative'],description:'디자인과 콘텐츠 제작 관련 기회를 찾아요.'},
 {id:'idea',title:'기획·창업',keywords:['기획','아이디어','아이디어톤','창업','공모전','entrepreneur'],description:'기획과 아이디어를 발전시킬 기회를 찾아요.'},
];
function matchedKeyword(title:string,keywords:string[]){
 const text=title.toLowerCase();
 return keywords.find(word=>word==='ai'?/(^|[^a-z])ai([^a-z]|$)/i.test(text):text.includes(word.toLowerCase()));
}
export default function GoalPaths({demo,saved,savedOfficial,profile,onSave,onSaveOfficial,onDetail}:{demo:boolean;saved:string[];savedOfficial:SavedOfficial[];profile:Profile;onSave:(id:string)=>void;onSaveOfficial:(item:SavedOfficial)=>void;onDetail:(id:string)=>void}){
 const [goal,setGoal]=useState(goals[0].id);const path=goals.find(p=>p.id===goal)!;
 const campus=officialData.items.filter(i=>i.kind==='goodgil'&&officialDeadline(i)&&!feedClosed(i,demo)&&matchedKeyword(i.title,path.keywords)).sort((a,b)=>(officialDeadline(a)||'').localeCompare(officialDeadline(b)||'')).slice(0,4);
 const related=visibleOpportunities(demo).filter(n=>n.scope==='교외'&&!isClosed(n,demo)&&matchedKeyword(n.title,path.keywords)).sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,4);
 const demoCampus=demo?visibleOpportunities(demo).filter(n=>n.scope==='교내'&&n.demoOnly&&!isClosed(n,demo)&&matchedKeyword(n.title,path.keywords)).slice(0,1):[];
 const card=(n:Opportunity)=><article className="goal-card" key={n.id}><div className="goal-card-top"><span>{n.scope} · {n.kind}</span><button className="save" onClick={()=>onSave(n.id)} aria-label={`${n.title} ${saved.includes(n.id)?'저장 해제':'저장'}`} aria-pressed={saved.includes(n.id)}>{saved.includes(n.id)?'♥':'♡'}</button></div><DeadlineBadge deadline={n.deadline} deadlineAt={n.deadlineAt} demo={demo} closed={isClosed(n,demo)}/><button className="goal-card-title" onClick={()=>onDetail(n.id)}>{n.title} ↗</button><p>신청 마감 {n.deadline} · {n.source}</p><small>제목의 ‘{matchedKeyword(n.title,path.keywords)}’ 주제와 관련</small>{n.demoOnly&&<span className="example">발표 시연용</span>}</article>;
 return <section className="section goals"><div className="page-heading"><span className="sectionnum">GOAL → OPPORTUNITY</span><h1>목표별 기회</h1><p>관심 목표를 고르면 관련 교내 활동과 교외 도전을 함께 살펴볼 수 있어요.</p></div>
 <div className="tabs goal-tabs">{goals.map(p=><button key={p.id} className={goal===p.id?'selected':''} onClick={()=>setGoal(p.id)} aria-pressed={goal===p.id}>{p.title}</button>)}</div><p className="goal-description">{path.description} <strong>제목의 키워드를 기준으로 모은 목록</strong>이에요.</p>
 <div className="goal-columns"><section><div className="goal-heading"><span>01</span><div><h2>교내에서 준비하기</h2><p>공개된 굿길 프로그램 중 관련 주제를 살펴봐요.</p></div></div><div className="goal-card-list">{campus.map(item=><article className="goal-card" key={item.id}><div className="goal-card-top"><span>교내 · 굿길</span><button className="save" onClick={()=>onSaveOfficial(item)} aria-label={`${item.title} ${savedOfficial.some(x=>x.id===item.id)?'저장 해제':'저장'}`} aria-pressed={savedOfficial.some(x=>x.id===item.id)}>{savedOfficial.some(x=>x.id===item.id)?'♥':'♡'}</button></div><DeadlineBadge deadline={officialDeadline(item)} demo={demo}/><a className="goal-card-title" href={officialUrl(item)} target="_blank" rel="noreferrer">{item.title} ↗</a><p>신청기간 {item.date}</p><small>제목의 ‘{matchedKeyword(item.title,path.keywords)}’ 주제와 관련</small><details className="notice-summary-toggle"><summary>신청 정보 자세히 보기</summary><NoticeSummary item={item} profile={profile} checkedAt={officialData.checkedAt}/></details></article>)}{demoCampus.map(card)}{!campus.length&&!demoCampus.length&&<div className="goal-empty">현재 목록에서 관련 교내 활동을 찾지 못했어요.</div>}</div></section>
 <section><div className="goal-heading"><span>02</span><div><h2>교외에서 도전하기</h2><p>같은 목표와 관련된 교외 공고를 확인해요.</p></div></div><div className="goal-card-list">{related.length?related.map(card):<div className="goal-empty">현재 목록에서 관련 교외 공고를 찾지 못했어요.</div>}</div></section></div>
 <div className="goal-caution"><strong>연결하기 전에 확인해 주세요</strong><p>교내 활동은 선택 가능한 준비 방법이며 교외 공고의 참가 요건이 아니에요. 제목을 통한 주제 분류이므로 실제 관련성, 활동일과 교외 공고의 마감일은 각각의 원문에서 확인해 주세요.</p><p>관심 공고를 저장한 뒤 내 준비함에서 준비 계획을 만들 수 있어요.</p></div></section>;
}
