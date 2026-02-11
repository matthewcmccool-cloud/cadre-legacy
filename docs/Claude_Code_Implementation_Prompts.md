# Claude Code Implementation Prompts — Cadre PLG Build

**How to use:** Run these prompts sequentially. Each builds on the previous. Before starting, make sure Claude Code has access to the repo and can read the spec files.

**First, always start a Claude Code session with:**
> Read these spec files before doing anything: `/path/to/Cadre_UIUX_Deep_Dive_Spec.md` and `/path/to/Cadre_UIUX_Part2_Implementation.md`. These are the complete design specs for the Cadre PLG rebuild. Reference them throughout our session.

---

## Prompt 1: Clerk Auth Setup

```
Set up Clerk authentication in the Cadre Next.js 14 project.

Requirements:
- Install @clerk/nextjs
- Configure ClerkProvider in the root layout
- Set up Google OAuth and email magic link sign-in methods
- Create a sign-in modal component (not a full page redirect — modal overlay on the current page)
- The modal should show:
  - "Follow [Company Name] and 1,300+ companies on Cadre" (dynamic headline, falls back to generic if no company context)
  - "Get weekly hiring updates for the companies you care about."
  - "Continue with Google" button (primary)
  - "Continue with email" button (secondary, triggers magic link)
  - Terms/Privacy links at bottom
- Create middleware that protects /feed, /feed/compare, and /settings routes (redirect to / if not signed in)
- Public routes (no auth required): /, /discover, /company/*, /investor/*, /job/*, /fundraises, /pricing
- Add environment variables to .env.local: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
- Create a useAuth hook wrapper that exposes: user, isSignedIn, openSignIn(context?: { companyName?: string })

Don't change any existing pages yet. Just set up the auth infrastructure so we can use it in subsequent steps.
```

---

## Prompt 2: Supabase Setup + Data Models

```
Set up Supabase in the Cadre project for user data (follows, preferences, feed events). The existing Airtable database stays for companies, jobs, and investors — Supabase is only for user-generated data.

Requirements:
- Install @supabase/supabase-js
- Create a Supabase client utility (lib/supabase.ts) with server and client variants
- Add environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

Create these tables via SQL migration:

1. `follows` table:
   - id (uuid, primary key, default gen_random_uuid())
   - user_id (text, not null) — Clerk user ID
   - company_id (text, not null) — Airtable record ID
   - source (text, default 'direct') — 'direct' or 'portfolio'
   - portfolio_investor_id (text, nullable) — if followed via investor portfolio
   - created_at (timestamptz, default now())
   - UNIQUE constraint on (user_id, company_id)

2. `alert_preferences` table:
   - user_id (text, primary key) — Clerk user ID
   - weekly_digest (boolean, default true)
   - daily_digest (boolean, default false)
   - daily_digest_time (text, default '09:00')
   - realtime_new_roles (boolean, default true)
   - realtime_fundraises (boolean, default true)
   - realtime_surges (boolean, default true)
   - realtime_stalls (boolean, default true)
   - newsletter (boolean, default true)
   - updated_at (timestamptz, default now())

3. `feed_events` table:
   - id (uuid, primary key, default gen_random_uuid())
   - event_type (text, not null) — 'new_role', 'fundraise', 'surge', 'stall'
   - company_id (text, not null)
   - company_name (text, not null)
   - company_logo_url (text)
   - company_stage (text)
   - event_data (jsonb, not null) — flexible payload per event type
   - event_date (timestamptz, not null)
   - created_at (timestamptz, default now())
   - INDEX on (company_id, event_date DESC)

4. `company_daily_metrics` table:
   - id (uuid, primary key, default gen_random_uuid())
   - company_id (text, not null)
   - date (date, not null)
   - active_roles (integer, default 0)
   - new_roles (integer, default 0)
   - roles_by_function (jsonb) — { "Engineering": 12, "Sales": 5, ... }
   - UNIQUE constraint on (company_id, date)
   - INDEX on (company_id, date DESC)

Create API routes:
- GET /api/follows — returns array of company_ids the current user follows
- POST /api/follows — body: { companyId, source?, portfolioInvestorId? } — creates follow, returns success
- DELETE /api/follows/[companyId] — removes follow
- POST /api/follows/portfolio — body: { investorId } — looks up all companies for that investor in Airtable, creates follows for each, returns count of new follows added

All follow routes require Clerk auth. Use getAuth() from @clerk/nextjs/server to get the user ID.

Create React context:
- FollowsProvider that wraps the app
- Fetches user's follows on mount (if signed in)
- Exposes: followedCompanyIds (Set<string>), isFollowing(companyId), follow(companyId), unfollow(companyId)
- follow() and unfollow() are optimistic — update local Set immediately, then sync to Supabase async. If the API call fails, revert and show error toast.

Create a SubscriptionProvider context (stub for now):
- Exposes: status ('free' | 'trialing' | 'active'), isPro (boolean), isTrialing (boolean), trialDaysRemaining (number | null)
- Hardcode to { status: 'free', isPro: false } for now. We'll wire Stripe later.
```

---

## Prompt 3: Navigation Redesign

