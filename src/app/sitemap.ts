import { MetadataRoute } from 'next';
import { blogs } from '@/lib/blogData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://skillyugedu.com';

  // Generate dynamic URLs for all blog posts
  const blogUrls = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Combine static and dynamic URLs
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...blogUrls,
  ];
}
