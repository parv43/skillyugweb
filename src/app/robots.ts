import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llms.txt'], // /llms.txt explicitly allowed so AI crawlers always find it
        disallow: ['/api/'],
      }
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
