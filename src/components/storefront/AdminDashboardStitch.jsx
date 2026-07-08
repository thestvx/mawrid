import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import AnimatedContent from '../ui/AnimatedContent';
import './AdminDashboardStitch.css';

const VENDOR_QUEUE = [
  { initials: 'AZ', name: 'Azure Tech Supplies', id: 'V-8892', type: 'Electronics', date: 'Today, 09:41 AM', status: 'review', color: '#8589ff' },
  { initials: 'OL', name: 'Oasis Logistics', id: 'V-8890', type: 'Services', date: 'Yesterday', status: 'docs', color: '#e1e3e4' },
  { initials: 'NM', name: 'Nova Manufacturing', id: 'V-8885', type: 'Industrial', date: 'Oct 24, 2023', status: 'flagged', color: '#2f2ebe' },
];

const ALERTS = [
  { type: 'error', title: 'High Chargeback Rate', desc: "Vendor 'TechNova' has exceeded the 2% chargeback threshold in the last 7 days.", action: 'Action Required' },
  { type: 'warning', title: 'API Rate Limit Approaching', desc: 'Payment gateway API calls at 85% capacity for current hour.', action: '12 mins ago' },
];

const NAV_ITEMS = [
  { key: 'overview', icon: 'dashboard', label: 'Overview', active: true },
  { key: 'vendors', icon: 'verified_user', label: 'Vendor Verification' },
  { key: 'moderation', icon: 'gavel', label: 'Listing Moderation' },
  { key: 'payouts', icon: 'payments', label: 'Payouts' },
  { key: 'reports', icon: 'assessment', label: 'Reports' },
  { key: 'settings', icon: 'settings', label: 'Settings' },
];

