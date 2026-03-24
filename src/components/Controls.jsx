import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';

export default function Controls({
  onPrevious,
  onNext,
  onFullscreen,
  isFullscreen,
  canGoPrevious,
  canGoNext,
}) {
  return (
    <>
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 glass rounded-full p-3 sm:p-4 disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95 hover:scale-110 transition-all duration-200"
        aria-label="Previous slide"
      >
        <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-colors duration-300 pointer-events-none" />
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 relative group-hover:-translate-x-1 transition-transform duration-200" />
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 glass rounded-full p-3 sm:p-4 disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95 hover:scale-110 transition-all duration-200"
        aria-label="Next slide"
      >
        <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-colors duration-300 pointer-events-none" />
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 relative group-hover:translate-x-1 transition-transform duration-200" />
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={onFullscreen}
        className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50 glass rounded-full p-3 sm:p-4 group active:scale-95 hover:scale-110 transition-all duration-200"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-colors duration-300 pointer-events-none" />
        <span
          className={`relative block transition-transform duration-300 ${isFullscreen ? 'rotate-180' : ''}`}
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </span>
      </button>
    </>
  );
}
