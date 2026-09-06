import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/dashboard/map'],
        disallow: ['/dashboard/', '/api/'],
      },
    ],
    sitemap: 'https://urbanflow-mobility.vercel.app/sitemap.xml',
  }
}
