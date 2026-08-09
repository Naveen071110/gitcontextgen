import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/dashboard/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://repopulse-ai.singhnaveen360.workers.dev'}/sitemap.xml`,
  };
}
