import { writeFileSync } from 'node:fs';
import { academyPaths } from '../path-catalog-data.js';

// Only public discovery pages belong in search; learning records and exams do not.
export const publicPages = Object.freeze(['', 'paths', 'courses', 'labs', 'quizzes', 'tools', 'challenges', 'free-studio', 'operations', 'certifications', 'professional']);
export function buildPublicSitemap(paths = academyPaths) {
  const origin = 'https://academy.biuret.dev';
  const ids = paths.map(path => path.id);
  if (ids.some(id => typeof id !== 'string' || !/^[a-z][a-z0-9_]*$/.test(id)) || new Set(ids).size !== ids.length) throw new Error('Invalid or duplicate path identifier');
  const urls = [...publicPages.map(page => `${origin}/${page ? page + '.html' : ''}`), ...ids.map(id => `${origin}/path.html?id=${encodeURIComponent(id)}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
}
export function writePublicSitemap() {
  writeFileSync(new URL('../sitemap.xml', import.meta.url), buildPublicSitemap());
}
