import type { APIRoute } from 'astro';
import { hasPlaceholderContent } from '../lib/content';

// Block crawlers while placeholder content is on the site (SPEC 6.4); allow everything afterwards.
export const GET: APIRoute = async ({ site }) => {
  const body = (await hasPlaceholderContent())
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
