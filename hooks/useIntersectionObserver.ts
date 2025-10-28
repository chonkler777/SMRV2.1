'use client'


import { useState, useEffect, useRef } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
}

export function useIntersectionObserver({ 
  threshold = 0.1, 
  rootMargin = '100px' 
}: UseIntersectionObserverProps = {}) {
  const [visibleElements, setVisibleElements] = useState<Set<Element>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisibleElements(prev => {
          const newSet = new Set(prev);
          let changed = false;
          
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (!newSet.has(entry.target)) {
                newSet.add(entry.target);
                changed = true;
              }
            } else {
              if (newSet.has(entry.target)) {
                newSet.delete(entry.target);
                changed = true;
              }
            }
          });
          
          return changed ? newSet : prev;
        });
      },
      { threshold, rootMargin }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin]);

  const observe = (element: Element) => {
    observerRef.current?.observe(element);
  };

  const unobserve = (element: Element) => {
    observerRef.current?.unobserve(element);
  };

  return { visibleElements, observe, unobserve };
}