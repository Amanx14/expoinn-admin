import { Bell, Search } from 'lucide-react';

const pageTitles = {
  dashboard:    'Booking Management Engine',
  calendar:     'Calendar Module',
  bookings:     'All Bookings',
  'new-booking':'New Booking',
  reports:      'Reports & Analytics',
  ai:           'AI / LLM Module',
  master:       'Master Data',
  users:        'User Management',
};

export default function Topbar({ page }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="topbar">
      <span className="topbar-title">{pageTitles[page]}</span>
      <div className="topbar-right">
        <div className="topbar-date">{dateStr}</div>
      </div>
    </header>
  );
}
