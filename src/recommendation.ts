import type { Profile } from './Profile';

// These are topic associations, not eligibility or predictions of outcomes.
export const experienceAreas = ['정보보안', '프로그래밍', '인공지능·데이터', '디자인·콘텐츠', '기획·창업', '어학·글쓰기', '전기·전자', '기계·로봇', '건축·도시', '환경·에너지', '식품·영양', '농업·식물', '동물·생명과학', '의료·보건', '심리·상담', '교육·멘토링', '사회복지·봉사', '법·행정', '마케팅·홍보', '음악·예술'] as const;
const rules: {area: string; words: string[]; majors: string[]}[] = [
  {area:'정보보안',words:['해킹','정보보안','사이버보안','사이버 보안','보안경진','보안 경진','취약점','암호학'],majors:['컴퓨터공학','소프트웨어융합','소프트웨어&서비스컴퓨팅','정보보안']},
  {area:'프로그래밍',words:['프로그래밍','코딩','소프트웨어','개발자','앱 개발','웹 개발','알고리즘','해커톤'],majors:['컴퓨터공학','소프트웨어융합','소프트웨어&서비스컴퓨팅','정보보안']},
  {area:'인공지능·데이터',words:['인공지능','데이터 분석','빅데이터','머신러닝','딥러닝','ai보안','ai 보안','ai 경진','ai 활용'],majors:['컴퓨터공학','소프트웨어융합','소프트웨어&서비스컴퓨팅','정보보안','인공지능','데이터']},
  {area:'디자인·콘텐츠',words:['디자인','영상 제작','영상제작','콘텐츠 제작','콘텐츠제작','시각디자인','디자인씽킹'],majors:['디자인','미디어','영상']},
  {area:'기획·창업',words:['창업','사업화','사업계획','아이디어톤','창업 아이디어'],majors:['경영','창업']},
  {area:'어학·글쓰기',words:['어학','영어','외국어','에세이','글쓰기','번역'],majors:['영어','문예창작','언어']},
  {area:'전기·전자',words:['전기공학','전자공학','반도체','회로설계','전자회로','전기전자'],majors:['전기공학','전자공학','반도체']},
  {area:'기계·로봇',words:['기계공학','기계설계','로봇','자율주행','모빌리티','드론'],majors:['기계공학','로봇공학']},
  {area:'건축·도시',words:['건축','도시재생','도시계획','공간설계','토목공학'],majors:['건축','토목']},
  {area:'환경·에너지',words:['환경공학','환경보호','기후변화','탄소중립','친환경','재생에너지','신재생에너지','환경 캠페인'],majors:['환경공학','에너지']},
  {area:'식품·영양',words:['식품','영양','식생활','푸드테크','푸드 테크'],majors:['식품','영양']},
  {area:'농업·식물',words:['농업','농촌','스마트팜','원예','식물','농생명','조경'],majors:['식물','농업','원예','조경','스마트팜']},
  {area:'동물·생명과학',words:['동물','반려동물','생명과학','생명공학','바이오'],majors:['동물','생명과학','생명공학','바이오']},
  {area:'의료·보건',words:['보건','의료','건강증진','건강관리','헬스케어','재활공학'],majors:['보건','의료','헬스케어']},
  {area:'심리·상담',words:['심리','상담','마음건강','정신건강','스트레스'],majors:['심리','상담']},
  {area:'교육·멘토링',words:['멘토링','멘토','교육봉사','학습지도','학습법','튜터링','튜터'],majors:['교육','보육']},
  {area:'사회복지·봉사',words:['사회복지','복지','자원봉사','봉사활동','사회공헌','장애학생'],majors:['복지','수어','특수체육']},
  {area:'법·행정',words:['법률','법학','행정','정책 제안','정책제안','공공정책','공공기관'],majors:['법학','행정']},
  {area:'마케팅·홍보',words:['마케팅','홍보','광고','브랜딩','브랜드','서포터즈'],majors:['경영','홍보','마케팅']},
  {area:'음악·예술',words:['음악','미술','공연','예술','공예','전시회','작곡'],majors:['음악','예술','공예']},
];
export function relevantAreas(text:string):string[]{const normalized=text.toLowerCase();return rules.filter(rule=>rule.words.some(word=>normalized.includes(word))).map(rule=>rule.area)}
export function recommend(text:string,profile:Profile,noticeTags:string[],interests:string[]) {
 const areas=relevantAreas(text); const matchedExperiences=areas.filter(area=>profile.experiences.includes(area));
 const majorAreas=areas.filter(area=>rules.find(rule=>rule.area===area)?.majors.some(major=>profile.major.includes(major)));
 const matchedInterests=noticeTags.filter(tag=>interests.includes(tag));
 const reasons:string[]=[];
 if(majorAreas.length && profile.major) reasons.push(`선택한 ${profile.school?.startsWith('HK자율')?'희망 전공':'전공'} ‘${profile.major}’ 관련 ${majorAreas.join('·')} 주제`);
 if(matchedExperiences.length) reasons.push(`선택한 경험 분야 ${matchedExperiences.join('·')}와 관련`);
 if(matchedInterests.length) reasons.push(`관심 분야 ${matchedInterests.join('·')}와 일치`);
 return {score:majorAreas.length*2+matchedExperiences.length*2+matchedInterests.length,reasons,areas};
}
