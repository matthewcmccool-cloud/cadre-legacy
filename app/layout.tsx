import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'cadre | The career graph for tech talent',
  description: 'Discover jobs at 250+ venture-backed tech companies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
