# Master Claude Code: Build a University-Matching App From One Prompt File
**Target runtime: ~15:30 · Format: HeyGen avatar bookends + screen footage with VO**

Footage referenced below lives in `recordings/`. Replay MP4s run at real session speed — apply the speed ramps noted per segment in the edit.

---

## SEGMENT 0 — COLD OPEN (0:00–0:35) · footage: `demo-cold-open.mp4` (23s, slow to 0.85x) + `shot-05-mobile.png`
**VO (energetic, no avatar):**

> This app takes a student's GPA, their interests, and their budget — and instantly matches them against 84 universities across 30 countries. Safety schools, matches, reaches. Filter by country, tuition, total cost of attendance.
>
> I didn't write a single line of this code. Claude Code built it in five sessions — and in the next fifteen minutes I'll show you the exact prompts, the exact workflow, and every mistake it caught on its own. Stick around — the prompt files are free in the description.

*(On-screen text: "5 prompts. 0 lines of code written by hand.")*

---

## SEGMENT 1 — AVATAR INTRO (0:35–2:00) · HeyGen avatar, full frame → picture-in-picture
**Avatar script (~200 words, conversational):**

> Hey — welcome back. Today we're going from an empty folder to a deployed university-matching web app, using nothing but Claude Code.
>
> Here's the idea: a student types in their GPA — or their percentage, or even a letter grade — picks what they want to study, and the app scores every university in the dataset against their profile. Then they filter by country, tuition, and what a year actually costs all-in.
>
> But this video isn't really about this app. It's about the workflow that makes Claude Code feel like a senior engineer instead of a slot machine. Three things separate people who master Claude Code from people who fight it:
>
> One — the spec file. We write a CLAUDE.md before we write any prompt. Claude reads it at the start of every session.
>
> Two — small sessions with one job each. Five focused prompts beat one giant prompt every time.
>
> Three — verification baked into every prompt. Every session ends with builds and tests passing, or it isn't done.
>
> Let's open the terminal.

---

## SEGMENT 2 — THE SPEC (2:00–3:30) · footage: screen capture scrolling `CLAUDE.md` + `prompts/` folder
**VO:**

> Before the first prompt, we give Claude a constitution. This is CLAUDE.md — it lives in the repo root, and Claude Code reads it automatically.
>
> Look at what's in here: the stack — Vite plus React, no UI libraries. The design language — exact hex colors, card radius, fonts. The data model — every field a university record must have. The matching formula — sixty percent academic fit, forty percent interest fit, with exact thresholds for Safety, Match, and Reach labels. And the canonical list of thirteen field-of-interest tags.
>
> This is the highest-leverage file in the whole project. Every ambiguity you settle here is a hallucination you prevent later. When Claude knows the minimum GPA rules and the exact tag list, it can't invent its own.
>
> And next to it — five prompt files. Five sessions, one job each: scaffold, dataset, matching engine, filters, and QA. You're about to watch all five.

---

## SEGMENT 3 — SESSION 1: SCAFFOLD (3:30–5:00) · footage: `01-scaffold-replay.mp4` (61s real → run at ~0.9x with 2 pauses)
**VO:**

> Session one: the scaffold. The prompt tells Claude to set up Vite and React in the current directory, build the app shell, and — this matters — write the design system CSS before any feature exists.
>
> Watch the tool calls stream by. It reads CLAUDE.md first — that's the spec paying off. Then it writes the configs directly instead of fighting the interactive CLI — that's actually faster and it's a trick worth stealing: tell Claude it MAY skip interactive tools.
>
> *(pause VO, let terminal audio breathe for ~8s)*
>
> And the last thing it does before reporting back: runs the production build. Green. That's rule three — a session isn't done because Claude says so, it's done because the build says so.

**Lower-third: "Prompt 1: prompts/01-scaffold.md — full text in description"**

---

## SEGMENT 4 — SESSION 2: THE DATASET (5:00–6:45) · footage: `02-dataset-replay.mp4` (116s real → ~1.5x) + cutaway to `universities.json` scrolling
**VO:**

> Session two: data. Eighty-four real universities across five regions — and here's the part most tutorials skip: we don't just ask for data, we ask for a validator.
>
> The prompt demands realistic numbers — German public universities near zero tuition, US privates at fifty-eight to sixty-five thousand — and a spread of selectivity so the matching engine has something interesting to chew on: a quarter elite, a quarter strong, a quarter solid, a quarter accessible.
>
> Then look at this: Claude writes validate-data.mjs — a script that checks every record against the schema — and runs it until all eighty-four pass. We just turned "trust me" into "npm run validate."
>
> When your AI generates data, never accept the data. Accept the passing validator.

---

## SEGMENT 5 — SESSION 3: THE MATCHING ENGINE (6:45–9:15) · footage: `03-matching-replay.mp4` (288s real → ~2.5x with 3 slowdowns) + `shot-03-results.png`
**VO:**

