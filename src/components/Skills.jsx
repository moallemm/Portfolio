import { useLocale } from '../context/LocaleContext';
import SectionHeading from './SectionHeading';
import TechBadge from './TechBadge';

export default function Skills() {
  const { t } = useLocale();
  return (
    <section id="skills" className="section skills-standalone" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading number="04" eyebrow={t.skills.eyebrow} title={<span id="skills-title">{t.skills.title}</span>}><p>{t.skills.intro}</p></SectionHeading>
        <div className="skill-groups">
          {t.skills.groups.map((group) => (
            <article key={group.title} className="skill-group">
              <h3>{group.title}</h3>
              <ul className="skill-list">{group.items.map((skill) => <li key={skill}><TechBadge name={skill} /></li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
