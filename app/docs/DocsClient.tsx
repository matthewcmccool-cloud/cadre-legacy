'use client';

import { useState, useRef } from 'react';

const pages = ['intro', 'start', 'companies', 'jobs', 'investors', 'funding', 'signals', 'examples', 'access'] as const;
type PageId = typeof pages[number];

export default function DocsClient() {
  const [activePage, setActivePage] = useState<PageId>('intro');
  const contentRef = useRef<HTMLDivElement>(null);

  function navTo(id: PageId) {
    setActivePage(id);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }

  function copyCode(btn: HTMLButtonElement) {
    const pre = btn.closest('.cb')?.querySelector('pre');
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText).then(() => {
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 1500);
    });
  }

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Geist Mono';
          src: url('https://cdn.jsdelivr.net/gh/nicro950/geist-mono@main/fonts/GeistMono-Regular.woff2') format('woff2');
          font-weight: 400;
        }
        @font-face {
          font-family: 'Geist Mono';
          src: url('https://cdn.jsdelivr.net/gh/nicro950/geist-mono@main/fonts/GeistMono-Medium.woff2') format('woff2');
          font-weight: 500;
        }
        @font-face {
          font-family: 'Geist Mono';
          src: url('https://cdn.jsdelivr.net/gh/nicro950/geist-mono@main/fonts/GeistMono-Bold.woff2') format('woff2');
          font-weight: 700;
        }

        :root {
          --bg: #000;
          --bg-code: #0a0a0a;
          --border: #1a1a1a;
          --text: #999;
          --text-bright: #ccc;
          --text-dim: #555;
          --purple: #9d8ec7;
          --purple-dim: rgba(157, 142, 199, 0.15);
          --purple-border: rgba(157, 142, 199, 0.25);
          --mono: 'Geist Mono', 'JetBrains Mono', monospace;
        }

        header, footer, nav.fixed, nav.sticky { display: none !important; }

        body {
          background: var(--bg) !important;
          color: var(--text) !important;
          font-family: var(--mono) !important;
          font-size: 13px !important;
          line-height: 1.7 !important;
          -webkit-font-smoothing: antialiased !important;
          overflow: hidden !important;
          height: 100vh !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        ::selection { background: var(--purple-dim); color: var(--text-bright); }

        a { color: var(--purple); text-decoration: none; }
        a:hover { color: #b8a9db; text-decoration: underline; }

        /* ── Layout ── */
        .docs-app {
          display: grid;
          grid-template-columns: 220px 1fr;
          height: 100vh;
        }

        /* ── Sidebar ── */
        .sidebar {
          border-right: 1px solid var(--border);
          padding: 36px 0;
          display: flex;
          flex-direction: column;
        }

        .sb-brand {
          padding: 0 20px 24px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .sb-brand .mark {
          font-size: 12px;
          font-weight: 700;
          color: var(--purple);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .sb-brand .sub {
          display: block;
          font-size: 11px;
          color: var(--text-dim);
          margin-top: 4px;
        }

        .nav-group { padding: 0 12px; margin-bottom: 16px; }

        .nav-label {
          font-size: 10px;
          color: var(--text-dim);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0 8px;
          margin-bottom: 4px;
        }

        .nav-item {
          display: block;
          padding: 4px 8px;
          font-size: 12px;
          color: var(--text-dim);
          cursor: pointer;
          transition: color 0.1s;
          user-select: none;
          border-radius: 3px;
        }

        .nav-item:hover { color: var(--text); }
        .nav-item.active { color: var(--purple); background: var(--purple-dim); }

        .sb-footer {
          margin-top: auto;
          padding: 16px 20px 0;
          border-top: 1px solid var(--border);
        }

        .sb-footer a {
          font-size: 11px;
          color: var(--text-dim);
        }

        .sb-footer a:hover { color: var(--purple); }

        /* ── Content ── */
        .content {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #1a1a1a transparent;
        }

        .pg {
          display: none;
          max-width: 660px;
          padding: 48px 56px 100px;
        }

        .pg.active { display: block; }

        /* ── Type ── */
        .pg h1 {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-bright);
          margin-bottom: 20px;
        }

        .pg h2 {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-bright);
          margin-top: 36px;
          margin-bottom: 10px;
        }

        .pg p { margin-bottom: 14px; }
        .pg p:last-child { margin-bottom: 0; }

        .pg hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 28px 0;
        }

        .b { color: var(--text-bright); }
        .d { color: var(--text-dim); }
        .accent { color: var(--purple); }

        /* ── Code ── */
        .cb {
          position: relative;
          margin-bottom: 16px;
        }

        .cb pre {
          background: var(--bg-code);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 14px 16px;
          overflow-x: auto;
          font-size: 12px;
          line-height: 1.8;
        }

        .cb .cp {
          position: absolute;
          top: 8px;
          right: 8px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 3px;
          color: var(--text-dim);
          font-family: var(--mono);
          font-size: 10px;
          padding: 2px 8px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }

        .cb .cp:hover { color: var(--purple); border-color: var(--purple-border); }
        .cb .cp.copied { color: var(--purple); }

        .k { color: var(--text-bright); }
        .s { color: var(--purple); }
        .n { color: #7ec89d; }
        .c { color: #444; }

        /* ── Endpoint badge ── */
        .ep {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .ep .m {
          color: #7ec89d;
          font-weight: 500;
        }

        .ep .u { color: var(--text-bright); }

        /* ── Tables ── */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 12px;
        }

        th {
          text-align: left;
          color: var(--text-dim);
          font-weight: 400;
          padding: 4px 10px;
          border-bottom: 1px solid var(--border);
        }

        td {
          padding: 4px 10px;
          border-bottom: 1px solid #0d0d0d;
        }

        td:first-child { color: var(--purple); white-space: nowrap; }

        /* ── Next link ── */
        .next {
          display: inline-block;
          margin-top: 28px;
          font-size: 12px;
          color: var(--text-dim);
          cursor: pointer;
          transition: color 0.1s;
        }

        .next:hover { color: var(--purple); text-decoration: none; }

        /* ── Responsive ── */
        @media (max-width: 700px) {
          .docs-app { grid-template-columns: 1fr; }
          .sidebar { display: none; }
          body { overflow: auto !important; }
          .pg { padding: 28px 18px 60px; }
        }
      `}</style>

      <div className="docs-app">

        <nav className="sidebar" aria-label="Documentation navigation">
          <div className="sb-brand">
            <span className="mark">CADRE</span>
            <span className="sub">API Docs</span>
          </div>

          <div className="nav-group">
            <div className="nav-label">Overview</div>
            <div className={`nav-item ${activePage === 'intro' ? 'active' : ''}`} onClick={() => navTo('intro')}>Introduction</div>
            <div className={`nav-item ${activePage === 'start' ? 'active' : ''}`} onClick={() => navTo('start')}>Getting Started</div>
          </div>

          <div className="nav-group">
            <div className="nav-label">Endpoints</div>
            <div className={`nav-item ${activePage === 'companies' ? 'active' : ''}`} onClick={() => navTo('companies')}>Companies</div>
            <div className={`nav-item ${activePage === 'jobs' ? 'active' : ''}`} onClick={() => navTo('jobs')}>Jobs</div>
            <div className={`nav-item ${activePage === 'investors' ? 'active' : ''}`} onClick={() => navTo('investors')}>Investors</div>
            <div className={`nav-item ${activePage === 'funding' ? 'active' : ''}`} onClick={() => navTo('funding')}>Funding</div>
            <div className={`nav-item ${activePage === 'signals' ? 'active' : ''}`} onClick={() => navTo('signals')}>Signals</div>
          </div>

          <div className="nav-group">
            <div className="nav-label">Guides</div>
            <div className={`nav-item ${activePage === 'examples' ? 'active' : ''}`} onClick={() => navTo('examples')}>Example Queries</div>
          </div>

          <div className="nav-group">
            <div className={`nav-item ${activePage === 'access' ? 'active' : ''}`} onClick={() => navTo('access')}>Request Access</div>
          </div>

          <div className="sb-footer">
            <a href="mailto:matt@cadre.careers">matt@cadre.careers &rarr;</a>
          </div>
        </nav>

        <main className="content" ref={contentRef}>

          {/* ─── Introduction ─── */}
          <article className={`pg ${activePage === 'intro' ? 'active' : ''}`} id="intro">

            <h1>Introduction</h1>

            <p>
              CADRE connects three things that are usually siloed: who&apos;s investing, who they&apos;re investing in, and what those companies are actually doing &mdash; measured by who they&apos;re hiring.
            </p>

            <p>
              It&apos;s a single API. You send a query like &quot;Sequoia-backed Series B companies hiring ML engineers&quot; and get back structured data joining the investor, the company profile, funding history, and live job postings. One call instead of stitching together Crunchbase, LinkedIn, and a job board.
            </p>

            <hr />

            <h2 style={{ marginTop: 0 }}>What&apos;s in the graph</h2>

            <p>
              <span className="b">Companies</span> &mdash; profile, industry, stage, headcount, HQ, ATS provider, careers page, funding history, investor relationships.
            </p>
            <p>
              <span className="b">Jobs</span> &mdash; title, department, location, remote policy, seniority, posting date, source URL. Pulled directly from Greenhouse, Lever, and Ashby APIs plus career page scraping.
            </p>
            <p>
              <span className="b">Investors</span> &mdash; portfolio companies, fund relationships, lead vs. follow designation.
            </p>
            <p>
              <span className="b">Signals</span> &mdash; hiring surges, new department openings, role removals, velocity changes. What changed this week, not just what exists.
            </p>
            <p>
              <span className="b">Funding</span> &mdash; round type, amount, date, lead investor, all participants.
            </p>

            <hr />

            <h2 style={{ marginTop: 0 }}>Who uses this</h2>

            <p>
              <span className="b">AI recruiting agents</span> need company context, not just job listings. CADRE gives your agent the difference between &quot;Senior Engineer, San Francisco&quot; and &quot;Senior Engineer at a Sequoia-backed Series B that tripled engineering headcount after closing a $30M round.&quot;
            </p>
            <p>
              <span className="b">AI SDR &amp; sales tools</span> treat funding events and hiring surges as buying signals. CADRE delivers both, structured and ready for agent consumption. No scraping, no parsing press releases.
            </p>
            <p>
              <span className="b">Research &amp; due diligence platforms</span> can pull portfolio-level hiring data across entire funds. What&apos;s the aggregate hiring velocity across Benchmark&apos;s portfolio? Which sectors are ramping headcount?
            </p>
            <p>
              <span className="b">Enrichment platforms &amp; agent toolchains</span> get the investor&rarr;company&rarr;jobs join in a single call. Plug it into Clay, a waterfall, or any agent that needs company intelligence beyond basic firmographics.
            </p>

            <span className="next" onClick={() => navTo('start')}>Getting Started &rarr;</span>
          </article>

          {/* ─── Getting Started ─── */}
          <article className={`pg ${activePage === 'start' ? 'active' : ''}`} id="start">

            <h1>Getting Started</h1>

            <h2 style={{ marginTop: 0 }}>Base URL</h2>
            <div className="cb">
              <pre>https://api.cadre.careers/v1</pre>
            </div>

            <h2>Authentication</h2>
            <p>Pass your API key as a Bearer token in the Authorization header.</p>
            <div className="cb">
              <button className="cp" onClick={(e) => copyCode(e.currentTarget)}>Copy</button>
              <pre>curl -H <span className="s">&quot;Authorization: Bearer cadre_sk_xxx&quot;</span> \{'\n'}  <span className="s">&quot;https://api.cadre.careers/v1/companies?industry=ai-infrastructure&quot;</span></pre>
            </div>

            <h2>Response format</h2>
            <p>Every list endpoint returns JSON with a count and a data array.</p>
            <div className="cb">
<pre>{`{
  `}<span className="k">&quot;count&quot;</span>: <span className="n">47</span>,{`
  `}<span className="k">&quot;data&quot;</span>: [ ... ]{`
}`}</pre>
            </div>

            <h2>Rate limits</h2>
            <p>Limits are per API key. Usage is returned in every response header.</p>
            <div className="cb">
<pre><span className="k">X-RateLimit-Limit</span>: 1000{'\n'}<span className="k">X-RateLimit-Remaining</span>: 847{'\n'}<span className="k">X-RateLimit-Reset</span>: <span className="s">2026-02-16T00:00:00Z</span></pre>
            </div>

            <h2>Errors</h2>
            <table>
              <tbody>
                <tr><th>Status</th><th>Meaning</th></tr>
                <tr><td>401</td><td>Bad or missing API key</td></tr>
                <tr><td>404</td><td>Resource doesn&apos;t exist</td></tr>
                <tr><td>429</td><td>Rate limit hit</td></tr>
                <tr><td>500</td><td>Something broke on our end</td></tr>
              </tbody>
            </table>

            <span className="next" onClick={() => navTo('companies')}>Companies &rarr;</span>
          </article>

          {/* ─── Companies ─── */}
          <article className={`pg ${activePage === 'companies' ? 'active' : ''}`} id="companies">

            <h1>Companies</h1>

            <div className="ep"><span className="m">GET</span> <span className="u">/v1/companies</span></div>
            <p>Search and filter companies. Every result includes investor relationships, open roles, and hiring velocity.</p>

            <table>
              <tbody>
                <tr><th>Parameter</th><th>Description</th></tr>
                <tr><td>industry</td><td>ai-infrastructure, ai-applications, fintech, cybersecurity, healthtech, defense, devtools, data-analytics, climate, logistics, edtech, biotech, hardware, etc.</td></tr>
                <tr><td>stage</td><td>seed, series-a, series-b, series-c, series-d, late-stage</td></tr>
                <tr><td>investor</td><td>Investor name or ID</td></tr>
                <tr><td>hq</td><td>City, state, or country</td></tr>
                <tr><td>size</td><td>1-10, 11-50, 51-200, 201-1000, 1000+</td></tr>
                <tr><td>funded_within</td><td>30d, 90d, 180d, 365d</td></tr>
                <tr><td>has_open_roles</td><td>true / false</td></tr>
                <tr><td>min_open_roles</td><td>Minimum active postings</td></tr>
                <tr><td>department</td><td>engineering, product, design, sales, marketing, operations, data</td></tr>
                <tr><td>domain</td><td>Company domain for direct lookup</td></tr>
              </tbody>
            </table>

            <div className="cb">
              <button className="cp" onClick={(e) => copyCode(e.currentTarget)}>Copy</button>
<pre><span className="c"># sequoia-backed series b companies hiring engineers</span>{'\n'}curl -H <span className="s">&quot;Authorization: Bearer cadre_sk_xxx&quot;</span> \{'\n'}  <span className="s">&quot;https://api.cadre.careers/v1/companies?investor=sequoia-capital&amp;stage=series-b&amp;department=engineering&amp;has_open_roles=true&quot;</span></pre>
            </div>

            <div className="cb">
<pre>{`{
  `}<span className="k">&quot;count&quot;</span>: <span className="n">12</span>,{`
  `}<span className="k">&quot;data&quot;</span>: [{`
    {
      `}<span className="k">&quot;id&quot;</span>: <span className="s">&quot;comp_abc123&quot;</span>,{`
      `}<span className="k">&quot;name&quot;</span>: <span className="s">&quot;Acme AI&quot;</span>,{`
      `}<span className="k">&quot;domain&quot;</span>: <span className="s">&quot;acme.ai&quot;</span>,{`
      `}<span className="k">&quot;industry&quot;</span>: <span className="s">&quot;ai-infrastructure&quot;</span>,{`
      `}<span className="k">&quot;stage&quot;</span>: <span className="s">&quot;series-b&quot;</span>,{`
      `}<span className="k">&quot;total_raised&quot;</span>: <span className="n">45000000</span>,{`
      `}<span className="k">&quot;last_round_date&quot;</span>: <span className="s">&quot;2025-11-15&quot;</span>,{`
      `}<span className="k">&quot;size&quot;</span>: <span className="s">&quot;51-200&quot;</span>,{`
      `}<span className="k">&quot;hq&quot;</span>: <span className="s">&quot;San Francisco, CA&quot;</span>,{`
      `}<span className="k">&quot;open_roles&quot;</span>: <span className="n">23</span>,{`
      `}<span className="k">&quot;roles_by_dept&quot;</span>: {'{ '}<span className="k">&quot;engineering&quot;</span>: <span className="n">14</span>, <span className="k">&quot;product&quot;</span>: <span className="n">3</span>, <span className="k">&quot;sales&quot;</span>: <span className="n">4</span>{' },'}{`
      `}<span className="k">&quot;hiring_velocity&quot;</span>: <span className="n">2.3</span>,{`
      `}<span className="k">&quot;investors&quot;</span>: [{`
        { `}<span className="k">&quot;name&quot;</span>: <span className="s">&quot;Sequoia Capital&quot;</span>, <span className="k">&quot;lead&quot;</span>: <span className="n">true</span>{` },
        { `}<span className="k">&quot;name&quot;</span>: <span className="s">&quot;Founders Fund&quot;</span>, <span className="k">&quot;lead&quot;</span>: <span className="n">false</span>{` }
      ],
      `}<span className="k">&quot;ats&quot;</span>: <span className="s">&quot;greenhouse&quot;</span>{`
    }
  ]
}`}</pre>
            </div>

            <hr />

            <div className="ep"><span className="m">GET</span> <span className="u">/v1/companies/{'{id}'}</span></div>
            <p>Everything about one company &mdash; profile, every funding round, full investor list, and all current open roles.</p>

            <div className="cb">
<pre>{`{
  `}<span className="k">&quot;id&quot;</span>: <span className="s">&quot;comp_abc123&quot;</span>,{`
  `}<span className="k">&quot;name&quot;</span>: <span className="s">&quot;Acme AI&quot;</span>,{`
  `}<span className="k">&quot;description&quot;</span>: <span className="s">&quot;Foundation models for robotics.&quot;</span>,{`
  `}<span className="k">&quot;domain&quot;</span>: <span className="s">&quot;acme.ai&quot;</span>,{`
  `}<span className="k">&quot;industry&quot;</span>: <span className="s">&quot;ai-infrastructure&quot;</span>,{`
  `}<span className="k">&quot;stage&quot;</span>: <span className="s">&quot;series-b&quot;</span>,{`
  `}<span className="k">&quot;founded_year&quot;</span>: <span className="n">2022</span>,{`
  `}<span className="k">&quot;size&quot;</span>: <span className="s">&quot;51-200&quot;</span>,{`
  `}<span className="k">&quot;hq&quot;</span>: <span className="s">&quot;San Francisco, CA&quot;</span>,{`
  `}<span className="k">&quot;total_raised&quot;</span>: <span className="n">45000000</span>,{`
  `}<span className="k">&quot;funding_rounds&quot;</span>: [{`
    {
      `}<span className="k">&quot;type&quot;</span>: <span className="s">&quot;series-b&quot;</span>,{`
      `}<span className="k">&quot;amount&quot;</span>: <span className="n">30000000</span>,{`
      `}<span className="k">&quot;date&quot;</span>: <span className="s">&quot;2025-11-15&quot;</span>,{`
      `}<span className="k">&quot;lead&quot;</span>: <span className="s">&quot;Sequoia Capital&quot;</span>{`
    }
  ],
  `}<span className="k">&quot;investors&quot;</span>: [{`
    { `}<span className="k">&quot;name&quot;</span>: <span className="s">&quot;Sequoia Capital&quot;</span>, <span className="k">&quot;lead&quot;</span>: <span className="n">true</span>{` },
    { `}<span className="k">&quot;name&quot;</span>: <span className="s">&quot;Founders Fund&quot;</span>, <span className="k">&quot;lead&quot;</span>: <span className="n">true</span>{` },
    { `}<span className="k">&quot;name&quot;</span>: <span className="s">&quot;Y Combinator&quot;</span>, <span className="k">&quot;lead&quot;</span>: <span className="n">false</span>{` }
  ],
  `}<span className="k">&quot;open_roles&quot;</span>: <span className="n">23</span>,{`
  `}<span className="k">&quot;roles_by_dept&quot;</span>: {'{'}{`
    `}<span className="k">&quot;engineering&quot;</span>: <span className="n">14</span>,{`
    `}<span className="k">&quot;product&quot;</span>: <span className="n">3</span>,{`
    `}<span className="k">&quot;sales&quot;</span>: <span className="n">4</span>,{`
    `}<span className="k">&quot;operations&quot;</span>: <span className="n">2</span>{`
  },
  `}<span className="k">&quot;hiring_velocity&quot;</span>: <span className="n">2.3</span>,{`
  `}<span className="k">&quot;ats&quot;</span>: <span className="s">&quot;greenhouse&quot;</span>,{`
  `}<span className="k">&quot;careers_url&quot;</span>: <span className="s">&quot;https://boards.greenhouse.io/acmeai&quot;</span>,{`
  `}<span className="k">&quot;jobs&quot;</span>: [{`
    {
      `}<span className="k">&quot;id&quot;</span>: <span className="s">&quot;job_001&quot;</span>,{`
      `}<span className="k">&quot;title&quot;</span>: <span className="s">&quot;Senior ML Engineer&quot;</span>,{`
      `}<span className="k">&quot;department&quot;</span>: <span className="s">&quot;engineering&quot;</span>,{`
      `}<span className="k">&quot;location&quot;</span>: <span className="s">&quot;San Francisco, CA&quot;</span>,{`
      `}<span className="k">&quot;posted&quot;</span>: <span className="s">&quot;2026-02-01&quot;</span>,{`
      `}<span className="k">&quot;url&quot;</span>: <span className="s">&quot;https://boards.greenhouse.io/acmeai/jobs/12345&quot;</span>{`
    }
  ]
}`}</pre>
            </div>

            <span className="next" onClick={() => navTo('jobs')}>Jobs &rarr;</span>
          </article>

          {/* ─── Jobs ─── */}
          <article className={`pg ${activePage === 'jobs' ? 'active' : ''}`} id="jobs">

            <h1>Jobs</h1>

            <div className="ep"><span className="m">GET</span> <span className="u">/v1/jobs</span></div>
            <p>Search open roles across the graph. Every job comes back with its company context &mdash; who the investors are, what stage they&apos;re at, how fast they&apos;re hiring.</p>

            <table>
              <tbody>
                <tr><th>Parameter</th><th>Description</th></tr>
                <tr><td>title</td><td>Keyword match on job title</td></tr>
                <tr><td>department</td><td>engineering, product, design, sales, marketing, operations, data</td></tr>
                <tr><td>location</td><td>City, state, or &quot;remote&quot;</td></tr>
                <tr><td>industry</td><td>Filter by parent company industry</td></tr>
                <tr><td>stage</td><td>Filter by parent company stage</td></tr>
                <tr><td>investor</td><td>Filter by parent company investor</td></tr>
                <tr><td>posted_within</td><td>7d, 14d, 30d</td></tr>
              </tbody>
            </table>

            <div className="cb">
              <button className="cp" onClick={(e) => copyCode(e.currentTarget)}>Copy</button>
<pre><span className="c"># ml roles at a16z portfolio companies, last 14 days</span>{'\n'}curl -H <span className="s">&quot;Authorization: Bearer cadre_sk_xxx&quot;</span> \{'\n'}  <span className="s">&quot;https://api.cadre.careers/v1/jobs?title=ml+engineer&amp;investor=a16z&amp;posted_within=14d&quot;</span></pre>
            </div>

            <div className="cb">
<pre>{`{
  `}<span className="k">&quot;count&quot;</span>: <span className="n">31</span>,{`
  `}<span className="k">&quot;data&quot;</span>: [{`
    {
      `}<span className="k">&quot;id&quot;</span>: <span className="s">&quot;job_001&quot;</span>,{`
      `}<span className="k">&quot;title&quot;</span>: <span className="s">&quot;Senior ML Engineer&quot;</span>,{`
      `}<span className="k">&quot;department&quot;</span>: <span className="s">&quot;engineering&quot;</span>,{`
      `}<span className="k">&quot;location&quot;</span>: <span className="s">&quot;San Francisco, CA&quot;</span>,{`
      `}<span className="k">&quot;posted&quot;</span>: <span className="s">&quot;2026-02-01&quot;</span>,{`
      `}<span className="k">&quot;url&quot;</span>: <span className="s">&quot;https://boards.greenhouse.io/acmeai/jobs/12345&quot;</span>,{`
      `}<span className="k">&quot;company&quot;</span>: {'{'}{`
        `}<span className="k">&quot;id&quot;</span>: <span className="s">&quot;comp_abc123&quot;</span>,{`
        `}<span className="k">&quot;name&quot;</span>: <span className="s">&quot;Acme AI&quot;</span>,{`
        `}<span className="k">&quot;stage&quot;</span>: <span className="s">&quot;series-b&quot;</span>,{`
        `}<span className="k">&quot;total_raised&quot;</span>: <span className="n">45000000</span>,{`
        `}<span className="k">&quot;investors&quot;</span>: [<span className="s">&quot;Sequoia Capital&quot;</span>, <span className="s">&quot;Founders Fund&quot;</span>],{`
        `}<span className="k">&quot;hiring_velocity&quot;</span>: <span className="n">2.3</span>{`
      }
    }
  ]
}`}</pre>
            </div>

            <span className="next" onClick={() => navTo('investors')}>Investors &rarr;</span>
          </article>

          {/* ─── Investors ─── */}
          <article className={`pg ${activePage === 'investors' ? 'active' : ''}`} id="investors">

            <h1>Investors</h1>

            <div className="ep"><span className="m">GET</span> <span className="u">/v1/investors</span></div>
            <p>Browse the investor graph. See which funds have actively hiring portfolio companies, aggregate open roles, and the companies ramping fastest.</p>

            <table>
              <tbody>
                <tr><th>Parameter</th><th>Description</th></tr>
                <tr><td>name</td><td>Investor name (partial match)</td></tr>
                <tr><td>has_active_hiring</td><td>Only return investors with portfolio companies currently hiring</td></tr>
              </tbody>
            </table>

            <div className="cb">
              <button className="cp" onClick={(e) => copyCode(e.currentTarget)}>Copy</button>
<pre><span className="c"># sequoia portfolio — companies and hiring activity</span>{'\n'}curl -H <span className="s">&quot;Authorization: Bearer cadre_sk_xxx&quot;</span> \{'\n'}  <span className="s">&quot;https://api.cadre.careers/v1/investors?name=sequoia&quot;</span></pre>
            </div>

            <div className="cb">
<pre>{`{
  `}<span className="k">&quot;data&quot;</span>: [{`
    {
      `}<span className="k">&quot;id&quot;</span>: <span className="s">&quot;inv_001&quot;</span>,{`
      `}<span className="k">&quot;name&quot;</span>: <span className="s">&quot;Sequoia Capital&quot;</span>,{`
      `}<span className="k">&quot;portfolio_count&quot;</span>: <span className="n">34</span>,{`
      `}<span className="k">&quot;actively_hiring&quot;</span>: <span className="n">28</span>,{`
      `}<span className="k">&quot;total_open_roles&quot;</span>: <span className="n">412</span>,{`
      `}<span className="k">&quot;top_hiring&quot;</span>: [{`
        { `}<span className="k">&quot;name&quot;</span>: <span className="s">&quot;Acme AI&quot;</span>, <span className="k">&quot;open_roles&quot;</span>: <span className="n">23</span>, <span className="k">&quot;velocity&quot;</span>: <span className="n">2.3</span>{` },
        { `}<span className="k">&quot;name&quot;</span>: <span className="s">&quot;Nexus Labs&quot;</span>, <span className="k">&quot;open_roles&quot;</span>: <span className="n">18</span>, <span className="k">&quot;velocity&quot;</span>: <span className="n">1.8</span>{` }
      ]
    }
  ]
}`}</pre>
            </div>

            <span className="next" onClick={() => navTo('funding')}>Funding &rarr;</span>
          </article>

          {/* ─── Funding ─── */}
          <article className={`pg ${activePage === 'funding' ? 'active' : ''}`} id="funding">

            <h1>Funding</h1>

            <div className="ep"><span className="m">GET</span> <span className="u">/v1/funding</span></div>
            <p>Recent funding rounds with hiring activity attached. A company that just raised and is on a hiring surge is the strongest signal there is &mdash; this endpoint gives you both in one response.</p>

            <table>
              <tbody>
                <tr><th>Parameter</th><th>Description</th></tr>
                <tr><td>industry</td><td>Same values as /companies</td></tr>
                <tr><td>round_type</td><td>seed, series-a, series-b, series-c, series-d</td></tr>
                <tr><td>recency</td><td>30d, 90d, 180d</td></tr>
                <tr><td>lead_investor</td><td>Investor name or ID</td></tr>
              </tbody>
            </table>

            <div className="cb">
              <button className="cp" onClick={(e) => copyCode(e.currentTarget)}>Copy</button>
<pre><span className="c"># ai companies that raised in the last 90 days</span>{'\n'}curl -H <span className="s">&quot;Authorization: Bearer cadre_sk_xxx&quot;</span> \{'\n'}  <span className="s">&quot;https://api.cadre.careers/v1/funding?industry=ai-infrastructure&amp;recency=90d&quot;</span></pre>
            </div>

            <div className="cb">
<pre>{`{
  `}<span className="k">&quot;count&quot;</span>: <span className="n">23</span>,{`
  `}<span className="k">&quot;data&quot;</span>: [{`
    {
      `}<span className="k">&quot;company_id&quot;</span>: <span className="s">&quot;comp_ghi789&quot;</span>,{`
      `}<span className="k">&quot;company_name&quot;</span>: <span className="s">&quot;Nexus Labs&quot;</span>,{`
      `}<span className="k">&quot;round_type&quot;</span>: <span className="s">&quot;series-a&quot;</span>,{`
      `}<span className="k">&quot;amount&quot;</span>: <span className="n">18000000</span>,{`
      `}<span className="k">&quot;date&quot;</span>: <span className="s">&quot;2026-01-22&quot;</span>,{`
      `}<span className="k">&quot;lead_investor&quot;</span>: <span className="s">&quot;Benchmark&quot;</span>,{`
      `}<span className="k">&quot;investors&quot;</span>: [<span className="s">&quot;Benchmark&quot;</span>, <span className="s">&quot;Y Combinator&quot;</span>, <span className="s">&quot;SV Angel&quot;</span>],{`
      `}<span className="k">&quot;open_roles&quot;</span>: <span className="n">18</span>,{`
      `}<span className="k">&quot;hiring_velocity&quot;</span>: <span className="n">3.1</span>{`
    }
  ]
}`}</pre>
            </div>

            <span className="next" onClick={() => navTo('signals')}>Signals &rarr;</span>
          </article>

          {/* ─── Signals ─── */}
          <article className={`pg ${activePage === 'signals' ? 'active' : ''}`} id="signals">

            <h1>Signals</h1>

            <div className="ep"><span className="m">GET</span> <span className="u">/v1/signals</span></div>
            <p>What changed recently. Hiring surges, new departments, roles disappearing. This is the temporal layer &mdash; it tells you what&apos;s happening, not just what exists.</p>

            <table>
              <tbody>
                <tr><th>Parameter</th><th>Description</th></tr>
                <tr><td>type</td><td>hiring-surge, new-department, first-hire, role-removed</td></tr>
                <tr><td>industry</td><td>Same values as /companies</td></tr>
                <tr><td>investor</td><td>Filter by company investor</td></tr>
                <tr><td>recency</td><td>7d, 14d, 30d</td></tr>
              </tbody>
            </table>

            <div className="cb">
              <button className="cp" onClick={(e) => copyCode(e.currentTarget)}>Copy</button>
<pre><span className="c"># hiring surges in the last 7 days</span>{'\n'}curl -H <span className="s">&quot;Authorization: Bearer cadre_sk_xxx&quot;</span> \{'\n'}  <span className="s">&quot;https://api.cadre.careers/v1/signals?type=hiring-surge&amp;recency=7d&quot;</span></pre>
            </div>

            <div className="cb">
<pre>{`{
  `}<span className="k">&quot;count&quot;</span>: <span className="n">8</span>,{`
  `}<span className="k">&quot;data&quot;</span>: [{`
    {
      `}<span className="k">&quot;company_id&quot;</span>: <span className="s">&quot;comp_abc123&quot;</span>,{`
      `}<span className="k">&quot;company_name&quot;</span>: <span className="s">&quot;Acme AI&quot;</span>,{`
      `}<span className="k">&quot;type&quot;</span>: <span className="s">&quot;hiring-surge&quot;</span>,{`
      `}<span className="k">&quot;detail&quot;</span>: <span className="s">&quot;Engineering roles: 6 → 14 in 7 days&quot;</span>,{`
      `}<span className="k">&quot;stage&quot;</span>: <span className="s">&quot;series-b&quot;</span>,{`
      `}<span className="k">&quot;last_round_date&quot;</span>: <span className="s">&quot;2025-11-15&quot;</span>,{`
      `}<span className="k">&quot;investors&quot;</span>: [<span className="s">&quot;Sequoia Capital&quot;</span>, <span className="s">&quot;Founders Fund&quot;</span>],{`
      `}<span className="k">&quot;detected_at&quot;</span>: <span className="s">&quot;2026-02-14T08:00:00Z&quot;</span>{`
    }
  ]
}`}</pre>
            </div>

            <span className="next" onClick={() => navTo('examples')}>Example Queries &rarr;</span>
          </article>

          {/* ─── Example Queries ─── */}
          <article className={`pg ${activePage === 'examples' ? 'active' : ''}`} id="examples">

            <h1>Example Queries</h1>

            <p>These are real queries the API was built around. Each one maps to something a specific type of buyer actually needs.</p>

            <hr />

            <h2 style={{ marginTop: 0 }}>Recruiting agents</h2>
            <p className="d">&quot;sequoia-backed series b companies hiring ML engineers right now&quot;</p>
            <div className="cb">
              <pre>/v1/companies?investor=sequoia-capital&amp;stage=series-b&amp;department=engineering&amp;has_open_roles=true</pre>
            </div>

            <p className="d">&quot;all remote engineering roles at recently funded companies&quot;</p>
            <div className="cb">
              <pre>/v1/jobs?department=engineering&amp;location=remote&amp;posted_within=30d</pre>
            </div>

            <hr />

            <h2 style={{ marginTop: 0 }}>SDR &amp; sales agents</h2>
            <p className="d">&quot;companies that just raised and are on a hiring surge &mdash; best outbound targets&quot;</p>
            <div className="cb">
              <pre>/v1/signals?type=hiring-surge&amp;recency=14d</pre>
            </div>

            <p className="d">&quot;fintech companies that closed series b+ in the last 6 months&quot;</p>
            <div className="cb">
              <pre>/v1/funding?industry=fintech&amp;round_type=series-b,series-c&amp;recency=180d</pre>
            </div>

            <hr />

            <h2 style={{ marginTop: 0 }}>Research &amp; due diligence</h2>
            <p className="d">&quot;full a16z portfolio &mdash; headcount, roles, velocity by department&quot;</p>
            <div className="cb">
              <pre>/v1/investors?name=a16z</pre>
            </div>

            <p className="d">&quot;ai infrastructure companies ranked by hiring velocity&quot;</p>
            <div className="cb">
              <pre>/v1/companies?industry=ai-infrastructure&amp;has_open_roles=true&amp;sort=hiring_velocity:desc</pre>
            </div>

            <hr />

            <h2 style={{ marginTop: 0 }}>Enrichment &amp; platforms</h2>
            <p className="d">&quot;enrich a domain with investors, stage, funding, and live hiring data&quot;</p>
            <div className="cb">
              <pre>/v1/companies?domain=acme.ai</pre>
            </div>

            <span className="next" onClick={() => navTo('access')}>Request Access &rarr;</span>
          </article>

          {/* ─── Access ─── */}
          <article className={`pg ${activePage === 'access' ? 'active' : ''}`} id="access">

            <h1>Request Access</h1>

            <p>
              Early access. Tell us what you&apos;re building and we&apos;ll get you a key.
            </p>

            <p>
              <a href="mailto:matt@cadre.careers">matt@cadre.careers</a>
            </p>

            <p style={{ marginTop: 48, fontSize: 11, color: 'var(--text-dim)' }}>
              &copy; 2026 Cadre Talent Intelligence
            </p>

          </article>

        </main>
      </div>
    </>
  );
}
