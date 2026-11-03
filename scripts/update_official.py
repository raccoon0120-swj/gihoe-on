#!/usr/bin/env python3
"""Refresh a snapshot of the publicly visible first pages; requires beautifulsoup4."""
import json,re,urllib.request,datetime
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urljoin
root=Path(__file__).resolve().parents[1]
def fetch(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; GihoeOn/1.0)'})
 with urllib.request.urlopen(req,timeout=30) as res:return BeautifulSoup(res.read(),'html.parser')
def tags(title,default):
 groups={'장학금':['장학','지원금','등록금'],'공모전':['공모','경진','아이디어톤'],'자격증·어학':['자격증','어학','영어','토익'],'취업·멘토링':['취업','진로','멘토','채용'],'교내 활동':['프로그램','특강','교육','활동','모집']}
 found=[k for k,words in groups.items() if any(w in title for w in words)]
 return found or [default]
items=[]
for url,source,category,default in [('https://www.hknu.ac.kr/kor/563/subview.do','한경국립대학교 장학공지','경제적 지원','장학금'),('https://www.hknu.ac.kr/kor/561/subview.do','한경국립대학교 한경공지','교내 활동','교내 활동')]:
 soup=fetch(url)
 for row in soup.select('table tbody tr'):
  a=row.select_one('a[href*="/artclView.do"]')
  if not a:continue
  title=' '.join(a.stripped_strings); title=re.sub(r'^\[\s*일반공지\s*\]\s*','',title).strip(); cells=row.find_all('td'); txt=row.get_text(' ',strip=True); dates=re.findall(r'20\d{2}\.\d{2}\.\d{2}',txt)
  items.append({'id':'hknu-'+re.search(r'/([0-9]+)/artclView',a['href']).group(1),'title':title,'source':source,'category':category,'tags':tags(title,default),'date':dates[0] if dates else '게시일 확인 필요','target':'원문에서 확인','condition':'원문에서 확인','url':urljoin(url,a['href']),'kind':'school'})
soup=fetch('https://goodgil.hknu.ac.kr/index.do')
for a in soup.select('div.context > a.tit'):
 title=a.p.get_text(' ',strip=True) if a.p else ''
 if not title:continue
 fields={dl.dt.get_text(' ',strip=True):dl.dd.get_text(' ',strip=True) for dl in a.parent.select('dl') if dl.dt and dl.dd}; match=re.search(r'encSddpbSeq=([a-f0-9]+)',a.get('onclick',''))
 if not match:continue
 items.append({'id':'goodgil-'+match.group(1),'title':title,'source':'굿길 비교과 프로그램','category':'교내 활동','tags':tags(title,'교내 활동'),'date':fields.get('신청기간','기간 확인 필요'),'target':fields.get('신청대상','원문에서 확인'),'condition':fields.get('신청조건','원문에서 확인'),'year':fields.get('신청학년','원문에서 확인'),'campus':fields.get('개설장소','원문에서 확인'),'url':'https://goodgil.hknu.ac.kr/index.do','kind':'goodgil'})
result={'checkedAt':datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime('%Y-%m-%d %H:%M KST'),'scope':'학교 한경공지·장학공지 첫 페이지 및 굿길 첫 화면의 공개 목록','items':items}
(root/'src'/'official.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Refreshed',len(items),'public notices')
