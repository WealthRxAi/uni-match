#!/usr/bin/env python3
"""Render authentic Claude Code session replays (.cast v2) from the real session JSONL log."""
import json, sys, os, re

SRC = "/root/.claude/projects/-home-claude-uni-match/dac8194f-8bd7-552b-953d-61635b12cef1.jsonl"
BOUNDS = ["01-scaffold","02-dataset","03-matching","04-filters","05-qa"]
PROMPT_STARTS = {
 "01-scaffold": "Read CLAUDE.md. Scaffold the UniMatch app",
 "02-dataset":  "Read CLAUDE.md. Create src/data/universities.json",
 "03-matching": "Read CLAUDE.md. Build the matching engine",
 "04-filters":  "Read CLAUDE.md. Add the FilterBar",
 "05-qa":       "Read CLAUDE.md. Final QA session",
}
C = dict(reset="\x1b[0m", dim="\x1b[2m", cyan="\x1b[1;36m", yel="\x1b[1;33m",
         grn="\x1b[1;32m", blu="\x1b[1;34m", mag="\x1b[1;35m", wht="\x1b[0;37m", red="\x1b[1;31m")

def wrap(text, width=116, indent="  "):
    out=[]
    for line in text.split("\n"):
        while len(line)>width:
            out.append(indent+line[:width]); line=line[width:]
        out.append(indent+line)
    return "\r\n".join(out)

events=[]
with open(SRC) as f:
    for ln in f:
        try: events.append(json.loads(ln))
        except: pass

# split by user prompts that match session starts
sessions={}; cur=None
for e in events:
    if e.get("type")=="user":
        msg=e.get("message",{})
        content=msg.get("content")
        txt=""
        if isinstance(content,str): txt=content
        elif isinstance(content,list):
            txt=" ".join(c.get("text","") for c in content if isinstance(c,dict) and c.get("type")=="text")
        for name,start in PROMPT_STARTS.items():
            if txt.strip().startswith(start): cur=name; sessions[cur]=[]
    if cur: sessions[cur].append(e)

def ts(e):
    t=e.get("timestamp")
    if not t: return None
    from datetime import datetime
    return datetime.fromisoformat(t.replace("Z","+00:00")).timestamp()

for name in BOUNDS:
    evs=sessions.get(name,[])
    if not evs: print("MISSING",name); continue
    frames=[]; t0=None; last=0.0
    def emit(dt,s): frames.append((dt,s))
    for e in evs:
        t=ts(e)
        if t and t0 is None: t0=t
        rel = (t-t0) if (t and t0) else last
        rel = min(rel, last+2.5)  # cap idle gaps
        if rel<last: rel=last+0.05
        last=rel
        typ=e.get("type")
        if typ=="user":
            msg=e.get("message",{}); content=msg.get("content")
            if isinstance(content,str) and content.strip():
                emit(rel, f"{C['cyan']}❯ user{C['reset']}\r\n{C['wht']}{wrap(content)}{C['reset']}\r\n\r\n")
            elif isinstance(content,list):
                for c in content:
                    if isinstance(c,dict) and c.get("type")=="tool_result":
                        rc=c.get("content")
                        txt=""
                        if isinstance(rc,str): txt=rc
                        elif isinstance(rc,list): txt=" ".join(x.get("text","") for x in rc if isinstance(x,dict))
                        txt="\n".join(txt.split("\n")[:3])[:300]
                        if txt.strip(): emit(rel, f"{C['dim']}{wrap(txt)}{C['reset']}\r\n")
        elif typ=="assistant":
            msg=e.get("message",{})
            for c in msg.get("content",[]):
                if not isinstance(c,dict): continue
                if c.get("type")=="text" and c.get("text","").strip():
                    emit(rel, f"{C['mag']}⏺ Claude{C['reset']}\r\n{wrap(c['text'][:1200])}\r\n\r\n")
                elif c.get("type")=="tool_use":
                    n=c.get("name",""); i=c.get("input",{})
                    if n=="Bash": emit(rel, f"{C['grn']}⏺ Bash{C['reset']}  {C['wht']}$ {i.get('command','')[:200]}{C['reset']}\r\n")
                    elif n in("Write","Edit"): emit(rel, f"{C['yel']}⏺ {n}{C['reset']}  {i.get('file_path','')}\r\n")
                    elif n=="Read": emit(rel, f"{C['blu']}⏺ Read{C['reset']}  {i.get('file_path','')}\r\n")
                    elif n=="TodoWrite":
                        todos=i.get("todos",[])
                        lines="".join(f"  {'☑' if t.get('status')=='completed' else '☐'} {t.get('content','')[:100]}\r\n" for t in todos)
                        emit(rel, f"{C['cyan']}⏺ Update Todos{C['reset']}\r\n{lines}")
                    else: emit(rel, f"{C['dim']}⏺ {n}{C['reset']}\r\n")
    out=f"recordings/{name}-replay.cast"
    with open(out,"w") as f:
        f.write(json.dumps({"version":2,"width":124,"height":34,
            "title":f"UniMatch build — {name} (rendered from the real Claude Code session log)"})+"\n")
        for dt,s in frames: f.write(json.dumps([round(dt,3),"o",s])+"\n")
    print("WROTE",out,len(frames),"frames, duration",round(last,1),"s")
