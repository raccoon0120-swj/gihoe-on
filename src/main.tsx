import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  visibleOpportunities,
  opportunities,
  feedClosed,
  status as opportunityStatus,
  isClosed,
} from "./opportunities";
import type { Opportunity } from "./opportunities";
import GoalPaths from "./GoalPaths";
import PrepPage from "./PrepPage";
import DeadlineBadge, { DeadlineClock } from "./DeadlineBadge";
import NoticeSummary from "./NoticeSummary";
import NoticeAlerts from "./NoticeAlerts";
import {findDeadlineChanges} from "./noticeChanges";
import Calendar from "./Calendar";
import type { CalendarEvent, SavedOfficial } from "./Calendar";
import { officialDeadline } from "./Calendar";
import OfficialFeed from "./OfficialFeed";
import ProfilePage, { emptyProfile } from "./Profile";
import type { Profile } from "./Profile";
import officialData from "./official.json";
import { recommend } from "./recommendation";
import { inferSchool } from "./academics";
import "./style.css";
import "./home.css";
import { AuthPage, supabase, useAuth } from "./auth";
import Welcome from "./Welcome";
import Landing from "./Landing";
import Onboarding, { interestTags } from "./Onboarding";
import type { User } from "@supabase/supabase-js";
const tags = interestTags,
  cats = ["전체", "경제적 지원", "교내 활동", "성장", "진로"];
const params = new URLSearchParams(location.search),
  demo = params.get("demo") === "1",
  key = demo ? "gihoe-demo" : "gihoe-normal";
