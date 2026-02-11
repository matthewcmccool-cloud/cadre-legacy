# Cadre UI/UX Deep Dive — Part 2: Implementation Details

**Companion to: Cadre_UIUX_Deep_Dive_Spec.md**
**For: Claude Code implementation**
**Purpose: Every detail Part 1 left ambiguous**

---

## 1. Design System Tokens

Claude Code needs exact values, not descriptions. Everything below is Tailwind-native.

### Color Palette

```
Background layers:
  Page bg:           bg-zinc-950         (#09090b)
  Card bg:           bg-zinc-900         (#18181b)
  Card bg hover:     bg-zinc-800         (#27272a)
  Elevated surface:  bg-zinc-800/50      (sidebar, modals)
  Input bg:          bg-zinc-900         with border-zinc-700

Text:
  Primary:           text-zinc-100        (#f4f4f5)
  Secondary:         text-zinc-400        (#a1a1aa)
  Tertiary:          text-zinc-500        (#71717a)
  Disabled:          text-zinc-600        (#52525b)

Accent (brand):
  Primary purple:    text-purple-500      (#a855f7)  — Pro badges, followed borders, CTAs
  Purple hover:      text-purple-400      (#c084fc)
  Purple bg fill:    bg-purple-600        (#9333ea)  — Follow button filled state
  Purple subtle:     bg-purple-500/10     — followed chip left border, light accents

Signal colors:
  Fundraise:         border-emerald-500/30, text-emerald-400
  Surge:             border-orange-500/30, text-orange-400
  Stall:             border-yellow-500/30, text-yellow-400
  Error:             text-red-400
  Success:           text-emerald-400

Borders:
  Default:           border-zinc-800
  Subtle:            border-zinc-800/50
  Input focus:       border-purple-500/50 with ring-1 ring-purple-500/20
```

### Typography Scale

```
Hero headline:     text-4xl font-semibold tracking-tight    (homepage only)
Page title:        text-2xl font-semibold tracking-tight    (Discover, Feed, Fundraises)
Section header:    text-lg font-medium                      (Hiring Activity, Open Roles)
Card title:        text-sm font-medium text-zinc-100        (company name in feed card)
Card body:         text-sm text-zinc-400                    (role title, location)
Card meta:         text-xs text-zinc-500                    (timestamp, function label)
Badge text:        text-xs font-medium                      (stage badges, PRO badge)
Stat number:       text-2xl font-semibold tabular-nums      (47 open roles, 23 new)
Stat label:        text-xs text-zinc-500 uppercase tracking-wide  (OPEN ROLES, NEW THIS WEEK)
Button text:       text-sm font-medium
Nav link:          text-sm font-medium text-zinc-400 hover:text-zinc-100
```

Font family: keep whatever is currently in the project. Do NOT change fonts during this update. Typography improvements come in a later polish pass.

### Spacing System

```
Page padding:       px-6 (mobile), px-8 (desktop), max-w-7xl mx-auto
Card padding:       p-4
Card gap:           space-y-3 (between cards in feed)
Section gap:        space-y-8 (between sections on a page)
Chip gap:           gap-2 (flex-wrap)
Nav height:         h-14
Ticker height:      h-8
Sidebar width:      w-72 (desktop feed sidebar)
Modal max-width:    max-w-md (account creation), max-w-lg (onboarding playlist)
```

### Border Radius

```
Cards:              rounded-lg
Chips:              rounded-full
Buttons:            rounded-md
Inputs:             rounded-md
Modals:             rounded-xl
Badges:             rounded-full
```

### Shadows

Minimal. Dark theme doesn't need much shadow.
```
Cards:              No shadow (rely on bg contrast against page)
Modals:             shadow-2xl (modal needs to lift off page)
Dropdowns:          shadow-lg
Toasts:             shadow-lg
```

---

## 2. Command Palette Search (⌘K)

### Trigger

- Desktop: click the search icon in nav, OR press ⌘K (Mac) / Ctrl+K (Windows)
- Mobile: tap the search icon in nav header

### Layout

Full-screen overlay with centered search box. Not a dropdown — a modal. This is the Raycast/Linear/Spotlight pattern.

