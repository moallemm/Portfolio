# Mohamad Moallem — portfolio

A bilingual React portfolio for data science, computer vision, and software development. The visual theme pairs warm ivory with forest green in light mode, and charcoal with sage in dark mode. Arabic uses a complete right-to-left layout.

The original section order is preserved: Home → About → Experience → Projects → Skills → Education → Contact. The hero uses the original portrait and a continuous “Scroll to explore” control that pauses on interaction. Reduced-motion visitors jump directly to About. Clicking **Mohamad** in the header opens the personal space and changes the name to **Moallem**; click it again to return. The Arabic version uses **محمد** and **معلم**. Personal-space links use `#personal`, including across language changes.

The contact form uses the original Formspree endpoint, `https://formspree.io/f/mjgblvkr`, with required name, email, subject, and message fields. It reports success and failures, keeps the draft after a failure, and supports a native POST when JavaScript is unavailable. Browser tests intercept submissions so they do not send real emails.

The portrait card tilts away from the hovered corner and flips on click, tap, Enter, or Space to an AI illustration. Reduced-motion settings disable the tilt and flip animation while keeping the switch usable. The original photograph remains the default.

Projects have **Completed** and **Ongoing** tabs. All completed cards render without pagination: adding a sixth entry automatically shows it and updates the counts. Six or more cards use a two-column desktop grid, and mobile uses one column. Add new completed projects to `projects.items` and ongoing work to `projects.ongoingItems` in both languages in `src/data/content.js`; no component changes are required.

## Development

Use Node.js 18+ and npm. This project has been checked with Node.js 22.

```sh
npm ci
npm run dev
```

Vite serves the site under `/Portfolio/`. Open the URL printed in the terminal. The English page is `/Portfolio/`, and Arabic is `/Portfolio/ar/`.

Both development and preview commands support `--host`, `--host 127.0.0.1`, `--port 5174`, `--strictPort`, and `--open`. For example, `npm run dev -- --host 127.0.0.1 --port 5174`. In Windows PowerShell, use `npm.cmd` if the system's script policy blocks `npm.ps1`.

```sh
npm run build
npm run preview
npm run check:seo
```

The build creates the client bundle, renders both language versions to HTML, checks metadata and local assets, and removes its temporary `.prerender` directory. `check:seo` can be rerun against an existing `dist` folder. No server is needed in production.

## Editing content

- `src/data/content.js`: displayed English and Arabic copy, project facts, skills, education, and experience. Update both language versions together.
- `src/data/portfolioData.js`: shared contact details, social links, resume path, and identity facts used by the SEO build. Its older project, skills, and experience objects are retained from the original portfolio; the redesigned pages use `content.js` for these sections.
- `src/index.css`: layout, typography, and light/dark color variables.
- `scripts/site-config.mjs`: localized page titles and search/social descriptions.
- `public/Mohamad Moallem_CV_2026.pdf`: downloadable CV. Keep its filename consistent with the resume link in the portfolio data.
- `public/profile.jpg`: original portrait, stored locally for reliable loading.
- `public/profile-illustrated.jpg`: optimized AI portrait for the flip side. The generation prompt and retained source are documented in `docs/portrait-art.md`.
- `src/data/companies.js` and `public/companies/`: verified company links and original logo assets. SATCON uses the supplied logo without a link because no official destination was provided.
- `public/education/`: the original university and school marks recovered from the existing portfolio.
- `src/data/technologies.js` and `public/technologies/`: local technology badge logos, mappings, and upstream license/source records. Semantic skills use small symbols rather than invented brand marks.
- `public/social-card.png`: 1200 × 630 social sharing image; its editable source is `public/social-card.svg`.
- `public/fonts/`: self-hosted DM Sans, Instrument Serif, and Noto Sans Arabic, with their open-source licenses. `node scripts/fetch-fonts.mjs` refreshes the official Google Fonts subsets when needed; it requires network access. Normal development and production builds use the committed files without external font requests.

The `homepage` field in `package.json` is the source for Vite's base path, canonical links, language alternates, and sitemap URLs. If the repository name or domain changes, update it and rebuild. Keep the deployed spelling and capitalization exact.

## GitHub Pages deployment

The current target is [moallemm.github.io/Portfolio/](https://moallemm.github.io/Portfolio/). GitHub Pages supports the generated static files directly; `/ar/index.html` makes Arabic refreshes and direct visits work without a client-side routing fallback. See [GitHub's Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

When you are ready to publish:

```sh
npm run deploy
```

This builds, validates, and publishes `dist` to the existing repository's `gh-pages` branch. It adds `.nojekyll`. In the repository's **Settings → Pages**, select **Deploy from a branch → gh-pages → / (root)** if that is your current publishing setup. If the repository already uses a GitHub Actions workflow, have that workflow run `npm ci` and `npm run build`, and upload `dist`; do not switch publishing sources unnecessarily.

After publishing, check both language URLs and the CV download. No deployment is performed just by editing or building this project.

## Search visibility

Each route ships its complete portfolio content as HTML, with its own title, description, canonical URL, reciprocal `hreflang` links, Open Graph/Twitter tags, and Person/WebSite/ProfilePage JSON-LD. The schema describes the existing portfolio facts. Build output also includes `sitemap.xml`.

This follows Google's guidance for [JavaScript-rendered content](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) and [localized page versions](https://developers.google.com/search/docs/specialty/international/localized-versions). Structured data helps describe the profile; it does not guarantee a rich result or ranking. See Google's [profile structured-data guidance](https://developers.google.com/search/docs/appearance/structured-data/profile-page).

After the new version is live:

1. Add or open the `https://moallemm.github.io/Portfolio/` URL-prefix property in [Google Search Console](https://search.google.com/search-console). Complete ownership verification if needed.
2. Submit `https://moallemm.github.io/Portfolio/sitemap.xml` under **Sitemaps**.
3. Inspect both language URLs and request indexing. Test the published structured data with [Google's Rich Results Test](https://search.google.com/test/rich-results).
4. Link this portfolio from your GitHub and LinkedIn profiles. Keep project descriptions accurate and add useful work as you complete it.

The project deliberately does not add a `/Portfolio/robots.txt`: crawlers look for robots rules at the origin root (`https://moallemm.github.io/robots.txt`), which this project does not control. The sitemap can be submitted directly through Search Console. If you manage the account's root site, its robots file can advertise this project's sitemap.

Indexing takes time and remains a search engine decision. Use Search Console to monitor discovered pages, indexing, and search queries.
