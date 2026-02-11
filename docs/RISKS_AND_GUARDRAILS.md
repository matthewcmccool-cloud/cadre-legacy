# Cadre — Risks, Guardrails & Anti-Patterns

**Living document. Read before every major build cycle.**
**Last updated: February 11, 2026**

---

## Why This File Exists

AI makes it easy to ship fast. It does not make it easy to ship *right*. This document is a standing reminder of the mistakes that kill solo-founder startups — not the dramatic ones, but the slow, invisible ones. Every AI agent working on Cadre (Claude Code, OpenClaw, Comet) should treat this as context. Every decision should pass through these filters.

---

## I. Don't Look Like a Weekend Project

Cadre has real infrastructure — a knowledge graph, automated ATS pipelines, cross-portfolio aggregation that nobody else has. But if the frontend, messaging, or positioning don't immediately communicate that depth, sophisticated buyers will dismiss it in seconds.

**Rules:**
- Never describe Cadre as a "job board." It's a hiring activity intelligence platform.
- Lead with data infrastructure and the knowledge graph in conversations with VCs and fund ops. Lead with speed and alerts in conversations with recruiters.
- Every UI decision should signal intentionality. No placeholder text in production. No "Lorem ipsum." No default component library aesthetics.
- If a feature looks like something that could be vibe-coded in a weekend, either cut it or make it clearly deeper than the surface suggests.

---

## II. Security Is a Before-Launch Problem

The gap between a demo and a product handling payments and user data is enormous. Most AI-assisted builders skip this entirely.

**Rules:**
- Zero hardcoded API keys or credentials in committed code. Ever. Grep for this before every merge.
- Rate limiting on all public-facing API routes before first paying customer.
- Input validation and sanitization on every form and API endpoint.
- Error boundaries on every page. A crashed page in front of a VC prospect is a dead deal.
- RLS policies enabled on all Supabase user data tables before launch.
- Audit every AI-generated PR before merging to main. Claude Code and Comet are fast but not infallible.
- OPENCLAW_API_KEY required on all ingestion endpoints. No unauthenticated write access to the database.

---

## III. Document Everything — Your Bus Factor Is 1

Nothing about Cadre's architecture, business logic, or data model should live only in your head or in expired conversation histories.

**Rules:**
- Architecture decisions go in docs/ARCHITECTURE.md.
- Every migration gets a comment block explaining *why*, not just *what*.
- LAUNCH_CHECKLIST.md stays current. If you had to onboard a co-founder tomorrow, they should be able to deploy from that doc alone.
- This file, the thesis, and the strategy docs live in the repo — not in chat transcripts.
- When an AI agent makes a non-obvious decision, it should leave a code comment explaining the reasoning.

---

## IV. Revenue Over Vanity

Waitlist signups, Twitter followers, newsletter subscribers, and MRR screenshots are not revenue. The only metric that matters pre-traction is: **someone paid you money for this.**

**Rules:**
- Never treat interest form submissions as validation. They're signal, not commitment.
- Don't spend more time on content marketing than on closing the first deal.
- Don't compare progress to people posting inflated metrics on X. Most of it is performative.
- The uncomfortable question — "will you pay $99/month for this?" — should be asked this month, not next month.
- One paying customer before any accelerator application.

---

## V. Stop Building, Start Selling

Code is commoditized. Identifying a real problem, pricing it correctly, building relationships with buyers, and sustaining a business is not. The risk is staying in builder mode when the next phase demands founder mode.

**Rules:**
- "One more feature" is never a prerequisite for outreach. Ship and sell in parallel.
- Cold outreach to VCs showing their own portfolio data ("your engineering hiring is down 10%, sales up 20%") is higher leverage than any single code commit.
- Price with confidence. Competitors charge $200–500/month for less. Cadre Pro at $99/month is already the value option.
- The best product insights come from conversations with buyers, not from more time in the codebase.
- Every week should include at least one conversation with a potential customer.

---

## VI. Stay in the Niche

The temptation in a chaotic market is to chase trends, pivot constantly, or expand scope too early. Cadre's strength is its specific, underserved niche: VC-backed hiring intelligence.

**Rules:**
- Don't expand beyond the VC ecosystem before dominating it.
- Don't pivot based on Twitter discourse. Pivot based on customer feedback.
- Don't build features for hypothetical users. Build for the buyers you've talked to.
- The knowledge graph is the moat. Protect it. Deepen it. Everything else is a feature on top.
- Resist the urge to become a generic data platform before the core use cases are proven.

---

## VII. Protect the Founder

You are the entire pipeline. If you burn out, everything stops. AI agents are force multipliers, not replacements for the human making decisions.

**Rules:**
- Sleep, exercise, breaks are not optional. This is a marathon.
- Batch AI agent work into focused sprints. Don't context-switch between strategy, code review, and sales in the same hour.
- Set weekly goals, not daily panic responses.
- The cabin sprint has an end date. Pace accordingly.

---

## Summary — The Pre-Launch Checklist

- [ ] Security audit complete (API keys, rate limiting, input validation, RLS)
- [ ] System documentation current (ARCHITECTURE.md, LAUNCH_CHECKLIST.md, this file)
- [ ] First cold outreach sent to 3–5 target VCs
- [ ] Pricing live and confident ($99/mo consumer, $500/mo fund)
- [ ] All messaging says "hiring intelligence platform," never "job board"
- [ ] Every AI-generated PR audited before merge
- [ ] One paying customer before accelerator applications
- [ ] Founder sustainability plan in place

---

## How to Use This File

**For Matt:** Read before every sprint. Check the boxes as you go. Add new lessons as you learn them.

**For AI agents (Claude Code, OpenClaw, Comet, Claude Opus):** Treat every rule in this document as a constraint. If a proposed change violates any of these guardrails, flag it. Don't silently ship code that contradicts these principles.

---

*Inspired by @IM_Kevin_Archer's thread: "Everyone Can Code Now. That's the Problem." — February 11, 2026*
*Updated with Cadre-specific context from the February 2026 cabin sprint.*
