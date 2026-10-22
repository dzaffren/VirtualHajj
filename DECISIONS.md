# Decisions

Append-only. A changed decision is a new entry that supersedes the old one; only an
old entry's Status line ever changes.

## D1 · 2026-10-21 · Teach Shafi'i rulings, as in Tabung Haji courses

Why: the learners attend Tabung Haji courses, which teach the Shafi'i rulings.
Rejected: rulings that all four madhhabs share, with differences noted (more text in every rite, and it differs from the course).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D2 · 2026-10-21 · Run in the web browser on phone and laptop

Why: a learner opens a link with no install.
Rejected: installed mobile app (an install step before the first lesson), VR headset (few learners own one).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D3 · 2026-10-21 · Teach all three types of Hajj

Why: tamattu', ifrad and qiran differ in when Umrah is done and whether hady is due, so one fixed order teaches some learners the wrong order.
Rejected: tamattu' only (ifrad and qiran pilgrims learn the wrong order).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D4 · 2026-10-21 · Malay and English from the first rite

Why: Tabung Haji courses teach in Malay, and students and learners outside those courses need English.
Rejected: Malay only (no English for learners outside Malay courses), English only (does not match the Malay courses).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D5 · 2026-10-21 · Release each slice when it is done

Why: a course can test tawaf with real learners while the later rites are built, so the success test is checked early.
Rejected: one release after the full Hajj (no learner feedback until the last of seven slices).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D6 · 2026-10-21 · One content version for all ages

Why: plain text that a 10-year-old can follow also serves a first-time adult pilgrim, and every text is already written in two languages.
Rejected: a separate child version (it doubles the text again).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D15 · 2026-10-21 · A warm, quiet HUD for a third-person Hajj game

Why: learners walk as a character; a top card and corner controls keep the character and the goal in view, with text at 7:1.
Rejected: one bottom panel (it covers the character in third person), text set straight on the scene as Monument Valley does (cannot hold 7:1 over a moving 3D view), Linear's restraint (reads cool, against "warm"), a score or stars (not chosen in the brief; it can read as scoring worship).
Source: docs/design/system-brief.md
Status: active

## D16 · 2026-10-21 · Bright game palette: cream and clear sky by day, night blue by dark, one vivid orange accent

Why: the product is a 3D game, so the colours should read as one; every text pair still holds 7:1.
Rejected: sand and teal (muted; quieter than the game the user wants), Sky pastel (softer, and its plum sits near the overused purple look).
Source: docs/design/system-brief.md
Status: active

## D17 · 2026-10-21 · Build the app with React Three Fiber on React, TypeScript and Vite

Why: every rite is a 3D scene with UI on top, and React Three Fiber has the largest set of helpers (drei) and answers for 3D on the web.
Rejected: plain Three.js with TypeScript (scene and UI code written by hand), Svelte with Threlte (a smaller community, so fewer answers when stuck).
Source: docs/specs/walking-skeleton.md
Status: active

## D18 · 2026-10-21 · Host on Cloudflare Pages, with a preview URL per PR

