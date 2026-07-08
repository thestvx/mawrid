import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedContent({
  children,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const fromVars = {
      opacity: initialOpacity,
      scale: scale < 1 ? scale : 1,
    };

    if (direction === 'vertical') {
      fromVars.y = reverse ? -distance : distance;
    } else {
      fromVars.x = reverse ? -distance : distance;
    }

    const toVars = {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration,
      ease,
      delay,
    };

    if (!animateOpacity) {
      delete toVars.opacity;
    }

    const tween = gsap.fromTo(el, fromVars, {
      ...toVars,
      scrollTrigger: {
        trigger: el,
        start: `top ${100 - threshold * 100}%`,
        toggleActions: 'play none none none',
      },
    });

    return () => {
      tween.kill();
    };
  }, [distance, direction, reverse, duration, ease, initialOpacity, animateOpacity, scale, threshold, delay]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
    </div>
  );
}
