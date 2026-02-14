import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API Documentation | Cadre',
  description: 'Cadre API documentation — search companies, jobs, investors, and funding rounds across the venture graph.',
  alternates: { canonical: 'https://cadre.careers/docs' },
};

export default function DocsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap');

        header.sticky, footer.py-16,
        nav.fixed, nav.sticky { display: none !important; }

        body {
          background: #000 !important;
          color: #888 !important;
          font-family: 'Geist Mono', monospace !important;
          font-size: 0.8125rem !important;
          line-height: 1.7 !important;
          padding: 3rem !important;
          -webkit-font-smoothing: antialiased !important;
        }

        .docs { max-width: 640px; }
        .docs-logo { color: #ededed; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.8125rem; }
        .docs-logo span { color: #9d8ec7; }
        .docs-logo a { color: inherit; text-decoration: none; }
        .docs-intro { color: #555; margin-bottom: 4rem; }
        .docs section { margin-bottom: 4rem; }
        .docs h2 {
          color: #ededed;
          font-size: 0.8125rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #1a1a1a;
        }
        .docs h3 {
          color: #ccc;
          font-size: 0.8125rem;
          font-weight: 500;
          margin-bottom: 0.75rem;
          margin-top: 2.5rem;
        }
        .docs h3:first-child { margin-top: 0; }
        .docs p { margin-bottom: 1rem; }
        .docs .dim { color: #555; }
        .docs .endpoint { display: inline-block; margin-bottom: 0.5rem; }
        .docs .method { color: #9d8ec7; font-weight: 500; }
        .docs .path { color: #ededed; }
        .docs table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
        .docs th {
          text-align: left;
          color: #555;
          font-weight: 400;
          font-size: 0.75rem;
          padding: 0.4rem 0;
          border-bottom: 1px solid #1a1a1a;
        }
        .docs td {
          padding: 0.4rem 0;
          border-bottom: 1px solid #0d0d0d;
          vertical-align: top;
        }
        .docs td:first-child { color: #ccc; width: 140px; }
        .docs td:nth-child(2) { color: #555; font-size: 0.75rem; }
        .docs pre {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 4px;
          padding: 1rem 1.25rem;
          overflow-x: auto;
          margin-bottom: 1.5rem;
          font-size: 0.75rem;
          line-height: 1.8;
        }
        .docs .comment { color: #444; }
        .docs .string { color: #9d8ec7; }
        .docs .key { color: #888; }
        .docs .number { color: #b5cea8; }
        .docs .bool { color: #d19a66; }
        .docs code {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 3px;
          padding: 0.15rem 0.4rem;
          font-size: 0.75rem;
          color: #ccc;
        }
        .docs .back { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid #1a1a1a; }
        .docs .back a { color: #333; text-decoration: none; transition: color 0.15s; }
        .docs .back a:hover { color: #888; }

        @media (max-width: 640px) {
          body { padding: 2rem 1.25rem !important; }
          .docs pre { font-size: 0.6875rem; }
        }
      `}</style>

      <div className="docs">
        <div className="docs-logo"><Link href="/">CADRE <span>&middot;</span></Link></div>
        <p className="docs-intro">API Documentation</p>

        <section>
          <h2>Authentication</h2>
          <p>Pass your API key in the Authorization header.</p>
          <pre><span className="comment"># Every request requires an API key</span>{'\n'}curl -H <span className="string">&quot;Authorization: Bearer cadre_sk_xxx&quot;</span> \{'\n'}  https://api.cadre.careers/v1/companies</pre>
        </section>

        <section>
          <h3>
            <div className="endpoint"><span className="method">GET</span> <span className="path">/v1/companies</span></div>
          </h3>
          <p>Search and filter companies in the graph.</p>
          <table>
            <tbody>
              <tr><th>Parameter</th><th>Description</th></tr>
              <tr><td>industry</td><td>ai-infrastructure, ai-applications, american-dynamism, defi, l1-l2, cybersecurity, fintech, developer-infrastructure, productivity, healthcare-biotech, aerospace-defense, financial-services, crypto-infrastructure</td></tr>
              <tr><td>stage</td><td>seed, series-a, series-b, series-c, series-d, late-stage</td></tr>
              <tr><td>size</td><td>1-10, 11-50, 51-200, 201-1000, 1000+</td></tr>
              <tr><td>investor</td><td>Investor name or ID</td></tr>
              <tr><td>hq</td><td>City or country</td></tr>
              <tr><td>funded_within</td><td>30d, 90d, 180d, 365d</td></tr>
              <tr><td>has_open_roles</td><td>true / false</td></tr>
            </tbody>
          </table>
          <pre>curl -H <span className="string">&quot;Authorization: Bearer cadre_sk_xxx&quot;</span> \{'\n'}  <span className="string">&quot;https://api.cadre.careers/v1/companies?industry=ai-infrastructure&amp;stage=series-b&amp;size=51-200&quot;</span></pre>
          <pre>{`{`}{'\n'}  <span className="key">&quot;count&quot;</span>: <span className="number">47</span>,{'\n'}  <span className="key">&quot;companies&quot;</span>: [{'\n'}    {`{`}{'\n'}      <span className="key">&quot;id&quot;</span>: <span className="string">&quot;comp_abc123&quot;</span>,{'\n'}      <span className="key">&quot;name&quot;</span>: <span className="string">&quot;Acme AI&quot;</span>,{'\n'}      <span className="key">&quot;industry&quot;</span>: <span className="string">&quot;ai-infrastructure&quot;</span>,{'\n'}      <span className="key">&quot;stage&quot;</span>: <span className="string">&quot;series-b&quot;</span>,{'\n'}      <span className="key">&quot;size&quot;</span>: <span className="string">&quot;51-200&quot;</span>,{'\n'}      <span className="key">&quot;hq&quot;</span>: <span className="string">&quot;San Francisco, CA&quot;</span>,{'\n'}      <span className="key">&quot;total_raised&quot;</span>: <span className="number">45000000</span>,{'\n'}      <span className="key">&quot;last_funding_date&quot;</span>: <span className="string">&quot;2025-11-15&quot;</span>,{'\n'}      <span className="key">&quot;last_funding_round&quot;</span>: <span className="string">&quot;series-b&quot;</span>,{'\n'}      <span className="key">&quot;founded_year&quot;</span>: <span className="number">2022</span>,{'\n'}      <span className="key">&quot;open_roles&quot;</span>: <span className="number">23</span>,{'\n'}      <span className="key">&quot;investors&quot;</span>: [{'\n'}        {`{`} <span className="key">&quot;id&quot;</span>: <span className="string">&quot;inv_001&quot;</span>, <span className="key">&quot;name&quot;</span>: <span className="string">&quot;Sequoia Capital&quot;</span> {`}`},{'\n'}        {`{`} <span className="key">&quot;id&quot;</span>: <span className="string">&quot;inv_002&quot;</span>, <span className="key">&quot;name&quot;</span>: <span className="string">&quot;Founders Fund&quot;</span> {`}`}{'\n'}      ]{'\n'}    {`}`}{'\n'}  ]{'\n'}{`}`}</pre>
        </section>

        <section>
          <h3>
            <div className="endpoint"><span className="method">GET</span> <span className="path">/v1/jobs</span></div>
          </h3>
          <p>Search open roles across the graph. Each result includes full company context.</p>
          <table>
            <tbody>
              <tr><th>Parameter</th><th>Description</th></tr>
              <tr><td>company_id</td><td>Filter to a single company</td></tr>
              <tr><td>industry</td><td>Same values as /companies</td></tr>
              <tr><td>stage</td><td>Same values as /companies</td></tr>
              <tr><td>department</td><td>engineering, ai-ml, product, design, go-to-market, operations, leadership, data</td></tr>
              <tr><td>location</td><td>City, state, or &quot;remote&quot;</td></tr>
              <tr><td>posted_within</td><td>7d, 30d, 90d</td></tr>
            </tbody>
          </table>
          <pre>curl -H <span className="string">&quot;Authorization: Bearer cadre_sk_xxx&quot;</span> \{'\n'}  <span className="string">&quot;https://api.cadre.careers/v1/jobs?industry=cybersecurity&amp;department=leadership&amp;stage=series-b,series-c&quot;</span></pre>
          <pre>{`{`}{'\n'}  <span className="key">&quot;count&quot;</span>: <span className="number">14</span>,{'\n'}  <span className="key">&quot;jobs&quot;</span>: [{'\n'}    {`{`}{'\n'}      <span className="key">&quot;id&quot;</span>: <span className="string">&quot;job_xyz789&quot;</span>,{'\n'}      <span className="key">&quot;title&quot;</span>: <span className="string">&quot;VP of Engineering&quot;</span>,{'\n'}      <span className="key">&quot;department&quot;</span>: <span className="string">&quot;leadership&quot;</span>,{'\n'}      <span className="key">&quot;location&quot;</span>: <span className="string">&quot;New York, NY&quot;</span>,{'\n'}      <span className="key">&quot;remote&quot;</span>: <span className="bool">false</span>,{'\n'}      <span className="key">&quot;posted_date&quot;</span>: <span className="string">&quot;2026-02-10&quot;</span>,{'\n'}      <span className="key">&quot;url&quot;</span>: <span className="string">&quot;https://boards.greenhouse.io/secureai/jobs/123&quot;</span>,{'\n'}      <span className="key">&quot;company&quot;</span>: {`{`}{'\n'}        <span className="key">&quot;id&quot;</span>: <span className="string">&quot;comp_def456&quot;</span>,{'\n'}        <span className="key">&quot;name&quot;</span>: <span className="string">&quot;SecureAI&quot;</span>,{'\n'}        <span className="key">&quot;industry&quot;</span>: <span className="string">&quot;cybersecurity&quot;</span>,{'\n'}        <span className="key">&quot;stage&quot;</span>: <span className="string">&quot;series-b&quot;</span>,{'\n'}        <span className="key">&quot;size&quot;</span>: <span className="string">&quot;51-200&quot;</span>,{'\n'}        <span className="key">&quot;investors&quot;</span>: [{'\n'}          {`{`} <span className="key">&quot;id&quot;</span>: <span className="string">&quot;inv_003&quot;</span>, <span className="key">&quot;name&quot;</span>: <span className="string">&quot;a16z&quot;</span> {`}`},{'\n'}          {`{`} <span className="key">&quot;id&quot;</span>: <span className="string">&quot;inv_004&quot;</span>, <span className="key">&quot;name&quot;</span>: <span className="string">&quot;Lightspeed&quot;</span> {`}`}{'\n'}        ]{'\n'}      {`}`}{'\n'}    {`}`}{'\n'}  ]{'\n'}{`}`}</pre>
        </section>

        <section>
          <h3>
            <div className="endpoint"><span className="method">GET</span> <span className="path">/v1/investors</span></div>
          </h3>
          <p>Search investors and see portfolio coverage across the graph.</p>
          <table>
            <tbody>
              <tr><th>Parameter</th><th>Description</th></tr>
              <tr><td>name</td><td>Full or partial match</td></tr>
              <tr><td>type</td><td>vc-firm, angel, corporate, accelerator</td></tr>
            </tbody>
          </table>
          <pre>curl -H <span className="string">&quot;Authorization: Bearer cadre_sk_xxx&quot;</span> \{'\n'}  <span className="string">&quot;https://api.cadre.careers/v1/investors?name=sequoia&quot;</span></pre>
          <pre>{`{`}{'\n'}  <span className="key">&quot;investors&quot;</span>: [{'\n'}    {`{`}{'\n'}      <span className="key">&quot;id&quot;</span>: <span className="string">&quot;inv_001&quot;</span>,{'\n'}      <span className="key">&quot;name&quot;</span>: <span className="string">&quot;Sequoia Capital&quot;</span>,{'\n'}      <span className="key">&quot;type&quot;</span>: <span className="string">&quot;vc-firm&quot;</span>,{'\n'}      <span className="key">&quot;portfolio_companies&quot;</span>: <span className="number">34</span>,{'\n'}      <span className="key">&quot;total_open_roles&quot;</span>: <span className="number">612</span>,{'\n'}      <span className="key">&quot;industries&quot;</span>: [{'\n'}        <span className="string">&quot;ai-infrastructure&quot;</span>,{'\n'}        <span className="string">&quot;fintech&quot;</span>,{'\n'}        <span className="string">&quot;cybersecurity&quot;</span>{'\n'}      ]{'\n'}    {`}`}{'\n'}  ]{'\n'}{`}`}</pre>
        </section>

        <section>
          <h3>
            <div className="endpoint"><span className="method">GET</span> <span className="path">/v1/funding</span></div>
          </h3>
          <p>Recent funding rounds across the graph.</p>
          <table>
            <tbody>
              <tr><th>Parameter</th><th>Description</th></tr>
              <tr><td>industry</td><td>Same values as /companies</td></tr>
              <tr><td>round_type</td><td>seed, series-a, series-b, series-c, series-d</td></tr>
              <tr><td>recency</td><td>30d, 90d, 180d</td></tr>
              <tr><td>lead_investor</td><td>Investor name or ID</td></tr>
            </tbody>
          </table>
          <pre>curl -H <span className="string">&quot;Authorization: Bearer cadre_sk_xxx&quot;</span> \{'\n'}  <span className="string">&quot;https://api.cadre.careers/v1/funding?industry=ai-infrastructure&amp;recency=90d&quot;</span></pre>
          <pre>{`{`}{'\n'}  <span className="key">&quot;count&quot;</span>: <span className="number">23</span>,{'\n'}  <span className="key">&quot;rounds&quot;</span>: [{'\n'}    {`{`}{'\n'}      <span className="key">&quot;company_id&quot;</span>: <span className="string">&quot;comp_ghi789&quot;</span>,{'\n'}      <span className="key">&quot;company_name&quot;</span>: <span className="string">&quot;Nexus Labs&quot;</span>,{'\n'}      <span className="key">&quot;round_type&quot;</span>: <span className="string">&quot;series-a&quot;</span>,{'\n'}      <span className="key">&quot;amount&quot;</span>: <span className="number">18000000</span>,{'\n'}      <span className="key">&quot;date&quot;</span>: <span className="string">&quot;2026-01-22&quot;</span>,{'\n'}      <span className="key">&quot;lead_investor&quot;</span>: <span className="string">&quot;Benchmark&quot;</span>,{'\n'}      <span className="key">&quot;investors&quot;</span>: [{'\n'}        <span className="string">&quot;Benchmark&quot;</span>,{'\n'}        <span className="string">&quot;Y Combinator&quot;</span>,{'\n'}        <span className="string">&quot;SV Angel&quot;</span>{'\n'}      ]{'\n'}    {`}`}{'\n'}  ]{'\n'}{`}`}</pre>
        </section>

        <section>
          <h2>Rate Limits</h2>
          <p>Rate limits are applied per API key. Status is returned in response headers:</p>
          <pre><span className="key">X-RateLimit-Limit</span>: ...{'\n'}<span className="key">X-RateLimit-Remaining</span>: ...{'\n'}<span className="key">X-RateLimit-Reset</span>: 2026-02-15T00:00:00Z</pre>
        </section>

        <section>
          <h2>Errors</h2>
          <table>
            <tbody>
              <tr><th>Status</th><th>Description</th></tr>
              <tr><td>401</td><td>Invalid or missing API key</td></tr>
              <tr><td>404</td><td>Resource not found</td></tr>
              <tr><td>429</td><td>Rate limit exceeded</td></tr>
              <tr><td>500</td><td>Server error</td></tr>
            </tbody>
          </table>
          <pre>{`{`}{'\n'}  <span className="key">&quot;error&quot;</span>: <span className="string">&quot;rate_limit_exceeded&quot;</span>,{'\n'}  <span className="key">&quot;message&quot;</span>: <span className="string">&quot;Daily request limit reached. Resets at midnight UTC.&quot;</span>{'\n'}{`}`}</pre>
        </section>

        <div className="back">
          <Link href="/">&larr; cadre.careers</Link>
        </div>
      </div>
    </>
  );
}
