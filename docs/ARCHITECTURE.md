# Cadre — Architecture

**Last updated:** February 11, 2026
**Status:** Pre-rebuild. This doc should be updated by Claude Code after each major implementation session.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 (App Router) | Deployed on Vercel |
| Auth | Clerk | Google OAuth + email magic link. Middleware protects /feed, /feed/compare, /settings |
| Database | Supabase (Postgres) | Migrating from Airtable. See `Cadre_Airtable_Supabase_Migration.md` |
| Payments | Stripe | Checkout Sessions, Customer Portal, webhooks |
| Email | Loops.so | Weekly digest, trial emails, re-engagement |
| Hosting | Vercel | Auto-deploy from main branch |
| AI Agent | OpenClaw (Mac Mini M4) | ATS sync, enrichment, content generation, anomaly detection |
| Domain | cadre.careers | |

---

## Environment Variables

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=

# Loops
LOOPS_API_KEY=

# Legacy (remove after Airtable migration)
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
```

---

## Database Schema

### Core Data (migrated from Airtable)

```
companies
├── id (uuid, PK)
├── name, slug, logo_url, description
├── website, location, stage
├── ats_platform, ats_slug, careers_url
├── status ('active' | 'inactive' | 'stealth')
└── created_at, updated_at

investors
├── id (uuid, PK)
├── name, slug, logo_url
├── type ('vc' | 'pe' | 'angel' | 'cvc' | 'accelerator')
├── location, website
└── created_at, updated_at

jobs
├── id (uuid, PK)
├── company_id → companies
├── title, location, remote_status, function
├── ats_job_id, ats_url, description
├── posted_date, first_seen_at, last_seen_at
├── status ('active' | 'closed')
└── created_at, updated_at

fundraises
├── id (uuid, PK)
├── company_id → companies
├── round_type, amount, date_announced
├── source_url, source_name
└── created_at

industries
├── id (uuid, PK)
└── name, slug
```

### Junction Tables

```
company_investors    (company_id, investor_id, relationship)
company_industries   (company_id, industry_id)
fundraise_investors  (fundraise_id, investor_id, role: 'lead' | 'participant')
```

### User Data (created by Claude Code Prompts 1-2)

```
follows              (user_id, company_id, source, portfolio_investor_id)
alert_preferences    (user_id, weekly_digest, daily_digest, realtime_*, newsletter)
feed_events          (event_type, company_id, company_name, event_data jsonb, event_date)
company_daily_metrics (company_id, date, active_roles, new_roles, closed_roles, roles_by_function)
```

### Computed Views

```
company_stats        → active_roles, new_this_week, new_this_month per company
investor_stats       → portfolio_companies, total_portfolio_roles, new_this_week per investor
```

---

## URL Routing

```
/                        → Homepage (redirects to /feed if signed in)
/discover                → Discover page (companies default view)
/discover?view=companies → Companies chip grid
/discover?view=jobs      → Jobs list view
/discover?view=investors → Investors chip grid
/company/[slug]          → Company detail
/investor/[slug]         → Investor detail
/job/[id]                → Job detail
/fundraises              → Fundraise feed
/feed                    → My Feed (requires auth)
/feed/compare            → Cross-company comparison (requires auth + Pro)
/settings                → Account, alerts, billing (requires auth)
/pricing                 → Pricing page
```

---

## Data Flow

### ATS Sync (OpenClaw → Supabase)

```
OpenClaw cron (daily 4 AM ET)
  → Greenhouse/Lever/Ashby APIs
  → Parse + deduplicate jobs
  → Upsert into Supabase `jobs` table
  → Compute daily metrics → `company_daily_metrics`
  → Generate feed events → `feed_events`
  → Run anomaly detection (surge/stall)
  → Report to Matt via Telegram
```

### Frontend Data Access

```
Browser → Next.js API Route → Supabase (service_role key)
                            → Return JSON to client

Protected routes:
  Clerk middleware checks auth → redirects to sign-in if needed
  API routes verify Clerk session → query Supabase with user context
```

### Payment Flow

```
User clicks "Start trial"
  → POST /api/checkout (creates Stripe Checkout Session with trial_period_days: 14)
  → Redirect to Stripe
  → Stripe webhook → POST /api/stripe/webhook
  → Updates subscription status in Supabase
  → SubscriptionProvider reads status, gates Pro features
```

### Email Flow

```
Weekly digest (Loops.so):
  → Cron triggers digest generation
  → Query followed companies' activity from feed_events
  → Send personalized email via Loops API

Trial emails (Loops.so):
  → Day 1: Welcome
  → Day 7: Mid-trial summary
  → Day 12: Trial ending reminder
```

---

## Key Patterns

### Auth Check
```javascript
// In API routes
import { auth } from '@clerk/nextjs';
const { userId } = auth();
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

### Supabase Query
```javascript
// In API routes — always use service_role key server-side
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### Pro Feature Gating
```javascript
// ProGate component wraps any Pro-only content
<ProGate fallback={<BlurredPlaceholder />}>
  <FullHistoryChart data={data} />
</ProGate>
```

### Optimistic Follows
```javascript
// FollowsProvider handles optimistic UI
const { follows, toggleFollow, isFollowing } = useFollows();
// toggleFollow updates UI immediately, syncs to Supabase in background
```

---

## Contexts / Providers

```
<ClerkProvider>
  <SubscriptionProvider>    → exposes { tier, isProUser, trialDaysLeft }
    <FollowsProvider>       → exposes { follows, toggleFollow, isFollowing, followCount }
      <Layout>
        {children}
      </Layout>
    </FollowsProvider>
  </SubscriptionProvider>
</ClerkProvider>
```

---

## Build Phases

See `Claude_Code_Implementation_Prompts.md` for the 16-prompt sequence.

| Phase | Prompts | What it delivers |
|-------|---------|-----------------|
| Foundation | 1-2 | Auth (Clerk) + data layer (Supabase) |
| Core Pages | 3-8 | Nav, homepage, Discover, company/investor/fundraise pages |
| PLG Features | 9-11 | Onboarding, My Feed, manage follows, toasts |
| Power Features | 12 | Command palette search (⌘K) |
| Monetization | 13-15 | Pricing page, Stripe, Pro gating, settings |
| Polish | 16 | Skeletons, errors, mobile, SEO |

---

## External Services

| Service | Purpose | Dashboard URL |
|---------|---------|--------------|
| Vercel | Hosting, deploys, crons | vercel.com/dashboard |
| Supabase | Database, auth policies | supabase.com/dashboard |
| Clerk | User auth | dashboard.clerk.com |
| Stripe | Payments | dashboard.stripe.com |
| Loops.so | Email campaigns | app.loops.so |
| GitHub | Source code | github.com/matthewcmccool-cloud/cadre-ui |

---

*This document should be updated by Claude Code after major implementation sessions. When in doubt about how something works, check here first.*
