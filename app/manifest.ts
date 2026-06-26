import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Distribuidora Graser',
    short_name: 'Graser',
    description: 'Catálogo de electricidad y electrónica',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a3a6b',
    theme_color: '#1a3a6b',
    orientation: 'portrait',
    categories: ['shopping', 'business'],
    icons: [
      {
        src: '/dgs-pwa-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/dgs-pwa-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
