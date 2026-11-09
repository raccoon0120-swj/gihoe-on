#!/usr/bin/env python3
"""Refresh public first-page notices only after all sources succeed."""
import datetime
import json
import re
import urllib.request
from pathlib import Path
from urllib.parse import urljoin

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'src' / 'official.json'
SOURCES = [
    ('https://www.hknu.ac.kr/kor/563/subview.do', '한경국립대학교 장학공지', '경제적 지원', '장학금'),
    ('https://www.hknu.ac.kr/kor/561/subview.do', '한경국립대학교 한경공지', '교내 활동', '교내 활동'),
]


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; GihoeOn/1.0)'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return BeautifulSoup(response.read(), 'html.parser')


def tags(title, default):
    groups = {'장학금':['장학','지원금','등록금'], '공모전':['공모','경진','아이디어톤'], '자격증·어학':['자격증','어학','영어','토익'], '취업·멘토링':['취업','진로','멘토','채용'], '교내 활동':['프로그램','특강','교육','활동','모집']}
    found = [name for name, words in groups.items() if any(word in title for word in words)]
    return found or [default]


def school_notices(url, source, category, default):
    items = []
    for row in fetch(url).select('table tbody tr'):
        link = row.select_one('a[href*="/artclView.do"]')
        match = re.search(r'/([0-9]+)/artclView', link.get('href', '')) if link else None
        if not match:
            continue
        title = re.sub(r'^\[\s*일반공지\s*\]\s*', '', ' '.join(link.stripped_strings)).strip()
        if not title:
            continue
        dates = re.findall(r'20\d{2}\.\d{2}\.\d{2}', row.get_text(' ', strip=True))
        items.append({'id':'hknu-'+match.group(1), 'title':title, 'source':source, 'category':category, 'tags':tags(title, default), 'date':dates[0] if dates else '게시일 확인 필요', 'target':'원문에서 확인', 'condition':'원문에서 확인', 'url':urljoin(url, link['href']), 'kind':'school'})
    return items


def goodgil_notices():
    items = []
    for link in fetch('https://goodgil.hknu.ac.kr/index.do').select('div.context > a.tit'):
        title = link.p.get_text(' ', strip=True) if link.p else ''
        match = re.search(r'encSddpbSeq=([a-f0-9]+)', link.get('onclick', ''))
        if not title or not match:
            continue
        fields = {dl.dt.get_text(' ', strip=True):dl.dd.get_text(' ', strip=True) for dl in link.parent.select('dl') if dl.dt and dl.dd}
        items.append({'id':'goodgil-'+match.group(1), 'title':title, 'source':'굿길 비교과 프로그램', 'category':'교내 활동', 'tags':tags(title, '교내 활동'), 'date':fields.get('신청기간','기간 확인 필요'), 'target':fields.get('신청대상','원문에서 확인'), 'condition':fields.get('신청조건','원문에서 확인'), 'year':fields.get('신청학년','원문에서 확인'), 'campus':fields.get('개설장소','원문에서 확인'), 'url':'https://goodgil.hknu.ac.kr/index.do', 'kind':'goodgil'})
    return items


def refresh():
    items = []
    for args in SOURCES:
        source_items = school_notices(*args)
        if not source_items:
            raise RuntimeError(f'{args[1]}에서 공고를 찾지 못했습니다. 기존 파일을 유지합니다.')
        items.extend(source_items)
    goodgil = goodgil_notices()
    if not goodgil:
        raise RuntimeError('굿길에서 공고를 찾지 못했습니다. 기존 파일을 유지합니다.')
    items.extend(goodgil)
    unique = list({item['id']: item for item in items}.values())
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9)))
    result = {'checkedAt':now.strftime('%Y-%m-%d %H:%M KST'), 'scope':'학교 한경공지·장학공지 첫 페이지 및 굿길 첫 화면의 공개 목록', 'items':unique}
    temp = OUTPUT.with_suffix('.json.tmp')
    try:
        temp.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        temp.replace(OUTPUT)
    finally:
        temp.unlink(missing_ok=True)
    print('Refreshed', len(unique), 'public notices')


if __name__ == '__main__':
    refresh()
