import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Distribuidora Graser',
    short_name: 'Graser',
    description: 'Catálogo de electricidad y electrónica',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#1A56DB',
    orientation: 'portrait',
    categories: ['shopping', 'business'],
    icons: [
      {
        src: '/dgs-orbit-icon-512.png',
        sizes: '192x192 512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