> Session three is the brain. Two library files before any UI: grades.js converts anything a student types — 4.0 scale, percentage, letter grades — into one number. match.js implements the formula from the spec: academic fit is sixty percent, interest overlap is forty, and every school gets labeled Safety, Match, or Reach based on GPA gap thresholds we defined back in CLAUDE.md.
>
> *(slow to 1x as tests appear)*
>
> And again — the prompt requires eight assertions in a test script before the session can end. Grade conversion edge cases, label boundaries. Claude writes the tests, runs them, they pass.
>
> *(cut to shot-03-results.png)*
>
> Here's what came out: profile form, interest chips, and a stats bar — 84 total, 39 safeties, 35 matches, 10 reaches for a 3.6 GPA student into computer science and economics. Cheapest option and best-fit country, computed live.
>
> One honest note — watch what Claude reports at the end: it couldn't open a browser in the sandbox, so it flags exactly what it verified and what it didn't. When Claude tells you its blind spots, read them. That's where your bugs live.

---

## SEGMENT 6 — SESSION 4: FILTERS & POLISH (9:15–11:00) · footage: `04-filters-replay.mp4` (300s real → ~3x, slow for the mobile sheet part) + `shot-05-mobile.png`
**VO:**

> Session four turns a demo into a product. Country multi-select that only lists countries actually in the data. Region quick-chips. Two cost sliders — max tuition, and max total cost including living expenses. A sort control. And an empty state with a "relax filters" button, because dead ends kill demos.
>
> Notice the mobile requirement in the prompt: filters collapse into a bottom sheet with an active-filter count badge. You have to ask for mobile explicitly — AI defaults to desktop, every time.
>
> The polish list — focus rings, entrance animations, reduced-motion support, even print styles — that's one line each in the prompt. One line in, production detail out. That's the leverage.

---

## SEGMENT 7 — SESSION 5: QA — THE MONEY SESSION (11:00–13:15) · footage: `05-qa-replay.mp4` (432s real → ~3x, slow to 1x at the bug find)
**VO:**

> Last session, and the one that separates toys from products: we tell Claude to attack its own code. NaN handling. Division by zero. Contradictory filters. Letter-grade edge cases.
>
> *(slow to 1x, zoom terminal)*
>
> And it found something real. The profile form only checked for an empty grade — but any string that failed conversion, like a half-typed number, would throw an uncaught exception and white-screen the entire app. No error boundary. Claude moved the conversion into the form, wrapped it, and now bad input shows a friendly inline error instead of killing the page.
>
> Then it went further than I asked — it extracted the filter logic into its own testable module and grew the test suite from eight assertions to nineteen. Blank inputs, case-sensitivity, boundary GPAs, contradictory filter regressions.
>
> That bug shipped in four earlier sessions and none of them caught it, because none of them were LOOKING for it. A dedicated adversarial QA session isn't optional. It's where Claude Code earns its keep.

---

## SEGMENT 8 — DEPLOY + LIVE TEST (13:15–14:15) · footage: Vercel deploy screen capture + live app walkthrough (record after deploy)
**VO:**

> README, vercel.json, gitignore, clean initial commit — Claude left the repo deploy-ready, so shipping is: import the repo on Vercel, click deploy, done.
>
> Live test, real profile: 3.6 GPA, computer science and economics, Europe only, total budget under forty thousand a year. *(interact on screen)* — and there's the shortlist a student would actually use.

---

## SEGMENT 9 — AVATAR OUTRO (14:15–15:30) · HeyGen avatar full frame
**Avatar script (~150 words):**

> So — five prompts, zero hand-written code, one deployed product. But here's what I actually want you to take away.
>
> The spec file did the heavy lifting. Every session started by reading CLAUDE.md, which means every session agreed on the same colors, the same data shapes, the same thresholds — five sessions that never contradicted each other.
>
> Every prompt ended with proof: a build, a validator, a test suite. Claude Code will happily tell you things work. Make it show you.
>
> And the QA session found a crash bug that four "successful" sessions walked right past. Budget a whole session for breaking your own app. Always.
>
> All five prompt files and the CLAUDE.md are linked below — steal them, swap in your own project, and tell me in the comments what you build. If this saved you a weekend, the subscribe button is right there. See you in the next one.

---

## PRODUCTION NOTES
- **Avatar total: ~3:00 of 15:30 (19%)** — intro 1:25, outro 1:15, optional 10s transition stingers between segments 4→5 and 6→7 if pacing drags.
- **Terminal footage:** all replay MP4s are 124-col dark terminal; consistent monokai theme. Speed-ramp in the editor per segment notes; never show more than ~25s of terminal without a VO beat or cutaway.
- **Cutaways available:** shot-01 (empty state), shot-02 (profile filled), shot-03 (results + stats bar), shot-04 (full results grid — great for a slow vertical pan), shot-05 (mobile).
- **Music:** low-key tech bed under terminal segments, duck −18dB under VO; drop music entirely for the bug-find moment in Segment 7 (silence sells the find).
- **Thumbnail concept:** split frame — left: terminal with "5 prompts"; right: the results grid glowing; text: "I Built This With 5 Prompts".
- **Title options:**
  1. "Master Claude Code: I Built a University-Matching App With 5 Prompts (Full Workflow)"
  2. "Claude Code Full Build: University Finder App — Zero Code Written By Hand"
  3. "The 5-Prompt Claude Code Workflow That Ships Real Apps"
- **Description assets:** link prompts/ folder + CLAUDE.md (GitHub), timestamps per segment above.
