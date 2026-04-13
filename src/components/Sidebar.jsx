import {
  LayoutDashboard, CalendarDays, BookOpen, PlusSquare,
  BarChart3, Database, Users, Sparkles, ChevronRight
} from 'lucide-react';

const navItems = [
  { key: 'dashboard',  label: 'Booking Engine',   icon: LayoutDashboard, section: 'ENGINE' },
  { key: 'calendar',   label: 'Calendar Module',   icon: CalendarDays,    section: 'CORE' },
  { key: 'master',     label: 'Master Data',      icon: Database,        section: 'CORE' },
  { key: 'reports',    label: 'Reports & Analytics', icon: BarChart3,    section: 'ANALYTICS' },
  { key: 'ai',         label: 'AI / LLM Module',  icon: Sparkles,        section: 'AI LAYER' },
  { key: 'users',      label: 'User Management',  icon: Users,           section: 'MANAGEMENT' },
];

export default function Sidebar({ active, onNav }) {
  const sections = [...new Set(navItems.map(n => n.section))];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand-name">ExpoInn</div>
        <div className="brand-sub">Smart Booking Engine</div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(sec => (
          <div key={sec}>
            <div className="nav-section-label">{sec}</div>
            {navItems.filter(n => n.section === sec).map(item => {
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
          <div className="user-avatar">AS</div>
          <div>
            <div className="user-name">Avinash Sharma</div>
            <div className="user-role">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