```
Redesign the site navigation. Reference the spec files for exact design tokens (colors, typography, spacing).

Current nav: "Job Listings | Companies 267 | Investors 100" tabs

New nav structure:

Desktop (top bar, h-14, bg-zinc-950, border-b border-zinc-800):
- Left: Cadre logo (link to /)
- Center: "Discover" | "Feed" | "Fundraises" — text-sm font-medium, zinc-400 default, zinc-100 active, hover:zinc-100
- Right: Search button (magnifying glass icon + "⌘K" hint text in zinc-600) | Sign in button OR user avatar dropdown

Key behaviors:
- "Feed" nav item only renders if user is signed in (useAuth). Anonymous users see only "Discover" and "Fundraises"
- Active nav item has a subtle bottom border (2px, purple-500) or text-zinc-100
- Search button opens command palette (build in a later prompt — for now just render the button)
- Avatar dropdown (when signed in): "My Feed", "Settings", "Sign out" — dropdown bg-zinc-900, border-zinc-800, shadow-lg
- "Sign in" button: text-sm text-zinc-400 hover:text-zinc-100, no background

Mobile (bottom tab bar, h-14, bg-zinc-950, border-t border-zinc-800, fixed bottom):
- Three tabs: Discover | Feed | Fundraises
- Each tab: icon above label, text-xs
- Active tab: purple-500 icon + text, inactive: zinc-500
- Feed tab shows dot indicator if there's unread activity (can be a simple purple dot for now, real logic later)
- Top bar on mobile: Cadre logo left, search icon center, avatar/sign-in right

Remove the old tab navigation entirely. The Discover sub-navigation (Companies / Jobs / Investors) will be built inside the Discover page in the next prompt.

Keep all existing page content working — just replace the navigation chrome.
```

---

## Prompt 4: Homepage Redesign

```
Redesign the homepage (/) for anonymous visitors. Reference spec files for exact design tokens.

Current homepage: shows job listings feed directly.

New homepage for anonymous visitors (not signed in):

1. LIVE DATA TICKER (below nav, above hero)
   - Horizontal scrolling bar, h-8, bg-zinc-900, text-xs text-zinc-400
   - CSS animation scrolling left continuously (~40px/second)
   - Entries separated by " · "
   - For MVP, hardcode 5-6 entries with realistic data from your database. We'll make this dynamic later.
   - Example entries: "Anthropic +3 roles today · Sequoia portfolio: 89 new roles this week · Series B AI companies ↑22% MoM · 12 fundraises detected this week"

2. HERO SECTION (centered, generous vertical padding py-24)
   - Headline: "Hiring intelligence for the venture ecosystem." — text-4xl font-semibold tracking-tight text-zinc-100
   - Stats line: "1,312 companies · 330 investors · 7,800+ roles · Updated daily." — text-sm text-zinc-400, mt-4
   - Two CTAs side by side, mt-8:
     - "Explore companies →" — bg-purple-600 hover:bg-purple-500 text-white rounded-md px-4 py-2 text-sm font-medium. Links to /discover
     - "Get weekly intel →" — bg-transparent border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-md px-4 py-2 text-sm font-medium. Scrolls to newsletter section

3. THIS WEEK'S SIGNAL (card, max-w-2xl mx-auto, mt-16)
   - bg-zinc-900 rounded-xl p-8 border border-zinc-800
   - Hardcode one compelling data insight for now. Example: "Engineering hiring across VC-backed companies is up 18% this month. The biggest mover: Anthropic posted 23 new roles after their Series C."
   - Small "Read more on the blog →" link at bottom (can link to # for now)

4. THREE ENTRY CARDS (grid grid-cols-3 gap-4, max-w-4xl mx-auto, mt-16)
   - Each card: bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition
   - Card 1: "Companies" / "1,312 companies" / arrow icon → links to /discover?view=companies
   - Card 2: "Investors" / "330 firms" / arrow icon → links to /discover?view=investors
   - Card 3: "Fundraises" / "12 this week" / arrow icon → links to /fundraises

5. NEWSLETTER CTA (max-w-xl mx-auto, mt-24, mb-16)
   - "The Cadre Hiring Signal" — text-lg font-medium text-zinc-100
   - "Weekly hiring intelligence from 330+ VC portfolios. Saturday mornings." — text-sm text-zinc-400
   - Email input + Subscribe button, same as current but restyled to match new design
   - Wire to existing /api/subscribe endpoint

6. FOOTER (every page, but build it here first)
   - py-16, border-t border-zinc-800
   - "Cadre · Hiring Activity Intelligence" — text-sm text-zinc-500
   - Links: Discover · Fundraises · Pricing · Newsletter — text-sm text-zinc-500 hover:text-zinc-300
   - "© 2026 Cadre · Terms · Privacy · Contact" — text-xs text-zinc-600

For signed-in users: redirect / to /feed. We'll build /feed in a later prompt.
```

---

## Prompt 5: Discover Page with View Mode Switching

