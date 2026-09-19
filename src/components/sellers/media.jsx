import { useMemo } from 'react';
import { motion } from 'framer-motion';

export function AudioWaves() {
  const bars = useMemo(() => Array.from({ length: 28 }, (_, i) => 0.25 + Math.abs(Math.sin(i * 1.7)) * 0.75), []);
  return (
    <span className="wm-waves" aria-hidden="true">
      {bars.map((h, i) => (
        <i key={i} style={{ height: `${Math.round(h * 100)}%`, animationDelay: `${(i % 6) * 90}ms` }} />
      ))}
    </span>
  );
}

export function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function MediaStage({ work, isRtl }) {
  if (!work) return null;
  return (
    <motion.div
      key={work.id}
      className="wm-stage"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {work.type === 'image' && (
        <div className="wm-stage__img">
          <img src={work.src} alt={isRtl ? work.title_ar : work.title_en} />
        </div>
      )}
      {work.type === 'video' && (
        <div className="wm-stage__media">
          <video key={work.id} src={work.src} poster={work.poster} controls autoPlay preload="metadata" />
        </div>
      )}
      {work.type === 'audio' && (
        <div className="wm-stage__audio">
          <div className="wm-stage__audio-visual">
            <AudioWaves />
            <strong>{work.duration}</strong>
          </div>
          <audio key={work.id} src={work.src} controls autoPlay preload="metadata" />
        </div>
      )}
      <p className="wm-stage__caption">{isRtl ? work.title_ar : work.title_en}</p>
    </motion.div>
  );
}
