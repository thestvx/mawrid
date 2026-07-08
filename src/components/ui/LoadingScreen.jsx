import { useEffect, useRef, useState } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('enter');
  const doneRef = useRef(false);

  useEffect(() => {
    const start = performance.now();
    const duration = 2000;
    let frame;

    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const pct = Math.round(t * 100);
      setProgress(pct);

      if (t >= 1 && !doneRef.current) {
        doneRef.current = true;
        setStage('exit');
        setTimeout(() => onFinish?.(), 500);
        return;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [onFinish]);

  return (
    <div className={`loading-screen loading-screen--${stage}`}>
      <div className="loading-screen__ring-wrap">
        <div className="loading-screen__ring">
          <svg viewBox="0 0 100 100" className="loading-screen__svg">
            <defs>
              <linearGradient id="loadingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6201" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,98,1,0.1)" strokeWidth="3" />
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
  );
}
