import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Slide from './components/Slide';
import Controls from './components/Controls';
import ProgressBar from './components/ProgressBar';
import ThemeToggle from './components/ThemeToggle';
import useKeyboard from './hooks/useKeyboard';

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [visiblePointsCount, setVisiblePointsCount] = useState(0);
  const [slidePointsState, setSlidePointsState] = useState({}); // Track points visibility per slide

  // Load slides from public folder
  useEffect(() => {
    const loadSlides = async () => {
      try {
        const response = await fetch('/data/slides.json');
        const data = await response.json();
        // Transform the data to match our component structure
        const transformedSlides = data.slides.map((slide) => ({
          id: slide.slide_number,
          title: slide.heading,
          content: slide.points.join('\n• '),
        }));
        setSlides(transformedSlides);
      } catch (error) {
        console.error('Error loading slides:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSlides();
  }, []);

  // Apply theme to body
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const goToPrevious = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide, slides.length]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useKeyboard({
    onNext: goToNext,
    onPrevious: goToPrevious,
    onFullscreen: toggleFullscreen,
  });

  const canGoPrevious = currentSlide > 0;
  const canGoNext = currentSlide < slides.length - 1;

  // Handle slide change to preserve point state
  useEffect(() => {
    // Load saved point state for current slide
    const savedCount = slidePointsState[currentSlide] || 0;
    setVisiblePointsCount(savedCount);
  }, [currentSlide, slidePointsState]);

  const handleSlideClick = useCallback((event) => {
    // Only toggle points if clicking on the slide content area (not on controls)
    const target = event.target;
    const isControlElement = target.closest('button') || 
                            target.closest('.glass') || 
                            target.closest('.progress-bar') ||
                            target.closest('.theme-toggle');
    
    if (!isControlElement) {
      setVisiblePointsCount(prev => {
        const currentSlidePoints = slides[currentSlide]?.content?.split('\n').filter(point => point.trim()) || [];
        const maxPoints = currentSlidePoints.length;
        const newCount = prev < maxPoints ? prev + 1 : prev;
        
        // Save state for current slide
        setSlidePointsState(prevState => ({
          ...prevState,
          [currentSlide]: newCount
        }));
        
        return newCount;
      });
    }
  }, [currentSlide, slides]);

  // Loading state
  if (isLoading || slides.length === 0) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        <div className="text-center">
          {/* Animated loading spinner */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-white/80 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-t-white/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-lg opacity-70 font-medium tracking-wide">Loading presentation...</p>
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/40 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden" onClick={handleSlideClick}>
      {/* Theme Toggle */}
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

      {/* Slides Container */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <Slide
          key={slides[currentSlide].id}
          slide={slides[currentSlide]}
          direction={direction}
          visiblePointsCount={visiblePointsCount}
        />
      </AnimatePresence>

      {/* Controls */}
      <Controls
        onPrevious={goToPrevious}
        onNext={goToNext}
        onFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />

      {/* Progress Bar */}
      <ProgressBar currentSlide={currentSlide} totalSlides={slides.length} />

      {/* Keyboard Hints (desktop only) */}
      <div className="fixed bottom-8 right-8 z-40 hidden lg:flex gap-2 text-xs opacity-50">
        <span className="glass rounded px-2 py-1">← → Navigate</span>
        <span className="glass rounded px-2 py-1">F Fullscreen</span>
      </div>
    </div>
  );
}