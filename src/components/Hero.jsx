import { motion } from 'framer-motion';
import { Linkedin, Github, Mail, ExternalLink, ArrowBigDown, ArrowBigDownDashIcon, ArrowBigDownDash, ArrowDownCircleIcon, ArrowDownFromLine, ArrowDownNarrowWide } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { useState, useEffect, useRef } from 'react';

export default function Hero() {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const autoScrollRef = useRef(null);

  useEffect(() => {
    if (!isAutoScrolling) return;

    const handleUserScroll = () => {
      setIsAutoScrolling(false);
    };

    window.addEventListener('wheel', handleUserScroll, { passive: true });
    window.addEventListener('touchmove', handleUserScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
    };
  }, [isAutoScrolling]);

  useEffect(() => {
    if (!isAutoScrolling) return;

    const autoScroll = () => {
      const currentScroll = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      if (currentScroll < maxScroll) {
        // Scroll 3px per frame for smooth motion
        window.scrollBy(0, 3);
        autoScrollRef.current = requestAnimationFrame(autoScroll);
      } else {
        setIsAutoScrolling(false);
      }
    };

    autoScrollRef.current = requestAnimationFrame(autoScroll);

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling]);

  const handleScrollExplore = () => {
    setIsAutoScrolling(true);
  };
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-light to-secondary-light dark:from-primary dark:to-secondary pt-20">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
          {/* Profile Image - Left Side (25%) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center md:col-span-1"
          >
            <div className="relative w-64 h-64 md:w-full md:aspect-square">
              <img
                src={portfolioData.profileImage}
                alt={portfolioData.name}
                className="w-full h-full object-cover rounded-2xl border-4 border-accent-light dark:border-accent shadow-2xl shadow-accent-light/30 dark:shadow-accent/30 hover:shadow-accent-light/50 dark:hover:shadow-accent/50 transition-shadow duration-300"
              />
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-accent-light dark:bg-accent rounded-full opacity-10 blur-2xl"></div>
              <div className="absolute -top-2 -left-2 w-20 h-20 bg-purple-500 rounded-full opacity-10 blur-2xl"></div>
            </div>
          </motion.div>

          {/* Content - Right Side (75%) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-3 text-center md:text-left"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-text-primary-light dark:text-white">
              Hi, I'm <span className="gradient-text">{portfolioData.name}</span>
            </h1>

            <p className="text-2xl md:text-3xl text-accent-light dark:text-accent mb-4 font-semibold">
              {portfolioData.title}
            </p>

            <p className="text-xl text-text-secondary-light dark:text-slate-300 mb-8 leading-relaxed">
              {portfolioData.description}
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex gap-6 justify-center md:justify-start flex-wrap mb-8"
            >
              <a
                href={`mailto:${portfolioData.socials.email}`}
                className="px-8 py-3 bg-accent-light dark:bg-accent text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-accent-dark flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-accent-light/50 dark:hover:shadow-accent/50"
                target='_blank'
              >
                <Mail size={20} /> Get In Touch
              </a>
              <a
                href={portfolioData.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-secondary-light dark:bg-secondary text-text-primary-light dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-accent-light/50 dark:hover:shadow-accent/50"
              >
                <Github size={20} /> GitHub Profile
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex gap-6 justify-center md:justify-start"
            >
              <a href={portfolioData.socials.github} target="_blank" rel="noopener noreferrer" className="text-text-secondary-light dark:text-slate-400 hover:text-accent-light dark:hover:text-accent transition-colors">
                <Github size={28} />
              </a>
              <a href={portfolioData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-secondary-light dark:text-slate-400 hover:text-accent-light dark:hover:text-accent transition-colors">
                <Linkedin size={28} />
              </a>
              <a
                href={`mailto:${portfolioData.socials.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary-light dark:text-slate-400 hover:text-accent-light dark:hover:text-accent transition-colors"
              >
                <Mail size={28}/>
              </a>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-20 text-center flex flex-col items-center cursor-pointer group"
          onClick={handleScrollExplore}
        >
          <div className="text-text-secondary-light dark:text-slate-400 text-sm group-hover:text-accent-light dark:group-hover:text-accent transition-colors">
            {isAutoScrolling ? 'Scrolling...' : 'Scroll to explore'}
          </div>
          <div className="text-2xl mt-2 flex justify-center text-text-secondary-light dark:text-slate-400 group-hover:text-accent-light dark:group-hover:text-accent transition-colors">
            <ArrowBigDownDash />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
