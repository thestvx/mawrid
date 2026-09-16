import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import './Countdown.css';

const STRIP = '01234567890123456789';

function pad(value) {
  return String(value).padStart(2, '0');
}

function useCountdown(hours = 24) {
  const targetRef = useRef(Date.now() + hours * 3600 * 1000);
  const [left, setLeft] = useState(targetRef.current - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setLeft(Math.max(0, targetRef.current - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return left;
}

function getParts(totalMs) {
  const total = Math.max(0, totalMs);
  return {
    days: Math.floor(total / 86400000),
    hours: Math.floor((total % 86400000) / 3600000),
    minutes: Math.floor((total % 3600000) / 60000),
    seconds: Math.floor((total % 60000) / 1000),
  };
}

function getLabels() {
  return {
    days: 'D',
    hours: 'H',
    minutes: 'M',
    seconds: 'S',
  };
}

function RollDigit({ value }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const pos = 10 + Number(value);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <span className="roll-digit">
      <span className="roll-digit__mask">
        <span
          className="roll-digit__strip"
          style={
            reduce || !ready
              ? { transform: `translateY(-${pos}em)` }
              : { transform: `translateY(-${pos}em)`, transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }
          }
        >
          {STRIP.split('').map((d, i) => (
            <span className="roll-digit__char" key={i}>
              {d}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

function CountdownCell({ value, label }) {
  const [d1, d2] = pad(value).split('');
  return (
    <span className="countdown__cell">
      <span className="countdown__digits">
        <RollDigit value={d1} />
        <RollDigit value={d2} />
      </span>
      <span className="countdown__label">{label}</span>
    </span>
  );
}

export default function Countdown({ hours = 24, dark = true, size = 'md', labels }) {
  const left = useCountdown(hours);
  const parts = getParts(left);
  const merged = { ...getLabels(), ...labels };

  return (
    <div
      className={`countdown countdown--${size} ${dark ? 'countdown--dark' : 'countdown--light'}`}
      role="timer"
      aria-live="polite"
      aria-label={`${parts.days} ${merged.days}, ${parts.hours} ${merged.hours}, ${parts.minutes} ${merged.minutes}, ${parts.seconds} ${merged.seconds}`}
    >
      <CountdownCell value={parts.days} label={merged.days} />
      <CountdownCell value={parts.hours} label={merged.hours} />
      <CountdownCell value={parts.minutes} label={merged.minutes} />
      <CountdownCell value={parts.seconds} label={merged.seconds} />
    </div>
  );
}