import { createContext, useContext, useRef, useCallback } from 'react';

const MouseContext = createContext({ x: 0, y: 0, normalX: 0, normalY: 0 });

export function MouseProvider({ children }) {
  const mouse = useRef({ x: 0, y: 0, normalX: 0, normalY: 0 });

  const handleMouseMove = useCallback((e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mouse.current = {
      x: e.clientX,
      y: e.clientY,
      normalX: (e.clientX / w - 0.5) * 2,
      normalY: (e.clientY / h - 0.5) * 2,
    };
  }, []);

  return (
    <MouseContext.Provider value={mouse}>
      <div onMouseMove={handleMouseMove} style={{ width: '100%', minHeight: '100vh' }}>
        {children}
      </div>
    </MouseContext.Provider>
  );
}

export function useMouse() {
  return useContext(MouseContext);
}
