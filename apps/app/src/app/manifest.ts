import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'logs',
    short_name: 'logs',
    description: 'digital echoes in the void',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf9f7',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/assets/leaves/fall.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/assets/leaves/fall.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
