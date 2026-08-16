import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function Personal({ onNavigateHome }) {
  return (
    <div className="min-h-screen bg-primary-light dark:bg-primary text-text-primary-light dark:text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-accent-light dark:text-accent hover:gap-3 transition-all mb-8"
        >
          <ArrowLeft size={20} />
          Back to Portfolio
        </motion.button>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-secondary-light dark:bg-secondary rounded-lg p-12 shadow-lg border border-slate-300 dark:border-slate-700"
        >
          <h1 className="text-5xl font-bold mb-6 gradient-text">
            Personal Space
          </h1>

          <div className="space-y-6 text-lg text-text-secondary-light dark:text-slate-300">
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🚧</div>
              <h2 className="text-3xl font-semibold mb-3 text-text-primary-light dark:text-white">
                Under Construction
              </h2>
              <p className="text-base">
                This page is still being crafted. Come back soon to discover hobbies, interests, and more personal insights!
              </p>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-accent-light dark:border-accent p-4 rounded">
              <p className="text-sm">
                💡 This section will showcase personal hobbies, interests, and other non-professional aspects of who I am.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
