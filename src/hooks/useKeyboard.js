import { useEffect } from 'react';

export default function useKeyboard({ onNext, onPrevious, onFullscreen }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if user is typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          onPrevious();
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          onFullscreen();
          break;
        case 'Escape':
          // Exit fullscreen on Escape
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrevious, onFullscreen]);
}