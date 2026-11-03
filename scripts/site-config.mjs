import { readFileSync } from 'node:fs';

const { homepage } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

// The deployed URL is shared by Vite, canonical links, language links, and the sitemap.
export const SITE_URL = `${homepage.replace(/\/+$/, '')}/`;
export const BASE_PATH = new URL(SITE_URL).pathname;
export const LOCALES = {
  en: {
    url: SITE_URL,
    dir: 'ltr',
    title: 'Mohamad Moallem | Data Scientist & Software Developer',
    description: 'Mohamad Moallem, a data scientist and software developer in Lebanon. Explore computer vision, machine learning, and web development projects, including SafeWalk AI.',
    ogLocale: 'en_US',
    alternateOgLocale: 'ar_LB',
    imageAlt: 'Mohamad Moallem — data science, computer vision, and software development.',
  },
  ar: {
    url: new URL('ar/', SITE_URL).href,
    dir: 'rtl',
    title: 'محمد معلم | عالم بيانات ومطور برمجيات',
    description: 'محمد معلم، عالم بيانات ومطور برمجيات من لبنان. تعرّف على مشاريعي في الرؤية الحاسوبية وتعلّم الآلة وتطوير الويب، ومنها SafeWalk AI.',
    ogLocale: 'ar_LB',
    alternateOgLocale: 'en_US',
    imageAlt: 'محمد معلم — علم البيانات والرؤية الحاسوبية وتطوير البرمجيات.',
  },
};
