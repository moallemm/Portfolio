import { useEffect, useRef } from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

export default function Personal({ onNavigateHome }) {
  const { t } = useLocale();
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  return (
    <section id="personal" className="personal-section container" aria-labelledby="personal-title">
      <a className="text-link personal-back" data-personal-back href="#home" onClick={onNavigateHome}><ArrowLeft size={17} aria-hidden="true" />{t.personal.back}</a>
      <div className="personal-card">
        <p className="eyebrow"><Compass size={16} aria-hidden="true" />{t.personal.eyebrow}</p>
        <h1 id="personal-title" ref={heading} tabIndex={-1}>{t.personal.title}<span className="accent-dot">.</span></h1>
        <div className="personal-placeholder">
          <span className="personal-asterisk" aria-hidden="true">✳</span>
          <h2>{t.personal.heading}</h2>
          <p>{t.personal.description}</p>
        </div>
      </div>
    </section>
  );
}
