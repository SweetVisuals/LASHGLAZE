import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Disable standard browser scroll restoration to prevent browser memory overriding our manual resetting
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Perform direct scroll resets across all scroll contexts (window, html element, body element)
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      
      // Fallback direct properties
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Run immediately
    resetScroll();

    // 3. Retry on next tick/event-loop step (helps with fast render-tree shifts in React)
    const timer = setTimeout(() => {
      resetScroll();
    }, 0);

    // 4. Retry on next animation frame to catch layout shifts and late dynamic image/CSS reflows
    const rafId = requestAnimationFrame(() => {
      resetScroll();
    });

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return null;
}

