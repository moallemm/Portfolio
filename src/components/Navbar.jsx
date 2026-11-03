import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLocale } from '../context/LocaleContext';

export default function Navbar({ isPersonalPage, onNavigatePersonal, onNavigateHome }) {
  const { theme, toggleTheme } = useTheme();
  const { t, isArabic } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');
  const menuButton = useRef(null);
  const base = import.meta.env.BASE_URL;
  const links = [
    ['home', t.nav.home], ['about', t.nav.about], ['experience', t.nav.experience],
    ['projects', t.nav.work], ['skills', t.nav.skills], ['education', t.nav.education], ['contact', t.nav.contact],
  ];
  const displayedName = t.name.split(' ')[isPersonalPage ? 1 : 0];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: '-15% 0px -60% 0px' });
    document.querySelectorAll('main > section[id]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isPersonalPage]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    };
    const onResize = () => { if (window.innerWidth > 1000) setMenuOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a
          className="wordmark" data-personal-toggle href={isPersonalPage ? '#home' : '#personal'}
          aria-label={`${displayedName} — ${isPersonalPage ? t.personal.return : t.personal.open}`}
          title={isPersonalPage ? t.personal.return : t.personal.open}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            const destination = isPersonalPage ? 'home' : 'personal';
            setMenuOpen(false);
            if (isPersonalPage) onNavigateHome(); else onNavigatePersonal();
            window.location.hash = destination;
            requestAnimationFrame(() => document.getElementById(destination)?.scrollIntoView());
          }}
        >
          <span className="monogram" aria-hidden="true">m<span>.</span></span>
          <span className="wordmark-name"><span className="name-switch">{displayedName}</span><span className="wordmark-role">{isPersonalPage ? t.personal.title : t.role}</span></span>
        </a>
        {!isPersonalPage && (
          <nav className="desktop-nav" aria-label={isArabic ? 'التنقل الرئيسي' : 'Main navigation'}>
            {links.map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} aria-current={active === id ? 'location' : undefined}>{label}</a>)}
          </nav>
        )}
        <div className="header-controls">
          <a className="language-switch" data-language-switch href={isArabic ? base : `${base}ar/`} hrefLang={isArabic ? 'en' : 'ar'} lang={isArabic ? 'en' : 'ar'} onClick={(event) => {
            if (window.location.hash) event.currentTarget.href = `${isArabic ? base : `${base}ar/`}${window.location.hash}`;
          }}>{isArabic ? 'EN' : 'عربي'}</a>
          <span className="control-divider" aria-hidden="true" />
          <button type="button" className="icon-button theme-toggle" data-theme-toggle onClick={toggleTheme} aria-label={theme === 'dark' ? t.nav.light : t.nav.dark} title={theme === 'dark' ? t.nav.light : t.nav.dark}>
            <Moon className="theme-moon" size={18} aria-hidden="true" /><Sun className="theme-sun" size={18} aria-hidden="true" />
          </button>
          {!isPersonalPage && <button type="button" ref={menuButton} className="icon-button menu-toggle" data-menu-toggle aria-label={menuOpen ? t.nav.close : t.nav.menu} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>}
        </div>
      </div>
      {!isPersonalPage && <nav id="mobile-navigation" className="mobile-nav" hidden={!menuOpen} aria-label={isArabic ? 'التنقل عبر الهاتف' : 'Mobile navigation'}>
        {links.map(([id, label], index) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}><span className="mono">0{index + 1}</span>{label}<ArrowUpRight size={18} aria-hidden="true" /></a>)}
      </nav>}
    </header>
  );
}
