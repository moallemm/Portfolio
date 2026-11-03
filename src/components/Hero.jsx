import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, Download, Github, Linkedin, MapPin, Pause } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { profile } from '../data/portfolioData';
import PortraitCard from './PortraitCard';

function useExploreScroll() {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (!isScrolling) return undefined;
    let frame;
    let lastTime;
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => setIsScrolling(false);
    const onPointerDown = (event) => {
      if (!event.target.closest('[data-scroll-explore]')) stop();
    };
    const onKeyDown = (event) => {
      if (event.key === ' ' && event.target.closest('[data-scroll-explore]')) return;
      if (['Escape', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab'].includes(event.key)) stop();
    };
    const onVisibilityChange = () => { if (document.hidden) stop(); };
    const onMotionChange = (event) => { if (event.matches) stop(); };
    const step = (time) => {
      const maximum = root.scrollHeight - window.innerHeight;
      if (window.scrollY >= maximum - 1) { stop(); return; }
      if (lastTime !== undefined) window.scrollBy(0, Math.min(time - lastTime, 50) * 0.15);
      lastTime = time;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', stop, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibilityChange);
    media.addEventListener('change', onMotionChange);
    return () => {
      cancelAnimationFrame(frame);
      root.style.scrollBehavior = previousBehavior;
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      media.removeEventListener('change', onMotionChange);
    };
  }, [isScrolling]);

  const toggleScroll = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.getElementById('about')?.scrollIntoView({ behavior: 'auto' });
      return;
    }
    setIsScrolling((current) => !current);
  };
  return { isScrolling, toggleScroll };
}

export default function Hero() {
  const { t } = useLocale();
  const { isScrolling, toggleScroll } = useExploreScroll();

  return (
    <section id="home" className="hero container" aria-labelledby="hero-title">
      <div className="hero-topline">
        <span className="eyebrow"><span className="tiny-spark" aria-hidden="true">✳</span>{t.hero.eyebrow}</span>
        <span className="location-label"><MapPin size={13} aria-hidden="true" />{t.location}</span>
      </div>
      <div className="hero-profile-grid">
        <figure className="hero-portrait">
          <PortraitCard />
          <figcaption><span className="status-dot" aria-hidden="true" />{t.hero.availability}</figcaption>
        </figure>
        <div className="hero-copy">
          <p className="hero-intro">{t.hero.greeting}<span className="intro-line" aria-hidden="true" /></p>
          <h1 id="hero-title"><em>{t.name}.</em></h1>
          <p className="hero-role">{t.role}</p>
          <p className="hero-description">{t.hero.description}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">{t.nav.contact}<ArrowUpRight size={18} aria-hidden="true" /></a>
            <a className="button button-text" href={`${import.meta.env.BASE_URL}Mohamad%20Moallem_CV_2026.pdf`} download><Download size={17} aria-hidden="true" />{t.hero.resume}</a>
          </div>
          <div className="social-links hero-socials">
            <a href={profile.socials.github} target="_blank" rel="noopener noreferrer"><Github size={16} aria-hidden="true" />GitHub<ArrowUpRight size={12} aria-hidden="true" /></a>
            <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={16} aria-hidden="true" />LinkedIn<ArrowUpRight size={12} aria-hidden="true" /></a>
          </div>
        </div>
      </div>
      <div className="hero-bottom">
        <button className="explore-link scroll-explore" type="button" data-scroll-explore aria-pressed={isScrolling} onClick={toggleScroll}>
          <span>{isScrolling ? t.hero.scrolling : t.hero.scroll}</span>
          {isScrolling ? <Pause size={16} aria-hidden="true" /> : <ArrowDown className="scroll-arrow" size={18} aria-hidden="true" />}
        </button>
        <span className="hero-note">{t.hero.note}</span>
      </div>
    </section>
  );
}
