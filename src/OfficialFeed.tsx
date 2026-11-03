import {useState} from 'react';
import data from './official.json';
import type {Profile} from './Profile';
import {experienceAreas,recommend,relevantAreas} from './recommendation';

type Item=typeof data.items[number];
export default function OfficialFeed({interests,profile}:{interests:string[];profile:Profile}) {
 const [category,setCategory]=useState('전체'),[source,setSource]=useState('전체'),[topic,setTopic]=useState('전체'),[campus,setCampus]=useState('전체'),[mode,setMode]=useState('전체'),[query,setQuery]=useState(''),[count,setCount]=useState(9);
 function eligibility(item:Item) {
  if(item.kind!=='goodgil')return '신청 조건 원문 확인 필요';
  const year='year' in item?item.year:'';const conflicts:string[]=[];const matched:string[]=[];
  if(profile.enrollment&&item.condition.includes('재학'))(profile.enrollment==='재학생'?matched:conflicts).push('재학');
  if(profile.year&&year&&/[1-4]학년/.test(year))(year.includes(profile.year.replace(' 이상',''))?matched:conflicts).push('학년');
  if(conflicts.length)return `${conflicts.join('·')} 조건 불일치 가능 · 원문 확인 필요`;
  if(matched.length)return `${matched.join('·')} 정보 일치 · 나머지 조건 확인 필요`;
  return '신청 조건 원문 확인 필요';
 }
 const scored=data.items.map(item=>({item,match:recommend(item.title,profile,item.tags,interests)}));
 const list=scored.filter(({item,match})=>{
  const place='campus' in item?item.campus:'';
  return (category==='전체'||item.tags.includes(category))&&(source==='전체'||item.source===source)&&(topic==='전체'||match.areas.includes(topic))&&(campus==='전체'||place===campus)&&(mode==='전체'||(mode==='추천 공고'&&match.score>0)||(mode==='관심 분야 일치'&&item.tags.some(t=>interests.includes(t))))&&item.title.toLowerCase().includes(query.trim().toLowerCase());
 }).sort((a,b)=>b.match.score-a.match.score);
 const clear=()=>{setCategory('전체');setSource('전체');setTopic('전체');setCampus('전체');setMode('전체');setQuery('');setCount(9)};
 const select=(label:string,value:string,set:(v:string)=>void,options:string[])=><label><span>{label}</span><select value={value} onChange={e=>{set(e.target.value);setCount(9)}}>{options.map(o=><option key={o}>{o}</option>)}</select></label>;
 return <section className="section official-feed"><div className="sectionhead"><div><span className="sectionnum">CAMPUS NOTICE / 실제 공고</span><h2>학교의 새로운 소식 <i>{list.length}</i></h2><p>전공·경험·관심 분야와 관련된 공고부터 표시합니다. 신청 조건은 공식 원문에서 확인해 주세요.</p></div></div>
 <div className="feed-meta"><span>최종 수집 {data.checkedAt} · {data.scope}</span><span>제목 키워드 기반 추천 · 신청 자격이나 수상 예측 아님</span></div>
 <div className="filter-panel"><div className="filter-header"><strong>원하는 공고 찾기</strong><button onClick={clear}>필터 초기화 ↺</button></div><div className="filter-grid">
 {select('공고 유형',category,setCategory,['전체','장학금','공모전','교내 활동','자격증·어학','취업·멘토링'])}
 {select('출처',source,setSource,['전체','한경국립대학교 장학공지','한경국립대학교 한경공지','굿길 비교과 프로그램'])}
 {select('주제·경험 분야',topic,setTopic,['전체',...experienceAreas])}
 {select('개설 장소',campus,setCampus,['전체','안성','평택'])}
 {select('추천 기준',mode,setMode,['전체','추천 공고','관심 분야 일치'])}
 <label><span>공고명</span><input type="search" placeholder="공고명 검색" value={query} onChange={e=>{setQuery(e.target.value);setCount(9)}}/></label>
 </div><p>개설 장소 필터는 장소가 공개된 굿길 공고만 보여줍니다. 주제는 공고 제목의 키워드를 기준으로 분류합니다.</p></div>
 {list.length===0?<div className="empty"><strong>조건에 맞는 공고가 없어요.</strong><span>필터를 바꾸거나 초기화해 보세요.</span></div>:<div className="grid">{list.slice(0,count).map(({item,match})=>{const direct=item.kind==='goodgil'?`https://goodgil.hknu.ac.kr/ptfol/imng/icmpNsbjtPgm/findIcmpNsbjtPgmInfo.do?encSddpbSeq=${item.id.replace('goodgil-','')}`:item.url;return <article className="card official-card" key={item.id}><div className="cardtop"><span className="status open">{item.source}</span><span className="feed-label">공식 공개 목록</span></div><a className="cardtitle official-title" href={direct} target="_blank" rel="noreferrer">{item.title} ↗</a><div className="official-tags">{item.tags.map(t=><span key={t}>#{t}</span>)}</div><div className="target"><span>신청대상</span><strong>{item.target}</strong></div><div className="deadline"><span>{item.kind==='goodgil'?'신청기간':'게시일'}</span><strong>{item.date}</strong></div>{match.reasons.length>0&&<p className="reason">✦ 추천 이유: {match.reasons.join(' / ')}</p>}<p className="profile-match">{eligibility(item)}</p><a className="official-link" href={direct} target="_blank" rel="noreferrer">{item.kind==='goodgil'?'굿길 개별 공고 열기 (로그인 필요) ↗':'학교 공고 원문 보기 ↗'}</a>{item.kind==='goodgil'&&<p className="route"><a href={item.url} target="_blank" rel="noreferrer">굿길 첫 화면</a> → 학습 → 비교과 → 프로그램명 검색</p>}</article>})}</div>}
 {count<list.length&&<button className="more" onClick={()=>setCount(c=>c+9)}>공고 더 보기 ({Math.min(count,list.length)} / {list.length}) ↓</button>}
 </section>
}