```
Rebuild the Discover page (/discover) to support three view modes: Companies, Jobs, and Investors.

URL structure: /discover?view=companies (default), /discover?view=jobs, /discover?view=investors

Layout:
- Page title: "Discover" — text-2xl font-semibold
- View mode switcher below title: three pill-shaped toggles
  - Selected: bg-zinc-700 text-zinc-100 rounded-full px-4 py-1.5 text-sm font-medium
  - Unselected: text-zinc-400 hover:text-zinc-100 px-4 py-1.5 text-sm
- Search bar below switcher (same as current, restyled)
- Filters below search bar:
  - Companies view: [Industry ▾] [Stage ▾] [Backed By ▾]
  - Jobs view: [Industry ▾] [Function ▾] [Stage ▾] [Location ▾] [Remote ▾]
  - Investors view: [Industry ▾] [Stage ▾]
  - All views: a grayed-out [Hiring Activity ▾] filter with "PRO" badge in text-xs text-purple-500. Clicking it opens the dropdown showing options (Posting this week, Surging, Stalled) as non-selectable with "Start free trial to unlock →" at the bottom.
- Result count: "1,312 companies" / "7,823 jobs" / "330 investors"
- Results area changes per view mode

CRITICAL: Filters persist across view modes. URL captures all state: /discover?view=companies&industry=ai&stage=series-b. Switching view modes only changes the view param.

Companies view:
- Same chip-based grid as current
- Each chip: [Logo 24px] [Name] [Stage badge] [Role count in text-xs text-zinc-500 if > 0]
- Default sort: by open role count descending (companies with most roles first)
- For signed-in users: followed companies get a 2px left border in purple-500/40 (subtle indicator)
- "View all X →" chip at end if showing truncated set

Jobs view:
- List of job cards (not chips)
- Each card: bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 cursor-pointer
  - Line 1: [Company logo 24px] Job title (text-sm font-medium text-zinc-100)
  - Line 2: Company name · Location · Function (text-sm text-zinc-400)
  - Line 3: Stage badge + lead investor name(s) (text-xs text-zinc-500)
  - Line 4: "Posted 2 hours ago" (text-xs text-zinc-500)
- Clicking card navigates to /job/[id]
- Load 30 results, "Load more" button at bottom
- Default sort: newest first

Investors view:
- Same chip-based grid as Companies view
- Each chip: [Logo if available] [Name] [Company count + role count in text-xs text-zinc-500]
- Default sort: by portfolio role count descending

Migrate all existing company, investor, and job listing logic into this unified Discover page. The old separate tab pages should redirect to /discover?view=companies, /discover?view=jobs, /discover?view=investors.
```

---

## Prompt 6: Company Detail Page Update

```
Update the company detail page (/company/[slug]) with the Follow button and hiring activity section.

Layout (reference spec file for full wireframe):

Top section:
- Company logo (48px) on its own line
- Company name (text-2xl font-semibold) with Follow button right-aligned on the same line
- One-line description below name (text-sm text-zinc-400)
- Metadata chips below description: [Industry] [Stage] [Location] [ATS platform] — each as small badges (bg-zinc-800 rounded-full px-3 py-1 text-xs text-zinc-400)

Follow button states:
- Not signed in: outlined button "☆ Follow" (border-zinc-700 text-zinc-300 rounded-md px-4 py-2 text-sm). Click opens sign-in modal with company name context.
- Signed in, not following: same outlined "☆ Follow". Click → optimistic toggle to filled state, show toast.
- Signed in, following: filled "★ Following ✓" (bg-purple-600 text-white rounded-md px-4 py-2 text-sm). On hover: changes to "Unfollow" with bg-zinc-600. Click → unfollows, shows toast.
- Use the FollowsProvider context for isFollowing() checks and follow()/unfollow() actions.

"Backed by" section:
- Investor chips below metadata. Each is a link to /investor/[slug].
- Show first 4 investors, "+X" chip for overflow.

Hiring Activity section (new):
- Section header: "Hiring Activity" — text-lg font-medium
- Stats line: "47 open roles · 8 new this week" — stat numbers in text-2xl font-semibold tabular-nums, labels in text-xs text-zinc-500
- 30-day sparkline next to stats:
  - Pure SVG, 120px wide, 24px tall
  - Line: 1.5px stroke, purple-500
  - Fill: gradient from purple-500/20 to transparent
  - Data: one point per day for last 30 days (new roles posted that day)
  - If no historical data available yet, show a flat line with tooltip "Historical data available soon"
  - No axes, no labels, just the shape
- Below sparkline (Pro only, blurred for free users):
  - Full 90-day chart placeholder (bg-zinc-900 rounded-lg h-48 with blur overlay)
  - "See full hiring history → Start free trial" text below blur
  - Use the isPro check from SubscriptionProvider

Open Roles section:
- List of roles at this company
- Each row: Job title (text-sm font-medium, link to /job/[id]) · Location · Function · Posted date
- Show all roles (no truncation needed for company pages)

Similar Companies section:
- "Similar Companies" header
- 5-8 company chips (same industry AND shared investor)
- Query: find companies that share at least one investor AND same industry, sort by role count
- Standard chip format, clickable to their company pages
```

---

## Prompt 7: Investor Detail Page Update

