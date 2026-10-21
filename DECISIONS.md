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
