# Cadre UI/UX Deep Dive — PLG Experience Design Spec

**Author: UI/UX Lead Review**
**Date: February 11, 2026**
**For: Claude Code implementation**
**Stack: Next.js 14, Tailwind CSS, dark theme (zinc palette with purple accents)**

---

## Design Principles

Before any screen-level decisions, these principles govern every interaction:

1. **The data is the design.** Don't decorate — let numbers, trends, and relationships be visually interesting on their own. A sparkline says more than an icon.
2. **Progressive disclosure everywhere.** Show the minimum first. Let users pull more detail when they want it. Never overwhelm.
3. **Invisible until needed.** Follow buttons, Pro badges, upgrade prompts — all invisible or near-invisible until the user's behavior creates the context for them. No feature marketing in the UI.
4. **Speed is the aesthetic.** The site should feel fast. Skeleton loading, optimistic UI updates, instant follow toggles. If something takes >200ms, it needs a loading state.
5. **One new concept per screen.** Don't introduce Follow, the feed, comparisons, and cohorts all at once. Each screen teaches one thing.

---

## Navigation Redesign

### Current State
```
Job Listings | Companies 267 | Investors 100
```
Tabs at the top. Three database views. Functional but flat.

### New Navigation

**Desktop:**
```
[Cadre logo]                    [Search ⌘K]     [Sign in]
Discover    Feed    Fundraises
```

After sign-in:
```
[Cadre logo]                    [Search ⌘K]     [Avatar ▾]
Discover    Feed    Fundraises
```

**Key decisions:**

- "Discover" replaces the three tabs. The sub-navigation (Companies / Jobs / Investors) lives WITHIN Discover as view modes, not as top-level nav items.
- "Feed" only appears in nav after the user has an account. For anonymous users, this nav slot doesn't exist — don't show a grayed-out "Feed" that teases sign-up. That's manipulative.
- "Fundraises" gets top-level billing because it's the freshest content, the most unique to Cadre, and the strongest hook for non-job-seeker segments.
- Search gets a keyboard shortcut hint (⌘K) — signals to power users that this is a professional tool.
- The avatar dropdown contains: My Feed, Settings, Billing, Sign out. Keep it minimal.

**Mobile:**
```
[Cadre logo]     [Search]     [Avatar/Sign in]
[Discover]  [Feed]  [Fundraises]
```
Bottom tab bar for the three main sections. Feed tab shows a badge with unread activity count (e.g., "Feed •" or "Feed 12").

### Concern: Is "Discover" too vague?

Considered alternatives: "Explore," "Browse," "Directory," "Companies." "Discover" wins because it implies exploration without committing to a single entity type. "Browse" sounds passive. "Explore" is overused. "Companies" is too narrow (it also contains Jobs and Investors). If user testing shows confusion, the fallback is "Companies" as the primary label with Jobs/Investors as clearly visible sub-tabs within it.

---

## Discover Page (/discover)

### Layout

```
┌─────────────────────────────────────────────────────┐
│  Discover                                            │
│                                                      │
│  [Companies]  [Jobs]  [Investors]      ← view modes  │
│                                                      │
│  ┌─────────────────────────────────────────────┐     │
│  │ 🔍 Search companies, investors, industries... │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  [Industry ▾]  [Stage ▾]  [Backed By ▾]             │
│  {Pro badge: [Hiring Activity ▾]}                    │
│                                                      │
│  1,312 companies                                     │
│                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ chip │ │ chip │ │ chip │ │ chip │ │ chip │      │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ chip │ │ chip │ │ chip │ │ chip │ │ chip │      │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │
│  ...                                                 │
│  ┌────────────────┐                                  │
│  │ View all 1,312→│                                  │
│  └────────────────┘                                  │
└─────────────────────────────────────────────────────┘
```

### View Mode Switching (Companies / Jobs / Investors)

These are pill-shaped toggles, not tabs. Visually lighter than the current full tabs. The selected mode has a filled background (zinc-700); unselected are text-only with hover states.

**Critical UX decision:** Filters persist across view modes. If a user selects "AI" industry in Companies mode and switches to Jobs, they see jobs at AI companies. This creates the "knowledge graph" feeling — everything is connected.

**How this works technically:** The URL captures state: `/discover?view=companies&industry=ai&stage=series-b`. Switching view modes only changes the `view` param. All other filters stay.

### The "Hiring Activity" Pro Filter

This appears as a fourth filter dropdown alongside Industry, Stage, and Backed By. It's styled identically but with a small "PRO" badge (purple text, no background — subtle).

