import { useState, useEffect, useRef } from 'react';

export function useIntersectionObserver(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once !== false) observer.unobserve(el);
        } else if (options.once === false) {
          setIsVisible(false);
        }
      },
      { threshold: options.threshold ?? 0.1, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.once]);

  return [ref, isVisible];
}

export default useIntersectionObserver;
