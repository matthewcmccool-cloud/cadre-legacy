import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cadre — Hiring Intelligence API',
  description: 'Hiring activity intelligence for AI recruiting agents.',
  alternates: { canonical: 'https://cadre.careers' },
};

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg: #09090b;
          --purple: #9d8ec7;
          --purple-bright: #7C5CFC;
          --text: #a1a1aa;
          --text-dim: #71717a;
          --text-muted: #52525b;
          --text-bright: #e4e4e7;
          --font: 'Geist Mono', monospace;
        }

        header, footer, nav.fixed, nav.sticky { display: none !important; }

        body {
          background: var(--bg) !important;
          color: var(--text) !important;
          font-family: var(--font) !important;
          font-size: 0.875rem !important;
          line-height: 1.7 !important;
          font-weight: 400 !important;
          min-height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          padding: 3rem !important;
          -webkit-font-smoothing: antialiased !important;
          overflow: hidden !important;
        }
        body::before {
          content: '';
          position: fixed;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(124, 92, 252, 0.07) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        body::after {
          content: '';
          position: fixed;
          bottom: -300px;
          left: -200px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(157, 142, 199, 0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .content {
          max-width: 540px;
          position: relative;
          z-index: 1;
          opacity: 0;
          animation: fadeIn 0.6s ease forwards;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2rem;
        }
        .logo-text {
          color: var(--text-bright);
          font-weight: 500;
          font-size: 2rem;
        }
        .logo-dot {
          width: 6px;
          height: 6px;
          background: var(--purple-bright);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(124, 92, 252, 0.5);
        }
        .lp-h1 {
          font-size: 1.125rem;
          font-weight: 500;
          color: var(--text-bright);
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .lp-h1 .accent {
          color: var(--purple);
        }
        .subtitle {
          margin-bottom: 2.5rem;
          color: var(--text-dim);
          font-size: 0.8125rem;
          line-height: 1.8;
        }
        .divider {
          width: 32px;
          height: 1px;
          background: linear-gradient(90deg, var(--purple-bright), transparent);
          margin-bottom: 2rem;
        }
        .links {
          display: flex;
          gap: 1.5rem;
        }
        .links a {
          color: var(--text-dim);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }
        .links a:hover {
          color: var(--purple);
        }
        .lp-footer {
          position: fixed;
          bottom: 3rem;
          left: 3rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          z-index: 1;
        }
        .lp-footer a {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .lp-footer a:hover { color: var(--text-dim); }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          body { padding: 2rem 1.25rem !important; overflow: auto !important; }
          .logo-text { font-size: 1.75rem; }
          .lp-h1 { font-size: 1rem; }
          .lp-footer { position: relative; bottom: auto; left: auto; margin-top: 4rem; }
        }
      `}</style>

      <div className="content">
        <div className="logo">
          <span className="logo-text">Cadre</span>
          <span className="logo-dot"></span>
        </div>
        <h1 className="lp-h1">Hiring Activity Intelligence for <span className="accent">AI Recruiting Agents</span></h1>
        <p className="subtitle">A curated and enriched graph of the companies that matter most. Real-time hiring, funding, and investor intelligence — structured for programmatic access.</p>
        <div className="divider"></div>
        <div className="links">
          <Link href="/docs">Docs</Link>
          <a href="mailto:matt@cadre.careers">Get In Touch</a>
        </div>
      </div>
      <div className="lp-footer">&copy; 2026 Cadre Talent Intelligence &middot; <Link href="/privacy">Privacy</Link></div>
    </>
  );
}