Options when clicked (for anonymous/free users):
```
┌──────────────────────────────────┐
│  Hiring Activity         PRO     │
│  ─────────────────────────────── │
│  ○ Posting this week             │
│  ○ Surging (3x+ average)        │
│  ○ Stalled (60+ days quiet)     │
│  ─────────────────────────────── │
│  Start free trial to unlock →    │
│  ─────────────────────────────── │
└──────────────────────────────────┘
```

The options are visible but not selectable. The radio buttons are grayed out. The prompt at the bottom is a subtle text link, not a loud CTA. Clicking it navigates to /pricing.

For Pro users, the filter works normally. No badge, no prompt.

### Company Chips — Design Details

Current chip anatomy:
```
[Logo] Company Name  Stage Badge
```

**No changes for anonymous users.** The chips stay exactly as they are. No follow icons, no hearts, no bookmarks on the chips. The chips page is a browsing surface, not an action surface.

**For logged-in users,** chips that the user follows get a very subtle visual distinction. NOT an icon — a thin left border accent or a barely-visible filled state:

```
Unfollowed: [Logo] Anthropic  Series C     ← standard zinc-800 bg
Followed:   [Logo] Anthropic  Series C     ← zinc-800 bg with 2px left border in purple-500/40
```

This is almost invisible to someone not looking for it, but once you know what it means, you can instantly scan the page and see which companies you're tracking. It's the same pattern Spotify uses for songs in your library (subtle dot indicator).

**Why not a bookmark icon?** Three reasons: (1) icons on every chip create visual noise at scale (imagine 50+ chips with hearts), (2) the follow action belongs on the company detail page, not the directory, and (3) the subtle border teaches the user "your followed companies are highlighted everywhere" which reinforces the personalization feeling without any explicit UI.

### Company Chips — Sorting

**Default sort: by open roles count (descending).** This is already decided. The chip should show the count:

```
[Logo] Anthropic  Series C  47 roles
```

"47 roles" in zinc-500 text, smallest readable size (text-xs). Only shows if the company has roles. Companies with 0 roles show no count. This lets users instantly scan for the most active hiring companies.