function AnimatedCounter({ end, duration = 2500, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState('0');
  const frameRef = useRef(null);

  useEffect(() => {
    let startTime = null;
    const step = (now) => {
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;
      const formatted = Number.isInteger(end) ? Math.floor(current).toLocaleString() : current.toFixed(2);
      setDisplay(prefix + formatted + suffix);
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration, prefix, suffix]);

  return <>{display}</>;
}

function StatusBadge({ status }) {
  const config = {
    review: { bg: 'rgba(255, 98, 1, 0.1)', color: 'var(--color-primary)', border: 'rgba(255, 98, 1, 0.2)', dot: 'var(--color-primary)', label: 'Review' },
    docs: { bg: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', border: 'var(--color-outline-variant)', dot: 'var(--color-on-surface-variant)', label: 'Docs Pending' },
    flagged: { bg: 'rgba(186, 26, 26, 0.1)', color: 'var(--color-error)', border: 'rgba(186, 26, 26, 0.2)', dot: 'var(--color-error)', label: 'Flagged' },
  };
  const c = config[status] || config.review;
  return (
    <span className="admin-stitch-badge" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      <span className="admin-stitch-badge-dot" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

export default function AdminDashboardStitch() {
  const { t, dir } = useLanguage();
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      document.querySelectorAll('.admin-glass-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="admin-stitch">
      {/* Sidebar */}
      <aside className={`admin-stitch-sidebar ${sidebarOpen ? 'admin-stitch-sidebar--open' : ''}`}>
        <div className="admin-stitch-sidebar-header">
          <img src="/images/stitch/admin-logo.png" alt="Mawrid" className="admin-stitch-sidebar-logo" />
          <div>
            <h1 className="admin-stitch-sidebar-title">Mawrid</h1>
            <p className="admin-stitch-sidebar-sub">Admin Portal</p>
          </div>
        </div>
        <nav className="admin-stitch-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`admin-stitch-nav-item ${activeNav === item.key ? 'admin-stitch-nav-item--active' : ''}`}
              onClick={() => setActiveNav(item.key)}
            >
              <span className="material-symbols-outlined" style={activeNav === item.key ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-stitch-sidebar-footer">
          <button className="admin-stitch-nav-item">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-stitch-main">
        {/* Top Bar */}
        <header className="admin-stitch-topbar">
          <div className="admin-stitch-search">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search vendors, listings, or IDs..." />
          </div>
          <div className="admin-stitch-topbar-actions">
            <button className="admin-stitch-notif-btn">
              <span className="material-symbols-outlined">notifications</span>
              <span className="admin-stitch-notif-dot" />
            </button>
            <div className="admin-stitch-divider" />
            <div className="admin-stitch-profile">
              <div className="admin-stitch-profile-info">
                <p className="admin-stitch-profile-name">Admin Super</p>
                <p className="admin-stitch-profile-role">Operations Lead</p>
              </div>
              <img src="/images/stitch/admin-avatar.jpg" alt="Admin" className="admin-stitch-avatar" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="admin-stitch-content">
          {/* Header */}
          <AnimatedContent distance={30}>
            <div className="admin-stitch-content-header">
              <div>
                <h2 className="admin-stitch-content-title">Platform Overview</h2>
                <p className="admin-stitch-content-sub">Real-time marketplace health and operational queue.</p>
              </div>
              <button className="admin-stitch-export-btn">
                <span className="material-symbols-outlined">download</span>
                Export Report
              </button>
            </div>
          </AnimatedContent>

          {/* Stats Grid */}
          <div className="admin-stitch-stats">
            <AnimatedContent distance={40} delay={0.1}>
              <div className="admin-glass-card admin-stitch-stat">
                <div className="admin-stitch-stat-glow" style={{ background: 'rgba(255, 98, 1, 0.15)' }} />
                <div className="admin-stitch-stat-header">
                  <div>
                    <p className="admin-stitch-stat-label">Total GMV (30d)</p>
                    <h3 className="admin-stitch-stat-value"><AnimatedCounter end={1.24} prefix="$" suffix="M" /></h3>
                  </div>
                  <div className="admin-stitch-stat-icon" style={{ background: 'rgba(255, 98, 1, 0.1)', color: 'var(--color-primary)' }}>
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                </div>
                <div className="admin-stitch-stat-trend admin-stitch-stat-trend--up">
                  <span className="material-symbols-outlined">arrow_upward</span> 12.5%
                  <span className="admin-stitch-stat-trend-label">vs last month</span>
                </div>
              </div>
            </AnimatedContent>

            <AnimatedContent distance={40} delay={0.2}>
              <div className="admin-glass-card admin-stitch-stat">
                <div className="admin-stitch-stat-glow" style={{ background: 'rgba(73, 75, 214, 0.15)' }} />
                <div className="admin-stitch-stat-header">
                  <div>
                    <p className="admin-stitch-stat-label">Active Vendors</p>
                    <h3 className="admin-stitch-stat-value"><AnimatedCounter end={842} /></h3>
                  </div>
                  <div className="admin-stitch-stat-icon" style={{ background: 'rgba(73, 75, 214, 0.1)', color: '#494bd6' }}>
                    <span className="material-symbols-outlined">storefront</span>
                  </div>
                </div>
                <div className="admin-stitch-stat-trend admin-stitch-stat-trend--up">
                  <span className="material-symbols-outlined">arrow_upward</span> 4.2%
                  <span className="admin-stitch-stat-trend-label">vs last month</span>
                </div>
              </div>
            </AnimatedContent>

            <AnimatedContent distance={40} delay={0.3}>
              <div className="admin-glass-card admin-stitch-stat">
                <div className="admin-stitch-stat-glow" style={{ background: 'rgba(186, 26, 26, 0.15)' }} />
                <div className="admin-stitch-stat-header">
                  <div>
                    <p className="admin-stitch-stat-label">Pending Approvals</p>
                    <h3 className="admin-stitch-stat-value"><AnimatedCounter end={28} /></h3>
                  </div>
                  <div className="admin-stitch-stat-icon" style={{ background: 'rgba(186, 26, 26, 0.1)', color: 'var(--color-error)' }}>
                    <span className="material-symbols-outlined">pending_actions</span>
                  </div>
                </div>
                <div className="admin-stitch-stat-trend admin-stitch-stat-trend--error">
                  Requires attention
                </div>
              </div>
            </AnimatedContent>
          </div>

          {/* Vendor Queue + Alerts */}
          <div className="admin-stitch-grid">
            <AnimatedContent distance={40} delay={0.3}>
              <div className="admin-glass-card admin-stitch-queue">
                <div className="admin-stitch-queue-header">
                  <h3 className="admin-stitch-section-title">Vendor Verification Queue</h3>
                  <a href="#" className="admin-stitch-view-all">View All</a>
                </div>
                <div className="admin-stitch-table-wrap">
                  <table className="admin-stitch-table">
                    <thead>
                      <tr>
                        <th>APPLICANT</th>
                        <th>BUSINESS TYPE</th>
                        <th>DATE APPLIED</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {VENDOR_QUEUE.map((v, i) => (
                        <tr key={i}>
                          <td>
                            <div className="admin-stitch-table-user">
                              <div className="admin-stitch-table-avatar" style={{ background: `${v.color}30`, color: v.color }}>{v.initials}</div>
                              <div>
                                <p className="admin-stitch-table-name">{v.name}</p>
                                <p className="admin-stitch-table-id">ID: {v.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="admin-stitch-table-secondary">{v.type}</td>
                          <td className="admin-stitch-table-secondary">{v.date}</td>
                          <td><StatusBadge status={v.status} /></td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="admin-stitch-arrow-btn">
                              <span className="material-symbols-outlined">arrow_forward_ios</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedContent>

            <AnimatedContent distance={40} delay={0.4}>
              <div className="admin-stitch-alerts-col">
                <div className="admin-glass-card admin-stitch-alerts">
                  <div className="admin-stitch-alerts-header">
                    <span className="material-symbols-outlined admin-stitch-alerts-icon">warning</span>
                    <h3 className="admin-stitch-section-title">Critical Alerts</h3>
                  </div>
                  <div className="admin-stitch-alerts-list">
                    {ALERTS.map((a, i) => (
                      <div key={i} className={`admin-stitch-alert admin-stitch-alert--${a.type}`}>
                        <span className={`admin-stitch-alert-dot admin-stitch-alert-dot--${a.type}`} />
                        <div>
                          <h4 className="admin-stitch-alert-title">{a.title}</h4>
                          <p className="admin-stitch-alert-desc">{a.desc}</p>
                          <span className={`admin-stitch-alert-action admin-stitch-alert-action--${a.type}`}>{a.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="admin-stitch-alerts-btn">View All Alerts</button>
                </div>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </main>
    </div>
  );
}
