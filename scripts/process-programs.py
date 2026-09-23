#!/usr/bin/env python3
"""Process Field-of-Study CSV into programs.json: per-school per-major earnings/debt (Bachelor's)."""
import csv, json, sys
src=sys.argv[1]
CIP2_TAG={'11':'Computer Science','14':'Engineering','15':'Engineering','52':'Business','51':'Medicine','22':'Law','50':'Arts & Design','45':'Social Sciences','26':'Natural Sciences','40':'Natural Sciences','27':'Mathematics','13':'Education','04':'Architecture','42':'Psychology','09':'Social Sciences','23':'Arts & Design','24':'Social Sciences','03':'Natural Sciences','19':'Education','31':'Education','43':'Law','44':'Social Sciences','54':'Social Sciences'}
valid_ids=set('us'+u['id'][2:] if u['id'].startswith('us') else '' for u in json.load(open('src/data/us-universities.json')))
valid_ids={u['id'] for u in json.load(open('src/data/us-universities.json'))}
def num(v):
    try: return int(float(v))
    except: return None
out=[]
with open(src, newline='', encoding='utf-8', errors='replace') as fh:
    for row in csv.DictReader(fh):
        uid='us'+row['UNITID']
        if uid not in valid_ids: continue
        if row.get('CREDLEV')!='3': continue  # Bachelor's only
        cip2=(row.get('CIPCODE') or '')[:2]
        tag=CIP2_TAG.get(cip2)
        if not tag: continue
        e5=num(row.get('EARN_MDN_5YR')); e1=num(row.get('EARN_MDN_1YR')); dm=num(row.get('DEBT_ALL_STGP_ANY_MDN'))
        if not (e5 or e1): continue
        title=(row.get('CIPDESC') or '').strip().rstrip('.')
        out.append({"u":uid,"tag":tag,"t":title[:80],"e5":e5,"e1":e1,"d":dm})
json.dump(out, open('src/data/programs.json','w'))
print(f"wrote {len(out)} programs for {len(set(p['u'] for p in out))} schools")
