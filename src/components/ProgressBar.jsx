import { motion } from 'framer-motion';

export default function ProgressBar({ currentSlide, totalSlides }) {
  const progress = ((currentSlide + 1) / totalSlides) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3"
    >
      {/* Slide Counter with glass effect */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 20 }}
        className="glass rounded-full px-6 py-3 text-sm sm:text-base font-medium tracking-wider"
      >
        <motion.span
          key={currentSlide}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="inline-block tabular-nums"
        >
          {String(currentSlide + 1).padStart(2, '0')}
        </motion.span>
        <span className="mx-2 opacity-50">/</span>
        <span className="tabular-nums opacity-70">
          {String(totalSlides).padStart(2, '0')}
        </span>
      </motion.div>

      {/* Progress Bar with pulse animation */}
      <div className="relative w-32 sm:w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
        {/* Background glow effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-white/5 rounded-full"
        />

        {/* Progress fill */}
        <motion.div
          className="h-full bg-gradient-to-r from-white/60 to-white/90 rounded-full relative"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 25,
          }}
        >
          {/* Shine effect on progress bar */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
          />
        </motion.div>
      </div>

      {/* Dots indicator */}
      <div className="flex gap-1.5 mt-1">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              backgroundColor: index <= currentSlide ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
              delay: 0.5 + index * 0.05,
            }}
            className="w-1.5 h-1.5 rounded-full cursor-pointer hover:scale-125 transition-transform"
          />
        ))}
      </div>
    </motion.div>
  );
}