Why: the build is static files that the free tier covers, Cloudflare's edge servers sit close to learners' phones, and each PR gets its own URL to check before merge.
Rejected: Vercel (a smaller edge network than Cloudflare's, and no gain for a static build), GitHub Pages (a slower CDN and no preview URL per PR), production-only deploys (no way to see a change before it is live).
Source: docs/specs/walking-skeleton.md
Status: active

## D19 · 2026-10-21 · Test with Vitest and Playwright

Why: Vitest runs on the app's own Vite config, and Playwright drives a real Chromium on CI, which the e2e test needs to draw a WebGL frame.
Rejected: Cypress (slower on CI), Vitest with no e2e test (the shape promises an e2e test in CI from slice 0).
Source: docs/specs/walking-skeleton.md
Status: active

## D20 · 2026-10-21 · Use pnpm

Why: installs are fast, and its strict layout fails on a package the code uses but never declared.
Rejected: npm (slower, and lets undeclared packages slip through), bun (less tested with Playwright).
Source: docs/specs/walking-skeleton.md
Status: active

## D21 · 2026-10-21 · Run CI on GitHub Actions

Why: one workflow runs the type-check, unit tests, build, deploy and the Playwright test on every push.
Rejected: Cloudflare Pages' built-in build (it only builds, so the type-check and Playwright would need a second CI).
Source: docs/specs/walking-skeleton.md
Status: active

## D22 · 2026-10-21 · Every scene holds 30 FPS on a Samsung Galaxy A35

Why: learners use phones (D2). The `/perf` page draws 200,000 triangles in 100 draw calls — an estimate of the Masjidil Haram scene, not a measurement — plus one walking figure of about 5,000 triangles and 20 bones, standing in for the character (D15). It passes only if no one-second reading after the first frame drops below 30 FPS over 5 minutes, long enough for the phone to heat up and slow down. A dropped 3D view is a fail.
Rejected: 60 FPS (forces heavy optimisation on every later scene), "loads and renders" (a stuttering scene still passes), the Galaxy A15 (a stricter bar than the shape's mid-range), a throwaway `/poc` (its number could not be re-run when `tawaf` adds the mosque), a 60-second run (too short to catch the phone slowing down as it heats up), a 5-minute average (hides stutter), a load with no figure (misses the character the game adds).
Source: docs/specs/walking-skeleton.md
Status: active

## D23 · 2026-10-21 · Keep the repo public, on a personal GitHub account

Why: GitHub Actions has no minute limit on public repos, and no secret lives in the code; the Cloudflare token sits in GitHub's secret store.
Rejected: a private repo (2,000 free Actions minutes a month), a GitHub org (no team to own it yet).
Source: docs/specs/walking-skeleton.md
Status: active

## D24 · 2026-10-21 · Serve production on the free pages.dev domain

Why: slice 0 needs no custom domain, and one can be added later with no code change.
Rejected: a custom domain now (DNS setup with nothing to gain yet).
Source: docs/specs/walking-skeleton.md
Status: active

## D25 · 2026-10-21 · Scene colours live in one scene palette, outside the UI system

Why: the design system covers only the UI drawn over the scene, and the sky, ground, kiswah and ihram colours belong to the place, not the HUD. One palette file keeps every rite's scene the same. The sky turns night blue in dark mode, as the UI does (D16).
Rejected: scene tokens in the design system (another `/design-system` run for colours the UI never uses), a fixed daytime scene (dark mode would put night-blue panels over a day sky).
Source: docs/specs/walking-skeleton.md
Status: active

## D26 · 2026-10-21 · Developer pages sit outside the learner HUD rules

Why: learners never reach `/perf`, because nothing links to it, and a 5-minute run needs a visible clock. The no-timer rule is there so learners never feel rushed. Developer pages still use the system's tokens and its 7:1 text contrast.
Rejected: holding `/perf` to the no-timer rule (no way to tell how long the run has left).
Source: docs/specs/walking-skeleton.md
Status: active

## D27 · 2026-10-21 · When the 3D view can't be shown, say so plainly and offer the way back

Why: a blank or frozen canvas leaves a first-time pilgrim, often older, with no idea what went wrong or what to do. The app covers the scene with the plain backdrop, says what happened in one line, and gives the next step: another browser when WebGL 2 is missing, a Reload button when the view drops.
Rejected: a blank page (says nothing), a message with no button (an older learner may not know how to reload a phone browser), a frozen frame (looks like the app hung).
Source: docs/specs/walking-skeleton.md
Status: active

## D28 · 2026-10-21 · Pin TypeScript to 6.0

Why: typescript-eslint, which the lint step uses, supports TypeScript below 6.1 (checked 2026-10-21). We move to 7 once it supports 7.
Rejected: TypeScript 7 (ESLint would lose its TypeScript-aware rules until typescript-eslint catches up).
Source: docs/specs/walking-skeleton.md
Status: active

## D29 · 2026-10-21 · UI components live in the app until tawaf

Why: slice 0 builds two, the top card and the primary button. Keeping them in `src/ui/` leaves the design-system package tokens-only, so `/design-sync` needs no change. They move into the package when `tawaf` adds more.
Rejected: exporting them from the design-system package now (the next `/design-sync` would have to switch the package from tokens-only to a component library for two components).
Source: docs/specs/walking-skeleton.md
Status: superseded by D41

## D30 · 2026-10-21 · Fork PRs get the build and unit tests, never secrets

Why: the repo is public (D23), and fork PRs get no secrets, so they can't deploy. Deploy and e2e are skipped for them, and the owner reviews a fork PR by hand before merging, because GitHub counts a skipped required check as passed.
Rejected: `pull_request_target` (it runs fork code with the Cloudflare token), letting fork PRs fail at the deploy step (every outside PR would look broken).
Source: docs/specs/walking-skeleton.md
Status: active

## D31 · 2026-10-22 · Build the tawaf scene and figure in code

Why: the brief asks for stylised figures with no face detail, and shapes built in code need no licence, no credit and no model download on a phone. The `/perf` figure is already built in code, at about 5,000 triangles (D22).
Rejected: free models with a licence (each licence needs a check, and some ban commercial use), bought models (they cost money, and the look may not match the brief).
Source: docs/specs/tawaf.md
Status: active

## D32 · 2026-10-22 · A tawaf round counts from the Hajar Aswad line, with the Kaabah on the left, outside the Hijr Ismail

Why: these are conditions of a valid round in the Shafi'i rulings (D1). A round counts when the figure crosses the line with no mistake. If the figure goes more than 3 m back clockwise, or steps inside the Hijr Ismail wall, the app names it and the round does not count. The round starts again at the next crossing. Before the first crossing, nothing counts and nothing is named, because tawaf has not started.
Rejected: the tawaf starts over after a mistake (stricter than the ruling), any step clockwise (small wobbles from tap-to-walk would count), a quarter round (a long wrong walk would pass unnamed), a direction check before the line (it is not tawaf yet).
Source: docs/specs/tawaf.md
Status: active

## D33 · 2026-10-22 · With hints off, the learner counts the rounds and taps Done

Why: a pilgrim must count seven rounds in Makkah, and the shape's success test is a rite walked with the hints off. Hints off hides the top card and the line's glow. The line stays as a plain marking, and mistakes are still named. Only Done at seven is correct. Done under seven is named, and the learner walks on. Done over seven is named, ends the tawaf, and goes on the done card's list, since an eighth round does not void a Shafi'i tawaf. The switch works at any time. Hints on with seven or more counted ends the tawaf, as Done does.
Rejected: the counter stays with hints off (the learner never practises the count), no line with hints off (the learner loses the fixed place to count from), a switch that locks once round 1 starts (the app is a learning tool, not a test), any wrong count starts the tawaf over (an eighth round does not void the tawaf).
Source: docs/specs/tawaf.md
Status: active

## D34 · 2026-10-22 · Learner pages open in the browser's language, with a language choice to change it

Why: Tabung Haji courses teach in Malay, and other learners need English (D4). A browser whose first language is Malay opens `/` and `/tawaf` in Malay, and any other opens them in English. The design system's language choice sits in the menu sheet on `/tawaf` and on the viewer's card on `/`. `/perf` stays in English, because it is a developer page (D26).
Rejected: Malay first on every visit (an English learner must find the choice each time), a language choice on a start card at every visit (one more tap before every lesson), English only on `/` (a Malay learner's first screen would be English), Malay anywhere in the browser's language list (a browser set to English would open in Malay), a compact BM / EN control in the top bar (the system has none, and the top bar is full on a 390px phone).
Source: docs/specs/tawaf.md
Status: active

## D35 · 2026-10-22 · Keep the language and hints settings on the device

Why: a learner who picked BM, or who practises with hints off, gets the same setting back on the next visit. Only these two settings are kept. No tawaf in progress is saved, so a reload or a new visit starts a new tawaf.
Rejected: hints on at every visit (a learner who practises with hints off must switch them off each time).
Source: docs/specs/tawaf.md
Status: active

## D36 · 2026-10-22 · Tawaf lives at /tawaf, and the viewer at / links to it

Why: each rite gets its own address that a course can send, and the viewer stays as the first screen, with a Start tawaf button.
Rejected: tawaf at `/` in place of the viewer (the viewer would go, and a later rite would need a new front page anyway).
Source: docs/specs/tawaf.md
Status: active

## D37 · 2026-10-22 · A man in ihram walks until the character pick ships

Why: the white ihram reads as a pilgrim on the mataf. Idtiba' and raml are sunnah, so a figure without them teaches nothing wrong. `tawaf-character` adds the pick and both rules.
Rejected: a woman (she comes with the pick in `tawaf-character`), a figure with no clothing detail (it does not read as a pilgrim).
Source: docs/specs/tawaf.md
Status: active

## D38 · 2026-10-22 · The done card lists each mistake made on the way

Why: after a tawaf with hints off, the list tells the learner what to practise. It states facts and gives no score, so the no-score rule holds (D15).
Rejected: a done card with no list (a learner may forget a mistake from round 2 by round 7).
Source: docs/specs/tawaf.md
Status: active

## D39 · 2026-10-22 · The pilgrim gets a ground shadow and no rim

Why: the brief asks for a ground shadow and a darker rim, so the white ihram reads on white marble. In the preview, the skin, the hair and the shadow already do that. A rim draws the figure a second time each frame on the Galaxy A35 (D22).
Rejected: a dark rim round the figure (a second draw of the figure each frame, for no gain seen in the preview).
Source: docs/specs/tawaf.md
Status: active

## D40 · 2026-10-22 · The tawaf camera turns towards the Kaabah

Why: a portrait phone sees about 24° across, so a camera straight behind the figure never shows the Kaabah, and the rule is "keep the Kaabah on your left". The camera stays behind and above the figure, turned 35° towards the Kaabah on a landscape screen, and 62° and further back on a portrait one. Walking the wrong way, it turns right, and the Kaabah shows on that side.
Rejected: a camera straight behind the figure, as the brief assumed (the Kaabah is off screen on a phone).
Source: docs/specs/tawaf.md
Status: superseded by D50

## D41 · 2026-10-22 · UI components stay in the app, in src/ui/

Why: tawaf adds seven components: the hints switch, menu button, quiet button, language choice, progress marks, bottom sheet and icons. Keeping them in `src/ui/` leaves the design-system package tokens-only, so `/design-sync` needs no change. They move into the package when a second app, or the Claude Design canvas, needs to mount them.
Rejected: moving them into the package now (it turns into a component library, and the next `/design-sync` needs a new entry and a preview per component).
Supersedes: D29
Source: docs/specs/tawaf.md
Status: active

## D42 · 2026-10-22 · /perf draws the pilgrim and the tawaf parts

Why: D22 needs every scene to hold 30 FPS on the Galaxy A35. `/perf` swaps its old figure for the pilgrim, and adds the Hijr Ismail wall and the glowing line. `/tawaf` draws less than `/perf` does, so one 5-minute run covers both, and no meter code goes on a learner page.
Rejected: a meter on `/tawaf` behind `?meter` (meter code on a learner page, and a second 5-minute run for each scene).
Source: docs/specs/tawaf.md
Status: active

## D43 · 2026-10-22 · The e2e tests steer the pilgrim through a ?e2e hook

Why: the slice test walks seven rounds. With `?e2e=1`, the page exposes `window.vh.walkTo(x, z)`, which takes the same path as a tap, and walks 10 times faster, so seven rounds take seconds on CI. The hook only moves the learner's own pilgrim.
Rejected: real arrow keys with the test steering by the pilgrim's position (about 3 minutes a run, and steering at CI's low frame rate is flaky).
Source: docs/specs/tawaf.md
Status: active

## D44 · 2026-10-22 · Up walks the pilgrim, Left and Right turn it

Why: Up walks forward the way the pilgrim faces, Down walks back, and Left and Right turn it, so holding Up and Left walks the tawaf circle. The camera turns towards the Kaabah (D40), so up the screen is not the way the pilgrim walks.
Rejected: keys that follow the screen (with the camera turned, Up would walk the pilgrim at an angle to the way it faces).
Source: docs/specs/tawaf.md
Status: active

## D45 · 2026-10-22 · Istilam: a station sheet before round 1, then a reminder at the start of each later round

Why: istilam is sunnah at the start of each round, seven in all (O2). A pilgrim in the crowd points the right hand at the Hajar Aswad, says "Bismillāhi wallāhu akbar", and kisses the hand, as al-Bujairimi and Zakariyya al-Ansari teach in the Shafi'i rulings (O17). One stop teaches the words and the gesture, and seven stops would break a walk of about 3 minutes. With hints off nothing shows, because nothing checks a sunnah.
Rejected: a sheet at every crossing (seven stops in one tawaf), a sheet before round 1 only (rounds 2 to 7 never practise it), eight istilam, with one more when round 7 ends (the user chose seven), a point with no kiss (the Shafi'i books teach the kiss), the sheet with hints off (it gives the answer away on the learner's own test).
Source: docs/specs/tawaf-stations.md
Status: active

## D46 · 2026-10-22 · The Rukun Yamani doa shows in the top card while the pilgrim walks

Why: pilgrims say "Rabbanā ātinā…" as they walk from the Rukun Yamani to the Hajar Aswad, so nobody stops. The top card shows it in each round, with hints on.
Rejected: a stop at the Rukun Yamani in round 1 (pilgrims do not stop there), a doa for each round from the Tabung Haji books (any doa is fine in the rest of the round, and it adds seven Arabic texts to check), a line on touching the Rukun Yamani (most pilgrims can't reach it in the crowd, and it adds one more ruling to check).
Source: docs/specs/tawaf-stations.md
Status: active

## D47 · 2026-10-22 · After the rounds, the learner prays two rakaat behind the Maqam Ibrahim before the done card

Why: two rakaat behind the Maqam Ibrahim follow every tawaf, as a sunnah in the Shafi'i rulings (D1). The spot counts within 3 m of a point 3 m behind the Maqam, on the line from the Kaabah through it. The sheet teaches al-Kafirun in the first rakaat and al-Ikhlas in the second, after al-Fatihah.
Rejected: the done card first, with a button to the rakaat (it puts the rakaat after the end), anywhere behind the Maqam up to 10 m (too loose to teach the place), the niat in Arabic on the sheet (one more Arabic text to check), one line with no surahs (it leaves out the sunnah surahs).
Source: docs/specs/tawaf-stations.md
Status: active

## D48 · 2026-10-22 · With hints off, the learner ends the rounds and goes to the Maqam Ibrahim alone

Why: hints off is the learner's own test (D33). Done at seven says "Seven rounds count.", and nothing guides the learner after it. A pilgrim in Makkah has no Done to press, so arrival behind the Maqam with seven or more counted acts as Done. Under seven, the spot does nothing, because learners walk across it in the rounds. Finish tawaf ends without the rakaat, and the done card notes them as a sunnah left out, not a mistake.
Rejected: the done card at Done (a hints-off learner never practises the rakaat), a top card that says to walk to the Maqam (that is a hint), a spot that does nothing until Done (a learner who goes straight to pray, as in Makkah, gets no answer), "Not done yet" at the spot under seven (it trips a learner who walks across the spot in round 3).
Source: docs/specs/tawaf-stations.md
Status: active

## D49 · 2026-10-22 · Show me how shows istilam on the pilgrim, and the walking HUD has no Show me

Why: words describe a gesture badly, so the pilgrim raises its right hand to the Hajar Aswad when the learner asks. On the walk, the glowing target and the edge arrow already show the way (tawaf O19). This closes the hand-off in tawaf O20.
Rejected: a Show me button in the walking HUD (it repeats the glow and the edge arrow), no demo (words alone describe a gesture badly), a demo of the two rakaat (a prayer animation is a lot of figure work, and learners already know how to pray).
Source: docs/specs/tawaf-stations.md
Status: active

## D50 · 2026-10-22 · The tawaf camera turns towards the Kaabah, and no further

Why: a portrait phone sees about 24° across, so a camera straight behind a walking figure never shows the Kaabah, and the rule is "keep the Kaabah on your left". The camera stays behind and above the figure. It turns up to 35° towards the Kaabah on a landscape screen, and up to 62° and further back on a portrait one. Walking the wrong way, it turns right, and the Kaabah shows on that side. It turns no further than the Kaabah is, so at a station, where the pilgrim faces the Kaabah, it stands straight behind.
Rejected: a camera straight behind the figure on the walk (the Kaabah is off screen on a phone), a fixed 35° or 62° turn (at a station, the camera looks past the Kaabah at the floor).
Supersedes: D40
Source: docs/specs/tawaf-stations.md
Status: active
