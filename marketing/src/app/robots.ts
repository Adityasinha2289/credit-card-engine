import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app/', '/app'],
      },
    ],
    sitemap: 'https://renocred.com/sitemap.xml',
  };
}
