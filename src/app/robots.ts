import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/dashboard/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://gitcontextgen.com'}/sitemap.xml`,
  };
}
