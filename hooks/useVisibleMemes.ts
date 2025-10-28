'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export function useVisibleMemes(
  enabled: boolean,
  maxTracked: number = 12
) {
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibleElementsRef = useRef<Map<Element, string>>(new Map());
  const observedElementsRef = useRef<Set<Element>>(new Set());


  useEffect(() => {
    if (!enabled) {

      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      visibleElementsRef.current.clear();
      observedElementsRef.current.clear();
      setVisibleIds([]);
      return;
    }


    observerRef.current = new IntersectionObserver(
      (entries) => {
        let hasChanges = false;

        entries.forEach((entry) => {
          const memeId = entry.target.getAttribute('data-meme-id');
          if (!memeId) return;

          if (entry.isIntersecting) {
            if (!visibleElementsRef.current.has(entry.target)) {
              visibleElementsRef.current.set(entry.target, memeId);
              hasChanges = true;
            }
          } else {

            if (visibleElementsRef.current.has(entry.target)) {
              visibleElementsRef.current.delete(entry.target);
              hasChanges = true;
            }
          }
        });


        if (hasChanges) {
          const currentVisible = Array.from(visibleElementsRef.current.values());
          

          const limitedVisible = currentVisible.slice(0, maxTracked);
          
          setVisibleIds(limitedVisible);
        }
      },
      {
        threshold: 0.1, 
        rootMargin: '100px', 
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      visibleElementsRef.current.clear();
      observedElementsRef.current.clear(); 
      setVisibleIds([]);
    };
  }, [enabled, maxTracked]);


  const observe = useCallback((element: Element, memeId: string) => {
    if (!observerRef.current) return;


    if (observedElementsRef.current.has(element)) return;

    element.setAttribute('data-meme-id', memeId);
    observerRef.current.observe(element);
    observedElementsRef.current.add(element); 
  }, []); 

  return {
    visibleIds,
    observe,
  };
}