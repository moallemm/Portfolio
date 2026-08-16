import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Education from './components/Education';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Personal from './components/Personal';
import ChristmasGreeting from './components/ChristmasGreeting';
import { ThemeProvider } from './context/ThemeContext';
import { useState } from 'react';
import './index.css';

export default function App() {
  const [isPersonalPage, setIsPersonalPage] = useState(false);

  const navigateToPersonal = () => setIsPersonalPage(true);
  const navigateToHome = () => setIsPersonalPage(false);

  return (
    <ThemeProvider>
      <div className="bg-primary-light dark:bg-primary text-text-primary-light dark:text-white overflow-x-hidden transition-colors duration-300">
        <Navbar onNavigatePersonal={navigateToPersonal} onNavigateHome={navigateToHome} isPersonalPage={isPersonalPage} />
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
            <Footer />
            {/*<ChristmasGreeting />*/}{/* Uncomment to enable Christmas/New Year Greeting */}
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
