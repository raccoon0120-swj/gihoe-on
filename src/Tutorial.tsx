import { useEffect, useRef, useState } from 'react';
import './tutorial.css';

type Route = 'login' | 'signup' | 'explore';
type Props = { onClose: () => void; onNavigate: (route: Route) => void };
const steps = [
  { label:'01 / 관심 분야', title:'관심 분야를 골라보세요', text:'장학금, 교내 활동, 공모전 중 관심 있는 분야를 선택하면 관련 공고를 찾아볼 수 있어요.', hint:'아래 분야를 눌러보세요' },
  { label:'02 / 공고 탐색', title:'나에게 맞는 기회를 찾아요', text:'학교와 굿길의 공개 공고부터 교외 공모전·해커톤까지 한곳에서 살펴볼 수 있어요.', hint:'예시 공고의 하트를 눌러 저장해 보세요' },
  { label:'03 / 일정 관리', title:'중요한 일정은 캘린더에', text:'저장한 공고의 확인 가능한 마감일을 캘린더에서 보고, 나만의 일정도 추가할 수 있어요.', hint:'날짜를 선택해 일정을 확인해 보세요' },
  { label:'04 / 기회 준비', title:'준비부터 신청까지 차근차근', text:'내 준비함에 관심 공고를 모아보세요. 준비 항목이 제공되는 공고는 체크하면서 관리할 수 있어요.', hint:'준비 항목을 눌러 체크해 보세요' },
];
export default function Tutorial({ onClose, onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const [interest, setInterest] = useState('공모전');
  const [saved, setSaved] = useState(false);
  const [day, setDay] = useState(18);
  const [checked, setChecked] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    nextRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled])') || []);
      if (!items.length) return;
      const first=items[0], last=items[items.length-1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown',onKey);
    return () => {document.removeEventListener('keydown',onKey);previous?.focus()};
  }, []);
  const item=steps[step];
  return <div className="tutorial-overlay"><section ref={dialogRef} className="tutorial-dialog" role="dialog" aria-modal="true" aria-labelledby="tutorial-title" aria-describedby="tutorial-description">
    <div className="tutorial-top"><div className="tutorial-brand">기회<span>ON</span> <small>처음 만나는 기회ON</small></div><button className="tutorial-skip" onClick={onClose}>건너뛰기 <span aria-hidden="true">×</span></button></div>
    <div className="tutorial-content"><div className="tutorial-copy" aria-live="polite"><span className="tutorial-step">{item.label}</span><h2 id="tutorial-title">{item.title}</h2><p id="tutorial-description">{item.text}</p><div className="tutorial-hint"><span aria-hidden="true">✦</span> {item.hint}</div><p className="tutorial-preview-note">지금 보이는 화면은 사용법을 알아보는 예시예요.</p></div>
    <div className="tutorial-stage"><div className="tutorial-window"><div className="tutorial-window-bar"><span className="tutorial-window-brand">기회<b>ON</b></span><span>서비스 미리보기</span><i aria-hidden="true">● ● ●</i></div>
      {step===0&&<div className="tutorial-screen"><span className="tutorial-screen-label">MY INTERESTS</span><h3>어떤 기회를 찾고 있나요?</h3><p>관심 있는 분야를 골라주세요.</p><div className="tutorial-chips">{['장학금','교내 활동','공모전','취업·멘토링'].map(x=><button key={x} className={interest===x?'is-selected':''} aria-pressed={interest===x} onClick={()=>setInterest(x)}>{interest===x?'✓ ':'+ '}{x}</button>)}</div><div className="tutorial-feedback">✦ <strong>{interest}</strong> 분야와 관련된 공고를 살펴볼 수 있어요.</div></div>}
      {step===1&&<div className="tutorial-screen"><span className="tutorial-screen-label">FOR YOU</span><h3>나를 위한 공고</h3><p>관심 분야에 맞는 기회를 확인하세요.</p><article className="tutorial-notice"><div><span className="tutorial-badge">공모전 · 예시</span><button aria-label={saved?'예시 공고 저장 해제':'예시 공고 저장'} aria-pressed={saved} onClick={()=>setSaved(!saved)}>{saved?'♥':'♡'}</button></div><strong>공공데이터 활용 아이디어 공모전</strong><small>교외 활동 · 대학생 대상</small><div className="tutorial-notice-bottom"><span>신청 마감</span><b>11월 18일</b></div></article><div className="tutorial-feedback">{saved?'♥ 관심 공고에 담았어요!':'♡ 관심 있는 공고는 하트를 눌러 담아요.'}</div></div>}
      {step===2&&<div className="tutorial-screen"><span className="tutorial-screen-label">MY CALENDAR</span><h3>나의 일정</h3><p>관심 공고와 개인 일정을 함께 관리해요.</p><div className="tutorial-calendar"><strong>11월</strong><div className="tutorial-week">{['일','월','화','수','목','금','토'].map(x=><span key={x}>{x}</span>)}</div><div className="tutorial-days">{[15,16,17,18,19,20,21].map(x=><button key={x} className={day===x?'is-selected':''} aria-pressed={day===x} onClick={()=>setDay(x)}>{x}{x===18&&<i/>}</button>)}</div></div><div className="tutorial-feedback">{day===18?'● 11월 18일 · 공모전 신청 마감':`${day}일 · 등록된 일정이 없어요`}</div></div>}
      {step===3&&<div className="tutorial-screen"><span className="tutorial-screen-label">MY BOX</span><h3>내 준비함</h3><p>필요한 준비를 하나씩 확인해요.</p><div className="tutorial-check-card"><span className="tutorial-badge">저장한 공고 · 예시</span><strong>공공데이터 활용 아이디어 공모전</strong><label><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/> 참가 조건 확인하기</label><label><input type="checkbox" disabled/> 제출 서류 준비하기</label></div><div className="tutorial-feedback">실제 신청은 반드시 주최기관 원문에서 진행해요.</div></div>}
    </div><img className="tutorial-mascot" src={import.meta.env.BASE_URL+'assets/hangyeong-wave.png'} alt=""/></div></div>
    <div className="tutorial-footer"><div className="tutorial-progress" aria-label={`${steps.length}단계 중 ${step+1}단계`}><strong>{String(step+1).padStart(2,'0')}</strong><span>/ {String(steps.length).padStart(2,'0')}</span><div>{steps.map((_,i)=><i className={i===step?'active':''} key={i}/>)}</div></div><div className="tutorial-buttons">{step>0&&<button className="tutorial-back" onClick={()=>setStep(step-1)}>이전</button>}{step===steps.length-1&&<button className="tutorial-explore" onClick={()=>onNavigate('explore')}>공고 둘러보기</button>}<button ref={nextRef} className="tutorial-next" onClick={()=>step===steps.length-1?onNavigate('signup'):setStep(step+1)}>{step===steps.length-1?'회원가입하고 시작하기':'다음'} <span aria-hidden="true">→</span></button></div></div>
  </section></div>;
}
