# UniMatch Tutorial — Edit Assembly Plan

## Deliverables inventory
| File | What | Duration | Use at |
|---|---|---|---|
| `recordings/demo-cold-open.mp4` | Scripted app demo (typing GPA → matches → filters) | 0:23 | Segment 0 cold open |
| YOUR recording (HeyGen studio avatar or on-camera) | Intro — script in SCRIPT.md Seg 1 | ~1:25 | Segment 1 |
| `recordings/01-scaffold-replay.mp4` | Session 1 terminal replay (real event log) | 1:01 | Segment 3 |
| `recordings/02-dataset-replay.mp4` | Session 2 terminal replay | 1:56 | Segment 4 |
| `recordings/03-matching-replay.mp4` | Session 3 terminal replay | 4:48 | Segment 5 |
| `recordings/04-filters-replay.mp4` | Session 4 terminal replay | 5:00 | Segment 6 |
| `recordings/05-qa-replay.mp4` | Session 5 terminal replay (bug find at ~2/3 mark) | 7:12 | Segment 7 |
| `recordings/shot-01…05.png` | App stills (empty, filled, results, full grid, mobile) | — | Cutaways |
| `recordings/*.cast` | Raw asciinema casts | — | Re-render at any speed/theme with `agg` |
| YOUR recording (HeyGen studio avatar or on-camera) | Outro — script in SCRIPT.md Seg 9 | ~1:15 | Segment 9 |
| `transcripts/*.log` | Session final reports (text) | — | Zoom-in inserts |
| `prompts/*.md` + `CLAUDE.md` | The 5 prompts + spec | — | Screen-capture scrolls, description links |

## Timeline (target 15:30)
```
0:00  demo-cold-open.mp4 @0.85x + VO-0 ................. 0:35
0:35  YOUR intro take (HeyGen studio / camera) .......... 2:00
2:00  screencap: CLAUDE.md scroll + prompts/ + VO-2 .... 3:30
3:30  01-scaffold-replay @0.9x + VO-3 .................. 5:00
5:00  02-dataset-replay @1.5x + VO-4 + json cutaway .... 6:45
6:45  03-matching-replay @2.5x + VO-5 + shot-03 ........ 9:15
9:15  04-filters-replay @3x + VO-6 + shot-05 mobile ....11:00
11:00 05-qa-replay @3x→1x at bug find + VO-7 ...........13:15
13:15 Vercel deploy capture + live walkthrough + VO-8 ..14:15
14:15 YOUR outro take (HeyGen studio / camera) ..........15:30
```

## Edit rules
1. Speed-ramp terminal footage; SLOW to 1x whenever VO says "watch/look/notice".
2. Never >25s of terminal without a cutaway or VO beat.
3. Kill music during the Segment 7 bug reveal — silence, then zoom on the fix.
4. Lower-thirds show the prompt file name during each session segment.
5. Cross-dissolve stills 400ms; hard cuts everywhere else.
6. Captions on for avatar segments (HeyGen provides), off for terminal (too busy).

## Still to capture (needs deploy done)
- DONE: recordings/unimatch-live-test.gif — live walkthrough on https://uni-match-wealth-rx-ai.vercel.app (typing GPA, interests, matching, Europe filter)

## Re-render footage variants (optional)
Any cast can be re-rendered with different theme/size/speed:
`agg --theme dracula --font-size 18 --speed 1.5 recordings/03-matching-replay.cast out.gif && ffmpeg -i out.gif out.mp4`

## Footage authenticity map (what is real)
- recordings/*.cast — literal asciinema recordings of the real Claude Code sessions (raw terminal I/O)
- recordings/*-replay.mp4 — rendered from the REAL session event log (every tool call, timestamp, command as it happened); for 100% screen-real terminal footage instead, run ./record-for-camera.sh in your own terminal while screen-recording — it re-runs the same 5 prompts through real Claude Code
- recordings/demo-cold-open.mp4 — real browser session against the real built app
- recordings/unimatch-live-test.gif — real Chrome session against the LIVE deployed app
- Intro/outro: record yourself — your own HeyGen studio avatar (scripts are word-for-word in SCRIPT.md Segments 1 & 9) or on camera. No generated video is used anywhere.
