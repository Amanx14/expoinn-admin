import { Bell, Plus, Search, Sun, Moon } from 'lucide-react';

const pageTitles = {
  dashboard:    'Booking Management Engine',
  calendar:     'Calendar Module',
  venues:        'Venue Catalog',
  bookings:     'All Bookings',
  'new-booking':'New Booking',
  'edit-booking':'Edit Booking',
  reports:      'Reports & Analytics',
  ai:           'AI / LLM Module',
  master:       'Master Data',
  users:        'User Management',
};

export default function Topbar({ page, onNav, onAddClick, theme, toggleTheme }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        <span className="topbar-title">{pageTitles[page]}</span>
        {page === 'users' ? (
          <button className="btn btn-primary btn-sm" onClick={onAddClick} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            <Plus size={14} style={{ marginRight: 4 }} /> Add User
          </button>
        ) : (page !== 'new-booking' && page !== 'edit-booking') && (
          <button className="btn btn-primary btn-sm" onClick={() => onNav('new-booking')} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            <Plus size={14} style={{ marginRight: 4 }} /> New Booking
          </button>
        )}
      </div>
      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="topbar-date">{dateStr}</div>
        <button
          onClick={toggleTheme}
          className="btn btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            borderRadius: '50%',
            width: 36,
            height: 36,
            minWidth: 36,
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--gold)',
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}