type State = {
  interests: string[];
  saved: string[];
  checks: Record<string, string[]>;
  ai: Record<string, boolean>;
  applied: Record<string, boolean>;
  onboardingComplete?: boolean;
  calendarEvents?: CalendarEvent[];
  savedOfficial?: SavedOfficial[];
  savedOpportunities?: Opportunity[];
};
const blank: State = {
  interests: [],
  saved: [],
  checks: {},
  ai: {},
  applied: {},
};
const sample: State = {
  ...blank,
  interests: ["공모전"],
  saved: ["ideathon"],
  checks: { ideathon: ["팀원 확정", "신청서 작성"] },
};
function initial(): State {
  try {
    const v = localStorage.getItem(key);
    return v
      ? { ...blank, ...JSON.parse(v) }
      : demo && params.get("view") === "prep"
        ? sample
        : demo && params.get("view") === "recommend"
          ? { ...blank, interests: ["공모전"] }
          : blank;
  } catch {
    return blank;
  }
}
const notices = visibleOpportunities(demo);
function status(n: Opportunity) {
  return opportunityStatus(n, demo);
}
function App({
  user,
  cloudData,
}: {
  user: User | null;
  cloudData?: { state: State; profile: Profile };
}) {
  const [state, set] = useState<State>(() => cloudData?.state ?? initial()),
    [page, setPage] = useState(
      location.hash.slice(2) ||
        (params.get("view") === "prep" ? "prep" : "home"),
    ),
    [profile, setProfile] = useState<Profile>(() => {
      if (cloudData) return { ...emptyProfile, ...cloudData.profile };
      try {
        const saved = JSON.parse(
          localStorage.getItem(key + "-profile") || "{}",
        );
        return {
          ...emptyProfile,
          ...saved,
          school: saved.school || inferSchool(saved.major || ""),
        };
      } catch {
        return emptyProfile;
      }
    }),
    [cat, setCat] = useState("전체"),
    [detail, setDetail] = useState<string | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false),
    [syncStatus, setSyncStatus] = useState(""),
    [signingOut, setSigningOut] = useState(false);
  const queue = useRef<Promise<boolean>>(Promise.resolve(true));
  useEffect(() => {
    if (!user || demo) {
      localStorage.setItem(key, JSON.stringify(state));
      localStorage.setItem(key + "-profile", JSON.stringify(profile));
      return;
    }
    const client = supabase;
    if (!client) return;
    setSyncStatus("저장 중…");
    const snapshot = {
      user_id: user.id,
      state,
      profile,
      updated_at: new Date().toISOString(),
    };
    queue.current = queue.current.then(async () => {
      try {
        const { error } = await client.from("user_data").upsert(snapshot);
        if (error) throw error;
        return true;
      } catch {
        return false;
      }
    });
    const current = queue.current;
    current.then((ok) => {
      if (queue.current === current)
        setSyncStatus(
          ok ? "저장됨" : "저장하지 못했어요. 변경 후 다시 시도해 주세요.",
        );
    });
  }, [state, profile, user?.id]);
  async function signOut() {
    if (!supabase) return;
    setSigningOut(true);
    const ok = await queue.current;
    if (!ok) {
      setSyncStatus(
        "저장하지 못해 로그아웃하지 않았어요. 변경 후 다시 시도해 주세요.",
      );
      setSigningOut(false);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSyncStatus("로그아웃하지 못했습니다. 다시 시도해 주세요.");
      setSigningOut(false);
    }
  }
  useEffect(() => {
    const sync = () => {
      setPage(location.hash.slice(2) || "home");
      setDetail(null);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const requestLogin = (destination: string) => {
    sessionStorage.setItem("gihoe-return-to", destination);
    location.hash = "/login";
  };
  const go = (p: string) => {
    if (!user && !demo && (p === "profile" || p === "prep" || p === "home")) {
      requestLogin(p);
      return;
    }
    setDetail(null);
    setPage(p);
    location.hash = "/" + p;
    window.scrollTo(0, 0);
  };
  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  const currentOfficial = officialData.items.map(item => ({...item, checkedAt:officialData.checkedAt}));
  const savedOfficial = (state.savedOfficial || []).map(item => currentOfficial.find(current => current.id === item.id) || item);
  const noticeChanges = findDeadlineChanges((state.savedOpportunities || []).filter(item=>state.saved.includes(item.id)), opportunities, state.savedOfficial || [], currentOfficial);
  const allOpportunities = [...opportunities, ...(state.savedOpportunities || []).filter(n => !opportunities.some(item => item.id === n.id))];
  const save = (id: string) => {
    if (!user && !demo) {
      requestLogin("prep");
      return;
    }
    set((s) => {
      const item = allOpportunities.find(n => n.id === id);
      const savedOpportunities = s.saved.includes(id) ? (s.savedOpportunities || []).filter(n => n.id !== id) : item ? [...(s.savedOpportunities || []).filter(n => n.id !== id), item] : s.savedOpportunities;
      return { ...s, saved: toggle(s.saved, id), savedOpportunities };
    });
  };
  const saveOfficial = (item: SavedOfficial) => {
    if (!user && !demo) { requestLogin("explore"); return; }
    set(s => ({...s, savedOfficial: (s.savedOfficial || []).some(x => x.id === item.id) ? (s.savedOfficial || []).filter(x => x.id !== item.id) : [...(s.savedOfficial || []), {...item,checkedAt:item.checkedAt || officialData.checkedAt}]}));
  };
  const changeCheck = (id: string, item: string) =>
    set((s) => ({
      ...s,
      checks: { ...s.checks, [id]: toggle(s.checks[id] || [], item) },
    }));
  const recommended = notices.filter(
    (n) =>
      !isClosed(n, demo) && n.tags.some((t) => state.interests.includes(t)),
  );
  const officialRecommendations = officialData.items
    .filter((item) => !feedClosed(item, demo))
    .map((item) => ({
      item,
      result: recommend(item.title, profile, item.tags, state.interests),
    }))
    .filter((x) => x.result.score > 0)
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, 3);
  const current = allOpportunities.find(
    (n) =>
      n.id === detail && (demo || !n.demoOnly || state.saved.includes(n.id)),
  );
  const goodgilLink = (
    <>
      <a
        className="primary link"
        href="https://goodgil.hknu.ac.kr/index.do"
        target="_blank"
        rel="noreferrer"
      >
        굿길에서 공식 신청 ↗
      </a>
      <p className="route">
        학습 → 비교과 → 프로그램명 검색
        <br />
        {demo && "발표 모드에서도 굿길은 현재 공식 페이지로 열립니다."}
      </p>
    </>
  );
  const link = (n: Opportunity) =>
    n.id === "ideathon" ? (
      goodgilLink
    ) : n.url ? (
      <a className="primary link" href={n.url} target="_blank" rel="noreferrer">
        공고 출처 보기 ↗
      </a>
    ) : null;
  function card(n: Opportunity, recommend = false) {
    return (
      <article className="card" key={n.id}>
        <div className="cardtop">
          <span
            className={
              "status " +
              (!isClosed(n, demo) ? "open" : "closed")
            }
          >
            ● {status(n)}
          </span>
          <button
            className="save"
            onClick={() => save(n.id)}
            aria-label={`${n.title} ${state.saved.includes(n.id) ? "저장 해제" : "저장"}`}
            aria-pressed={state.saved.includes(n.id)}
          >
            {state.saved.includes(n.id) ? "♥" : "♡"}
          </button>
        </div>
        <DeadlineBadge deadline={n.deadline} deadlineAt={n.deadlineAt} demo={demo} closed={isClosed(n,demo)} />
        <button className="cardtitle" onClick={() => setDetail(n.id)}>
          {n.title} <span>↗</span>
        </button>
        <p className="muted">
          {n.department} · {n.scope} · {n.kind}
        </p>
        {n.scope === "교외" && (
          <>
            <p className="muted">
              참가: {n.participation} · 최종 확인: {n.checkedAt}
            </p>
            <p className="muted">준비물: {n.submission}</p>
            {n.url && (
              <a
                className="official-link"
                href={n.url}
                target="_blank"
                rel="noreferrer"
              >
                공고 출처 보기 ↗
              </a>
            )}
          </>
        )}
        <div className="target">
          <span>신청대상</span>
          <strong>{n.target}</strong>
        </div>
        <div className="deadline">
          <span>신청·제출 마감</span>
          <strong>
            {n.deadline.replace(/-/g, ".")}.{" "}
            {n.deadlineAt && "16:00 (한국시간)"} {n.timeNote && "· 시간 원문 확인"}
          </strong>
        </div>
        {n.id === "ideathon" && (
          <p className="condition">
            ♧ 최소 2인 팀 · 확인 필요{" "}
            {profile.degree === "대학원생"
              ? "· 대학원생 제외"
              : profile.enrollment && profile.enrollment !== "재학생"
                ? "· 재학생 대상, 확인 필요"
                : ""}
          </p>
        )}
        {recommend && (
          <p className="reason">
            ✦ 선택한 관심 분야 ‘
            {n.tags.filter((t) => state.interests.includes(t)).join("’, ‘")}’과
            일치
          </p>
        )}
        {n.demoOnly && <span className="example">발표 시연용</span>}
      </article>
    );
  }
  return (
    <>
      <div className="utility">
        <div className="utility-inner"><div className="utility-copy">한경국립대학교 학생을 위한 기회 탐색</div>
          <div className="account-control">
            <button onClick={() => setWelcomeOpen(true)}>이용 안내</button>
            {user ? (
              <>
                <span>{user.email}</span>
                <button disabled={signingOut} onClick={signOut}>
                  로그아웃
                </button>
              </>
            ) : (
              <button onClick={() => requestLogin(page)}>
                로그인 / 회원가입
              </button>
            )}
          </div>
        </div>
      </div>
      <header>
        <div className="headerinner">
          <div className="identity">
            <img
              src={import.meta.env.BASE_URL + "assets/hknu-signature.png"}
              alt="한경국립대학교 시그니처"
            />
            <button className="brand" onClick={() => go("home")}>
              기회<span>ON</span>
              <small>나에게 맞는 기회를 켜다</small>
            </button>
          </div>
          <nav aria-label="주 메뉴">
            <button
              className={page === "home" ? "active" : ""}
              onClick={() => go("home")}
            >
              홈
            </button>
            <button
              className={page === "explore" ? "active" : ""}
              onClick={() => go("explore")}
            >
              공고 찾아보기
            </button>
            <button
              className={page === "profile" ? "active" : ""}
              onClick={() => go("profile")}
            >
              내 정보
            </button>
            <button
              className={page === "prep" ? "active" : ""}
              onClick={() => go("prep")}
            >
              내 준비함 <b>{state.saved.length + (state.savedOfficial || []).length}</b>
            </button>
          </nav>
        </div>
      </header>
      {welcomeOpen && (
        <Welcome
          onFinish={() => {
            setWelcomeOpen(false);
          }}
        />
      )}
      {user && !demo && state.onboardingComplete === false && (
        <Onboarding
          interests={state.interests}
          onChange={(interests) => set((s) => ({ ...s, interests }))}
          onFinish={() => set((s) => ({ ...s, onboardingComplete: true }))}
        />
      )}
      {user && !demo && syncStatus && syncStatus !== "저장됨" && syncStatus !== "저장 중…" && (
        <div className="sync-status" role="status">
          {syncStatus}
        </div>
      )}
      {demo && (
        <div className="demobar">
          발표 시연 · 2026.11.10 기준{" "}
          <button
            onClick={() => {
              set(blank);
              setProfile(emptyProfile);
              go("home");
            }}
          >
            시연 초기화 ↺
          </button>
        </div>
      )}
      <main className="app-main">
        {detail && current ? (
          <>
            <button className="back" onClick={() => setDetail(null)}>
              ← 돌아가기
            </button>
            <section className="detail">
              <DeadlineBadge deadline={current.deadline} deadlineAt={current.deadlineAt} demo={demo} closed={isClosed(current,demo)} />
              <div className="eyebrow">기회 상세 / {current.category}</div>
              <span
                className={
                  "status " +
                  (!isClosed(current, demo) ? "open" : "closed")
                }
              >
                ● {status(current)}
              </span>
              <h1>{current.title}</h1>
              <p className="muted">
                {current.department} · {current.source}
              </p>
              <div className="notice">
                관심 분야 일치는 추천 근거이며, 신청 자격을 보장하지 않아요.
              </div>
              <NoticeSummary item={current} profile={profile} />
              {current.organizerUrl&&<p><a href={current.organizerUrl} target="_blank" rel="noreferrer">공고에 기재된 홈페이지 ↗</a></p>}
              <div className="actions">
                <button className="secondary" onClick={() => save(current.id)}>
                  {state.saved.includes(current.id)
                    ? "♥ 저장됨"
                    : "♡ 준비함에 저장"}
                </button>
                {current.official && link(current)}
              </div>
            </section>
          </>
        ) : page === "home" ? (
          <div className="home-dashboard">
            <div className="home-heading">
              <div><span className="sectionnum">MY DASHBOARD</span><h1>나의 기회</h1><p>관심 공고부터 일정까지, 나의 하루를 한눈에 살펴보세요.</p></div>
              <button className="home-heading-action" onClick={() => go("explore")}>공고 찾아보기 <span aria-hidden="true">↗</span></button>
            </div>
            {noticeChanges.length>0&&<button className="home-change-alert" onClick={()=>go("prep")}><span>저장한 공고의 마감일 정보가 달라요 <strong>{noticeChanges.length}건</strong></span><span>내 준비함에서 확인 →</span></button>}
            <div className="home-overview" aria-label="나의 활동 요약">
              <button onClick={() => go("prep")}><span className="home-overview-icon heart" aria-hidden="true">♡</span><span className="home-overview-copy"><small>저장한 공고</small><strong>{state.saved.length + (state.savedOfficial || []).length}<em>건</em></strong></span><span className="home-overview-arrow" aria-hidden="true">↗</span></button>
              <button onClick={() => document.getElementById("home-calendar")?.scrollIntoView({behavior:"smooth",block:"start"})}><span className="home-overview-icon schedule" aria-hidden="true">▦</span><span className="home-overview-copy"><small>직접 추가한 일정</small><strong>{(state.calendarEvents || []).length}<em>건</em></strong></span><span className="home-overview-arrow" aria-hidden="true">↓</span></button>
              <button onClick={() => document.getElementById("home-interests")?.scrollIntoView({behavior:"smooth",block:"start"})}><span className="home-overview-icon interest-icon" aria-hidden="true">✦</span><span className="home-overview-copy"><small>선택한 관심 분야</small><strong>{state.interests.length}<em>개</em></strong></span><span className="home-overview-arrow" aria-hidden="true">↗</span></button>
            </div>
            <NoticeAlerts demo={demo} opportunities={allOpportunities.filter(n=>state.saved.includes(n.id))} official={savedOfficial} onPrep={()=>go("prep")}/>
            <div id="home-calendar"><Calendar demo={demo} events={state.calendarEvents || []} onEvents={calendarEvents => set(s => ({...s, calendarEvents}))} opportunities={allOpportunities.filter(n => state.saved.includes(n.id))} official={savedOfficial} onDetail={setDetail} onExplore={() => go("explore")} /></div>
            <section id="home-interests" className="home-interest" aria-labelledby="home-interest-title">
              <div className="home-interest-header"><div><span className="sectionnum">MY INTERESTS</span><h2 id="home-interest-title">관심 분야</h2><p>관심 분야를 선택하면 관련 공고를 추천해요.</p></div><button className="text-link" onClick={() => go("profile")}>내 정보 설정 →</button></div>
              <div className="chips">{tags.map(t=><button key={t} aria-pressed={state.interests.includes(t)} className={state.interests.includes(t)?"selected":""} onClick={()=>{if(!user&&!demo){requestLogin("home");return;}set(s=>({...s,interests:toggle(s.interests,t)}));}}>{state.interests.includes(t)?"✓ ":"+ "}{t}</button>)}</div>
            </section>
            <section className="section home-recommendations" aria-labelledby="home-recommendations-title">
              <div className="sectionhead"><div><span className="sectionnum">FOR YOU</span><h2 id="home-recommendations-title">나에게 맞는 기회</h2><p>선택한 관심 분야와 전공·경험을 바탕으로 살펴볼 공고예요.</p></div><button className="text-link" onClick={() => go("explore")}>공고 전체 보기 →</button></div>
              {officialRecommendations.length || recommended.length ? <div className="grid home-recommendation-grid">
                {officialRecommendations.map(({item,result})=><article className="card home-official" key={item.id}><div className="cardtop"><span className="status open">{item.source}</span><button className="save" onClick={()=>saveOfficial(item)} aria-label={`${item.title} ${(state.savedOfficial || []).some(x=>x.id===item.id)?'저장 해제':'저장'}`} aria-pressed={(state.savedOfficial || []).some(x=>x.id===item.id)}>{(state.savedOfficial || []).some(x=>x.id===item.id)?'♥':'♡'}</button></div><DeadlineBadge deadline={officialDeadline(item)} demo={demo} closed={feedClosed(item,demo)}/><strong className="home-official-title">{item.title}</strong><p className="reason">✦ {result.reasons.join(" / ")}</p><p className="muted">신청 조건은 원문에서 확인해 주세요.</p><details className="notice-summary-toggle"><summary>신청 정보 자세히 보기</summary><NoticeSummary item={item} profile={profile} checkedAt={officialData.checkedAt}/></details><a className="official-link" href={item.kind==="goodgil"?`https://goodgil.hknu.ac.kr/ptfol/imng/icmpNsbjtPgm/findIcmpNsbjtPgmInfo.do?encSddpbSeq=${item.id.replace("goodgil-","")}`:item.url} target="_blank" rel="noreferrer">공식 공고 보기 ↗ {item.kind==="goodgil"?"(로그인 필요)":""}</a></article>)}
                {recommended.slice(0,3).map(n=>card(n,true))}
              </div>:<div className="home-recommendation-empty"><img src={import.meta.env.BASE_URL+"assets/hangyeong-happy.png"} alt=""/><div><strong>{state.interests.length?"관련 공고가 아직 없어요":"나에게 맞는 기회를 찾아볼까요?"}</strong><p>{state.interests.length?"다른 관심 분야를 선택하거나 전체 공고를 살펴보세요.":"관심 분야나 내 정보를 설정하면 관련 공고를 보여드려요."}</p></div><button className="secondary" onClick={()=>go("explore")}>공고 둘러보기 →</button></div>}
            </section>
            <section className="home-shortcuts-section" aria-label="빠른 이동"><div className="home-shortcuts-heading"><span className="sectionnum">QUICK LINKS</span><h2>더 둘러보기</h2></div><div className="home-shortcuts">
              <button onClick={()=>go("goals")}><span>GOAL / 기회 연결</span><strong>목표별 기회 →</strong><small>교내 준비에서 교외 도전까지</small></button>
              <button onClick={()=>go("explore")}><span>EXPLORE</span><strong>공고 찾아보기 →</strong><small>학교와 교외 공고를 한곳에서</small></button>
              <button onClick={()=>go("prep")}><span>MY BOX</span><strong>내 준비함 →</strong><small>저장한 공고와 준비 상태 살펴보기</small></button>
            </div></section>
          </div>
        ) : page === "goals" ? (
          <GoalPaths
            demo={demo}
            saved={state.saved}
            savedOfficial={savedOfficial}
            profile={profile}
            onSave={save}
            onSaveOfficial={saveOfficial}
            onDetail={setDetail}
          />
        ) : page === "explore" ? (
          <>
            <div className="page-heading">
              <span className="sectionnum">OPPORTUNITY SEARCH</span>
              <h1>공고 찾아보기</h1>
              <p>학교와 굿길의 공개 공고를 한곳에서 살펴보세요.</p>
              <button className="secondary" onClick={() => go("profile")}>
                내 정보 설정 →
              </button>
            </div>
            <div className="tabs">
              <button
                className={cat === "교외" ? "selected" : ""}
                onClick={() => setCat("교외")}
              >
                교외 활동
              </button>
              <button
                className={cat !== "교외" ? "selected" : ""}
                onClick={() => setCat("전체")}
              >
                전체 공고
              </button>
            </div>
            {cat !== "교외" && (
              <OfficialFeed
                saved={state.savedOfficial || []}
                onSave={saveOfficial}
                interests={state.interests}
                profile={profile}
                demo={demo}
              />
            )}
            <section className="section">
              <div className="sectionhead">
                <div>
                  <span className="sectionnum">SAVED OPPORTUNITIES</span>
                  <h2>
                    {cat === "교외" ? "교외 활동" : "저장할 수 있는 공고"}
                  </h2>
                  <p>
                    모집 상태와 참가 조건은 공식 원문에서 다시 확인해 주세요.
                  </p>
                </div>
              </div>
              <div className="tabs">
                {cat !== "교외" &&
                  cats.map((c) => (
                    <button
                      key={c}
                      className={cat === c ? "selected" : ""}
                      onClick={() => setCat(c)}
                      aria-pressed={cat === c}
                    >
                      {c}
                    </button>
                  ))}
              </div>
              <div className="grid">
                {notices
                  .filter((n) =>
                    cat === "교외"
                      ? n.scope === "교외"
                      : cat === "전체" || n.category === cat,
                  )
                  .map((n) => card(n))}
              </div>
            </section>
          </>
        ) : page === "profile" ? (
          <ProfilePage
            accountSaved={!!user && !demo}
            profile={profile}
            onChange={setProfile}
            onExplore={() => go("explore")}
          />
        ) : (
          <PrepPage demo={demo} opportunities={allOpportunities.filter(n => state.saved.includes(n.id))} official={savedOfficial} profile={profile} calendarEvents={state.calendarEvents || []} changes={noticeChanges} onAddPlans={events => set(s => ({...s,calendarEvents:[...(s.calendarEvents || []),...events.filter(event => !(s.calendarEvents || []).some(existing => existing.planId && existing.planId === event.planId))]}))} onAcknowledge={change => set(s => ({...s, savedOfficial:(s.savedOfficial || []).map(old => old.id === change.id ? (currentOfficial.find(item => item.id === old.id) || old) : old), savedOpportunities:(s.savedOpportunities || []).map(old => old.id === change.id ? (opportunities.find(item => item.id === old.id) || old) : old)}))} checks={state.checks} ai={state.ai} applied={state.applied} onSave={save} onSaveOfficial={saveOfficial} onDetail={setDetail} onCheck={changeCheck} onAi={(id, checked) => set(s => ({...s, ai:{...s.ai,[id]:checked}}))} onApplied={(id, checked) => set(s => ({...s, applied:{...s.applied,[id]:checked}}))} onExplore={() => go("explore")} renderLink={link} />
        )}
      </main>
      <footer>
        <div>
          <strong>
            기회<span>ON</span>
          </strong>
          <p>
            공식 신청은 학교 원문에서 진행됩니다
            <br />
            기회ON은 학생 아이디어톤 제안작이며 학교 공식 서비스가 아닙니다.
          </p>
        </div>
        <p>
          2026 디자인씽킹 아이디어톤 제안작
          <br />팀 기회지기 · 한경국립대학교 송원진, 고유민
        </p>
      </footer>
    </>
  );
}
function AccountGate() {
  const { user, ready, recovery, finishRecovery } = useAuth();
  const [data, setData] = useState<{
      id: string;
      state: State;
      profile: Profile;
    } | null>(null),
    [error, setError] = useState("");
  const [route, setRoute] = useState(() =>
    location.hash.startsWith("#/") ? location.hash.slice(2) : "",
  );
  useEffect(() => {
    const onHash = () =>
      setRoute(location.hash.startsWith("#/") ? location.hash.slice(2) : "");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (path: string) => {
    location.hash = path === "landing" ? "" : "/" + path;
    setRoute(path === "landing" ? "" : path);
    window.scrollTo(0, 0);
  };
  const onSuccess = () => {
    finishRecovery();
    const destination = sessionStorage.getItem("gihoe-return-to") || "home";
    sessionStorage.removeItem("gihoe-return-to");
    const clean = new URL(location.href);
    clean.searchParams.delete("auth");
    history.replaceState(
      null,
      "",
      clean.pathname + clean.search + "#/" + destination,
    );
    setRoute(destination);
  };
  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
    if (!user || demo || !supabase) return;
    supabase
      .from("user_data")
      .select("state,profile")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data: row, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(
            "계정 정보를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.",
          );
          return;
        }
        setData({
          id: user.id,
          state: {
            ...blank,
            ...row?.state,
            onboardingComplete: row
              ? row.state?.onboardingComplete !== false
              : false,
          },
          profile: { ...emptyProfile, ...row?.profile },
        });
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  useEffect(() => {
    if (!ready || user || demo || !["profile", "prep"].includes(route)) return;
    sessionStorage.setItem("gihoe-return-to", route);
    navigate("login");
  }, [ready, user?.id, route]);
  useEffect(() => {
    if (
      !ready ||
      recovery ||
      new URLSearchParams(location.search).get("auth") === "recovery"
    )
      return;
    if (user && ["login", "signup", "forgot"].includes(route)) {
      const dest = sessionStorage.getItem("gihoe-return-to") || "home";
      sessionStorage.removeItem("gihoe-return-to");
      navigate(dest);
    }
  }, [ready, user?.id, route, recovery]);
  if (!ready)
    return (
      <main>
        <p>로그인 정보를 확인하고 있어요…</p>
      </main>
    );
  if (recovery)
    return <AuthPage route="reset" navigate={navigate} onSuccess={onSuccess} />;
  if (!user && !demo && ["login", "signup", "forgot"].includes(route))
    return (
      <AuthPage
        route={route as "login" | "signup" | "forgot"}
        navigate={navigate}
        onSuccess={onSuccess}
      />
    );
  if (!user && !demo && !["explore"].includes(route))
    return <Landing navigate={navigate} />;
  if (user && !demo && (!data || data.id !== user.id))
    return (
      <main>
        <p role="status">{error || "내 정보를 불러오고 있어요…"}</p>
        {error && (
          <button onClick={() => supabase?.auth.signOut()}>로그아웃</button>
        )}
      </main>
    );
  return (
    <DeadlineClock><App
      key={demo ? "demo" : user?.id || "guest"}
      user={user}
      cloudData={user && !demo ? data || undefined : undefined}
    /></DeadlineClock>
  );
}
createRoot(document.getElementById("root")!).render(<AccountGate />);