```
Update the investor detail page (/investor/[slug]) with Follow Portfolio button and portfolio overview.

Layout:

Top section:
- Investor name (text-2xl font-semibold) with "Follow Portfolio" button right-aligned
- Subtitle: "Venture Capital · [Location]" (text-sm text-zinc-400)
- Website link if available

"Follow Portfolio" button:
- Not signed in: "☆ Follow Portfolio (34 companies)" — outlined style. Click → sign-in modal.
- Signed in, not following: same. Click → calls POST /api/follows/portfolio with investorId. Toast: "Following 34 companies in [Investor]'s portfolio."
- Signed in, already following: "★ Following Portfolio ✓" — filled purple-600. Hover → "Unfollow Portfolio". Click → removes the portfolio follow flag but does NOT unfollow individually followed companies. Toast: "Stopped following [Investor]'s portfolio. Your individually followed companies are unchanged."

Portfolio Overview section:
- "34 portfolio companies · 412 open roles · 28 new roles this week"
- Same stat styling as company page

Portfolio Companies section:
- Chip grid of all portfolio companies
- Same chip style as Discover/Companies view
- For signed-in users: followed companies get the subtle purple left border
- Sort by role count descending

Portfolio Hiring Activity section (Pro only):
- Entire section wrapped in blur for free users
- For Pro users: placeholder cards showing "Portfolio analytics coming soon"
- We'll build the real charts later — for now just show the blurred gate to establish the Pro pattern
- Below blur: "Unlock portfolio hiring intelligence → Start free trial"
```

---

## Prompt 8: Fundraises Page

```
Build the Fundraises page (/fundraises).

This page shows a chronological feed of fundraise/funding events detected by our pipeline.

Data source: Airtable "Fundraises" table (or wherever fundraise events are stored — check the schema). Each fundraise has: company name, company logo, round type (Seed, Series A, B, C, etc.), amount raised, lead investor(s), co-investors, date announced, and a link to the company's Cadre page.

Layout:
- Page title: "Fundraises" — text-2xl font-semibold
- Subtitle: "The latest funding rounds across the venture ecosystem" — text-sm text-zinc-400
- Time filter pills: [This Week] [This Month] [All] — same pill toggle style as Discover view modes
- Industry filter dropdown: [Industry ▾]
- Result count: "12 fundraises this week"

Each fundraise card:
- bg-zinc-900 rounded-lg p-5 border border-zinc-800 hover:border-zinc-700
- Left border accent: border-l-2 border-emerald-500/30
- Line 1: [Company logo 32px] Company name + "raised $50M Series B" (text-sm font-medium text-zinc-100)
- Line 2: "Led by Sequoia · with a16z, Y Combinator" (text-sm text-zinc-400)
- Line 3: Industry badge + "Now hiring 23 roles →" (link to company page, text-sm text-purple-400)
- Line 4: "Announced: Feb 10, 2026" (text-xs text-zinc-500)
- Right side: small [Follow] button for the company (same follow logic as company pages)

Sort: newest first (by announcement date).
Pagination: load 20, "Load more" button.

If no fundraises match the time filter: "No fundraises detected [this week/this month]. Check back soon, or browse all fundraises." with link to clear the filter.

This page is fully public — no auth required, no Pro gating.
```

---

## Prompt 9: Onboarding Flow (Playlist)

```
Build the post-signup onboarding flow — the "playlist" experience for selecting companies to follow.

Trigger: After Clerk sign-up completes (use Clerk's afterSignUp callback or a post-auth redirect).

Implementation: A full-screen modal/overlay (not a new page) that appears after account creation.

Layout:

Header:
- "Pick companies to follow" — text-xl font-semibold text-zinc-100
- "We'll keep you updated on their hiring activity." — text-sm text-zinc-400

Search:
- Search input at top: "Search companies..." — same styling as Discover search

Already Following section (if they triggered sign-up by clicking Follow on a specific company):
- "Following (1)" label
- The company they were trying to follow, shown as a selected chip (bg-purple-600/20 border border-purple-500/40)
- This company was auto-followed during account creation

Suggested for You section:
- Show 6-9 company chips based on the company they first followed:
  - Same industry companies (sorted by role count)
  - Same investor companies
- Each chip is tappable — tap to follow (fills with purple tint), tap again to unfollow
- Micro-animation on tap: subtle scale(1.02) + color fill, 150ms transition

Popular on Cadre section:
- Show 6-9 most-followed companies across all users (or just highest role-count companies for MVP)
- Same tappable chip behavior

Quick Follow section:
- "Quick follow" label
- 3 investor portfolio rows:
  - "☆ Sequoia Portfolio (34 companies)"
  - "☆ a16z Portfolio (41 companies)"
  - "☆ Founders Fund (22 companies)"
- Each row: bg-zinc-800 rounded-lg p-3 cursor-pointer hover:bg-zinc-700
- Tapping follows the entire portfolio (uses POST /api/follows/portfolio)
- Show top 3 investors by portfolio company count

Continue button:
- Fixed at bottom: "Continue to your feed (7) →" — bg-purple-600 text-white rounded-md w-full py-3 text-sm font-medium
- The number updates live as user taps companies
- Button is subtly disabled (opacity-50) until 3+ companies followed
- If clicked with <3: show inline message "Follow at least 3 companies to get started" (text-xs text-yellow-400)
- If clicked with 3+: close modal, navigate to /feed

The entire flow should feel FAST. Every tap is instant (optimistic). No loading between selections. Chips respond immediately to interaction.

On modal close (X button or ESC): if they followed 0 companies, navigate to /discover. If they followed 1+, navigate to /feed.
```

