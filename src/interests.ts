// Fine-grained interest tags shown on the home screen and onboarding.
// Collected data still carries the coarse tags written by scripts/update_official.py;
// tagsFor() refines them from the title so the collectors do not need to change.
export const interestTags = ['장학금', '학비·생활 지원', '공모전', '해커톤', '대외활동', '자격증', '어학', '취업·채용', '진로·멘토링', '교내 활동', '특강·교육'] as const;

const words: Record<string, string[]> = {
  '장학금': ['장학'],
  '학비·생활 지원': ['지원금', '등록금', '생활비', '학자금', '주거', '기숙사', '대출'],
  '공모전': ['공모', '경진', '아이디어톤', '대회', 'award', 'competition', 'challenge'],
  '해커톤': ['해커톤', 'hackathon'],
  '대외활동': ['서포터즈', '기자단', '대외활동', '홍보대사', '앰버서더', '기 모집'],
  '자격증': ['자격증', '자격 취득', '기사 시험', '컴활', '자격시험'],
  '어학': ['어학', '영어', '토익', '토플', '외국어', '회화', 'toeic', 'opic', '오픽'],
  '취업·채용': ['취업', '채용', '인턴', '면접', '이력서', '자기소개서', '자소서', '직무'],
  '진로·멘토링': ['진로', '멘토', '멘토링', '코칭', '커리어'],
  '특강·교육': ['특강', '강좌', '세미나', '워크숍', '캠프', '교육', '클래스'],
  '교내 활동': ['프로그램', '활동', '모집'],
};

// Coarse tag -> the fine tag used when the title gives no better hint.
const fallback: Record<string, string> = {
  '장학금': '장학금', '공모전': '공모전', '자격증·어학': '자격증', '취업·멘토링': '진로·멘토링', '교내 활동': '교내 활동',
};
// Coarse tag -> fine tags it may be refined into.
const children: Record<string, string[]> = {
  '장학금': ['장학금', '학비·생활 지원'],
  '공모전': ['공모전', '해커톤', '대외활동'],
  '자격증·어학': ['자격증', '어학'],
  '취업·멘토링': ['취업·채용', '진로·멘토링'],
  '교내 활동': ['교내 활동', '특강·교육'],
};

export function tagsFor(title: string, coarse: string[], kind = ''): string[] {
  const text = `${title} ${kind}`.toLowerCase();
  const hit = (tag: string) => words[tag].some(w => text.includes(w));
  const result = new Set<string>();
  for (const tag of coarse) {
    const refined = (children[tag] || [tag]).filter(t => words[t] ? hit(t) : t === tag);
    (refined.length ? refined : [fallback[tag] || tag]).forEach(t => result.add(t));
  }
  return [...result];
}

// Saved interests from before the split: replace removed tag names with their children.
const legacyInterests: Record<string, string[]> = { '자격증·어학': ['자격증', '어학'], '취업·멘토링': ['취업·채용', '진로·멘토링'] };
export const normalizeInterests = (list: string[] = []) => [...new Set(list.flatMap(t => legacyInterests[t] || [t]))];
