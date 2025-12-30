//this is a festive Christmas greeting component with animations and a close button.
//a temporary component to spread holiday cheer on my portfolio site.
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

export default function ChristmasGreeting() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed bottom-8 right-8 z-40 max-w-sm"
      >
        <div className="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-lg shadow-2xl overflow-hidden border-2 border-yellow-300 relative">
          {/* Decorative top border */}
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-red-400 to-green-500"></div>

          <div className="p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-yellow-300 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* Festive emojis with bounce animation */}
            <div className="text-3xl mb-3 flex gap-2 justify-center">
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              >
                🎄
              </motion.span>
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              >
                ❄️
              </motion.span>
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              >
                🎅
              </motion.span>
            </div>

            {/* Main message */}
            <h3 className="text-2xl font-bold text-white text-center mb-3">
                Happy Holidays!
            </h3>

            <p className="text-white text-center text-sm leading-relaxed mb-4">
                Hope you have a joyful holiday and a wonderful New Year! filled with growth, health, and success.
            </p>

            {/* Animated festive dots */}
            <div className="flex gap-1 justify-center mb-4">
              <motion.span 
                className="w-2 h-2 bg-yellow-300 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              ></motion.span>
              <motion.span 
                className="w-2 h-2 bg-green-300 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.15 }}
              ></motion.span>
              <motion.span 
                className="w-2 h-2 bg-yellow-300 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              ></motion.span>
            </div>

            {/* Signature */}
            <p className="text-white text-xs text-center opacity-90">
              ~ Mohamad 🎁
            </p>
          </div>

          {/* Decorative bottom border */}
          <div className="h-1 bg-gradient-to-r from-green-500 via-red-400 to-yellow-400"></div>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{ boxShadow: ['0 0 20px rgba(255,215,0,0.4)', '0 0 30px rgba(220,20,60,0.4)', '0 0 20px rgba(255,215,0,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ pointerEvents: 'none' }}
          ></motion.div>
        </div>
      </motion.div>
    );
}
