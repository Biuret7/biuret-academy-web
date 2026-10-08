import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildPublicSitemap } from '../scripts/build-sitemap.mjs';
import { academyPaths } from '../path-catalog-data.js';

test('committed sitemap matches the public catalog and excludes private journeys', () => {
  const xml = buildPublicSitemap();
  assert.equal(readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8').replaceAll('\r\n','\n'), xml);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
  assert.equal(new Set(urls.map(url => url.href)).size, urls.length);
  assert.deepEqual(urls.filter(url => url.pathname === '/path.html').map(url => url.searchParams.get('id')), academyPaths.map(path => path.id));
  assert.equal(urls.some(url => /exam|lesson|practical|profile|notes|favorites|admin|settings|certificate\.html/.test(url.pathname)), false);
  assert.equal(urls.some(url => url.href.includes('undefined')), false);
});
test('invalid and duplicate path identifiers stop sitemap generation', () => {
  for (const paths of [[{}], [{id:'bad&link'}], [{id:'valid'}, {id:'valid'}]]) assert.throws(() => buildPublicSitemap(paths), /Invalid or duplicate/);
});
