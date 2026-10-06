import { Link } from 'react-router-dom';

/**
 * Figma: Button / Primary|Secondary|Ghost / MD|SM
 * Renders a <Link> when `to` is provided, otherwise a <button>.
 */
export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  children,
  ...rest
}) {
  const cls = `mw-btn mw-btn--${variant} mw-btn--${size}${block ? ' mw-btn--block' : ''}${className ? ` ${className}` : ''}`;
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