**Logged-in sort option:** "My companies first" — followed companies float to the top, then remaining companies sorted by role count. This is a free feature (it's just a sort preference, not intelligence).

---

## Company Detail Page (/company/[slug])

This is where the Follow action lives. This is the most important page in the conversion funnel because it's where "browsing" becomes "tracking."

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  [Logo 48px]                                             │
│  Company Name                          [Follow]          │
│  One-line description                                    │
│  ┌────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐    │
│  │AI & ML │ │Series C  │ │San Fran.  │ │greenhouse│    │
│  └────────┘ └──────────┘ └───────────┘ └──────────┘    │
│                                                          │
│  Backed by                                               │
│  [Spark Capital] [Google Ventures] [a16z] +4             │
│                                                          │
│  ── Hiring Activity ─────────────────────────────────── │
│  │                                                      │
│  │  47 open roles  ·  8 new this week  ·  ▁▃▅▇▆▄▅▇    │
│  │                                      (30-day spark)  │
│  │                                                      │
│  │  ┌─────────────────────────────────────────────┐    │
│  │  │  [See full hiring history →]  PRO            │    │
│  │  └─────────────────────────────────────────────┘    │
│  ────────────────────────────────────────────────────── │
│                                                          │
│  ── Open Roles ──────────────────────────────────────── │
│  │                                                      │
│  │  [Role row]                                          │
│  │  [Role row]                                          │
│  │  [Role row]                                          │
│  │  ...                                                 │
│  ────────────────────────────────────────────────────── │
│                                                          │
│  ── Similar Companies ───────────────────────────────── │
│  │  [Chip] [Chip] [Chip] [Chip] [Chip]                  │
│  ────────────────────────────────────────────────────── │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### The Follow Button — Interaction Design

**States:**

1. **Anonymous user, not followed:**
   ```
   [ ☆ Follow ]     ← outlined button, zinc-700 border, zinc-300 text
   ```
   Click → account creation modal (see Onboarding section below)

2. **Logged-in user, not followed:**
   ```
   [ ☆ Follow ]     ← same outlined style
   ```
   Click → instant toggle, optimistic UI update:
   ```
   [ ★ Following ✓ ] ← filled purple-600 bg, white text, subtle scale animation
   ```
   Micro-interaction: the button fills with color from left to right over ~200ms. A small toast appears at the bottom of the screen: "Following Anthropic. You'll see their activity in your feed." Toast auto-dismisses after 3 seconds.

3. **Logged-in user, already following:**
   ```
   [ ★ Following ✓ ] ← filled purple-600 bg
   ```
   Hover → button text changes to "Unfollow" with a subtle color shift to zinc-600. This is the standard Twitter/X pattern — shows the destructive action only on hover intent.
   Click → unfollows. Button reverts to outlined state. Toast: "Unfollowed Anthropic."

4. **During 14-day trial or Pro subscription:**
   Follow button works identically. No visual difference. Following is a free action.

**Button placement:** Right-aligned on the same line as the company name. It should feel like a natural part of the page header, not a floating action or a sidebar element.

**Size:** Standard button size (h-9 or h-10 in Tailwind). Not oversized. Not a giant CTA. It's a utility action, not a marketing moment.

### Hiring Activity Section

This section is new and critical. It sits between the company metadata and the open roles list.

**For all users (anonymous + free + pro):**
- "47 open roles · 8 new this week" — plain text stats
- A 30-day sparkline (tiny, ~120px wide, ~24px tall) showing daily posting volume. This is a CSS/SVG sparkline, not a chart library. Just dots or a thin line showing the shape of recent activity.

**For Pro users, the section expands:**
- Full 90-day hiring velocity chart (actual chart, not sparkline)
- Function breakdown: horizontal bar showing Engineering 55% | Sales 22% | Product 12% | Other 11%
- Month-over-month comparison: "↑ 23% vs. last month" or "↓ 12% vs. last month" or "— flat vs. last month"
- Stall/surge badge if applicable: "🔥 Surging — 3x their 90-day average" in a subtle alert-style card
- "Compare with..." button → opens company picker modal

**For free users, the Pro content shows as:**
- The expanded section is visible but the chart area is blurred/frosted glass effect
- Below the blur: "Unlock full hiring history and trends → Start free trial" in zinc-400 text
- The blur should be LIGHT — the user can vaguely see the shape of the chart but can't read specifics. This creates curiosity, not frustration.

### Sparkline Design Details

The 30-day sparkline is one of the most important micro-elements in the entire design. It instantly communicates "this is a living product with real-time data" without any words.

**Implementation:**
- Pure SVG, no chart library
- Width: 120px, Height: 24px
- Line: 1.5px stroke, purple-500 color
- Fill: gradient from purple-500/20 at top to transparent at bottom
- Data: one point per day for last 30 days (count of new roles posted that day)
- If a company has 0 postings for most days, the line sits flat at the bottom — this IS useful information (visually shows inactivity)
- If a company is surging, the line rises sharply on the right — also immediately visible
- No axes, no labels, no legend. Just the shape.

**Where sparklines appear:**
- Company detail page (hiring activity section)
- My Feed cards (next to company name, even smaller — 80px wide)
- Investor portfolio dashboard (one per portfolio company)

This single visual element does more for the "intelligence product, not job board" positioning than any amount of copy.

### Similar Companies Section

Below open roles, show 5-8 companies that share the same industry AND at least one investor. Chips format, tappable. This serves two purposes: (1) discovery ("I didn't know this company existed"), and (2) follow conversion ("I should follow these too"). Each chip here does NOT have a follow icon — it links to the company page where the Follow button lives.

---

## Investor Detail Page (/investor/[slug])

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  [Logo if available]                                     │
│  Investor Name                    [Follow Portfolio]     │
│  Venture Capital · San Francisco                         │
│  investor-website.com                                    │
│                                                          │
│  ── Portfolio Overview ──────────────────────────────── │
│  │                                                      │
│  │  34 portfolio companies · 412 open roles              │
│  │  28 new roles this week                               │
│  │                                                      │
│  ────────────────────────────────────────────────────── │
│                                                          │
│  ── Portfolio Companies ─────────────────────────────── │
│  │                                                      │
│  │  [Chip] [Chip] [Chip] [Chip] [Chip]                  │
│  │  [Chip] [Chip] [Chip] [Chip]                         │
│  │                                                      │
│  ────────────────────────────────────────────────────── │
│                                                          │
│  ── Portfolio Hiring Activity ──── PRO ──────────────── │
│  │                                                      │
│  │  [Blurred chart / Pro teaser for free users]         │
│  │  [Full dashboard for Pro users]                      │
│  │                                                      │
│  ────────────────────────────────────────────────────── │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### "Follow Portfolio" Button

This is a power action. One click follows ALL companies in that investor's portfolio. The button text reflects this:

```
[ ☆ Follow Portfolio (34 companies) ]
```

After clicking:
```
[ ★ Following Portfolio ✓ ]
```

Toast: "Following 34 companies in Sequoia's portfolio. You'll see all their hiring activity in your feed."

**Edge case:** If the user already follows 20 of the 34 companies individually, clicking "Follow Portfolio" adds the remaining 14. The toast says: "Added 14 new companies from Sequoia's portfolio. You're now following all 34."

**Edge case:** If the user unfollows the portfolio, do they unfollow ALL 34 companies? No — that's destructive and unexpected. Unfollowing a portfolio removes the "portfolio follow" flag but keeps individually followed companies. The toast says: "Stopped following Sequoia's portfolio. Your individually followed companies are unchanged." This is nuanced but important.

### Portfolio Hiring Activity (Pro section)

For Pro users, this section shows:
- Aggregate posting velocity chart across all portfolio companies (90 days)
- Function mix breakdown (horizontal stacked bar)
- Top 5 hiring companies this week
- Stall/surge flags per company (a mini table: Company | Open Roles | New This Week | Signal)

This is literally the proto-Product 2 (Cadre for Funds). When you build the fund dashboard later, it's this section expanded to a full page with LP export.

For free users, this entire section is blurred with: "Unlock portfolio hiring intelligence → Start free trial"

---

## The Onboarding Flow

### Trigger: User clicks Follow on a company page (or "Follow Portfolio" on an investor page) while not logged in.

### Step 1: Account Creation Modal

```
┌─────────────────────────────────────────┐
│                                          │
│     Follow Anthropic and 1,300+          │
│     companies on Cadre                   │
│                                          │
│     Get weekly hiring updates for        │
│     the companies you care about.        │
│                                          │
│     ┌─────────────────────────────┐      │
│     │ 🔵 Continue with Google     │      │
│     └─────────────────────────────┘      │
│                                          │
│     ┌─────────────────────────────┐      │
│     │ ✉️  Continue with email     │      │
│     └─────────────────────────────┘      │
│                                          │
│     By creating an account you agree     │
│     to our Terms and Privacy Policy      │
│                                          │
└─────────────────────────────────────────┘
```

**Key decisions:**
- Modal, not a full page redirect. The user shouldn't feel like they've left the company page.
- Google sign-in is primary (one click, no forms). Email magic link is secondary.
- No password. Ever. Magic links only. Passwords are friction and you don't need them.
- The modal copy references the company they were trying to follow: "Follow Anthropic and 1,300+ companies on Cadre." This personalizes the moment.
- No mention of Pro, trials, or pricing. This is purely "create a free account to follow."

### Step 2: The Playlist (immediately after account creation)

The modal transitions (doesn't close and reopen — smooth animation) to the company selector:

```
┌─────────────────────────────────────────┐
│                                          │
│     Pick companies to follow             │
│     We'll keep you updated on            │
│     their hiring activity.               │
│                                          │
│     ┌─────────────────────────────┐      │
│     │ 🔍 Search companies...      │      │
│     └─────────────────────────────┘      │
│                                          │
│     Following (1)                        │
│     ┌──────────────────────────────┐     │
│     │ ★ Anthropic  Series C        │     │
│     └──────────────────────────────┘     │
│                                          │
│     Suggested for you                    │
│     ┌───────┐ ┌───────┐ ┌───────┐       │
│     │OpenAI │ │Cohere │ │Mistral│       │
│     └───────┘ └───────┘ └───────┘       │
│     ┌───────┐ ┌───────┐ ┌───────┐       │
│     │Runway │ │Scale  │ │Glean  │       │
│     └───────┘ └───────┘ └───────┘       │
│                                          │
│     Popular on Cadre                     │
│     ┌───────┐ ┌───────┐ ┌───────┐       │
│     │Stripe │ │Figma  │ │Notion │       │
│     └───────┘ └───────┘ └───────┘       │
│                                          │
│     Quick follow                         │
│     ┌──────────────────────────────┐     │
│     │ ☆ Sequoia Portfolio (34 cos) │     │
│     │ ☆ a16z Portfolio (41 cos)    │     │
│     │ ☆ Founders Fund (22 cos)    │     │
│     └──────────────────────────────┘     │
│                                          │
│     ┌─────────────────────────────┐      │
│     │ Continue to your feed (7) → │      │
│     └─────────────────────────────┘      │
│                                          │
└─────────────────────────────────────────┘
```

**Key decisions:**

- The company they originally tried to follow (Anthropic) is already selected at the top. The user sees "Following (1)" — their action wasn't lost.
- "Suggested for you" shows companies related to their first follow — same industry, same investors. This is the "playlist" feeling. Tap to add, tap again to remove. Each tap has a quick micro-animation (chip fills with color, count updates).
- "Popular on Cadre" shows the most-followed companies across all users. Social proof + discovery.
- "Quick follow" shows investor portfolio bundles. One tap = follow 34 companies. This is the power move that gets a user from 1 follow to 35 in a single click. It also introduces the concept of investor portfolios as an organizing principle.
- The "Continue" button shows the total follow count, updating live as they tap. The button is disabled until they've selected at least 3 (soft gate — if they click with <3, show a gentle prompt "Follow at least 3 companies to get started" but don't hard-block).
- This entire flow should feel FAST. Chips respond instantly to taps. No loading between selections. The count animates. The suggestions update dynamically as they follow more (if they follow 3 AI companies, show more AI companies in suggestions).

### Step 3: First Feed View

After clicking "Continue to your feed," the modal closes and they land on /feed with their personalized dashboard already populated with activity from their followed companies. No empty state — the feed should have data immediately (even if it's recent historical data from the past 7 days).

**If a followed company has no recent activity:** Show a card: "[Company logo] Anthropic — 47 open roles. No new postings this week." This isn't empty — it's information.

---

## My Feed (/feed)

### Layout — Desktop

```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Your Feed                                       [Manage ↗]    │
│                                                                 │
│  ┌────────────────────────────────────────┐  ┌──────────────┐  │
│  │                                         │  │              │  │
│  │  ┌─── Summary Bar ──────────────────┐  │  │  Quick Stats │  │
│  │  │ Following 18 cos · 142 roles     │  │  │              │  │
│  │  │ 23 new this week                 │  │  │  18 cos      │  │
│  │  └─────────────────────────────────┘  │  │  142 roles    │  │
│  │                                         │  │  23 new      │  │
│  │  ┌─── Activity Card ───────────────┐  │  │              │  │
│  │  │ [Logo] Anthropic     2h ago     │  │  │  ──────────  │  │
│  │  │ Posted: Senior Research Engineer │  │  │  Top func.   │  │
│  │  │ San Francisco · Engineering      │  │  │  Eng 55%     │  │
│  │  │ {Pro: backed by Spark, a16z}     │  │  │  Sales 22%   │  │
│  │  └─────────────────────────────────┘  │  │  Product 12% │  │
│  │                                         │  │              │  │
│  │  ┌─── Activity Card ───────────────┐  │  │  ──────────  │  │
│  │  │ [Logo] Brex          today      │  │  │  Recently    │  │
│  │  │ Raised $150M Series D           │  │  │  funded      │  │
│  │  │ Led by Greenoaks · 28 roles     │  │  │  Brex (2d)   │  │
│  │  └─────────────────────────────────┘  │  │  Ramp (1w)   │  │
│  │                                         │  │              │  │
│  │  ┌─── Pro Teaser Card ─────────────┐  │  │              │  │
│  │  │ 🔒 1 company is surging         │  │  └──────────────┘  │
│  │  │ Unlock hiring signals →  PRO    │  │                     │
│  │  └─────────────────────────────────┘  │                     │
│  │                                         │                     │
│  │  ┌─── Activity Card ───────────────┐  │                     │
│  │  │ [Logo] Figma         yesterday  │  │                     │
│  │  │ Posted: Staff Product Designer   │  │                     │
│  │  │ ...                              │  │                     │
│  │  └─────────────────────────────────┘  │                     │
│  │                                         │                     │
│  │  [Load more]                            │                     │
│  │                                         │                     │
│  └────────────────────────────────────────┘                     │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Activity Card Types

**1. New Role Card (most common)**

```
┌──────────────────────────────────────────────┐
│  [Logo 32px]  Anthropic              2h ago  │
│               Posted: Senior Research Eng.   │
│               San Francisco · Engineering    │
│               {Pro line: Spark Capital, a16z │
│                Spark portfolio +47 eng/month} │
│                                              │
│               [and 2 more roles today →]     │
└──────────────────────────────────────────────┘
```

- Logo and company name on the first line with relative timestamp right-aligned
- Role title on the second line, bold
- Location and function on the third line, zinc-500
- Pro line (only for Pro users): investor names + one portfolio-level insight, zinc-400 with purple-500 accent on investor names
- If the company posted multiple roles on the same day, collapse into one card: "and 2 more roles today →" expandable
- Clicking the card opens the job detail page. Clicking the company name opens the company page.

**2. Fundraise Card**

```
┌──────────────────────────────────────────────┐
│  [Logo 32px]  Brex                   today   │
│               Raised $150M Series D          │
│               Led by Greenoaks               │
│               Now hiring 28 roles →          │
│  ─────────────────────── subtle green accent │
└──────────────────────────────────────────────┘
```

- Left border accent in emerald-500/30 to visually distinguish from role cards
- "Now hiring X roles →" links to the company page
- For Pro users, add: "[Investor] portfolio has raised $X total this quarter"

**3. Surge Card (Pro only)**

```
┌──────────────────────────────────────────────┐
│  🔥 [Logo]  Vercel                           │
│     Surging — 15 roles posted this week      │
│     3.2x their 90-day average                │
│     Top functions: Engineering (8), Sales (4) │
│  ─────────────────────── subtle orange accent │
└──────────────────────────────────────────────┘
```

- Left border accent in orange-500/30
- Only appears for Pro users
- For free users, this becomes the teaser card (see below)

**4. Stall Card (Pro only)**

```
┌──────────────────────────────────────────────┐
│  ⚠️ [Logo]  [Company]                        │
│     No new postings in 67 days               │
│     Last role posted: Dec 5, 2025            │
│     47 roles still listed (may be stale)     │
│  ─────────────────────── subtle yellow accent │
└──────────────────────────────────────────────┘
```

**5. Pro Teaser Card (free users only)**

Appears roughly every 8-12 regular cards in the feed. Not more frequent — don't annoy.

```
┌──────────────────────────────────────────────┐
│  🔒  1 of your companies is surging          │
│      3 haven't posted in 30+ days            │
│                                              │
│      See hiring signals → Start free trial   │
│  ───────────────────────── zinc-800 bg, no   │
│                            border accent     │
└──────────────────────────────────────────────┘
```

- The content is real — computed from their actual followed companies — but the specifics (which company is surging, which are stalled) are hidden.
- The "Start free trial" link is zinc-400 text, not a button. Subtle.
- These teaser cards use REAL data about the user's followed companies. Don't make them generic. "1 of your companies is surging" is much more compelling than "Unlock hiring signals."

### Right Sidebar — Quick Stats

Desktop only. Collapses to a horizontal summary bar on mobile (the bar at the top of the feed).

Contents:
- Following: 18 companies
- Open roles: 142
- New this week: 23
- Divider
- Top functions hiring (across followed companies): Eng 55%, Sales 22%, Product 12%
- Divider
- Recently funded (any followed company that raised in last 30 days): company names with "Xd ago"

This sidebar is static (doesn't scroll with the feed). It provides at-a-glance context. The stats update when the page loads, not in real-time.

### "Manage" Link

Top right of the feed. Opens a slide-over panel (not a new page) showing all followed companies as chips. The same chip-select UI from onboarding. User can add/remove follows, search for new companies. Changes are reflected immediately in the feed when the panel closes.

### Feed — Empty and Edge Cases

**User follows companies but none have recent activity:**
Show each company as a mini summary card: "[Logo] Company — 47 open roles. Last new posting: 12 days ago." Don't show an empty state — show the state of inactivity. That IS information.

**User has 0 follows (shouldn't happen if onboarding works, but just in case):**
Show the onboarding playlist inline in the feed area: "Your feed is empty. Follow some companies to get started." With the same chip selector UI below.

**Feed loading:**
Skeleton cards. Same card shape as real cards but with animated pulse placeholders for logo, text lines, and timestamp. Show 5 skeleton cards while loading.

---

## Fundraises Page (/fundraises)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Fundraises                                              │
│  The latest funding rounds across the venture ecosystem  │
│                                                          │
│  [This Week]  [This Month]  [All]        [Industry ▾]   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [Logo]  Acme AI raised $50M Series B              │  │
│  │          Led by Sequoia · with a16z, Y Combinator  │  │
│  │          AI & ML · Now hiring 23 roles →           │  │
│  │          Announced: Feb 10, 2026                    │  │
│  │                                            [Follow] │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [Logo]  NeuralCo raised $15M Seed                 │  │
│  │          Led by Founders Fund                       │  │
│  │          Robotics · Now hiring 4 roles →            │  │
│  │          Announced: Feb 9, 2026                     │  │
│  │                                            [Follow] │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ...                                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key decisions:**
- Chronological feed, newest first. This is the "what just happened" view.
- Each card shows: company, round type, amount, lead investor, co-investors, industry, role count link, announcement date.
- Each card has a Follow button right on it. This is the one exception to "Follow only lives on entity pages" — because the Fundraises page is a discovery surface for new companies the user hasn't seen before, and the follow action is high-intent here.
- Time filter (This Week / This Month / All) as pill toggles.
- Industry filter dropdown.
- No Pro gating on this page. The fundraise feed is free. It's one of the strongest hooks for getting non-job-seekers (recruiters, sales teams, VCs) to the site.

---

## Pro Paywall Presentation — Design Language

### The Rules

1. **Never block.** No modals that prevent the user from doing what they came to do. No "upgrade to view this page" full-screen gates.
2. **Always show the shape of the value.** Blurred charts are better than hidden sections. A grayed-out filter with "PRO" badge is better than a filter that doesn't exist for free users.
3. **Use real data in teases.** "1 of your companies is surging" (real, computed) is 10x more compelling than "Unlock hiring signals" (generic).
4. **One tease per screen.** The feed gets one Pro teaser card per ~10 cards. The company page gets one blurred section. The Discover page gets one grayed-out filter. Don't stack multiple upgrade prompts on the same viewport.
5. **The word "Pro" appears in small, purple text.** Not as a badge, not as a button, not as a banner. Just the word "PRO" in text-xs text-purple-500 next to the feature name. This is how Linear does it — it signals "upgrade available" without screaming.
6. **The upgrade path is always the same:** clicking any Pro element links to /pricing OR opens the trial start flow if they're already logged in.

### The Blur Effect

Used on: company page hiring history chart, investor portfolio dashboard, feed teaser cards.

Implementation:
```css
.pro-blur {
  filter: blur(6px);
  pointer-events: none;
  user-select: none;
  position: relative;
}
.pro-blur::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(24, 24, 27, 0.8) 100%);
}
```

The blur is light enough that the user can see "there's a chart here with data" but can't read specific numbers. The gradient fade at the bottom blends into a text prompt: "See full hiring history → Start free trial"

---

## Homepage Redesign (/  for anonymous visitors)

The current homepage is the Job Listings feed. This changes.

### New Homepage

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  [Nav bar]                                                   │
│                                                              │
│  ┌─── Live Data Ticker (horizontal scroll) ──────────────┐  │
│  │ Anthropic +3 roles today · Sequoia portfolio 89 new    │  │
│  │ this week · Series B AI companies ↑22% MoM · ...      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│                                                              │
│     Hiring intelligence for the                              │
│     venture ecosystem.                                       │
│                                                              │
│     1,312 companies · 330 investors · 7,800+ roles           │
│     Updated daily.                                           │
│                                                              │
│     [Explore companies →]   [Get weekly intel →]             │
│                                                              │
│                                                              │
│  ┌──── This Week's Signal ────────────────────────────────┐  │
│  │                                                         │  │
│  │  Engineering hiring across VC-backed companies          │  │
│  │  is up 18% this month. The biggest mover:               │  │
│  │  [Company] posted 23 new roles after their Series B.    │  │
│  │                                                         │  │
│  │  [Read more on the Cadre blog →]                        │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────┐  ┌──────────┐  ┌──────────────┐               │
│  │Companies│  │Investors │  │Fundraises    │               │
│  │         │  │          │  │              │               │
│  │ 1,312   │  │ 330      │  │ 12 this week│               │
│  │ cos     │  │ firms    │  │              │               │
│  │         │  │          │  │              │               │
│  │ [→]     │  │ [→]      │  │ [→]          │               │
│  └─────────┘  └──────────┘  └──────────────┘               │
│                                                              │
│                                                              │
│  ┌─── Newsletter CTA ────────────────────────────────────┐  │
│  │                                                        │  │
│  │  The Cadre Hiring Signal                               │  │
│  │  Weekly hiring intelligence from 330+ VC portfolios.   │  │
│  │  Saturday mornings.                                    │  │
│  │                                                        │  │
│  │  [email@input.com        ] [Subscribe]                 │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Live Data Ticker

A horizontal scrolling bar at the very top of the page (below the nav, above the hero). Shows real-time hiring signals computed from the database:

- "Anthropic +3 roles today"
- "Sequoia portfolio: 89 new roles this week"
- "Series B AI companies ↑22% MoM"
- "12 fundraises detected this week"
- "3 companies surging (3x+ average posting rate)"

Implementation: CSS animation, scrolling left continuously. Thin bar (h-8), zinc-900 background with zinc-400 text. Entries separated by " · " dots. This is the single most impactful element for communicating "this is a living intelligence product." It runs on real data that OpenClaw computes daily.

### Hero Section

Minimal. Two lines of headline, one line of stats, two CTAs.

Headline font should be larger and distinctive — the one place where the typography gets bold. Everything else on the site is restrained; the homepage headline is the moment to make an impression.

"Explore companies →" goes to /discover. "Get weekly intel →" scrolls to the newsletter signup.

### "This Week's Signal" Card

One data insight, refreshed weekly by OpenClaw. This shows anonymous visitors that Cadre has intelligence, not just listings. It's the homepage version of the newsletter content.

### Three Entry Cards

Visual cards (not text links) for the three main destinations. Each shows a count and a subtle visual (company logos collage for Companies, firm logos for Investors, a mini timeline for Fundraises).

---

## Pricing Page (/pricing)

Simple. One tier. No comparison table needed yet.

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Cadre Pro                                               │
│                                                          │
│  Real-time hiring intelligence for the                   │
│  companies you care about.                               │
│                                                          │
│  $79/month  or  $63/month billed annually                │
│                                                          │
│  [Start 14-day free trial →]                             │
│                                                          │
│  ── What you get ─────────────────────────────────────  │
│                                                          │
│  ✓ Daily and real-time alerts for followed companies     │
│  ✓ Full knowledge graph context                          │
│    (investor backing, portfolio trends in every alert)   │
│  ✓ Cross-company comparison dashboard                    │
│  ✓ Hiring surge and stall detection                      │
│  ✓ Full historical hiring trends (90-day, 6mo, 12mo)    │
│  ✓ Hiring activity filters on Discover                   │
│  ✓ CSV export                                            │
│  ✓ Priority data sync for your followed companies        │
│                                                          │
│  ── Always free ──────────────────────────────────────  │
│                                                          │
│  ✓ Browse all jobs, companies, and investors             │
│  ✓ Follow unlimited companies                            │
│  ✓ Personalized activity feed                            │
│  ✓ Weekly digest email                                   │
│  ✓ Fundraise feed                                        │
│                                                          │
│  ── Questions? ───────────────────────────────────────  │
│                                                          │
│  Contact matt@cadre.careers                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

Clean. No enterprise tier yet. No "contact sales." Just one price, one button, one list of what's included.

---

## Open Questions & Concerns

### 1. Auth Provider Decision Needed

Clerk vs. NextAuth vs. Supabase Auth. This decision blocks the Follow feature entirely. My recommendation: **Clerk** for MVP speed. Pre-built Google OAuth + magic link components, user management dashboard, webhook support for billing events. It costs $25/month after 10K MAU but you're nowhere near that. Switch to Supabase Auth when you do the database migration.

### 2. Stripe Integration Scope

For the $79/month single-tier plan, you need:
- One Stripe Price ID (monthly)
- One Stripe Price ID (annual)
- Stripe Checkout for trial start (with trial_period_days: 14)
- Stripe Customer Portal for self-serve cancel/reactivate
- A webhook to update user's plan status in your database
- That's it. No metered billing. No usage tracking. No invoice customization.

### 3. Email Infrastructure Overlap

You'll have TWO email streams:
- **Public newsletter** (Cadre Hiring Signal) → Loops.so, subscribed by anyone
- **Personalized weekly digest** → also Loops.so, but triggered per-user based on their followed companies

These need to be separate Loops audiences/campaigns. The digest is transactional (personalized to user data). The newsletter is broadcast (same content to everyone). Don't conflate them.

### 4. Data Freshness SLA

The Pro tier promises "real-time alerts" and "priority data sync." What does this actually mean operationally? OpenClaw syncs ATS feeds on a schedule. If the schedule is every 24 hours, "real-time" is a lie. Need to define:
- Free user companies: synced every 24 hours
- Pro user followed companies: synced every 4-6 hours (bumped to front of queue)
- "Real-time" alert = email sent within 1 hour of detection, NOT within 1 hour of the job being posted on the ATS

Frame it honestly in the product: "Alerts typically arrive within hours of a role being posted." Never promise "instant."

### 5. Mobile Feasibility for MVP

The feed is the primary mobile experience. The Discover chips page works on mobile (chips wrap naturally). But the comparison dashboard, the portfolio analytics, the historical trend charts — these are desktop experiences. For MVP, don't try to make every Pro feature mobile-responsive. The feed + basic company pages on mobile are sufficient. Pro analytics features can be desktop-only with a gentle "Best experienced on desktop" note on mobile.

### 6. The Feed Algorithm

What order does the feed show activity? Options:
- **Pure chronological** (simplest, most predictable, what I recommend for MVP)
- **Weighted by signal strength** (surges > fundraises > new roles > stalls)
- **Weighted by user engagement** (companies you click on most appear higher)

Start with pure chronological. It's honest, predictable, and doesn't require an algorithm. Users trust chronological feeds. Add ranking later if the feed gets too noisy for users following 50+ companies.

### 7. Performance Concern: Feed Data Volume

A user following 50 companies, each posting 2-3 roles per week = 100-150 cards per week. The feed needs pagination or infinite scroll with efficient loading. Don't load all cards at once. Load 20, then lazy-load on scroll. The skeleton loading pattern covers the loading gap.