---

## Prompt 10: My Feed

```
Build the My Feed page (/feed) — the personalized activity dashboard for logged-in users.

Requires auth — redirect to / if not signed in.

Data source: Supabase feed_events table, filtered by user's followed company IDs.

Layout:

Top section (visible on all screen sizes):
- Live data ticker (same as homepage — render it here too for logged-in users)
- "This Week's Signal" card (same as homepage — pinned first item, dismissable with X)

Summary bar:
- "Following 18 companies · 142 open roles · 23 new this week"
- Text: text-sm text-zinc-400. Numbers: text-sm font-semibold text-zinc-100

Activity feed (main content area, max-w-2xl):
- Reverse chronological list of feed event cards
- Load 20 cards initially, "Load more" at bottom

Card types (reference spec for full wireframes):

1. New Role Card:
   - [Company logo 32px] Company name (text-sm font-medium) · relative timestamp right-aligned (text-xs text-zinc-500)
   - "Posted: [Job title]" (text-sm text-zinc-400) — links to /job/[id]
   - "[Location] · [Function]" (text-xs text-zinc-500)
   - If company posted multiple roles same day: collapse into one card showing first role + "and X more →" expandable
   - For Pro users only: investor context line below in text-xs text-zinc-500 with purple-400 on investor names

2. Fundraise Card:
   - Same as role card but with border-l-2 border-emerald-500/30
   - "[Company] raised $X [Round]"
   - "Led by [Investor]"
   - "Now hiring X roles →" (link to company page)

3. Pro Teaser Card (free users only, insert every ~10 cards):
   - bg-zinc-800/50 rounded-lg p-4 border border-zinc-800
   - "🔒 X of your companies [is surging / hasn't posted in 30+ days]"
   - "See hiring signals → Start free trial" (text-xs text-zinc-400, link to /pricing)
   - Compute real numbers from user's followed companies if possible, otherwise use placeholder text

Right sidebar (desktop only, hidden on tablet/mobile, w-72):
- Quick Stats card: Following count, Open roles count, New this week count
- Top Functions: horizontal mini bars showing top 3 functions (Eng 55%, Sales 22%, Product 12%)
- Recently Funded: list any followed companies that raised in last 30 days

"Manage" link in top right of feed area — text-xs text-zinc-400 hover:text-zinc-100. Opens the Manage Follows panel (build in next prompt).

Mobile: full-width cards, no sidebar. Summary bar collapses to one line. Ticker still shows at top.

For MVP: if the feed_events table is empty (OpenClaw hasn't populated it yet), show the user's followed companies as simple cards: "[Logo] [Company] — [X] open roles. Last new posting: [date]." This way the feed is never truly empty.
```

---

## Prompt 11: Manage Follows Panel + Toast System

```
Build two components: the Manage Follows slide-over panel and the toast notification system.

MANAGE FOLLOWS PANEL:

Trigger: clicking "Manage" link on the Feed page.

Implementation: slide-over panel from the right side of the screen.
- Desktop: w-96, with dimmed backdrop (bg-black/40)
- Mobile: full-width, full-height
- Animation: slide in from right, 200ms ease-out

Layout:
- Header: "Following (18)" with close button (✕) right-aligned
- Search input: "Search companies..." — filters both followed list AND searches all companies
- Followed companies list: scrollable, each row is:
  - [★ purple-500] [Logo 24px] [Company name] [Stage] — tappable to toggle unfollow
  - On tap: star unfills, row gets strikethrough briefly, then animates out after 500ms
- Below followed list: "Suggested" section
  - 3-5 companies the user doesn't follow (same industry/investors as their current follows)
  - Each row: [☆ zinc-500] [Logo] [Name] [Stage] — tappable to follow
  - On tap: star fills purple, row animates briefly, company moves to the followed list above
- Count in header updates live on every follow/unfollow

Closing: click ✕, click backdrop, or press ESC. Feed refreshes to reflect changes.

TOAST NOTIFICATION SYSTEM:

Create a ToastProvider context and useToast() hook.

Toast specs:
- Position: fixed bottom-center, bottom-6, z-50
- Style: bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg px-4 py-3 text-sm text-zinc-100
- Left icon: ✓ (text-emerald-400) for success, ✕ (text-red-400) for error
- Auto-dismiss: 3 seconds for success, 5 for error
- Animation: slide up + fade in on appear, slide down + fade out on dismiss
- If multiple toasts: stack vertically, gap-2, newest on bottom

Usage:
const { toast } = useToast()
toast({ type: 'success', message: 'Following Anthropic. You\'ll see their activity in your feed.' })
toast({ type: 'error', message: 'Something went wrong. Try again.' })

Wire up toasts to all existing follow/unfollow actions throughout the app.
```

---

