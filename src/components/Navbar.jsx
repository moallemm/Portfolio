import { motion } from 'framer-motion';
import { Moon, Sun, Github, Linkedin } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onNavigatePersonal, onNavigateHome, isPersonalPage }) {
  const { theme, toggleTheme } = useTheme();

  const handleNameClick = () => {
    if (isPersonalPage) {
      onNavigateHome();
    } else {
      onNavigatePersonal();
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 bg-secondary-light dark:bg-secondary/95 backdrop-blur-md z-50 border-b border-slate-300 dark:border-slate-700 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div
          onClick={handleNameClick}
          className="text-2xl font-bold gradient-text cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPersonalPage ? portfolioData.name.split(' ')[1] : portfolioData.name.split(' ')[0]}
        </motion.div>

        {!isPersonalPage && (
          <div className="hidden md:flex gap-8">
            {['Home', 'About', 'Experience', 'Projects', 'Skills', 'Education', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-text-secondary-light dark:text-slate-300 hover:text-accent-light dark:hover:text-accent transition-colors"
            >
              {item}
            </button>
          ))}
          </div>
        )}

        <div className="flex gap-4 items-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-slate-700" />
            )}
          </button>
          <a href={portfolioData.socials.github} target="_blank" rel="noopener noreferrer" className="text-text-secondary-light dark:text-slate-400 hover:text-accent-light dark:hover:text-accent transition-colors">
            <Github size={20} />
          </a>
          <a href={portfolioData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-secondary-light dark:text-slate-400 hover:text-accent-light dark:hover:text-accent transition-colors">
            <Linkedin size={20} />
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
