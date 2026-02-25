import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAutoScrollOptions {
  enabled: boolean;
  threshold?: number; // Distance from bottom to trigger auto-scroll
  smooth?: boolean;
  pauseOnUserScroll?: boolean;
}

export interface UseAutoScrollReturn {
  scrollRef: React.RefObject<HTMLDivElement>;
  isAtBottom: boolean;
  isPaused: boolean;
  scrollToBottom: () => void;
  pauseAutoScroll: () => void;
  resumeAutoScroll: () => void;
  toggleAutoScroll: () => void;
}

export function useAutoScroll(options: UseAutoScrollOptions): UseAutoScrollReturn {
  const {
    enabled = true,
    threshold = 100,
    smooth = true,
    pauseOnUserScroll = true
  } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  
  const lastScrollTop = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const isScrollingProgrammatically = useRef(false);

  const checkIsAtBottom = useCallback(() => {
    if (!scrollRef.current) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const atBottom = scrollHeight - scrollTop <= clientHeight + threshold;
    
    setIsAtBottom(atBottom);
    return atBottom;
  }, [threshold]);

  const scrollToBottom = useCallback((force = false) => {
    if (!scrollRef.current || (!enabled && !force) || (isPaused && !force)) {
      return;
    }

    isScrollingProgrammatically.current = true;
    
    if (smooth) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Reset flag after a short delay to account for smooth scrolling
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 300);
    
    setIsAtBottom(true);
    setUserScrolledUp(false);
  }, [enabled, isPaused, smooth]);

  const handleScroll = useCallback((event: Event) => {
    if (!scrollRef.current || isScrollingProgrammatically.current) {
      return;
    }

    const target = event.target as HTMLDivElement;
    const { scrollTop } = target;
    
    // Detect user scroll direction
    const isScrollingUp = scrollTop < lastScrollTop.current;
    const isScrollingDown = scrollTop > lastScrollTop.current;
    
    lastScrollTop.current = scrollTop;

    // Check if we're at the bottom
    const atBottom = checkIsAtBottom();
    
    // If user scrolled up and we're not at bottom, pause auto-scroll
    if (isScrollingUp && !atBottom && pauseOnUserScroll && enabled) {
      setUserScrolledUp(true);
      setIsPaused(true);
    }
    
    // If user scrolled back to bottom, resume auto-scroll
    if (atBottom && userScrolledUp) {
      setUserScrolledUp(false);
      setIsPaused(false);
    }

    // Clear any existing timeout and set a new one to detect end of scrolling
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      // Final check after scrolling stops
      checkIsAtBottom();
    }, 150);
  }, [checkIsAtBottom, pauseOnUserScroll, enabled, userScrolledUp]);

  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeAutoScroll = useCallback(() => {
    setIsPaused(false);
    setUserScrolledUp(false);
  }, []);

  const toggleAutoScroll = useCallback(() => {
    if (isPaused) {
      resumeAutoScroll();
      scrollToBottom(true);
    } else {
      pauseAutoScroll();
    }
  }, [isPaused, resumeAutoScroll, pauseAutoScroll, scrollToBottom]);

  // Set up scroll listener
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleScroll]);

  // Auto-scroll when enabled and not paused
  useEffect(() => {
    if (enabled && !isPaused && isAtBottom) {
      // Small delay to allow content to render
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [enabled, isPaused, isAtBottom, scrollToBottom]);

  return {
    scrollRef,
    isAtBottom,
    isPaused,
    scrollToBottom,
    pauseAutoScroll,
    resumeAutoScroll,
    toggleAutoScroll
  };
}