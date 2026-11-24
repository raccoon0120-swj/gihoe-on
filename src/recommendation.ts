import type { Profile } from './Profile';

// These are topic associations, not eligibility or predictions of outcomes.
const rules: {area: string; words: string[]; majors: string[]}[] = [
  {area:'정보보안',words:['해킹','정보보안','사이버보안','사이버 보안','보안경진','보안 경진','취약점','암호학','security','cybersecurity','ctf'],majors:['컴퓨터공학','소프트웨어융합','소프트웨어&서비스컴퓨팅','정보보안']},
  {area:'소프트웨어 개발',words:['프로그래밍','코딩','소프트웨어','개발자','해커톤','hackathon','coding','programming','developer','software','code','open source','cloud','클라우드'],majors:['컴퓨터공학','소프트웨어융합','소프트웨어&서비스컴퓨팅','정보보안']},
  {area:'웹·앱 개발',words:['앱 개발','웹 개발','웹개발','앱개발','웹서비스','웹 서비스','모바일 앱','app','web','frontend','backend'],majors:['컴퓨터공학','소프트웨어융합','소프트웨어&서비스컴퓨팅','정보보안']},
  {area:'게임 개발',words:['게임','game','games','unity','유니티','언리얼'],majors:['컴퓨터공학','소프트웨어융합','소프트웨어&서비스컴퓨팅','정보보안','게임']},
  {area:'알고리즘·코딩테스트',words:['알고리즘','코딩테스트','코딩 테스트','프로그래밍 경진','icpc','algorithm'],majors:['컴퓨터공학','소프트웨어융합','소프트웨어&서비스컴퓨팅','정보보안']},
  {area:'인공지능·머신러닝',words:['인공지능','머신러닝','딥러닝','생성형','ai보안','ai 보안','ai 경진','ai 활용','ai','machine learning','deep learning','llm','agent','agentic','genai','챗봇'],majors:['컴퓨터공학','소프트웨어융합','소프트웨어&서비스컴퓨팅','정보보안','인공지능']},
  {area:'데이터 분석·시각화',words:['데이터 분석','빅데이터','공공데이터','데이터 시각화','통계','data','analytics'],majors:['컴퓨터공학','소프트웨어융합','소프트웨어&서비스컴퓨팅','정보보안','데이터','통계']},
  {area:'시각·UX 디자인',words:['디자인','시각디자인','디자인씽킹','ux','ui','브랜드 디자인','design','pixel','pixels','포스터'],majors:['디자인']},
  {area:'영상·미디어',words:['영상 제작','영상제작','영상','콘텐츠 제작','콘텐츠제작','유튜브','숏폼','사진','film','video','animation','애니메이션'],majors:['미디어','영상']},
  {area:'창업·사업화',words:['창업','사업화','사업계획','스타트업','startup','entrepreneur','entrepreneurship','pitch'],majors:['경영','창업']},
  {area:'아이디어·기획',words:['아이디어','아이디어톤','기획','정책 아이디어','서비스 기획'],majors:['경영']},
  {area:'외국어·어학',words:['어학','영어','외국어','번역','통역','토익','language'],majors:['영어','언어']},
  {area:'글쓰기·문학',words:['에세이','글쓰기','신춘문예','문예','수필','시나리오','essay','writing'],majors:['문예창작','국어']},
  {area:'전기·전자·반도체',words:['전기공학','전자공학','반도체','회로설계','전자회로','전기전자','semiconductor','hardware'],majors:['전기공학','전자공학','반도체']},
  {area:'임베디드·IoT',words:['임베디드','사물인터넷','iot','embedded','아두이노','라즈베리파이'],majors:['전자공학','컴퓨터공학','소프트웨어융합','소프트웨어&서비스컴퓨팅','정보보안']},
  {area:'기계설계·제조',words:['기계공학','기계설계','캐드','cad','3d 프린팅','제조'],majors:['기계공학']},
  {area:'로봇·드론·모빌리티',words:['로봇','자율주행','모빌리티','드론','robot','robotics','drone','autonomous','mobility'],majors:['기계공학','로봇공학']},
  {area:'건축·도시',words:['건축','도시재생','도시계획','공간설계','토목공학','모듈러'],majors:['건축','토목']},
  {area:'환경·에너지',words:['환경공학','환경보호','기후변화','탄소중립','친환경','재생에너지','신재생에너지','환경 캠페인','climate','sustainability','energy','environment'],majors:['환경공학','에너지']},
  {area:'식품·영양',words:['식품','영양','식생활','푸드테크','푸드 테크'],majors:['식품','영양']},
  {area:'농업·식물',words:['농업','농촌','스마트팜','원예','식물','농생명','조경'],majors:['식물','농업','원예','조경','스마트팜']},
  {area:'동물·생명과학',words:['동물','반려동물','생명과학','생명공학','바이오'],majors:['동물','생명과학','생명공학','바이오']},
  {area:'의료·보건',words:['보건','의료','건강증진','건강관리','헬스케어','재활공학','health','healthcare','medical'],majors:['보건','의료','헬스케어']},
  {area:'심리·상담',words:['심리','상담','마음건강','정신건강','스트레스'],majors:['심리','상담']},
  {area:'교육·멘토링',words:['멘토링','멘토','교육봉사','학습지도','학습법','튜터링','튜터','education','edtech'],majors:['교육','보육']},
  {area:'사회복지·봉사',words:['사회복지','복지','자원봉사','봉사활동','사회공헌','장애학생','social'],majors:['복지','수어','특수체육']},
  {area:'법·행정·정책',words:['법률','법학','행정','정책 제안','정책제안','공공정책','공공기관'],majors:['법학','행정']},
  {area:'마케팅·광고',words:['마케팅','광고','브랜딩','브랜드','marketing'],majors:['경영','마케팅']},
  {area:'홍보·서포터즈',words:['홍보','서포터즈','기자단','홍보대사','앰버서더'],majors:['홍보']},
  {area:'음악·공연',words:['음악','공연','작곡','밴드','music'],majors:['음악']},
  {area:'미술·공예',words:['미술','회화','공예','전시회','일러스트','art','arts'],majors:['예술','공예','미술']},
];
export const experienceAreas = rules.map(rule => rule.area);
// Saved profiles from before the split: an old area expands into the areas it was split into.
const legacyAreas: Record<string, string[]> = {
  '프로그래밍':['소프트웨어 개발','웹·앱 개발','게임 개발','알고리즘·코딩테스트'],
  '인공지능·데이터':['인공지능·머신러닝','데이터 분석·시각화'],
  '디자인·콘텐츠':['시각·UX 디자인','영상·미디어'],
  '기획·창업':['창업·사업화','아이디어·기획'],
  '어학·글쓰기':['외국어·어학','글쓰기·문학'],
  '전기·전자':['전기·전자·반도체','임베디드·IoT'],
  '기계·로봇':['기계설계·제조','로봇·드론·모빌리티'],
  '법·행정':['법·행정·정책'],
  '마케팅·홍보':['마케팅·광고','홍보·서포터즈'],
  '음악·예술':['음악·공연','미술·공예'],
};
export const normalizeExperiences = (list: string[] = []) => [...new Set(list.flatMap(a => legacyAreas[a] || [a]))];
// English keywords (Devpost titles) match whole words only, so 'ai' does not match 'maintain' and 'art' does not match 'smart'.
const matches=(text:string,word:string)=>/^[a-z0-9 ]+$/.test(word)?new RegExp(`(^|[^a-z0-9])${word}([^a-z0-9]|$)`).test(text):text.includes(word);
export function relevantAreas(text:string):string[]{const normalized=text.toLowerCase();return rules.filter(rule=>rule.words.some(word=>matches(normalized,word))).map(rule=>rule.area)}
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
