import {useState} from 'react';

const steps = [
  {eyebrow:'WELCOME TO 기회ON', title:'나에게 맞는 기회를\n함께 찾아볼까요?', description:'학교와 굿길의 다양한 공고를 한곳에서 살펴보고 나에게 맞는 기회를 찾아보세요.', image:'hangyeong-wave.png'},
  {eyebrow:'01 · 나에게 맞는 추천', title:'관심 분야와 경험을\n알려주세요', description:'홈에서 관심 분야를 고르고 내 정보에서 전공과 경험을 선택하면 관련 공고를 추천해 드려요.', image:'hangyeong-read.png'},
  {eyebrow:'02 · 기회 준비하기', title:'마음에 드는 기회를\n차근차근 준비해요', description:'공고를 살펴보고 준비함에 담아보세요. 공식 공고 확인과 신청은 학교 홈페이지 또는 굿길에서 진행해요.', image:'hangyeong-happy.png'},
];

export default function Welcome({onFinish}: {onFinish: () => void}) {
  const [step,setStep]=useState(0); const item=steps[step];
  return <div className="welcome-overlay"><section className="welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-title"><button className="welcome-skip" onClick={onFinish}>건너뛰기</button><span className="welcome-eyebrow">{item.eyebrow}</span><img className="welcome-image" src={import.meta.env.BASE_URL+'assets/'+item.image} alt=""/><h1 id="welcome-title">{item.title}</h1><p>{item.description}</p><div className="welcome-footer"><div className="welcome-dots" aria-label={`${steps.length}단계 중 ${step+1}단계`}>{steps.map((_,i)=><span key={i} className={i===step?'current':''}/>)}</div><div className="welcome-actions">{step>0&&<button className="secondary" onClick={()=>setStep(step-1)}>이전</button>}<button className="primary" onClick={()=>step===steps.length-1?onFinish():setStep(step+1)}>{step===steps.length-1?'시작하기':'다음'}</button></div></div></section></div>;
}
