import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <a href="#home" className="footer-brand">{t.name}</a>
        <p className="footer-note">© 2026 {t.footer.note}</p>
        <a href="#home" className="text-link">
          {t.footer.backTop}
          <ArrowUp size={16} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
