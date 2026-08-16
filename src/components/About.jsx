import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="about" className="py-20 bg-primary-light dark:bg-primary">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">About Me</h2>
          <div className="h-1 w-20 bg-accent-light dark:bg-accent mb-12"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-lg text-text-secondary-light dark:text-slate-300 mb-6 leading-relaxed">{portfolioData.about.intro}</p>
            <p className="text-lg text-text-secondary-light dark:text-slate-300 mb-6 leading-relaxed">
              {portfolioData.about.description}
            </p>
            <p className="text-lg text-text-secondary-light dark:text-slate-300 leading-relaxed">{portfolioData.about.plans}</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {portfolioData.about.highlights.map((highlight, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center gap-4 p-4 bg-secondary-light dark:bg-secondary rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-3 h-3 bg-accent-light dark:bg-accent rounded-full"></div>
                <span className="text-text-primary-light dark:text-slate-200 font-semibold">{highlight}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
