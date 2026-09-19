export default function VerifiedBadge({ size = 18, title }) {
  return (
    <span
      className="vbadge"
      style={{ width: size, height: size }}
      title={title || 'Verified'}
      aria-label={title || 'Verified'}
      role="img"
    >
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <path
          fill="#ff6201"
          d="M12 1.5l2.42 1.9 3.05-.52 1.18 2.86 2.85 1.18-.52 3.05L22.5 12l-1.9 2.42.52 3.05-2.85 1.18-1.18 2.86-3.05-.52L12 22.5l-2.42-1.9-3.05.52-1.18-2.86-2.85-1.18.52-3.05L1.5 12l1.9-2.42-.52-3.05 2.85-1.18 1.18-2.86 3.05.52z"
        />
        <path
          fill="#fff"
          d="M10.63 15.4l-3.02-3.02 1.27-1.27 1.75 1.75 4.49-4.49 1.27 1.27z"
        />
      </svg>
    </span>
  );
}
