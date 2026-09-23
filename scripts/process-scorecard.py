#!/usr/bin/env python3
"""Process US College Scorecard Most-Recent-Cohorts-Institution.csv into us-universities.json (UniMatch schema)."""
import csv, json, sys
src = sys.argv[1] if len(sys.argv)>1 else None
if not src: sys.exit("usage: process-scorecard.py <csv path>")
def f(row,k):
    v=row.get(k,'')
    try: return float(v)
    except: return None
PCIP_TAGS={'PCIP11':'Computer Science','PCIP14':'Engineering','PCIP52':'Business','PCIP51':'Medicine','PCIP22':'Law','PCIP50':'Arts & Design','PCIP45':'Social Sciences','PCIP26':'Natural Sciences','PCIP40':'Natural Sciences','PCIP27':'Mathematics','PCIP13':'Education','PCIP04':'Architecture','PCIP42':'Psychology'}
def sat_to_gpa(sat, adm, openadm):
    if openadm==1: return 2.0
    if sat:
        g = 2.0 + (sat-800)/800*2.0
        return max(2.0, min(3.95, round(g*20)/20))
    if adm is not None:
        if adm<0.15: return 3.7
        if adm<0.3: return 3.4
        if adm<0.5: return 3.0
        if adm<0.75: return 2.6
        return 2.2
    return 2.3
out=[]; skipped=0
with open(src, newline='', encoding='utf-8', errors='replace') as fh:
    for row in csv.DictReader(fh):
        try:
            if row.get('CURROPER')!='1': skipped+=1; continue
            hd=f(row,'HIGHDEG') or 0
            if hd<2: skipped+=1; continue
            tuition = f(row,'TUITIONFEE_OUT') or f(row,'TUITIONFEE_IN')
            if not tuition or tuition<1000: skipped+=1; continue
            cost = f(row,'COSTT4_A') or f(row,'COSTT4_P')
            tin = f(row,'TUITIONFEE_IN') or tuition
            living = max(8000, int(cost - tin)) if cost and cost>tin else 12000
            adm = f(row,'ADM_RATE'); sat=f(row,'SAT_AVG'); openadm = f(row,'OPENADMP')
            tags=[t for k,t in PCIP_TAGS.items() if (f(row,k) or 0)>0.03]
            tags=list(dict.fromkeys(tags))[:6]
            if len(tags)<3:
                extra=[t for k,t in sorted(PCIP_TAGS.items(), key=lambda kv:-(f(row,kv[0]) or 0)) if t not in tags]
                tags=list(dict.fromkeys(tags+extra))[:3]
            gpa=sat_to_gpa(sat,adm,openadm)
            if sat: rank = int(500 + max(0,(1600-sat))*4)
            elif adm is not None: rank = int(4000 + adm*3000)
            else: rank = 8000
            url=(row.get('INSTURL') or '').strip()
            if url and not url.startswith('http'): url='https://'+url
            out.append({"id":"us"+row['UNITID'],"name":row['INSTNM'].strip(),"country":"United States","city":f"{row.get('CITY','').strip()}, {row.get('STABBR','').strip()}","state":row.get('STABBR','').strip(),"region":"North America","minGPA":gpa,"acceptanceRate":round(adm,3) if adm is not None else None,"fields":tags,"tuitionIntlUSD":int(tuition),"livingCostUSD":int(living),"applicationFeeUSD":50,"ranking":min(rank,9998),"website":url})
        except Exception:
            skipped+=1
json.dump(out, open('src/data/us-universities.json','w'))
print(f"wrote {len(out)} US universities, skipped {skipped}")
