/**
 * Figma: Badge / New | Hot | Verified (+ soft/muted helpers)
 */
export default function Badge({ tone = 'new', className = '', children }) {
  return (
    <span className={`mw-badge mw-badge--${tone}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  );
}
