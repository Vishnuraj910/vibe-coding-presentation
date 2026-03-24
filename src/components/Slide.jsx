import { motion } from 'framer-motion';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '80%' : '-80%',
    opacity: 0,
    scale: 0.92,
    filter: 'blur(8px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (direction) => ({
    x: direction < 0 ? '80%' : '-80%',
    opacity: 0,
    scale: 0.92,
    filter: 'blur(8px)',
  }),
};

const transition = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
  mass: 0.8,
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

export default function Slide({ slide, direction, visiblePointsCount = 0 }) {
  const contentPoints = slide.content.split('\n').filter(point => point.trim());

  return (
    <motion.div
      key={slide.id}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24"
    >
      {/* Decorative gradient orbs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
        className="absolute bottom-1/4 -right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl pointer-events-none"
      />

      {/* Title with fixed positioning 200px from top */}
      <motion.h2
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          delay: 0.1,
        }}
        className="fixed top-[200px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center tracking-tight z-50"
      >
        <span className="bg-gradient-to-r from-current to-current bg-clip-text">
          {slide.title}
        </span>
      </motion.h2>

      {/* Content with staggered reveal */}
      {visiblePointsCount > 0 && (
        <motion.ul
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl space-y-6 mt-32"
        >
          {contentPoints.slice(0, visiblePointsCount).map((point, index) => (
            <motion.li
              key={index}
              variants={itemVariants}
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
                delay: index * 0.1,
              }}
              className="flex items-center gap-4 text-lg sm:text-xl md:text-2xl leading-relaxed group cursor-default"
            >
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 20,
                  delay: 0.3 + index * 0.1,
                }}
                className="flex-shrink-0 w-3 h-3 rounded-full bg-current opacity-40 group-hover:opacity-70 transition-opacity duration-300"
              />
              <span className="opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                {point.replace(/^[•]\s*/, '')}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      )}

      {/* Subtle bottom decoration */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.3 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-current to-transparent"
      />
    </motion.div>
  );
}
