#!/usr/bin/env python3
"""Update public third-party opportunity listings. Check each organizer's terms and details before applying."""
import json, re, time, urllib.request, urllib.parse
from datetime import datetime, timezone
from pathlib import Path
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'src'/'external.json'
HEADERS={'User-Agent':'GihoeON/1.0 (+https://github.com/raccoon0120-swj/gihoe-on)'}

def fetch(url):
 req=urllib.request.Request(url,headers=HEADERS)
 with urllib.request.urlopen(req,timeout=20) as r: return r.read().decode('utf-8')

def wevity():
 html=BeautifulSoup(fetch('https://www.wevity.com/?c=find&s=1'), 'html.parser')
 links=[]
 for a in html.select('a[href*="gbn=view"]'):
  href=urllib.parse.urljoin('https://www.wevity.com/',a.get('href',''))
  if a.get_text(' ',strip=True) and href not in links and not re.search(r'이벤트|교정 서비스',a.get_text(' ',strip=True)): links.append(href)
 result=[]
 failures=0
 for url in links[:10]:
  time.sleep(3)
  try:
   page=BeautifulSoup(fetch(url),'html.parser'); title=page.select_one('.tit-area')
   if not title: raise ValueError('제목을 찾지 못했습니다')
   title=title.get_text(' ',strip=True).split('조회수')[0].strip()
   values={}
   for li in page.select('.cd-info-list li'):
    label=li.select_one('.tit')
    if label: values[label.get_text(' ',strip=True)]=li.get_text(' ',strip=True)[len(label.get_text(' ',strip=True)):].strip()
   m=re.search(r'(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})',values.get('접수기간',''))
   ix=urllib.parse.parse_qs(urllib.parse.urlparse(url).query).get('ix',[''])[0]
   if not m or not ix: raise ValueError('접수 기간 또는 공고 ID를 찾지 못했습니다')
   homepage=next((a.get('href','') for li in page.select('.cd-info-list li') if li.select_one('.tit') and li.select_one('.tit').get_text(strip=True)=='홈페이지' for a in li.select('a[href]')), '')
   if urllib.parse.urlparse(homepage).scheme not in ('http','https'): homepage=''
   result.append({'organizerUrl':homepage,'id':'wevity-'+ix,'title':title,'deadline':m.group(2),'startDate':m.group(1),'target':values.get('응모대상','원문 확인'),'department':values.get('주최/주관','원문 확인'),'url':url,'source':'위비티 공고','kind':'공모전·대외활동','timeNote':'접수 시간과 참가 조건은 주최 측에서 확인'})
  except Exception as e:
   failures += 1
   print('위비티 항목 수집 실패:',type(e).__name__)
 if failures: raise RuntimeError('위비티 공고 일부를 확인하지 못했습니다')
 return result

def devpost():
 data=json.loads(fetch('https://devpost.com/api/hackathons?status=open'))
 result=[]
 for h in data.get('hackathons',[]):
  if h.get('open_state')!='open': continue
  dates=h.get('submission_period_dates','')
  m=re.search(r'-\s*([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})',dates)
  if not m: continue
  try: deadline=datetime.strptime(' '.join(m.groups()),'%b %d %Y').date().isoformat()
  except ValueError: continue
  if not h.get('id') or not h.get('url'):continue
  result.append({'organizerUrl':'','id':'devpost-'+str(h['id']),'title':h.get('title',''),'deadline':deadline,'target':'국가·연령 등 참가 자격 원문 확인','department':h.get('organization_name') or 'Devpost 주최 정보 확인','url':h['url'],'source':'Devpost','kind':'해커톤','timeNote':'현지 마감일·시간대와 참가 자격 원문 확인'})
 return result

if __name__=='__main__':
 try: old=json.loads(OUT.read_text()) if OUT.exists() else {}
 except (ValueError,OSError): old={}
 all_items=[]; errors=[]
 for name,func in [('위비티',wevity),('Devpost',devpost)]:
  try:
   items=func()
   if not items: raise ValueError('empty results')
   checked=datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
   for item in items: item['checkedAt']=checked
   all_items.extend(items);print(name, len(items),'건')
  except Exception as e:
   previous=[x for x in old.get('items',[]) if (x.get('id','').startswith('wevity-') if name=='위비티' else x.get('id','').startswith('devpost-'))]
   all_items.extend(previous); errors.append(name);print(name,'수집 실패; 이전 목록 유지:',type(e).__name__)
 if not all_items: raise SystemExit('목록을 갱신하지 않았습니다.')
 temp=OUT.with_suffix('.json.tmp')
 try:
  temp.write_text(json.dumps({'checkedAt':datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC'),'items':all_items},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  temp.replace(OUT)
 finally:
  temp.unlink(missing_ok=True)
 if errors: print('갱신 실패 출처:', ', '.join(errors))