## Prompt 12: Command Palette Search

```
Build the command palette search (⌘K).

Trigger:
- Click the search icon in the nav bar
- Press ⌘K (Mac) or Ctrl+K (Windows) anywhere on the site
- On mobile: tap the search icon in the top bar

Implementation: full-screen overlay with centered search modal.
- Backdrop: bg-black/60
- Modal: bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl, max-w-lg, centered vertically (slightly above center)
- Animation: fade in backdrop + scale up modal, 150ms

Layout:
- Search input at top: magnifying glass icon + "Search companies, investors, roles..." placeholder
  - text-sm, bg-transparent, no border (just the input)
  - Auto-focuses when modal opens
- Results appear below as you type (debounce 200ms)
- Results grouped by type with section headers:

  Companies (section header in text-xs text-zinc-500 uppercase tracking-wide)
  ┌─ [Logo 20px] Anthropic · AI & ML · Series C ──────── ┐
  ├─ [Logo 20px] Anduril · Defense · Late Stage ────────  ┤
  └─ [Logo 20px] Arc · Fintech · Early Stage ───────────  ┘

  Investors
  ┌─ Andreessen Horowitz ──────────────────────────────── ┐
  └─ Accel ─────────────────────────────────────────────── ┘

  Jobs
  ┌─ Senior ML Engineer · Anthropic ──────────────────── ┐
  └─ Product Manager · Brex ──────────────────────────── ┘

- Max 3 results per group
- Each result row: hover:bg-zinc-800 rounded-md px-3 py-2 cursor-pointer
- Keyboard navigation: ↑↓ to highlight, Enter to select, Esc to close
- Selected/highlighted row: bg-zinc-800
- Clicking a result: navigate to entity page, close modal
- No results: "No results for '[query]'" centered, text-sm text-zinc-500

API: Create GET /api/search?q=[query]
- Search companies by name (Airtable filterByFormula SEARCH on Company Name field)
- Search investors by name
- Search jobs by title
- Return max 3 per type, sorted by relevance (exact match first, then contains)
- Return shape: { companies: [...], investors: [...], jobs: [...] }

Footer of modal: "ESC to close" right-aligned, text-xs text-zinc-600

Register the keyboard shortcut globally (useEffect with keydown listener). Unregister on unmount.
```

---

## Prompt 13: Pricing Page + Stripe Integration

```
Build the pricing page (/pricing) and wire up Stripe for the $79/month Pro subscription with 14-day trial.

PRICING PAGE (/pricing):

Layout (centered, max-w-lg):
- "Cadre Pro" — text-3xl font-semibold
- "Real-time hiring intelligence for the companies you care about." — text-sm text-zinc-400 mt-2
- Billing toggle: [Monthly $79] [Annual $63/mo] — pill toggle, selected gets bg-zinc-800
- "Start 14-day free trial →" button — bg-purple-600 hover:bg-purple-500 text-white rounded-md w-full py-3 text-sm font-medium mt-6

"What you get" section:
- ✓ Daily and real-time alerts for followed companies
- ✓ Full knowledge graph context (investor backing, portfolio trends in every alert)
- ✓ Cross-company comparison dashboard
- ✓ Hiring surge and stall detection
- ✓ Full historical hiring trends (90-day, 6mo, 12mo)
- ✓ Hiring activity filters on Discover
- ✓ CSV export
- ✓ Priority data sync for your followed companies
Each line: text-sm text-zinc-300, ✓ in text-emerald-400

"Always free" section:
- ✓ Browse all jobs, companies, and investors
- ✓ Follow unlimited companies
- ✓ Personalized activity feed
- ✓ Weekly digest email
- ✓ Fundraise feed
Each line: text-sm text-zinc-400, ✓ in text-zinc-500

Footer: "Questions? Contact matt@cadre.careers" — text-xs text-zinc-500

STRIPE INTEGRATION:

Environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

Create two Stripe Price IDs (you'll create these in the Stripe dashboard):
- Monthly: $79/month
- Annual: $756/year ($63/month equivalent)

API routes:

POST /api/checkout — creates a Stripe Checkout session
- Requires auth (Clerk user ID)
- Body: { priceId: 'monthly' | 'annual' }
- Creates checkout session with:
  - mode: 'subscription'
  - trial_period_days: 14
  - customer_email: user's email from Clerk
  - metadata: { userId: clerkUserId }
  - success_url: /settings/billing?trial=started
  - cancel_url: /pricing
- Returns { url: checkoutSession.url }
- Frontend redirects to this URL

GET /api/billing/portal — creates a Stripe Customer Portal session
- Requires auth
- Looks up Stripe customer by Clerk user ID
- Returns { url: portalSession.url }
- Frontend redirects to this URL

POST /api/stripe/webhook — handles Stripe webhook events
- Verify webhook signature
- Handle events:
  - customer.subscription.created → update SubscriptionProvider (store status in Supabase or Clerk metadata)
  - customer.subscription.updated → update status (trialing → active, active → canceled, etc.)
  - customer.subscription.deleted → set status to 'free'
  - invoice.payment_failed → set status to 'past_due'

Update SubscriptionProvider to fetch real subscription status:
- On auth, check Stripe for active subscription by user email/ID
- Expose: status, isPro (true if 'active' or 'trialing'), isTrialing, trialDaysRemaining

The "Start free trial" button on pricing page:
- If not signed in → open sign-in modal, after sign-in redirect to /pricing
- If signed in → POST /api/checkout, redirect to Stripe Checkout
- If already subscribed → button changes to "Manage billing →" linking to Stripe Portal
```

