# Cadre — Spec Docs

Reference docs for Claude Code and OpenClaw. Read before implementing.

---

## Start Here

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | **Tech stack, data flow, env vars, schema, URL routing, key patterns.** Read this first. Updated after each major build session. |
| `CHANGELOG.md` | **What shipped, what broke, what's next.** Updated after every Claude Code session. |

## Architecture & Strategy

| File | What it covers |
|------|---------------|
| `Cadre_Master_Strategy.md` | North star. Three products, pricing, competitive landscape, GTM sequence, what to build vs. not build. |
| `Cadre_Airtable_Supabase_Migration.md` | Full migration plan: Supabase schema, migration script, cutover timeline, OpenClaw instructions. |

## UI/UX & Implementation

| File | What it covers |
|------|---------------|
| `Cadre_UIUX_Deep_Dive_Spec.md` | Part 1: Site architecture, navigation, Discover, company/investor pages, Follow system, onboarding, Feed, Fundraises, homepage, pricing, Pro paywall patterns, conversion architecture. |
| `Cadre_UIUX_Part2_Implementation.md` | Part 2: Design tokens, ⌘K search, job pages, email templates, trial flow, settings, comparison view, toasts, skeletons, errors, state management, responsive, footer, URL routing, build priority. |
| `Claude_Code_Implementation_Prompts.md` | 16 sequential prompts to give Claude Code. Run in order. Each prompt is self-contained with exact specs. |

## Operations

| File | What it covers |
|------|---------------|
| `cadre-openclaw-briefing.md` | OpenClaw's full operational briefing: content strategy, cron schedules, data pipeline, anomaly detection, fundraise discovery, publishing workflows. |
| `Cadre_Content_Strategy.md` | Category creation playbook: 3-phase plan to seed "hiring activity intelligence," LinkedIn post templates, newsletter structure, voice guidelines. |
| `Cadre_Accelerator_Narrative.md` | Accelerator application narrative for a16z Speedrun and Vercel AI Accelerator. |

## Legacy (may be partially superseded)

| File | What it covers |
|------|---------------|
| `Cadre_UI_Changes_Spec.md` | Pre-PLG UI fixes. Some items superseded by the Deep Dive spec. |
| `backend-automation-plan.md` | Early backend automation plan. Superseded by OpenClaw briefing. |
| `investor-product-implementation-plan.md` | Early investor product plan. Superseded by Master Strategy. |
| `cadre-thesis.md` | Original thesis doc. Superseded by Master Strategy. |

---

## For Claude Code

Start every session with:
```
Read all .md files in the docs/ folder before doing anything. 
Pay special attention to ARCHITECTURE.md for current tech stack and patterns,
and the UIUX spec files for design decisions.
```

## For OpenClaw

Your primary operational briefing is `cadre-openclaw-briefing.md`. Reference `Cadre_Airtable_Supabase_Migration.md` when the database migration begins.
