import { mkdir, writeFile } from 'node:fs/promises';

// Optional maintenance utility. Production serves these files locally.
const directory = new URL('../public/fonts/', import.meta.url);
const stylesheetUrl = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..700&family=Instrument+Serif:ital@0;1&family=Noto+Sans+Arabic:wght@400..700&display=swap';
const response = await fetch(stylesheetUrl, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
});
if (!response.ok) throw new Error(`Font stylesheet: HTTP ${response.status}`);
const stylesheet = await response.text();
const subsets = [...stylesheet.matchAll(/\/\* (latin|arabic) \*\/\s*(@font-face\s*\{[\s\S]*?\})/g)];
if (subsets.length < 4) throw new Error('Expected Latin and Arabic WOFF2 font subsets');
await mkdir(directory, { recursive: true });
const rules = [];

for (const [, subset, rule] of subsets) {
  const family = rule.match(/font-family:\s*'([^']+)'/)[1];
  const style = rule.match(/font-style:\s*([^;]+)/)[1];
  const remote = rule.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/)[1];
  const filename = `${family.toLowerCase().replaceAll(' ', '-')}-${subset}-${style}.woff2`;
  const font = await fetch(remote);
  if (!font.ok) throw new Error(`${family}: HTTP ${font.status}`);
  await writeFile(new URL(filename, directory), new Uint8Array(await font.arrayBuffer()));
  rules.push(`/* ${subset} */\n${rule.replace(remote, `./${filename}`)}`);
}

await writeFile(new URL('fonts.css', directory), `${rules.join('\n\n')}\n`, 'utf8');
for (const family of ['dmsans', 'instrumentserif', 'notosansarabic']) {
  const license = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`);
  if (!license.ok) throw new Error(`${family} license: HTTP ${license.status}`);
  await writeFile(new URL(`${family}-OFL.txt`, directory), await license.text(), 'utf8');
}
console.log(`Saved ${subsets.length} self-hosted font subsets and their OFL licenses.`);