```
┌─────────────────────────────────────────────────────────┐
│  (dimmed backdrop - bg-black/60)                         │
│                                                          │
│     ┌───────────────────────────────────────────┐       │
│     │ 🔍 Search companies, investors, roles...   │       │
│     └───────────────────────────────────────────┘       │
│                                                          │
│     ┌───────────────────────────────────────────┐       │
│     │                                            │       │
│     │  Companies                                 │       │
│     │  ┌─ [Logo] Anthropic · AI · Series C ──┐  │       │
│     │  └──────────────────────────────────────┘  │       │
│     │  ┌─ [Logo] Anduril · Defense · Late ───┐  │       │
│     │  └──────────────────────────────────────┘  │       │
│     │                                            │       │
│     │  Investors                                 │       │
│     │  ┌─ [Logo] Andreessen Horowitz ─────────┐  │       │
│     │  └──────────────────────────────────────┘  │       │
│     │                                            │       │
│     │  Jobs                                      │       │
│     │  ┌─ Senior ML Engineer · Anthropic ─────┐  │       │
│     │  └──────────────────────────────────────┘  │       │
│     │                                            │       │
│     │  ───────────── ESC to close ─────────────  │       │
│     └───────────────────────────────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Behavior

- Results appear as you type (debounced 200ms)
- Results grouped by type: Companies, Investors, Jobs (in that order)
- Max 3 results per group (with "See all X results →" link at bottom of each group)
- Results are keyboard navigable (↑↓ to move, Enter to select, Esc to close)
- Each result row shows: logo (if company/investor), name, subtitle info
- Clicking a result navigates to that entity page and closes the search
- Empty state (no query): show "Recent" if logged in (last 5 visited entities), or nothing if anonymous
- No results: "No results for '[query]'. Try searching for a company, investor, or job title."

### Technical

- Endpoint: `/api/search?q={query}` — searches across companies, investors, and jobs in one query
- For Airtable MVP: this will be slower than ideal. Use client-side caching of company/investor names for instant filtering, with server-side search as fallback for jobs.
- The search input should auto-focus when the modal opens.

---

## 3. Job Detail Page (/job/[id])

Currently exists but needs updates for the new design.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  ← Back to [Company Name] roles                         │
│                                                          │
│  Senior Research Engineer                                │
│  [Logo] Anthropic · San Francisco · Engineering          │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐            │
│  │ Series C │ │ Full-time│ │ Posted 2d ago│            │
│  └──────────┘ └──────────┘ └──────────────┘            │
│                                                          │
│  Backed by                                               │
│  [Spark Capital] [Google Ventures] [a16z] +4             │
│                                                          │
│  [Apply on Greenhouse →]          [Follow Anthropic]     │
│                                                          │
│  ── About this role ─────────────────────────────────── │
│  │                                                      │
│  │  (Job description text — rendered markdown)          │
│  │  ...                                                 │
│  │                                                      │
│  ────────────────────────────────────────────────────── │
│                                                          │
│  ── More roles at Anthropic (46) ────────────────────── │
│  │                                                      │
│  │  [Role row] [Role row] [Role row]                    │
│  │  [See all roles →]                                   │
│  │                                                      │
│  ────────────────────────────────────────────────────── │
│                                                          │
│  ── Similar roles at other companies ────────────────── │
│  │                                                      │
│  │  [Role row] [Role row] [Role row]                    │
│  │  (same function + same industry, different company)  │
│  │                                                      │
│  ────────────────────────────────────────────────────── │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Key decisions

- **"Apply on Greenhouse →"** is the primary CTA. It's a purple-600 filled button that links to the external ATS job page. This is the one place the user leaves Cadre.
- **"Follow Anthropic"** is secondary — an outlined button next to the apply CTA. Same follow button behavior as the company page.
- **Back navigation:** "← Back to Anthropic roles" if the user came from the company page. "← Back to results" if they came from Discover/Jobs. Use `document.referrer` or URL params to determine. Fallback: "← Back to Discover."
- **Investor badges** appear on the job page — this is the unique Cadre value. Every other job board shows the job. Cadre shows who funds the company that posted it.
- **"More roles at Anthropic"** shows 3 other roles at the same company. Keeps the user in the Cadre ecosystem.
- **"Similar roles"** shows 3 roles at other companies in the same industry with the same function classification. Cross-company discovery.
- **Job description** is rendered markdown. Some ATS platforms return HTML, others plain text. Sanitize and render consistently. Use `prose` class from Tailwind typography plugin for body text styling.

### No Pro gating on job pages

Job pages are fully free. No blurred sections, no upgrade prompts. The job page is a public-facing SEO surface — it needs to be crawlable and complete for search engines. Pro features live on the Feed and entity pages, not individual job pages.

---

## 4. Jobs View in Discover (/discover?view=jobs)

### Layout

When the user switches to Jobs view in Discover, the chips grid is replaced by a list view:

```
┌─────────────────────────────────────────────────────────┐
│  Discover                                                │
│  [Companies]  [Jobs ●]  [Investors]                      │
│                                                          │
│  [Search] [Industry ▾] [Function ▾] [Stage ▾]           │
│  [Location ▾] [Remote ▾] {Hiring Activity ▾ PRO}        │
│                                                          │
│  7,823 jobs                                              │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [Logo] Senior Research Engineer                     │  │
│  │        Anthropic · San Francisco · Engineering      │  │
│  │        Series C · Spark Capital, a16z +4            │  │
│  │        Posted 2 hours ago                           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [Logo] Product Manager, Growth                      │  │
│  │        Brex · Remote · Product                      │  │
│  │        Late Stage · Greenoaks, Y Combinator +3      │  │
│  │        Posted yesterday                             │  │
│  └────────────────────────────────────────────────────┘  │
│  ...                                                     │
│  [Load more]                                             │
└─────────────────────────────────────────────────────────┘
```

### Job row anatomy

Each row is a card (bg-zinc-900, rounded-lg, p-4). On hover: bg-zinc-800. Clickable — entire card links to /job/[id].

Line 1: Company logo (24px, rounded) + Job title (text-sm font-medium text-zinc-100)
Line 2: Company name · Location · Function (text-sm text-zinc-400)
Line 3: Stage badge + lead investor names (text-xs text-zinc-500)
Line 4: Relative timestamp (text-xs text-zinc-500)

### Filters specific to Jobs view

Jobs view gets additional filters that don't exist in Companies/Investors views:
- **Function** — Engineering, Sales, Product, Design, Marketing, Operations, etc. (from the 16 function classifications)
- **Location** — free text with suggestions (San Francisco, New York, Remote, London, etc.)
- **Remote** — toggle: All / Remote / On-site / Hybrid

These filters only appear when `view=jobs`. They persist if the user switches away and back.

### Sort

Default: newest first (posted date descending). 
Optional sort toggle: "Newest" / "Company size" (by total roles at company, descending).

### Pagination

Load 30 jobs initially. "Load more" button at the bottom (not infinite scroll — explicit load-more is better for SEO because crawlers can follow pagination links). After "Load more" is clicked, load 30 more. URL updates: `/discover?view=jobs&page=2`.

---

## 5. Weekly Digest Email Template

This email is the product. Designing it carefully.

### Subject Line

Dynamic, personalized:
- "Your companies posted 23 new roles this week" (if there's activity)
- "Quiet week — 2 new roles across your 18 companies" (if low activity)
- "🔥 Brex is surging — and 3 more updates from your feed" (if notable signal)

### Email Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  CADRE · THE HIRING SIGNAL                               │
│  Your weekly hiring activity update                      │
│  Week of February 10, 2026                               │
│                                                          │
│  ════════════════════════════════════════════════════════ │
│                                                          │
│  YOUR COMPANIES THIS WEEK                                │
│  Following 18 companies · 142 open roles                 │
│  23 new roles posted · 4 roles closed                    │
│                                                          │
│  ════════════════════════════════════════════════════════ │
│                                                          │
│  MOST ACTIVE                                             │
│                                                          │
│  Anthropic                                    8 new      │
│  Senior Research Engineer, Infrastructure     posted Mon │
│  Lead, ML Platform Engineer... +5 more                   │
│  → View all roles                                        │
│                                                          │
│  Brex                                         5 new      │
│  VP Sales, Account Executive, SDR Manager     posted Tue │
│  ... +2 more                                             │
│  → View all roles                                        │
│                                                          │
│  Figma                                        3 new      │
│  Staff Product Designer, Design Engineer      posted Wed │
│  ... +1 more                                             │
│  → View all roles                                        │
│                                                          │
│  ════════════════════════════════════════════════════════ │
│                                                          │
│  FUNDRAISE ALERT                                         │
│                                                          │
│  Brex raised $150M Series D                              │
│  Led by Greenoaks · Now hiring 28 roles                  │
│  → See company page                                      │
│                                                          │
│  ════════════════════════════════════════════════════════ │
│                                                          │
│  QUIET COMPANIES                                         │
│  These companies haven't posted in 30+ days:             │
│                                                          │
│  Notion — 45 days since last posting                     │
│  Linear — 38 days since last posting                     │
│  Ramp — 31 days since last posting                       │
│                                                          │
│  ════════════════════════════════════════════════════════ │
│                                                          │
│  ⚡ Want faster updates?                                  │
│  Pro users get daily alerts and surge/stall detection.   │
│  → Start your free trial                                 │
│                                                          │
│  ════════════════════════════════════════════════════════ │
│                                                          │
│  Cadre · Hiring Activity Intelligence                    │
│  Manage preferences · Unsubscribe                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Section Logic

**YOUR COMPANIES THIS WEEK:** Always present. Shows aggregate stats. Even if activity is zero: "0 new roles posted — quiet week across your companies."

**MOST ACTIVE:** Show top 3 followed companies by new roles posted this week. For each: company name, up to 3 role titles, "more" count, link to company page on Cadre. If no company posted anything, omit this section entirely.

**FUNDRAISE ALERT:** Only present if a followed company raised during the week. If multiple raised, show all (this is rare — probably 0-1 per week for most users).

**QUIET COMPANIES:** Only present if any followed company has 30+ days since last posting. This section does two things: (1) provides genuine intelligence (something may be off), (2) seeds the "stall alert" concept that's a Pro feature. The free digest tells you they're quiet. Pro tells you immediately when it happens and flags the 60-day and 90-day thresholds.

**PRO UPSELL:** Always present, always at the bottom, always one line + one link. Never aggressive. The framing: "Want faster updates?" (speed gap). Not "Unlock premium features!" (feature marketing).

### Design

- Plain HTML email (no frameworks, no CSS-in-JS — email clients are primitive)
- Max width: 600px, centered
- Background: #18181b (zinc-900)
- Text: #f4f4f5 (zinc-100) for primary, #a1a1aa (zinc-400) for secondary
- Accent: #a855f7 (purple-500) for links and the Pro CTA
- Company logos: 24px inline images (hosted on Cadre's domain for email client compatibility)
- Dividers: thin line in #27272a (zinc-800)
- Font: system font stack (email can't load custom fonts reliably)
- All links point to cadre.careers with UTM params: `?utm_source=digest&utm_medium=email&utm_campaign=weekly`

### Loops.so Implementation

- Audience: "digest_subscribers" (separate from newsletter audience)
- Trigger: scheduled send, Saturdays at 9:00 AM in the user's timezone (if timezone available, otherwise 9:00 AM ET)
- Personalization: Loops.so supports dynamic data blocks. Each user's digest data is computed by OpenClaw on Friday night and pushed to Loops as user properties:
  - `digest_summary` (JSON blob with all section data)
  - `companies_following_count`
  - `new_roles_this_week`
  - `most_active_companies` (array)
  - `fundraise_alerts` (array)
  - `quiet_companies` (array)

Alternative approach if Loops can't handle complex dynamic content: generate the full HTML email per-user in a Next.js API route and send via Loops' transactional email API. This gives full control over layout.

---

## 6. Trial Start Flow

### Trigger

User clicks "Start 14-day free trial" from:
- /pricing page
- Any Pro teaser/prompt in the UI

### Step 1: Redirect to Stripe Checkout

If user is logged in → redirect to Stripe Checkout with:
```
mode: 'subscription'
line_items: [{ price: PRICE_ID_MONTHLY, quantity: 1 }]
subscription_data: { trial_period_days: 14 }
```

If user is NOT logged in → show account creation modal first (same as Follow flow), then redirect to Stripe Checkout after account is created.

Stripe Checkout is a hosted page (not embedded). The user briefly leaves cadre.careers, enters payment info on Stripe's page, and returns.

### Step 2: Success Return

Stripe redirects to `/settings/billing?trial=started`

The billing page shows:
```
┌─────────────────────────────────────────┐
│                                          │
│  ✓ Your Pro trial is active              │
│                                          │
│  Trial ends: February 25, 2026           │
│  After trial: $79/month                  │
│                                          │
│  [Manage billing →]   (Stripe portal)    │
│                                          │
└─────────────────────────────────────────┘
```

### Step 3: Welcome Email

Triggered by Stripe webhook `customer.subscription.created` where `status: 'trialing'`.

Email content:
- Subject: "Your Cadre Pro trial is active"
- Body: "Here's what you can do now: daily alerts, hiring surge detection, cross-company comparisons. Your trial ends [date]. → Open your feed"

### Step 4: Trial End

Stripe automatically converts to paid subscription on day 15 (if payment succeeds) or cancels (if payment fails).

On conversion → no email needed (seamless).
On cancellation → user drops to free tier. Email: "Your Pro trial has ended. You're back on the free plan — you still have your feed and weekly digest. Want Pro back? → Reactivate"

### Annual Toggle

The pricing page shows both options:
```
[$79/month]    [$63/month billed annually — save 20%]
```

These are two separate Stripe Price IDs. The toggle switches which Price ID is passed to Checkout. The trial applies to both.

---

## 7. Settings Page (/settings)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Settings                                                │
│                                                          │
│  ┌────────────┐                                          │
│  │ Account    │  ── Account ─────────────────────────── │
│  │ Alerts     │  │                                      │
│  │ Billing    │  │  Email: matt@example.com              │
│  └────────────┘  │  Signed in with Google                │
│                   │                                      │
│                   │  [Delete account]                     │
│                   │                                      │
│                   ────────────────────────────────────── │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

Three sub-pages via left sidebar tabs (or stacked sections on mobile).

### Account Tab

- Email (read-only, from auth provider)
- Auth method (Google / Email)
- "Delete account" — destructive action with confirmation modal: "This will delete your account, all follows, and all data. This cannot be undone. [Cancel] [Delete account]"

### Alerts Tab

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Alert Preferences                                       │
│                                                          │
│  Weekly digest                                           │
│  Summary of your followed companies' activity.           │
│  Delivered Saturday mornings.                            │
│  [✓ Enabled]                                             │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  Daily digest                                   PRO      │
│  Morning summary of yesterday's activity.                │
│  {Free users: "Upgrade to Pro to enable →"}              │
│  {Pro users: [✓ Enabled]  Time: [9:00 AM ▾]}            │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  Real-time alerts                               PRO      │
│  Instant notification for high-priority signals.         │
│  {Free users: "Upgrade to Pro to enable →"}              │
│  {Pro users:                                             │
│    [✓] New roles at followed companies                   │
│    [✓] Fundraise events at followed companies            │
│    [✓] Surge alerts (3x+ posting rate)                   │
│    [✓] Stall alerts (60+ days quiet)                     │
│  }                                                       │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  Newsletter                                              │
│  The Cadre Hiring Signal — ecosystem-wide insights.      │
│  [✓ Subscribed]                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key decisions:**

- Weekly digest is ON by default for all accounts. Can be toggled off.
- Daily digest is a Pro feature. Free users see it grayed out with upgrade link. Pro users can toggle and set preferred delivery time.
- Real-time alerts are Pro. Pro users can toggle individual signal types on/off. Default: all on.
- Newsletter subscription is independent of account type. Can be toggled. Default: on for new accounts.

### Billing Tab

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Billing                                                 │
│                                                          │
│  {Free user:                                             │
│                                                          │
│    Current plan: Free                                    │
│    [Upgrade to Pro — $79/month →]                        │
│                                                          │
│  }                                                       │
│                                                          │
│  {Trial user:                                            │
│                                                          │
│    Current plan: Pro (trial)                              │
│    Trial ends: February 25, 2026                         │
│    After trial: $79/month                                │
│    [Manage billing →]  (opens Stripe Customer Portal)    │
│                                                          │
│  }                                                       │
│                                                          │
│  {Pro user:                                              │
│                                                          │
│    Current plan: Pro ($79/month)                          │
│    Next billing date: March 10, 2026                     │
│    [Manage billing →]  (opens Stripe Customer Portal)    │
│    [Switch to annual ($63/month) →]                      │
│                                                          │
│  }                                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

Stripe Customer Portal handles payment method updates, invoice history, and cancellation. Don't rebuild any of that.

---

## 8. Manage Follows Panel

Triggered by clicking "Manage" link on the Feed page header.

### Implementation: Slide-Over Panel

Slides in from the right. Overlay on the current page (dimmed backdrop). Same pattern as a mobile nav drawer but wider (w-96 on desktop, full-width on mobile).

```
┌──────────────────────────────────┐
│  Following (18)            [✕]  │
│                                  │
│  ┌───────────────────────────┐  │
│  │ 🔍 Search companies...    │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌───────────────────────────┐  │
│  │ ★ Anthropic   Series C   │  │
│  │ ★ Brex        Late Stage │  │
│  │ ★ Figma       Late Stage │  │
│  │ ★ Notion      Late Stage │  │
│  │ ★ Ramp        Late Stage │  │
│  │ ...                       │  │
│  └───────────────────────────┘  │
│                                  │
│  Suggested                       │
│  ┌───────────────────────────┐  │
│  │ ☆ Vercel     Late Stage  │  │
│  │ ☆ Linear     Mid Stage   │  │
│  │ ☆ Cursor     Early Stage │  │
│  └───────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

