import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const ClockContext = createContext<Date | null>(null);
export function DeadlineClock({children}:{children:ReactNode}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id=window.setInterval(()=>setNow(new Date()),60_000); return ()=>window.clearInterval(id); }, []);
  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>;
}
const kstDay = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const get=(type:string)=>Number(parts.find(part=>part.type===type)?.value);
  return Date.UTC(get('year'),get('month')-1,get('day'));
};
export function deadlineWarning(deadline: string | null | undefined, now: Date, deadlineAt?: string, closed=false) {
  if (closed || !deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline) || Number.isNaN(now.getTime())) return null;
  const [year,month,day] = deadline.split('-').map(Number);
  const date=Date.UTC(year,month-1,day);
  const parsed=new Date(date);
  if (parsed.getUTCFullYear()!==year || parsed.getUTCMonth()!==month-1 || parsed.getUTCDate()!==day) return null;
  if (deadlineAt) { const end=new Date(deadlineAt); if (!Number.isNaN(end.getTime()) && end.getTime()<now.getTime()) return null; }
  const days=Math.round((date-kstDay(now))/86400000);
  if (days<0 || days>7) return null;
  return {days, level:days<=3?'urgent':'warning'} as const;
}
export default function DeadlineBadge({deadline,deadlineAt,demo,closed=false}:{deadline?:string|null;deadlineAt?:string;demo:boolean;closed?:boolean}) {
  const clock=useContext(ClockContext);
  const info=deadlineWarning(deadline,demo?new Date('2026-11-10T12:00:00+09:00'):(clock || new Date()),deadlineAt,closed);
  if (!info) return null;
  const label=info.days===0?'오늘 마감':`마감 D-${info.days}`;
  return <span className={`deadline-alert ${info.level}`} aria-label={`${info.level==='urgent'?'마감 임박':'마감 주의'}: ${label}`}><i aria-hidden="true"/>{label}</span>;
}
