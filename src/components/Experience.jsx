import React from 'react';
import { useLocale } from '../context/LocaleContext';
import { companies } from '../data/companies';
import SectionHeading from './SectionHeading';

export default function Experience() {
  const { t, isArabic } = useLocale();

  return (
    <section id="experience" className="section experience-section container">
      <SectionHeading number="02" eyebrow={t.experience.eyebrow} title={t.experience.title} />

      <div className="experience-list">
        {t.experience.items.map((job) => {
          const company = companies[job.company];
          const destinationLabel = company?.destinationType === 'linkedin' ? 'LinkedIn' : (isArabic ? 'الموقع الرسمي' : 'the company website');
          const companyLinkLabel = isArabic
            ? `زيارة ${job.company} على ${destinationLabel} (تفتح في علامة تبويب جديدة)`
            : `Visit ${job.company} on ${destinationLabel} (opens in a new tab)`;

          return (
            <article key={job.company} className="experience-item">
              <aside className="experience-meta">
                <div className="experience-date">
                  <p className="mono"><bdi>{job.dates}</bdi></p>
                  <p>{job.location}</p>
                </div>
                  {company?.destination && (
                    <a
                      className="company-logo-link"
                      href={company.destination}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={companyLinkLabel}
                      title={companyLinkLabel}
                    >
                      <img
                        className="company-logo-image"
                        src={`${import.meta.env.BASE_URL}${company.logo}`}
                        alt=""
                        width="64"
                        height="64"
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  )}
                  {company?.logo && !company.destination && (
                    <span className="company-logo-link company-logo-static">
                      <img className="company-logo-image" src={`${import.meta.env.BASE_URL}${company.logo}`} alt={job.company} width="130" height="86" loading="lazy" decoding="async" />
                    </span>
                  )}
                  {!company && <span className="company-logo-placeholder" aria-label={job.company}><bdi>{job.company}</bdi></span>}
              </aside>
              <div className="experience-content">
                <div className="company-heading">
                  <h3>
                    {company?.destination ? (
                      <a href={company.destination} target="_blank" rel="noopener noreferrer" aria-label={companyLinkLabel}>
                        <bdi>{job.company}</bdi>
                      </a>
                    ) : <bdi>{job.company}</bdi>}
                  </h3>
                </div>
                <p className="experience-role">{job.role}</p>
                <p>{job.description}</p>
                <ul className="experience-highlights">
                  {job.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