### Behavior

- Shows all currently followed companies as a scrollable list with filled star icons
- Each row is tappable to toggle follow/unfollow (instant, optimistic)
- Search at top filters the followed list AND adds search results from all companies (so users can add new follows without leaving the panel)
- "Suggested" section at bottom shows companies the user doesn't follow but might like (same industry as their followed companies, same investors, currently surging)
- Count in the header updates live as user adds/removes follows
- Closing the panel returns to the feed, which refreshes to reflect changes

---

## 9. Comparison View (/feed/compare) — Pro Only

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Compare                                         [+ Add]    │
│  Showing 6 of 18 followed companies                         │
│                                                              │
│  ┌──────────┬────────┬─────────┬──────────┬───────┬──────┐  │
│  │ Company  │ Open   │ New     │ Velocity │ Top   │30-day│  │
│  │          │ Roles  │ This Wk │ trend    │ Func  │chart │  │
│  ├──────────┼────────┼─────────┼──────────┼───────┼──────┤  │
│  │Anthropic │ 47     │ 8  ↑   │ ▁▃▅▇▇   │ Eng   │ ~~~~│  │
│  │Brex      │ 28     │ 5  ↑   │ ▁▂▅▇▅   │ Sales │ ~~~~│  │
│  │Figma     │ 19     │ 3  —   │ ▃▃▃▃▃   │ Dsgn  │ ~~~~│  │
│  │Ramp      │ 15     │ 0  ↓   │ ▅▃▂▁▁   │ Eng   │ ~~~~│  │
│  │Notion    │ 12     │ 0      │ ▁▁▁▁▁   │ —     │ ~~~~│  │
│  │Linear    │  8     │ 2  ↑   │ ▁▁▁▃▅   │ Eng   │ ~~~~│  │
│  └──────────┴────────┴─────────┴──────────┴───────┴──────┘  │
│                                                              │
│  Sort by: [Open Roles ▾]  Show: [All ▾] [Surging] [Stalled] │
│                                                              │
│  [Export CSV →]                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key decisions

