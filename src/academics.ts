// School pages and 2026 major-selection guide; update when university organization changes.
export const universityPrograms: Record<string, Record<string,string[]>> = {
 '안성캠퍼스': {
  '인문융합공공인재학부':['문예창작미디어콘텐츠홍보전공','영미언어문화전공','행정학전공'],
  '법경영학부':['법학전공','경영학전공'],
  '웰니스산업융합학부':['의류산업학전공','복지상담학전공','식품영양학전공','융합레포츠전공'],
  '식물자원조경학부':['식물생명환경전공','조경학전공'],
  '동물생명융합학부':['동물생명과학전공','동물응용과학전공'],
  '생명공학부':['원예생명공학전공','응용생명공학전공'],
  '건설환경공학부':['토목공학전공','환경공학전공'],
  '사회안전시스템공학부':['안전공학전공','지역자원시스템공학전공'],
  '식품생명화학공학부':['식품생명공학전공','화학공학전공'],
  '컴퓨터응용수학부':['컴퓨터공학전공','소프트웨어융합전공','정보보안전공','응용수학전공','소프트웨어&서비스컴퓨팅전공'],
  'ICT로봇기계공학부':['ICT로봇공학전공','기계공학전공'],
  '전자전기공학부':['전자공학전공','전기공학전공'],
  '건축융합학부':['건축학전공(5년제)','건축공학전공'],
  'AI융합학부':['AI스마트팜융합전공','스마트헬스케어융합전공','AI빅데이터융합전공','공공헬스케어IT융합전공','반도체융합전공','스마트애그리푸드시스템전공'],
  '글로벌창의인재학부':['글로벌경영전공','글로벌인공지능IT전공','식물스마트팜전공','식물생의학전공','바이오에너지전공','아시아문화경영전공','Bio-Mobility전공','English Language, Literature and Language Technology 전공','글로벌스포츠매니지먼트전공'],
  '디자인예술스포츠학부':['시각영상디자인전공','스포츠과학전공','제품공간디자인전공','귀금속보석공예전공','실용음악학전공'],
  '브라이트칼리지':[],
 },
 '평택캠퍼스': {
  '디자인예술학부':['제품공간디자인전공','귀금속보석공예전공','실용음악학전공'],
  '복지융합학부':['사회복지학전공','한국수어교육전공','유아특수보육학전공','의료재활공학전공'],
  '사회통합학부':['공공행정전공','상담심리교육전공','특수체육전공'],
  'AI반도체융합학부':['AI반도체융합전공'],
 }
};
const pyeongtaekEligible=['제품공간디자인전공','실용음악학전공','귀금속보석공예전공','사회복지학전공','한국수어교육전공','유아특수보육학전공','의료재활공학전공','공공행정전공','상담심리교육전공','특수체육전공','AI반도체융합전공'];
const anseongEligible=['인문융합공공인재학부','법경영학부','웰니스산업융합학부','식물자원조경학부','동물생명융합학부','생명공학부','건설환경공학부','사회안전시스템공학부','식품생명화학공학부','컴퓨터응용수학부','ICT로봇기계공학부','전자전기공학부','건축융합학부'].flatMap(school=>universityPrograms['안성캠퍼스'][school]).filter(x=>!['융합레포츠전공','소프트웨어&서비스컴퓨팅전공'].includes(x));
universityPrograms['안성캠퍼스']['HK자율전공학부(안성)']=[...anseongEligible,...pyeongtaekEligible];
universityPrograms['평택캠퍼스']['HK자율전공학부(평택)']=pyeongtaekEligible;
export function majorsFor(school:string):string[]{for(const schools of Object.values(universityPrograms))if(school in schools)return schools[school];return []}
export function inferSchool(major:string):string{if(!major)return '';for(const schools of Object.values(universityPrograms))for(const [school,majors] of Object.entries(schools))if(!school.startsWith('HK자율')&&majors.includes(major))return school;return ''}
