import type {Profile} from './Profile';

// Only structured GOOD-GIL fields are compared. All other wording stays unknown.
export function assessEligibility(profile: Profile, item: {kind?:string; condition?:string; year?:string}) {
  if(item.kind!=='goodgil') return {status:'확인 필요', details:['공개 목록만으로 신청 조건을 판단할 수 없어요. 원문에서 확인해 주세요.']};
  const details:string[]=[];
  let mismatch=false;
  const condition=item.condition || '';
  const parts=condition.split('/');
  const academic=parts.length>1?parts[parts.length-1].trim():'';
  const allowed=['재학','휴학','수료','졸업'].filter(x=>academic.includes(x));
  const current:Record<string,string>={'재학생':'재학','휴학생':'휴학','졸업생':'졸업'};
  if (allowed.length && profile.enrollment && current[profile.enrollment]) {
    const matches=allowed.includes(current[profile.enrollment]);
    if(!matches)mismatch=true;
    details.push(`학적: 공고 ${allowed.join('·')} / 내 정보 ${profile.enrollment}${matches?' (일부 정보 일치)':' (불일치 가능)'}`);
  } else if(allowed.length && !profile.enrollment) details.push('학적 정보가 없어 비교하지 못했어요.');
  const years:string[]=Array.from((item.year||'').match(/[1-6]학년/g)||[]);
  if(years.length && profile.year){
    if(profile.year==='4학년 이상') details.push('학년: 내 정보가 4학년 이상으로 설정되어 있어 세부 학년을 원문에서 확인해 주세요.');
    else {const matches=years.includes(profile.year);if(!matches)mismatch=true;details.push(`학년: 공고 ${years.join('·')} / 내 정보 ${profile.year}${matches?' (일부 정보 일치)':' (불일치 가능)'}`);}
  } else if(years.length && !profile.year) details.push('학년 정보가 없어 비교하지 못했어요.');
  if (!details.length) details.push('공개 목록에서 비교할 수 있는 학적·학년 조건이 없어요.');
  return {status:mismatch?'조건 불일치 가능':'원문 확인 필요',details};
}
