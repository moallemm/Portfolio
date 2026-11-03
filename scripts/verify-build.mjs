import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { BASE_PATH, LOCALES, SITE_URL } from './site-config.mjs';

export async function verifyBuild() {
  const dist = new URL('../dist/', import.meta.url);

  for (const [locale, page] of Object.entries(LOCALES)) {
    const html = await readFile(new URL(locale === 'en' ? 'index.html' : 'ar/index.html', dist), 'utf8');
    assert.ok(html.includes(`<html lang="${locale}" dir="${page.dir}">`), `${locale}: language and direction`);
    assert.ok(html.includes(`<link rel="canonical" href="${page.url}"`), `${locale}: canonical URL`);
    for (const [language, alternate] of Object.entries(LOCALES)) {
      assert.ok(html.includes(`hreflang="${language}" href="${alternate.url}"`), `${locale}: ${language} alternate`);
    }
    assert.ok(html.includes(`hreflang="x-default" href="${LOCALES.en.url}"`), `${locale}: fallback alternate`);
    assert.equal((html.match(/<title>/g) || []).length, 1, `${locale}: one title`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${locale}: one main heading`);
    assert.ok(html.includes('SafeWalk AI'), `${locale}: project content exists before JavaScript`);
    assert.ok(html.includes('SATCON Africa'), `${locale}: current CV experience is rendered`);
    const sections = [...html.matchAll(/<section id="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(sections, ['home', 'about', 'experience', 'projects', 'skills', 'education', 'contact'], `${locale}: original section flow`);
    assert.ok(html.includes('data-personal-toggle="true"'), `${locale}: personal-space navigation`);
    assert.ok(html.includes('data-scroll-explore="true"'), `${locale}: explore-scroll control`);
    assert.ok(html.includes('data-portrait-card="true"'), `${locale}: interactive portrait`);
    assert.ok(html.includes('id="projects-tab-completed"') && html.includes('id="projects-tab-ongoing"'), `${locale}: completed and ongoing tabs`);
    assert.ok(!html.includes('tech-badge-watermark'), `${locale}: no oversized technology decorations`);
    assert.ok(html.includes('action="https://formspree.io/f/mjgblvkr"'), `${locale}: original Formspree endpoint`);
    for (const field of ['name', 'email', 'subject', 'message']) {
      assert.ok(html.includes(`name="${field}"`), `${locale}: contact ${field} field`);
    }
    assert.ok(html.includes('mailto:mohamadmoallem79@gmail.com'), `${locale}: contact is crawlable`);
    assert.ok(!html.includes('/vite.svg') && !html.includes('/src/main.jsx'), `${locale}: production assets only`);

    const structuredDataMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(structuredDataMatch, `${locale}: structured data`);
    const schema = JSON.parse(structuredDataMatch[1]);
    assert.equal(schema['@context'], 'https://schema.org');
    assert.equal(schema['@graph'].find((entity) => entity['@type'] === 'ProfilePage').inLanguage, locale);
    assert.equal(schema['@graph'].find((entity) => entity['@type'] === 'Person').alternateName, 'محمد معلم');

    const assetReferences = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((url) => url.startsWith(BASE_PATH) && !url.includes('#'));
    for (const reference of assetReferences) {
      const localPath = decodeURIComponent(reference.slice(BASE_PATH.length).split('?')[0]);
      await access(new URL(localPath, dist));
    }
  }

  const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
  for (const { url } of Object.values(LOCALES)) assert.ok(sitemap.includes(`<loc>${url}</loc>`));
  await access(new URL('favicon.svg', dist));
  await access(new URL('profile.jpg', dist));
  await access(new URL('profile-illustrated.jpg', dist));
  await access(new URL('education/usal.png', dist));
  await access(new URL('education/al-rahmah.jpg', dist));
  const resume = await readFile(new URL('Mohamad Moallem_CV_2026.pdf', dist));
  assert.equal(resume.subarray(0, 5).toString(), '%PDF-', 'Downloadable CV is a PDF');
  await access(new URL('social-card.png', dist));
  await access(new URL('.nojekyll', dist));
  const verificationFile = 'googlee39d46c1a56b8326.html';
  const verificationSource = await readFile(new URL(`../public/${verificationFile}`, import.meta.url));
  const verificationOutput = await readFile(new URL(verificationFile, dist));
  assert.deepEqual(verificationOutput, verificationSource, 'Google verification file is copied unchanged');
  const image = await readFile(new URL('social-card.png', dist));
  assert.equal(image.subarray(1, 4).toString(), 'PNG', 'Social preview is a PNG');
  assert.equal(image.readUInt32BE(16), 1200, 'Social preview width');
  assert.equal(image.readUInt32BE(20), 630, 'Social preview height');
  console.log(`SEO checks passed: 2 readable pages, canonical/hreflang, structured data, sitemap, and local assets (${SITE_URL}).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await verifyBuild();