- Table layout, not cards. This is an analytical view for power users.
- Default shows all followed companies, sorted by open roles descending.
- Columns: Company (with logo), Open Roles, New This Week (with ↑↓— trend arrow), Velocity (mini sparkline), Top Function, 30-day sparkline.
- Sortable by clicking column headers.
- Filterable: "Surging" (only companies with 3x+ average), "Stalled" (only companies with 0 postings in 30+ days).
- [+ Add] opens company picker to add non-followed companies to the comparison (temporary, for this session only — doesn't follow them).
- [Export CSV] downloads the table data as a CSV file.
- Accessible via: the "Compare" tab on /feed (appears as a tab alongside the activity feed), or "Compare with..." button on company detail pages.

### Mobile

Don't render the table on mobile. Show a message: "Comparison view is available on desktop. → Open on desktop" with a link the user can send to themselves. This is not worth the responsive complexity for MVP.

---

## 10. Toast Notification System

### Spec

- Position: bottom-center of viewport, 24px from bottom edge
- Width: auto (content-driven), max-w-sm
- Background: bg-zinc-800, border border-zinc-700, rounded-lg, shadow-lg
- Text: text-sm text-zinc-100
- Icon: left-aligned, contextual (✓ for success, ✕ for error, ℹ for info)
- Auto-dismiss: 3 seconds for success, 5 seconds for error, manual dismiss for action-required
- Animation: slide up + fade in on appear, slide down + fade out on dismiss
- Stack: if multiple toasts, stack vertically with 8px gap (newest on bottom)

### Toast types used in the app

```
Success (follow):
  ✓ Following Anthropic. You'll see their activity in your feed.

Success (unfollow):
  ✓ Unfollowed Anthropic.

Success (portfolio follow):
  ✓ Following 34 companies in Sequoia's portfolio.

Success (CSV export):
  ✓ CSV exported. Check your downloads.

Error (generic):
  ✕ Something went wrong. Try again.

Error (network):
  ✕ Couldn't connect. Check your internet connection.

Info (trial ending):
  ℹ Your Pro trial ends in 2 days. → Keep Pro
```

### Implementation

Build a simple toast context provider (React context) that any component can call:
```typescript
const { toast } = useToast()
toast({ type: 'success', message: 'Following Anthropic...' })
```

Don't use a library. Toast UIs are 50 lines of code. A library adds bundle weight for no reason.

---

## 11. Skeleton Loading States

### Principle

Every data-dependent component has a skeleton that matches its exact dimensions. No spinners. No "Loading..." text. Skeletons maintain layout stability (no content shift when data arrives).

### Component Skeletons

**Company chip skeleton:**
```
┌────────────────────────────────────┐
│  [○ 24px]  [████████ 80px] [███]  │  ← rounded-full, bg-zinc-800 animate-pulse
└────────────────────────────────────┘
```

**Feed card skeleton:**
```
┌──────────────────────────────────────────────┐
│  [○ 32px]  [████████████ 120px]     [██ 40px]│
│            [████████████████ 200px]           │
│            [████████ 100px]                   │
└──────────────────────────────────────────────┘
```
4 skeleton cards stacked with space-y-3.

**Sparkline skeleton:**
```
[▁▁▁▁▁▁▁▁▁▁▁▁] ← 120x24px rectangle, bg-zinc-800 animate-pulse, rounded
```

**Job row skeleton:**
```
┌──────────────────────────────────────────────┐
│  [○ 24px]  [████████████████ 180px]          │
│            [████████████ 140px]              │
│            [██████ 80px]                     │
│            [████ 60px]                       │
└──────────────────────────────────────────────┘
```

### Animation

All skeletons use `animate-pulse` (Tailwind built-in). The pulse timing should be consistent across all components — don't mix different pulse speeds.

---

## 12. Error States

### Page-Level Errors

If the API call for a page fails entirely (Airtable down, network error):

```
┌─────────────────────────────────────────┐
│                                          │
│         Something went wrong             │
│                                          │
│  We couldn't load this page. This is     │
│  usually temporary.                      │
│                                          │
│  [Try again]   [Go to homepage]          │
│                                          │
└─────────────────────────────────────────┘
```

Centered on page. No angry icons or error codes. Calm, minimal.

### Component-Level Errors

If a specific component fails (e.g., sparkline data didn't load but the rest of the page is fine):

- Don't show an error message inside the component
- Show a flat line sparkline (all zeros) or simply hide the component
- Log the error silently for debugging
- The page should still function even if individual data components fail

### Empty States

**No companies match filters:**
"No companies match your filters. [Clear filters]"

**No jobs match filters:**
"No jobs match your filters. Try broadening your search. [Clear filters]"

**No fundraises this week:**
"No fundraises detected this week. Check back soon, or [browse recent fundraises →]"

**Search returns nothing:**
"No results for '[query]'. Try searching for a company name, investor, or job title."

---

## 13. Data & State Architecture

### User State Model

Claude Code needs to know what data lives where and how to access it.

```typescript
// User state (from auth provider — Clerk)
type User = {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: Date
}

// Subscription state (from Stripe via webhook)
type Subscription = {
  status: 'free' | 'trialing' | 'active' | 'canceled' | 'past_due'
  planId?: string                    // Stripe Price ID
  trialEndsAt?: Date
  currentPeriodEnd?: Date
}

// Follow state (stored in Airtable for MVP, migrates to Supabase later)
type Follow = {
  userId: string
  companyId: string                  // Airtable record ID
  followedAt: Date
  source: 'direct' | 'portfolio'    // how they followed (individually or via investor portfolio)
  portfolioInvestorId?: string       // if source is 'portfolio', which investor triggered it
}

// Alert preferences (stored in Airtable or Clerk user metadata)
type AlertPreferences = {
  weeklyDigest: boolean              // default: true
  dailyDigest: boolean               // default: true (Pro only)
  dailyDigestTime: string            // default: '09:00'
  realtimeNewRoles: boolean          // default: true (Pro only)
  realtimeFundraises: boolean        // default: true (Pro only)
  realtimeSurges: boolean            // default: true (Pro only)
  realtimeStalls: boolean            // default: true (Pro only)
  newsletter: boolean                // default: true
}
```

### React Context

Three context providers wrap the app:

```typescript
// 1. Auth context (from Clerk)
// Provides: user object, isSignedIn, signIn(), signOut()

// 2. Subscription context (fetched from Airtable/Stripe on auth)
// Provides: subscription status, isPro (boolean helper), isTrialing, trialDaysRemaining

// 3. Follows context (fetched from Airtable on auth)
// Provides: followedCompanyIds (Set), follow(companyId), unfollow(companyId), isFollowing(companyId)
// follow() and unfollow() are optimistic — update local state immediately, sync to Airtable async
```

### API Routes Needed

```
POST   /api/auth/webhook          ← Clerk webhook for user events
POST   /api/stripe/webhook        ← Stripe webhook for subscription events
GET    /api/follows               ← get user's followed companies
POST   /api/follows               ← follow a company { companyId }
DELETE /api/follows/[companyId]    ← unfollow a company
POST   /api/follows/portfolio     ← follow all companies for an investor { investorId }
GET    /api/feed                  ← get activity feed for user's followed companies
GET    /api/search?q=             ← search across companies, investors, jobs
GET    /api/company/[id]/activity ← get hiring activity data for a company
GET    /api/investor/[id]/activity← get portfolio activity data for an investor
POST   /api/subscribe             ← newsletter signup (already exists per previous spec)
PUT    /api/preferences           ← update alert preferences
POST   /api/checkout              ← create Stripe Checkout session
GET    /api/billing/portal        ← create Stripe Customer Portal session
GET    /api/export/csv            ← export comparison data as CSV (Pro only)
```

### Pro Feature Gating

Every Pro-gated feature checks `subscription.status` from context:

```typescript
const { isPro } = useSubscription()

// In component:
if (isPro) {
  // render full feature
} else {
  // render blurred/disabled version with upgrade prompt
}
```

The gating happens client-side for UI elements. API routes for Pro-only data (export, comparison) also check subscription status server-side and return 403 if not Pro.

---

## 14. Responsive Breakpoints

### Breakpoint Definitions

```
Mobile:       < 768px    (sm: in Tailwind)
Tablet:       768-1024px (md:)
Desktop:      > 1024px   (lg:)
Wide:         > 1280px   (xl:)
```

### Mobile-Specific Behaviors

**Navigation:** Bottom tab bar (Discover / Feed / Fundraises). Top bar shows Cadre logo + search icon + avatar only.

**Feed:** Full-width cards. No sidebar. Summary stats collapse to a single horizontal bar above the feed: "18 cos · 142 roles · 23 new". Tappable to expand full stats.

**Discover/Companies:** Chips wrap naturally. 2-3 chips per row on mobile. Filters collapse into a single "Filters" button that opens a bottom sheet with all filter options.

**Company Detail:** Full-width layout. Follow button stays right-aligned in header. Sparkline moves below the stats text (not inline). Investor badges wrap.

**Search:** Full-screen overlay (same as desktop). Input auto-focuses with keyboard open.

**Settings:** Sidebar tabs become stacked vertically (full-width buttons). Each tab expands its content below.

**Comparison View:** Not rendered on mobile. Shows redirect message.

**Manage Follows Panel:** Full-screen instead of slide-over. Back button at top instead of ✕.

### Tablet

Same as desktop but:
- Feed sidebar collapses to horizontal bar (like mobile)
- Page padding reduces to px-6
- Comparison table scrolls horizontally if needed

---

## 15. Footer

Every page. Minimal.

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Cadre · Hiring Activity Intelligence                    │
│                                                          │
│  Discover · Fundraises · Pricing · Newsletter            │
│                                                          │
│  © 2026 Cadre · Terms · Privacy · Contact                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

- bg-zinc-950 (same as page, blends in)
- text-zinc-500 for all text
- Links hover to text-zinc-300
- "Hiring Activity Intelligence" subtly seeds the category name
- "Newsletter" links to anchor on homepage newsletter CTA
- "Terms" and "Privacy" need pages (can be placeholder for MVP)
- "Contact" mailto link to matt@cadre.careers
- Generous top padding (py-16) to separate from page content
- Maximum understated. The footer should feel like it barely exists.

---

## 16. Feed Card — Role Grouping Behavior

When a company posts multiple roles on the same day, they collapse into a single feed card:

### Collapsed State (default)

```
┌──────────────────────────────────────────────┐
│  [Logo]  Anthropic                    today  │
│          Posted 3 new roles                  │
│          Senior Research Engineer · SF · Eng  │
│          and 2 more →                        │
└──────────────────────────────────────────────┘
```

### Expanded State (after clicking "and 2 more →")

```
┌──────────────────────────────────────────────┐
│  [Logo]  Anthropic                    today  │
│          Posted 3 new roles                  │
│          Senior Research Engineer · SF · Eng  │
│          Infrastructure Lead · SF · Eng       │
│          ML Platform Engineer · Remote · Eng  │
│          ← Show less                         │
└──────────────────────────────────────────────┘
```

### Rules

- Group roles by company + date (same company, same calendar day)
- If 1 role: show the role directly (no grouping)
- If 2-3 roles: show first role, "and X more →"
- If 4+ roles: show first role, "and X more →" 
- Expanded state shows all roles, each as a row with title · location · function
- Each role row is clickable → navigates to /job/[id]
- "Show less" collapses back

---

## 17. URL Routing — Complete Map

```
/                              Homepage (anonymous) OR redirect to /feed (logged in)
/discover                      Discover page, defaults to ?view=companies
/discover?view=companies       Companies directory
/discover?view=jobs            Jobs listing
/discover?view=investors       Investors directory
/company/[slug]                Company detail
/investor/[slug]               Investor detail
/job/[id]                      Job detail
/fundraises                    Fundraise feed
/feed                          My Feed (requires auth, redirects to / if not logged in)
/feed/compare                  Comparison view (requires Pro)
/pricing                       Pricing page
/settings                      Settings (requires auth)
/settings/alerts               Alert preferences
/settings/billing              Billing management
/sitemap.xml                   Auto-generated sitemap
/terms                         Terms of service (placeholder for MVP)
/privacy                       Privacy policy (placeholder for MVP)
```

### Redirect Logic

```
/ (homepage):
  if (isSignedIn) → redirect to /feed
  else → render homepage

/feed:
  if (!isSignedIn) → redirect to /
  else → render feed

/feed/compare:
  if (!isSignedIn) → redirect to /
  if (!isPro) → render comparison page with full blur + upgrade prompt
  else → render comparison page

/settings:
  if (!isSignedIn) → redirect to /
  else → render settings
```

---

## 18. MVP Build Priority

For Claude Code, build in this order:

### Phase A: Foundation (must build first)
1. Clerk auth integration (Google OAuth + magic link)
2. User data model in Airtable (Follows table, Preferences)
3. Follow/unfollow API routes
4. Subscription context (hardcode to 'free' initially — Stripe comes later)

### Phase B: Core Pages
5. Navigation redesign (Discover / Feed / Fundraises)
6. Homepage redesign (hero, ticker, entry cards, newsletter CTA)
7. Discover page with view mode switching (Companies / Jobs / Investors)
8. Updated company detail page with Follow button + hiring activity section (sparkline, stats)
9. Updated investor detail page with Follow Portfolio button
10. Updated job detail page with investor badges and Follow prompt
11. Fundraises page (chronological feed)

### Phase C: Personalization
12. Onboarding flow (account creation modal → playlist company selector)
13. My Feed page (activity feed with card types)
14. Manage Follows slide-over panel
15. Command palette search (⌘K)
16. Toast notification system

### Phase D: Monetization
17. Pricing page
18. Stripe integration (Checkout, webhooks, Customer Portal)
19. Pro feature gating (blur overlays, disabled filters, Pro badges)
20. Settings page (account, alerts, billing)
21. Comparison view (Pro only)
22. CSV export (Pro only)

### Phase E: Email
23. Weekly digest email template + Loops.so integration
24. Trial lifecycle emails (welcome, mid-trial, ending, expired)
25. Newsletter subscriber flow (already partially built)

### Phase F: Polish
26. Skeleton loading states for all components
27. Error states for all pages
28. Mobile responsive pass
29. Footer
30. SEO (JSON-LD, meta tags, sitemap — from existing spec)

---

## 19. What I'm Worried About

### Concern 1: Airtable as the user data store

Follows, preferences, and subscription status need to be stored somewhere. Airtable is the current database. It works for company/job/investor data (read-heavy, batch-updated by OpenClaw). But user data is write-heavy (every follow, every preference toggle, every page load checking subscription status). Airtable's API has rate limits (5 requests/second) that will become a problem fast.

**Recommendation:** Store user data in Clerk's user metadata (for preferences and subscription status) and a simple Follows table in Airtable for now. Plan for Supabase migration before reaching 500 active users.

### Concern 2: Feed data query performance

The feed requires: "Get all jobs posted in the last 7 days WHERE company_id IN [user's followed company IDs], sorted by date descending." On Airtable, this means: fetch user's follows, then filter jobs by those company IDs. If a user follows 50 companies and there are 7,800 jobs, this is an expensive query.

**Recommendation:** Pre-compute the feed. When OpenClaw syncs new jobs, it also updates a "Feed Events" table with denormalized data (job title, company name, company logo, posted date, function, location). The feed API reads from this table with a simple filter. Writes happen during sync, reads are fast.

### Concern 3: Sparkline data availability

Sparklines require historical data — daily posting counts for the last 30 days. This data doesn't exist yet unless OpenClaw has been recording daily snapshots. If OpenClaw starts now, you'll have 30 days of data by mid-March.

**Recommendation:** Start OpenClaw's daily snapshot recording immediately (Phase 5 in the updated OpenClaw spec). For the first month of the product, show a "Data building..." placeholder instead of the sparkline, or show a flat line with a tooltip: "Historical data available after March 15."

### Concern 4: The homepage redirect for logged-in users

If logged-in users always redirect from / to /feed, they lose access to the homepage ticker, the weekly signal card, and the newsletter CTA. These are valuable content surfaces.

**Recommendation:** Don't hard redirect. Instead, show the feed as the default view but keep "Discover" and the homepage content accessible via nav. The homepage content (ticker, signal card) should also appear at the TOP of the feed page for logged-in users — the ticker runs above the feed, and the weekly signal card can appear as the first card in the feed (pinned, dismissable).

### Concern 5: Time-to-first-value for new accounts

The onboarding flow (account creation → playlist → feed) must be FAST. If any step takes more than 2 seconds to load, the user will bounce. The playlist suggestions need to be pre-computed (not computed on the fly during onboarding). The feed needs to have data ready immediately after onboarding completes.

**Recommendation:** Pre-compute "suggested companies" for common entry points (by industry, by investor). Cache them. When the user finishes the playlist and lands on /feed, show the last 7 days of activity for their followed companies — this data already exists in the jobs table, just needs filtering. No cold-start problem as long as the companies they followed have recent job activity.
