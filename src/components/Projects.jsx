import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import ProjectCard from './ProjectCard';

export default function Projects() {
  const [activeTab, setActiveTab] = useState('completed');
  const [currentPage, setCurrentPage] = useState(0);
  const projectsPerPage = 4;

  // Get current tab projects
  const projects = activeTab === 'completed' ? portfolioData.projects.completed : portfolioData.projects.ongoing;
  
  // Calculate pagination
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const startIndex = currentPage * projectsPerPage;
  const visibleProjects = projects.slice(startIndex, startIndex + projectsPerPage);

  // Reset page when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => (prev > 0 ? prev - 1 : totalPages - 1));//wrap around
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });//to top on page change
  };

  const handleNextPage = () => {
    setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : 0));//wrap around
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });//to top on page change
  };

  return (
    <section id="projects" className="py-20 bg-primary-light dark:bg-primary">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">My Projects</h2>
          <div className="h-1 w-20 bg-accent-light dark:bg-accent mb-12"></div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex gap-4 mb-12"
        >
          <button
            onClick={() => handleTabChange('completed')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-accent-light dark:bg-accent text-white'
                : 'bg-secondary-light dark:bg-secondary text-text-secondary-light dark:text-slate-300 hover:text-accent-light dark:hover:text-accent'
            }`}
          >
            Completed Projects
          </button>
          <button
            onClick={() => handleTabChange('ongoing')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'ongoing'
                ? 'bg-accent-light dark:bg-accent text-white'
                : 'bg-secondary-light dark:bg-secondary text-text-secondary-light dark:text-slate-300 hover:text-accent-light dark:hover:text-accent'
            }`}
          >
            Ongoing Projects
          </button>
        </motion.div>

        {/* Projects Grid - Always shows 4 projects max */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 min-h-[600px]"
        >
          {visibleProjects.map((project, index) => (
            <ProjectCard key={`${activeTab}-${currentPage}-${index}`} project={project} index={index} />
          ))}
        </motion.div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 20 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 flex items-center justify-center gap-6"
          >
            <button
              onClick={handlePrevPage}
              className="p-2 rounded-lg bg-secondary-light dark:bg-secondary hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-text-primary-light dark:text-white"
              aria-label="Previous page"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}//direct page select
                  onClickCapture={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}//to top on page change for better experience
                  className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                    currentPage === index
                      ? 'bg-accent-light dark:bg-accent text-white'
                      : 'bg-secondary-light dark:bg-secondary text-text-primary-light dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              className="p-2 rounded-lg bg-secondary-light dark:bg-secondary hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-text-primary-light dark:text-white"
              aria-label="Next page"
            >
              <ChevronRight size={24} />
            </button>

            {/* Page Info */}
            <div className="text-text-secondary-light dark:text-slate-400 text-sm ml-4">
              Page {currentPage + 1} of {totalPages}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
