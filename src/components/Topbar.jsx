import { Bell, Plus, Search } from 'lucide-react';

const pageTitles = {
  dashboard:    'Booking Management Engine',
  calendar:     'Calendar Module',
  venues:        'Venue Catalog',
  bookings:     'All Bookings',
  'new-booking':'New Booking',
  reports:      'Reports & Analytics',
  ai:           'AI / LLM Module',
  master:       'Master Data',
  users:        'User Management',
};

export default function Topbar({ page, onNav }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        <span className="topbar-title">{pageTitles[page]}</span>
        {page !== 'new-booking' && (
          <button className="btn btn-primary btn-sm" onClick={() => onNav('new-booking')} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            <Plus size={14} style={{ marginRight: 4 }} /> New Booking
          </button>
        )}
      </div>
      <div className="topbar-right">
        <div className="topbar-date">{dateStr}</div>
      </div>
    </header>
  );
}
