import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Database,
  LayoutDashboard,
  List,
  MapPin,
  PlusCircle,
  Sparkles,
  Users,
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Booking Engine', icon: LayoutDashboard, section: 'ENGINE' },
  { key: 'new-booking', label: 'New Booking', icon: PlusCircle, section: 'ENGINE' },
  { key: 'bookings', label: 'Bookings Registry', icon: List, section: 'CORE' },
  { key: 'calendar', label: 'Calendar Module', icon: CalendarDays, section: 'CORE' },
  { key: 'venues', label: 'Venues', icon: MapPin, section: 'CORE' },
  { key: 'master', label: 'Master Data', icon: Database, section: 'CORE' },
  { key: 'reports', label: 'Reports & Analytics', icon: BarChart3, section: 'ANALYTICS' },
  { key: 'ai', label: 'AI Insights', icon: Sparkles, section: 'ANALYTICS' },
  { key: 'users', label: 'User Management', icon: Users, section: 'MANAGEMENT' },
];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function Sidebar({ active, currentUser, onNav }) {
  const sections = [...new Set(navItems.map((item) => item.section))];
  const initials = currentUser?.initials || getInitials(currentUser?.name);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand-name">ExpoInn</div>
        <div className="brand-sub">Smart Booking Engine</div>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {navItems
              .filter((item) => item.section === section)
              .map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    className={`nav-item ${active === item.key ? 'active' : ''}`}
                    onClick={() => onNav(item.key)}
                  >
                    <Icon className="nav-icon" size={16} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {active === item.key && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
                  </div>
                );
              })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{currentUser?.name || 'Admin User'}</div>
            <div className="user-role">{currentUser?.role || 'Admin'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
