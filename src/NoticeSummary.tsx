import type {Profile} from './Profile';
import type {Opportunity} from './opportunities';
import type {SavedOfficial} from './Calendar';
import {officialDeadline,officialUrl} from './Calendar';
import {assessEligibility} from './eligibility';
import './planning.css';

export default function NoticeSummary({item,profile,checkedAt}:{item:Opportunity|SavedOfficial;profile:Profile;checkedAt?:string}) {
 const isOpportunity='scope' in item;
 const deadline=isOpportunity?item.deadline:officialDeadline(item);
 const result=assessEligibility(profile, isOpportunity?{}:item);
 const exact=isOpportunity&&item.deadlineAt?new Date(item.deadlineAt):null;
 const exactTime=exact&&Number.isFinite(exact.getTime())?new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false}).format(exact):'';
 const target='target' in item?item.target:'원문 확인';
 const condition='condition' in item?item.condition:'원문 확인';
 const url=isOpportunity?item.url:officialUrl(item);
 return <div className="notice-summary"><div className="notice-summary-header"><strong>신청 정보 한눈에</strong><span>{result.status}</span></div><dl>
  <div><dt>신청 대상</dt><dd>{target||'원문 확인'}</dd></div><div><dt>조건</dt><dd>{condition||'원문 확인'}</dd></div>
  <div><dt>참가 방식</dt><dd>{isOpportunity?item.participation:'원문 확인'}</dd></div><div><dt>신청 마감</dt><dd>{deadline||'원문 확인'}{exactTime&&` ${exactTime} (한국시간)`}{isOpportunity&&item.timeNote&&` · ${item.timeNote}`}</dd></div>
  <div><dt>제출물</dt><dd>{isOpportunity?item.submission:'원문 확인'}</dd></div><div><dt>출처·수집일</dt><dd>{item.source} · {isOpportunity?(item.checkedAt||'수집일 확인 필요'):(item.checkedAt||checkedAt||'수집일 확인 필요')}</dd></div>
 </dl>{result.details.map(line=><p key={line}>{line}</p>)}<p>이 정보는 신청 가능 여부를 보장하지 않아요. 세부 조건과 마감 시각은 {url?<a href={url} target="_blank" rel="noreferrer">공고 원문</a>:'공고 원문'}에서 확인해 주세요.</p></div>;
}
