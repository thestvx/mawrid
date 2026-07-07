import { useEffect, useState, useRef } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 2200;

    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));

      if (t >= 1) {
        setFading(true);
        setTimeout(() => onFinish?.(), 600);
        return;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [onFinish]);

  return (
    <div ref={containerRef} className={`loading-screen ${fading ? 'loading-screen--fade' : ''}`}>
      <div className="loading-screen__inner">
        <div className="loading-screen__ring">
          <svg viewBox="0 0 100 100" className="loading-screen__svg">
            <defs>
              <linearGradient id="loadingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6201" />
                <stop offset="100%" stopColor="#ff8c42" />
              </linearGradient>
            </defs>
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="rgba(255,98,1,0.1)"
              strokeWidth="3"
            />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#loadingGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
              className="loading-screen__circle"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="loading-screen__logo">
            <img src="/logos/Black-logo.png" alt="Mawrid" />
          </div>
        </div>

        <div className="loading-screen__text">
          <span className="loading-screen__brand">مَورد</span>
          <span className="loading-screen__dots">
            <span /><span /><span />
          </span>
        </div>

        <div className="loading-screen__progress">
          <div className="loading-screen__bar">
            <div className="loading-screen__fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="loading-screen__percent">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
