import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { useState } from 'react';

const ProjectCard = ({ project, index }) => {
  const isOngoing = project.progress !== undefined;
  const [isExpanded, setIsExpanded] = useState(false);
  const descriptionLength = project.description.length;
  const shouldShowReadMore = descriptionLength > 150;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group bg-secondary-light dark:bg-secondary rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 hover:border-accent-light dark:hover:border-accent transition-all hover:shadow-lg hover:shadow-accent/20"
    >
      {/* Gradient Header */}
      <div className="relative h-40 bg-gradient-to-br from-accent-light to-purple-500 dark:from-accent dark:to-purple-600 group-hover:shadow-lg transition-all">
        {isOngoing && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-primary-light dark:text-primary px-3 py-1 rounded-full text-sm font-bold">
            In Progress
          </div>
        )}
      </div>

      {/* Project Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-text-primary-light dark:text-white mb-2 group-hover:text-accent-light dark:group-hover:text-accent transition-colors">
          {project.title}
        </h3>
        
        {/* Description with Read More */}
        <motion.div
          initial={{ height: 'auto' }}
          animate={{ height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mb-4 overflow-hidden"
        >
          <p className={`text-text-secondary-light dark:text-slate-300 ${!isExpanded && shouldShowReadMore ? 'line-clamp-3' : ''}`}>
            {project.description}
          </p>
        </motion.div>

        {shouldShowReadMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-accent-light dark:text-accent font-semibold hover:underline mb-4 text-sm transition-colors"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}

        {/* Highlights */}
        <div className="mb-4 space-y-2">
          {project.highlights.map((highlight, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-accent-light dark:text-accent text-sm">✓</span>
              <span className="text-sm text-text-secondary-light dark:text-slate-400">{highlight}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar (for ongoing projects) */}
        {isOngoing && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-secondary-light dark:text-slate-300">Progress</span>
              <span className="text-sm text-accent-light dark:text-accent font-semibold">{project.progress}%</span>
            </div>
            <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-accent to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Technologies */}
        <div className="mb-4 flex flex-wrap gap-2">
          {project.technologies.map((tech, idx) => (
            <span key={idx} className="text-xs bg-primary-light dark:bg-primary px-3 py-1 rounded-full text-text-primary-light dark:text-slate-300">
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-4">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-colors"
            >
              <Github size={18} /> Code
            </a>
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-secondary-light dark:bg-secondary text-text-primary-light dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <ExternalLink size={18} /> Live
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
