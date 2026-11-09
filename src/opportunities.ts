import legacy from './notices.json';
import external from './external.json';

export type Opportunity = {id:string; title:string; category:string; tags:string[]; deadline:string; deadlineAt?:string; target:string; condition:string; department:string; items:string[]; conditional?:string; submission:string; source:string; official:boolean; override?:string; scope:'교내'|'교외'; kind:string; participation:string; checkedAt:string; url?:string; demoOnly?:boolean; activityDate?:string; startDate?:string; timeNote?:string; organizerUrl?:string};

// The original IDs and checklist text remain unchanged for existing localStorage records.
const existing:Opportunity[] = legacy.map(n=>({...n,scope:'교내',kind:n.category,participation:n.condition,checkedAt:'확인일 없음',demoOnly:!n.official}));
const extra:Opportunity[] = [
 {id:'labor-data-ai-2026',title:'제5회 고용노동 공공데이터·AI 활용 공모전',category:'성장',tags:['공모전'],deadline:'2026-05-14',deadlineAt:'2026-05-14T16:00:00+09:00',target:'고용노동 공공데이터와 AI를 활용할 수 있는 개인·단체',condition:'개인 또는 2~4인 단체 · 세부 조건 원문 확인',department:'한국장애인고용공단 · 한국고용정보원',items:['참가신청서','개인정보 수집·이용 동의서','저작재산권 및 콘텐츠 활용 동의서','청렴 서약서','아이디어 제안서 또는 사업계획서','데이터 명세서'],submission:'참가신청서, 동의서, 청렴 서약서, 제안서 또는 사업계획서, 데이터 명세서',source:'공모전 공식 누리집',official:true,scope:'교외',kind:'공모전',participation:'개인 또는 2~4인 단체',checkedAt:'2026-11-07',url:'https://www.2026datacontest.co.kr/'},
 {id:'demo-data-class',title:'데이터 분석과 시각화 특강',category:'교내 활동',tags:['교내 활동'],deadline:'2026-11-18',target:'재학생 (시연 설정)',condition:'참가 조건은 시연 설정',department:'교내 교육 지원 부서',items:['참여 일정 확인','질문 준비'],submission:'공식 공고에서 확인',source:'발표 시연용 예시',official:false,scope:'교내',kind:'특강',participation:'개인 (시연 설정)',checkedAt:'해당 없음',demoOnly:true,activityDate:'2026-11-20'},
 {id:'demo-data-contest',title:'공공데이터 활용 아이디어 공모전',category:'성장',tags:['공모전'],deadline:'2026-12-15',target:'대학생 (시연 설정)',condition:'개인·팀 참가 여부 확인',department:'가상 공공데이터 공모전 운영기관',items:['일정 확인','팀 참가 여부 확인','제안서 준비'],submission:'공식 공고에서 확인',source:'발표 시연용 예시',official:false,scope:'교외',kind:'공모전',participation:'개인·팀 여부 확인 필요',checkedAt:'해당 없음',demoOnly:true},
 {id:'demo-dev-project',title:'웹 서비스 개발 프로젝트 멘토링',category:'교내 활동',tags:['교내 활동'],deadline:'2026-11-19',target:'재학생 (시연 설정)',condition:'참가 조건은 시연 설정',department:'교내 교육 지원 부서',items:['멘토링 일정 확인','프로젝트 질문 준비'],submission:'공식 공고에서 확인',source:'발표 시연용 예시',official:false,scope:'교내',kind:'멘토링',participation:'팀 구성 확인 필요',checkedAt:'해당 없음',demoOnly:true,activityDate:'2026-11-23'},
 {id:'demo-hackathon',title:'지역 문제 해결 해커톤',category:'성장',tags:['공모전'],deadline:'2026-12-12',target:'대학생 (시연 설정)',condition:'팀 구성 및 참가 조건 확인',department:'가상 해커톤 운영기관',items:['일정 확인','팀원 모집','서비스 기획안 준비'],submission:'공식 공고에서 확인',source:'발표 시연용 예시',official:false,scope:'교외',kind:'해커톤',participation:'팀 참가 여부 확인 필요',checkedAt:'해당 없음',demoOnly:true}
];
const externalOpportunities: Opportunity[] = external.items.map(n => ({...n, category:'성장', tags:['공모전'], target:n.target, condition:n.timeNote, items:['일정 확인','참가 조건 확인','신청 준비'], submission:'상세 공고 확인', official:true, scope:'교외', participation:'원문 확인', checkedAt:n.checkedAt || external.checkedAt}));
export const opportunities=[...existing,...extra,...externalOpportunities];
export const visibleOpportunities=(demo:boolean)=>opportunities.filter(n=>demo||!n.demoOnly);
export function status(n:Opportunity,demo:boolean){if(n.override)return n.override; const now=demo?new Date('2026-11-10T12:00:00+09:00'):new Date(); const end=new Date(n.deadlineAt||`${n.deadline}T23:59:59.999+09:00`);return end.getTime()<now.getTime()?'마감일 지남 · 원문 확인':n.startDate&&now.getTime()<new Date(`${n.startDate}T00:00:00+09:00`).getTime()?'접수 예정 · 원문 확인':n.timeNote?'마감일 기준 · 원문 확인':'마감 전 · 모집 확인 필요'}
export const isClosed=(n:Opportunity,demo:boolean)=>['모집 마감','마감일 지남 · 원문 확인'].includes(status(n,demo));

// Only Goodgil date ranges are application periods; school dates are publication dates.
export function feedClosed(item:{kind:string;date:string},demo:boolean){if(item.kind!=='goodgil')return false;const match=item.date.match(/~\s*(\d{4})\.(\d{2})\.(\d{2})/);if(!match)return false;const end=new Date(`${match[1]}-${match[2]}-${match[3]}T23:59:59.999+09:00`);return end.getTime()<(demo?new Date('2026-11-10T12:00:00+09:00'):new Date()).getTime()}
