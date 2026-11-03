import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { LOCALES, SITE_URL } from './site-config.mjs';
import { portfolioData } from '../src/data/portfolioData.js';

const dist = new URL('../dist/', import.meta.url);
const escapeAttribute = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function structuredData(locale) {
  const page = LOCALES[locale];
  const personId = `${SITE_URL}#person`;
  const websiteId = `${SITE_URL}#website`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: portfolioData.name,
        alternateName: 'محمد معلم',
        url: SITE_URL,
        jobTitle: 'Data Scientist and Software Developer',
        description: page.description,
        email: portfolioData.email,
        homeLocation: { '@type': 'Country', name: portfolioData.location },
        sameAs: [portfolioData.socials.github, portfolioData.socials.linkedin],
        knowsAbout: ['Data Science', 'Machine Learning', 'Computer Vision', 'Python', 'Software Development'],
        knowsLanguage: ['English', 'Arabic'],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: 'Mohamad Moallem',
        url: SITE_URL,
        inLanguage: ['en', 'ar'],
        publisher: { '@id': personId },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${page.url}#profile`,
        url: page.url,
        name: page.title,
        description: page.description,
        inLanguage: locale,
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
      },
    ],
  }).replace(/</g, '\\u003c');
}

function metadata(locale) {
  const page = LOCALES[locale];
  const title = escapeAttribute(page.title);
  const description = escapeAttribute(page.description);
  const socialImage = new URL('social-card.png', SITE_URL).href;
  const primaryFont = new URL(`fonts/${locale === 'ar' ? 'noto-sans-arabic-arabic-normal.woff2' : 'dm-sans-latin-normal.woff2'}`, SITE_URL).pathname;
  return `<!-- seo:start -->
    <link rel="preload" href="${primaryFont}" as="font" type="font/woff2" crossorigin />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="author" content="${escapeAttribute(portfolioData.name)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${page.url}" />
    <link rel="alternate" hreflang="en" href="${LOCALES.en.url}" />
    <link rel="alternate" hreflang="ar" href="${LOCALES.ar.url}" />
    <link rel="alternate" hreflang="x-default" href="${LOCALES.en.url}" />
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="Mohamad Moallem" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${page.url}" />
    <meta property="og:locale" content="${page.ogLocale}" />
    <meta property="og:locale:alternate" content="${page.alternateOgLocale}" />
    <meta property="og:image" content="${socialImage}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeAttribute(page.imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${socialImage}" />
    <meta name="twitter:image:alt" content="${escapeAttribute(page.imageAlt)}" />
    <script type="application/ld+json">${structuredData(locale)}</script>
    <!-- seo:end -->`;
}

export async function prerender() {
  const { render } = await import('../.prerender/entry-server.js');
  const template = await readFile(new URL('index.html', dist), 'utf8');
  if (!template.includes('<div id="root"></div>') || !template.includes('<!-- seo:start -->')) {
    throw new Error('Expected HTML template markers were not found');
  }

  for (const [locale, page] of Object.entries(LOCALES)) {
    const html = template
      .replace(/<html\b[^>]*>/, `<html lang="${locale}" dir="${page.dir}">`)
      .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, () => metadata(locale))
      .replace('<div id="root"></div>', () => `<div id="root">${render(locale)}</div>`);
    const destination = new URL(locale === 'en' ? 'index.html' : 'ar/index.html', dist);
    if (locale === 'ar') await mkdir(new URL('ar/', dist), { recursive: true });
    await writeFile(destination, html, 'utf8');
  }

  // HTML already supplies reciprocal language annotations; keep the sitemap simple.
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.values(LOCALES).map(({ url }) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
  await writeFile(new URL('sitemap.xml', dist), sitemap, 'utf8');
  await writeFile(new URL('.nojekyll', dist), '', 'utf8');
  console.log('Prerendered English and Arabic pages with localized metadata.');
}
