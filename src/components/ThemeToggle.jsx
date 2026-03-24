import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed top-4 left-4 sm:top-8 sm:left-8 z-50 glass rounded-full p-3 sm:p-4 group overflow-hidden"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Background glow on hover */}
      <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />

      {/* Icon with rotation animation */}
      <AnimatePresence mode="wait">
        <motion.span
          key={isDark ? 'sun' : 'moon'}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }}
          className="relative block"
        >
          {isDark ? (
            <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </motion.span>
      </AnimatePresence>

      {/* Subtle ring effect */}
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1.2, opacity: 0.3 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-full border-2 border-current pointer-events-none"
      />
    </motion.button>
  );
}
