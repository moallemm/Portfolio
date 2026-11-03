import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Personal from './components/Personal';
import { ThemeProvider } from './context/ThemeContext';
import { LocaleProvider, useLocale } from './context/LocaleContext';
import './index.css';

function Portfolio() {
  const { t } = useLocale();
  // Start with the prerendered portfolio, including on a direct #personal visit.
  const [isPersonalPage, setIsPersonalPage] = useState(false);

  useEffect(() => {
    const syncHash = () => {
      const personal = window.location.hash === '#personal';
      setIsPersonalPage(personal);
      requestAnimationFrame(() => {
        const id = personal ? 'personal' : window.location.hash.slice(1);
        if (id) document.getElementById(id)?.scrollIntoView();
      });
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  // Insert the destination before the browser follows the link's fragment.
  const navigateToPersonal = () => flushSync(() => setIsPersonalPage(true));
  const navigateToHome = () => flushSync(() => setIsPersonalPage(false));

  return (
    <>
      <a className="skip-link" href="#main">{t.nav.skip}</a>
      <Navbar
        isPersonalPage={isPersonalPage}
        onNavigatePersonal={navigateToPersonal}
        onNavigateHome={navigateToHome}
      />
      <main id="main" tabIndex={-1}>
        {isPersonalPage ? (
          <Personal onNavigateHome={navigateToHome} />
        ) : (
          <>
            <Hero />
            <About />
            <Experience />
            <Projects />
            <Skills />
            <Education />
            <Contact />
          </>
        )}
      </main>
      {!isPersonalPage && <Footer />}
    </>
  );
}

export default function App({ initialLocale }) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <ThemeProvider><Portfolio /></ThemeProvider>
    </LocaleProvider>
  );
}