---

## Prompt 14: Pro Feature Gating

```
Implement Pro feature gating across all pages. Use the isPro boolean from SubscriptionProvider.

Gating pattern — create a reusable ProGate component:

<ProGate fallback={<BlurredPlaceholder prompt="See full hiring history → Start free trial" />}>
  <FullHistoryChart data={historyData} />
</ProGate>

ProGate renders children if isPro is true, renders fallback if false.

BlurredPlaceholder component:
- Wrapper div with relative positioning
- Children (the blurred content): filter blur(6px), pointer-events-none, user-select-none
- Overlay: absolute inset-0, gradient from transparent to zinc-950/80 at bottom
- Text prompt below: text-sm text-zinc-400, link to /pricing in text-purple-400

Apply gating to these locations:

1. Company detail page — Hiring Activity section:
   - Free: show stats (open roles, new this week) and 30-day sparkline
   - Pro: additionally show full 90-day chart area (placeholder for now), function breakdown, MoM comparison
   - Blurred section for free users with "See full hiring history → Start free trial"

2. Investor detail page — Portfolio Hiring Activity section:
   - Free: show portfolio overview stats only
   - Pro: show full portfolio dashboard (placeholder for now)
   - Blurred section for free users with "Unlock portfolio hiring intelligence → Start free trial"

3. Discover page — Hiring Activity filter:
   - Free: filter dropdown opens but options are grayed out (text-zinc-600, cursor-not-allowed)
   - Footer in dropdown: "Start free trial to unlock →" (text-xs text-purple-400, link to /pricing)
   - Pro: filter works normally

4. Feed page — Pro teaser cards:
   - Only render Pro teaser cards (surge/stall teasers) if isPro is false
   - Only render surge/stall cards with full data if isPro is true
   - Knowledge graph context line on feed cards: only render if isPro is true

5. Feed page — Compare tab:
   - Add a "Compare" tab/link near the feed header
   - Free: clicking it navigates to /feed/compare which shows the comparison table fully blurred with upgrade prompt
   - Pro: shows the working comparison table (build as a simple data table for now — we'll polish later)

6. CSV Export:
   - Only show export button for Pro users
   - API route /api/export/csv checks subscription status server-side, returns 403 if not Pro
```

---

## Prompt 15: Settings Page

```
Build the Settings page (/settings) with three tabs: Account, Alerts, Billing.

Requires auth — redirect to / if not signed in.

Layout:
- Desktop: left sidebar with tab buttons (Account, Alerts, Billing), content area to the right
- Mobile: stacked full-width tab buttons, tapping one expands its content below

URL structure: /settings (defaults to Account), /settings/alerts, /settings/billing

ACCOUNT TAB (/settings):
- Email: show user's email from Clerk (read-only, text-sm text-zinc-100)
- Auth method: "Signed in with Google" or "Signed in with email" (text-sm text-zinc-400)
- "Delete account" button at bottom: text-sm text-red-400 hover:text-red-300
  - Click opens confirmation modal: "This will delete your account, all follows, and all data. This cannot be undone." [Cancel] [Delete account]
  - Cancel: closes modal
  - Delete: calls API to delete user data from Supabase, then Clerk, then redirect to /

ALERTS TAB (/settings/alerts):
- Fetch and update from alert_preferences table in Supabase
- Each alert type is a row with toggle switch:

  Weekly digest — toggle (default on)
  "Summary of your followed companies' activity. Delivered Saturday mornings."

  Daily digest — toggle with PRO badge (disabled for free users)
  Free: "Upgrade to Pro to enable →" (text-xs text-purple-400)
  Pro: toggle + time picker dropdown (9:00 AM default, options every hour)

  Real-time alerts — section with PRO badge
  Free: "Upgrade to Pro to enable →"
  Pro: four sub-toggles:
    [✓] New roles at followed companies
    [✓] Fundraise events at followed companies
    [✓] Surge alerts (3x+ posting rate)
    [✓] Stall alerts (60+ days quiet)

  Newsletter — toggle (default on)
  "The Cadre Hiring Signal — ecosystem-wide hiring insights."

Toggle styling: small toggle switch (w-9 h-5), purple-600 when on, zinc-700 when off. Use a simple CSS toggle, no library.

All toggles save immediately on change (PUT /api/preferences). Show subtle save confirmation (checkmark that fades, or "Saved" text that appears briefly).

BILLING TAB (/settings/billing):
- Conditionally render based on subscription status:

  Free: "Current plan: Free" + "Upgrade to Pro — $79/month →" button (links to /pricing)

  Trialing: "Current plan: Pro (trial)" + "Trial ends: [date]" + "After trial: $79/month" + "Manage billing →" (opens Stripe Portal)

  Active: "Current plan: Pro ($79/month)" + "Next billing date: [date]" + "Manage billing →" + "Switch to annual ($63/month) →"

  Canceled: "Plan canceled. Access expires [date]." + "Reactivate →" (links to /pricing)

The "Manage billing →" button calls GET /api/billing/portal and redirects to the Stripe Customer Portal URL.

API route:
PUT /api/preferences — body: { weeklyDigest, dailyDigest, dailyDigestTime, realtimeNewRoles, realtimeFundraises, realtimeSurges, realtimeStalls, newsletter } — upserts into alert_preferences table in Supabase
```

