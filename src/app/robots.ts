import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // All standard crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/profile', '/my-batch'],
      },
      // ChatGPT / OpenAI
      { userAgent: 'GPTBot', allow: '/' },
      // OpenAI SearchBot (ChatGPT search)
      { userAgent: 'OAI-SearchBot', allow: '/' },
      // Claude / Anthropic
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      // Google Gemini / Bard
      { userAgent: 'Google-Extended', allow: '/' },
      // Perplexity AI
      { userAgent: 'PerplexityBot', allow: '/' },
      // Apple Intelligence
      { userAgent: 'Applebot-Extended', allow: '/' },
      // Amazon Alexa AI
      { userAgent: 'Amazonbot', allow: '/' },
      // Cohere AI
      { userAgent: 'cohere-ai', allow: '/' },
      // Common Crawl (used by many LLMs for training)
      { userAgent: 'CCBot', allow: '/' },
    ],
    sitemap: 'https://www.skillyugedu.com/sitemap.xml',
  };
}
