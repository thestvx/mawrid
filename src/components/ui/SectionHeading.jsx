/**
 * Figma: SectionHeading (eyebrow + title + subtitle)
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}) {
  return (
    <div
      className={`mw-section-head${align === 'start' ? ' mw-section-head--start' : ''}${className ? ` ${className}` : ''}`}
    >
      {eyebrow && <span className="mw-section-head__eyebrow">{eyebrow}</span>}
      {title && <h2 className="mw-section-head__title">{title}</h2>}
      {subtitle && <p className="mw-section-head__subtitle">{subtitle}</p>}
    </div>
  );
}
