import { useState, useEffect, useRef } from 'react';

export function useMousePosition(options = {}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current || window;

    const handleMouseMove = (e) => {
      let x, y;
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      } else {
        x = (e.clientX / window.innerWidth - 0.5) * 2;
        y = (e.clientY / window.innerHeight - 0.5) * 2;
      }
      setPosition({ x, y });
    };

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => el.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return [ref, position];
}

export default useMousePosition;
