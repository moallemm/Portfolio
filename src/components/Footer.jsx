import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Heart, Hammer, Power, Laptop } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-light dark:bg-primary border-t border-slate-300 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-3 gap-8 mb-8"
        >
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-accent-light dark:text-accent mb-4">{portfolioData.name.split(' ')[0]}</h3>
            <p className="text-text-secondary-light dark:text-slate-400 text-sm leading-relaxed">
              Data Science & AI Engineer passionate about building intelligent solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-text-primary-light dark:text-white font-semibold mb-4">Quick Links</h4>
            <div className="flex gap-4">
              {['About', 'Skills', 'Projects', 'Experience'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-text-secondary-light dark:text-slate-400 hover:text-accent-light dark:hover:text-accent transition-colors text-sm"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-text-primary-light dark:text-white font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href={portfolioData.socials.github} target="_blank" rel="noopener noreferrer" className="text-text-secondary-light dark:text-slate-400 hover:text-accent-light dark:hover:text-accent transition-colors">
                <Github size={20} />
              </a>
              <a href={portfolioData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-secondary-light dark:text-slate-400 hover:text-accent-light dark:hover:text-accent transition-colors">
                <Linkedin size={20} />
              </a>
              <a href={`mailto:${portfolioData.socials.email}`} className="text-text-secondary-light dark:text-slate-400 hover:text-accent-light dark:hover:text-accent transition-colors"
              target='_blank'>
                <Mail size={20} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-slate-300 dark:border-slate-700 pt-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-text-secondary-light dark:text-slate-400 text-sm"
          >
            <p className="flex items-center justify-center gap-2">
              Made using <Laptop size={16} className="text-accent-light dark:text-accent" /> by {portfolioData.name}
            </p>{/*/-- credits to me :) and Ai wrote made with love no it was made with laptop*/}
            <p className="mt-2">© {currentYear} All rights reserved.</p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
