import { useLocale } from '../context/LocaleContext';
import SectionHeading from './SectionHeading';

export default function About() {
  const { t, isArabic } = useLocale();
  const currentRole = t.experience.items[0];
  return (
    <section id="about" className="section about-section container" aria-labelledby="about-title">
      <SectionHeading number="01" eyebrow={t.about.eyebrow} title={<span id="about-title">{t.about.title}</span>} />
      <div className="about-grid">
        <div className="about-copy">
          <p className="lead">{t.about.intro}</p>
          <p>{t.about.body}</p>
          <blockquote className="about-principle">{t.about.principle}</blockquote>
        </div>
        <dl className="about-facts">
          <div className="fact-row"><dt>{t.about.locationLabel}</dt><dd>{t.about.location}</dd></div>
          <div className="fact-row"><dt>{t.about.languagesLabel}</dt><dd>{t.about.languages}</dd></div>
          <div className="fact-row"><dt>{isArabic ? 'حاليًا' : 'Currently'}</dt><dd><strong className="current-company"><bdi>{currentRole.company}</bdi></strong><span>{currentRole.role}</span></dd></div>
        </dl>
      </div>
    </section>
  );
}
