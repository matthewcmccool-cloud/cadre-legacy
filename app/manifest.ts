import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CADRE — Jobs at VC-backed companies',
    short_name: 'CADRE',
    description: 'Find jobs at top VC-backed companies.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F2F2F2',
    theme_color: '#F2F2F2',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
