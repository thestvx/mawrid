export default function VerifiedBadge({ size = 18, title, animate = true }) {
  return (
    <span
      className={`vbadge${animate ? '' : ' vbadge--static'}`}
      style={{ width: size, height: size }}
      title={title || 'Verified'}
      aria-label={title || 'Verified'}
      role="img"
    >
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <path
          fill="#ff6201"
          d="M12 1.4l2.45 1.93 3.09-.53 1.2 2.9 2.89 1.2-.53 3.09L23.03 12l-1.93 2.45.53 3.09-2.89 1.2-1.2 2.9-3.09-.53L12 22.6l-2.45-1.93-3.09.53-1.2-2.9-2.89-1.2.53-3.09L.97 12l1.93-2.45-.53-3.09 2.89-1.2 1.2-2.9 3.09.53z"
        />
        <path
          fill="#fff"
          d="M10.42 16.1l-3.5-3.5 1.58-1.58 1.92 1.92 4.66-4.66 1.58 1.58z"
        />
      </svg>
    </span>
  );
}
