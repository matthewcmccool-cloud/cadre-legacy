'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#F2F2F2', margin: 0, fontFamily: '"DM Sans", sans-serif' }}>
        <main style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', padding: '0 1rem' }}>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 500, color: '#1A1A1A', marginBottom: '0.5rem', fontFamily: '"Space Mono", monospace' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#666666', marginBottom: '1.5rem' }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: '#1A1A1A',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: '1px solid #E0E0E0',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
