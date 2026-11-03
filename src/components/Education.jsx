import { useLocale } from '../context/LocaleContext';
import SectionHeading from './SectionHeading';

export default function Education() {
  const { t } = useLocale();
  return (
    <section id="education" className="section education-section container" aria-labelledby="education-title">
      <SectionHeading number="05" eyebrow={t.education.eyebrow} title={<span id="education-title">{t.education.title}</span>}><p>{t.education.intro}</p></SectionHeading>
      <div className="education-list">
        {t.about.educationItems.map((education, index) => (
          <article key={education.school} className="education-item">
            <div className="education-meta"><span className="education-icon education-logo"><img src={`${import.meta.env.BASE_URL}education/${index === 0 ? 'usal.png' : 'al-rahmah.jpg'}`} alt={education.school} width="48" height="48" loading="lazy" decoding="async" /></span><span className="mono"><bdi>{education.years}</bdi></span></div>
            <div><h3>{education.degree}</h3><p>{education.school}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}