---

## Prompt 16: Polish Pass — Skeletons, Errors, Mobile, SEO

```
Final polish pass across the entire app.

1. SKELETON LOADING STATES

Create skeleton components that match exact dimensions of real content:

CompanyChipSkeleton: rounded-full, bg-zinc-800 animate-pulse, w-40 h-8
FeedCardSkeleton: rounded-lg bg-zinc-800 animate-pulse, full-width h-24 (show 4 stacked on feed load)
SparklineSkeleton: rounded bg-zinc-800 animate-pulse, w-[120px] h-6
JobRowSkeleton: rounded-lg bg-zinc-800 animate-pulse, full-width h-20
StatSkeleton: rounded bg-zinc-800 animate-pulse, w-12 h-8

Use these everywhere data is fetched:
- Discover page: show 12 CompanyChipSkeletons while loading
- Feed: show 4 FeedCardSkeletons
- Company page: show SparklineSkeleton in hiring activity section
- Jobs view: show 5 JobRowSkeletons

2. ERROR STATES

Page-level error (API completely fails):
- Centered on page: "Something went wrong" (text-lg font-medium) + "We couldn't load this page. This is usually temporary." (text-sm text-zinc-400) + [Try again] [Go to homepage] buttons

Component-level error (e.g., sparkline fails but page loads):
- Silently hide the component. Don't show error UI for non-critical components.

Empty states:
- No companies match filters: "No companies match your filters." + [Clear filters] link
- No jobs match filters: "No jobs match your filters. Try broadening your search." + [Clear filters]
- No fundraises: "No fundraises detected this week. Check back soon." + [Browse all →]
- Search no results: "No results for '[query]'. Try a company name, investor, or job title."
- Feed no activity: Show followed companies as static cards with role counts (never show a truly empty feed)

3. MOBILE RESPONSIVE PASS

Review every page and ensure:
- Nav switches to bottom tab bar on mobile (< 768px)
- Discover chips wrap properly (gap-2, flex-wrap)
- Discover filters collapse into single "Filters" button → bottom sheet on mobile
- Feed: full-width cards, no sidebar, summary bar collapses to one line
- Company/Investor pages: full-width, Follow button stays in header
- Search: full-screen overlay works on mobile with soft keyboard
- Settings: sidebar tabs become stacked vertical buttons
- Manage Follows: full-screen panel instead of slide-over
- /feed/compare: show "Comparison view is available on desktop" message on mobile

4. SEO (from existing spec — verify these are implemented)

- JSON-LD on all entity pages (JobPosting, Organization schemas)
- Dynamic meta tags (title, description) per page
- Open Graph tags for social sharing
- Auto-generated sitemap.xml
- Canonical URLs
- robots.txt with sitemap reference

Update meta tags for new pages:
- /discover: "Discover 1,300+ VC-Backed Companies & Their Open Roles | Cadre"
- /fundraises: "Latest Venture Capital Fundraises & Who's Hiring | Cadre"
- /feed: noindex (private, personalized)
- /pricing: "Cadre Pro — Hiring Activity Intelligence | $79/month"

5. FOOTER

Add to every page (layout-level component):
- py-16, border-t border-zinc-800
- "Cadre · Hiring Activity Intelligence" — text-sm text-zinc-500
- Links row: Discover · Fundraises · Pricing · Newsletter — text-sm text-zinc-500 hover:text-zinc-300, separated by " · "
- Copyright row: "© 2026 Cadre · Terms · Privacy · Contact" — text-xs text-zinc-600
- Terms/Privacy link to placeholder pages (/terms, /privacy) with just a title and "Coming soon" text
- Contact: mailto:matt@cadre.careers
```

---

## Notes for Matt

- **Run these in order.** Each prompt depends on infrastructure from the previous ones.
- **Prompt 1-2 are foundation.** Nothing works without auth and the data model.
- **Prompt 3-8 are the core pages.** After these, the site is usable with the new design.
- **Prompt 9-11 are the PLG features.** Onboarding, feed, follows management.
- **Prompt 12 is search.** Nice to have for MVP, can defer if needed.
- **Prompt 13-15 are monetization.** Stripe, Pro gating, settings. Can ship before this is ready (just hide pricing link).
- **Prompt 16 is polish.** Do this last.
- **Estimated time with Claude Code:** 3-5 focused sessions for the full build, assuming each session tackles 2-3 prompts.
- **If you need to prioritize:** Ship prompts 1-8 first for a working redesigned site, then 9-11 for the Follow PLG loop, then 13-15 for monetization. Prompt 12 and 16 can wait.
