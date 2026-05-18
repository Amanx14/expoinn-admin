import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart3, BarChart2, CalendarDays, ChevronDown, ChevronRight,
  Database, LayoutDashboard, List, MapPin, PlusCircle, Sparkles, Users,
  TrendingUp, Calendar, Activity, Home, Zap, DollarSign, CreditCard,
} from 'lucide-react';

const REPORT_CHILDREN = [
  { path: '/reports/overview',    label: 'Overview',                 icon: BarChart2  },
  { path: '/reports/competitive', label: 'Competitive Analytics',    icon: TrendingUp },
  { path: '/reports/own-shows',   label: 'Own Shows (IEML)',         icon: Calendar   },
  { path: '/reports/demand',      label: 'Demand Analysis',          icon: Activity   },
  { path: '/reports/hall-alloc',  label: 'Hall Allocation',          icon: Home       },
  { path: '/reports/conflict',    label: 'Conflict Report',          icon: Zap        },
  { path: '/reports/revenue',     label: 'Revenue Reports',          icon: DollarSign },
  { path: '/reports/billing',     label: 'Billing Report',           icon: CreditCard },
  { path: '/reports/utilization', label: 'Utilization Report',       icon: Activity   },
];

const navItems = [
  { key: 'dashboard',   label: 'Booking Engine',       icon: LayoutDashboard, section: 'ENGINE',     path: '/dashboard' },
  { key: 'new-booking', label: 'New Booking',           icon: PlusCircle,      section: 'ENGINE',     path: '/bookings/new' },
  { key: 'bookings',    label: 'Bookings Registry',     icon: List,            section: 'CORE',       path: '/bookings' },
  { key: 'calendar',    label: 'Calendar Module',       icon: CalendarDays,    section: 'CORE',       path: '/calendar' },
  { key: 'venues',      label: 'Venues',                icon: MapPin,          section: 'CORE',       path: '/venues' },
  { key: 'master',      label: 'Master Data',           icon: Database,        section: 'CORE',       path: '/master-data' },
  { key: 'reports',     label: 'Reports & Analytics',   icon: BarChart3,       section: 'ANALYTICS',  path: '/reports', children: REPORT_CHILDREN },
  { key: 'ai',          label: 'AI Insights',           icon: Sparkles,        section: 'ANALYTICS',  path: '/ai-insights' },
  { key: 'users',       label: 'User Management',       icon: Users,           section: 'MANAGEMENT', path: '/users' },
];

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0,2).map(p => p[0]).join('').toUpperCase();
}

export default function Sidebar({ active, currentUser, onNav }) {
  const { pathname } = useLocation();
  const initials = currentUser?.initials || getInitials(currentUser?.name);

  // Auto-expand if we're on a reports sub-route
  const isOnReports = pathname.startsWith('/reports');
  const [reportsOpen, setReportsOpen] = useState(isOnReports);

  const sections = [...new Set(navItems.map(item => item.section))];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand-name">ExpoInn</div>
        <div className="brand-sub">Smart Booking Engine</div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {navItems.filter(item => item.section === section).map(item => {
              const Icon      = item.icon;
              const isActive  = active === item.key || (item.key === 'reports' && isOnReports);
              const hasChildren = !!item.children;

              return (
                <div key={item.key}>
                  {/* Parent nav item */}
                  <div
                    className={`nav-item ${isActive && !hasChildren ? 'active' : ''} ${hasChildren && isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (hasChildren) {
                        setReportsOpen(o => !o);
                        if (!isOnReports) onNav(item.key);
                      } else {
                        onNav(item.key);
                      }
                    }}
                  >
                    <Icon className="nav-icon" size={16} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {hasChildren
                      ? (reportsOpen
                          ? <ChevronDown size={13} style={{ opacity:0.5, transition:'transform 0.2s' }} />
                          : <ChevronRight size={13} style={{ opacity:0.5 }} />)
                      : (isActive && <ChevronRight size={12} style={{ opacity: 0.5 }} />)
                    }
                  </div>

                  {/* Child items */}
                  {hasChildren && reportsOpen && (
                    <div style={{ overflow:'hidden' }}>
                      {item.children.map(child => {
                        const CIcon       = child.icon;
                        const childActive = pathname === child.path;
                        return (
                          <div
                            key={child.path}
                            className={`nav-item nav-child ${childActive ? 'active' : ''}`}
                            onClick={() => onNav(child.path)}
                            style={{
                              paddingLeft: 36,
                              fontSize: '0.82rem',
                              opacity: childActive ? 1 : 0.75,
                            }}
                          >
                            <CIcon size={12} style={{ marginRight:6, flexShrink:0, color: childActive ? 'var(--gold)' : 'inherit' }} />
                            <span style={{ flex:1 }}>{child.label}</span>
                            {childActive && <ChevronRight size={10} style={{ opacity:0.5 }} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
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
