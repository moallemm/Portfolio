import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';

export default function Education() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="education" className="py-20 bg-primary-light dark:bg-primary">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Education</h2>
          <div className="h-1 w-20 bg-accent mb-12"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {portfolioData.education.map((edu, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative pl-8 pb-8 border-l-2 border-accent-light dark:border-accent last:border-l-transparent"
            >
              <div className="absolute -left-4 top-0 w-6 h-6 bg-accent-light dark:bg-accent rounded-full border-4 border-primary-light dark:border-primary"></div>

              <div className="relative bg-secondary-light dark:bg-secondary p-6 rounded-lg overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-text-primary-light dark:text-white">{edu.degree}</h3>
                    <span className="text-accent-light dark:text-accent text-sm font-semibold">
                      {edu.startYear} - {edu.endYear}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    {edu.logo && (
                      <img
                        src={edu.logo}
                        alt={`${edu.school} logo`}
                        className="w-12 h-12 object-contain rounded border border-accent/30 p-1.5 bg-primary-light/50 dark:bg-primary/50"
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <p className="text-accent-light dark:text-accent font-semibold">{edu.school}</p>
                    </div>
                  </div>
                  <p className="text-text-secondary-light dark:text-slate-400 mb-4">{edu.field}</p>
                  <p className="text-text-secondary-light dark:text-slate-300 mb-4">{edu.description}</p>

                  <div className="grid grid-cols-1 gap-2">
                    {edu.achievements.map((achievement, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-accent-light dark:text-accent mt-1">•</span>
                        <span className="text-text-secondary-light dark:text-slate-300">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
