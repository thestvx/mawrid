import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function AnimatedContent({
  children,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  className = '',
  style = {},
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: `-${(1 - threshold) * 100}px` });

  const dirMult = reverse ? -1 : 1;
  const initial = {
    opacity: initialOpacity,
    scale: scale < 1 ? scale : 1,
  };
  if (direction === 'vertical') {
    initial.y = dirMult * distance;
  } else {
    initial.x = dirMult * distance;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={initial}
      animate={isInView ? { opacity: animateOpacity ? 1 : initialOpacity, y: 0, x: 0, scale: 1 } : initial}
      transition={{
        duration,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
