import { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import BookingsList from './components/BookingsList';
import BookingForm from './components/BookingForm';
import Reports from './components/Reports';
import AIInsights from './components/AIInsights';
import MasterData from './components/MasterData';
import UserManagement from './components/UserManagement';
import Venues from './components/Venues';

// Report sub-pages
import OverviewReport     from './components/reports/OverviewReport';
import CompetitiveReport  from './components/reports/CompetitiveReport';
import OwnShowsReport     from './components/reports/OwnShowsReport';
import DemandReport       from './components/reports/DemandReport';
import HallAllocationReport from './components/reports/HallAllocationReport';
import ConflictReport     from './components/reports/ConflictReport';
import RevenueReport      from './components/reports/RevenueReport';
import BillingReport      from './components/reports/BillingReport';
import UtilizationReport  from './components/reports/UtilizationReport';

import {
  initialBookings,
  masterData,
  users as initialUsers,
} from './data/staticData';

const DEFAULT_ROUTE = 'dashboard';

const routeConfig = {
  dashboard:    '/dashboard',
  calendar:     '/calendar',
  venues:       '/venues',
  bookings:     '/bookings',
  'new-booking':  '/bookings/new',
  'edit-booking': '/bookings/edit',
  reports:      '/reports',
  ai:           '/ai-insights',
  master:       '/master-data',
  users:        '/users',
};

function AdminShell({ page, onNav, onAddClick, currentUser, isSidebarOpen, theme, toggleTheme, children }) {
  return (
    <div className="app-shell" data-route={routeConfig[page] || routeConfig[DEFAULT_ROUTE]}>
      {isSidebarOpen && <Sidebar active={page} onNav={onNav} currentUser={currentUser} />}
      <div className="main-content" style={{ marginLeft: isSidebarOpen ? '240px' : '0', transition: 'margin-left 0.2s' }}>
        <Topbar page={page} onNav={onNav} onAddClick={onAddClick} theme={theme} toggleTheme={toggleTheme} />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const getFromLocalStorage = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    try { return saved ? JSON.parse(saved) : defaultValue; }
    catch (e) { console.error(`Error loading ${key} from localStorage:`, e); return defaultValue; }
  };

  const [bookings, setBookings]         = useState(() => getFromLocalStorage('bookings', initialBookings));
  const [venues, setVenues]             = useState(() => {
    const saved = getFromLocalStorage('venues', masterData.venues);
    // Force sync if cached data has the old hall counts
    if (saved && saved.length > 0 && saved[0].halls.length < 10) {
      return masterData.venues;
    }
    return saved;
  });
  const [users, setUsers]               = useState(() => getFromLocalStorage('users', initialUsers));
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  const [industries, setIndustries]     = useState(() => getFromLocalStorage('industries', masterData.industries));
  const [sectors, setSectors]           = useState(() => getFromLocalStorage('sectors', masterData.sectors));
  const [organizers, setOrganizers]     = useState(() => getFromLocalStorage('organizers', masterData.organizers));
  const [eventStatuses, setEventStatuses] = useState(() => getFromLocalStorage('eventStatuses', masterData.eventStatuses));
  const [eventTypes, setEventTypes]     = useState(() => getFromLocalStorage('eventTypes', masterData.eventTypes));
  const [primePeriods, setPrimePeriods] = useState(() => getFromLocalStorage('primePeriods', masterData.primePeriods));

  useEffect(() => localStorage.setItem('bookings', JSON.stringify(bookings)), [bookings]);
  useEffect(() => localStorage.setItem('venues', JSON.stringify(venues)), [venues]);
  useEffect(() => localStorage.setItem('users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('industries', JSON.stringify(industries)), [industries]);
  useEffect(() => localStorage.setItem('sectors', JSON.stringify(sectors)), [sectors]);
  useEffect(() => localStorage.setItem('organizers', JSON.stringify(organizers)), [organizers]);
  useEffect(() => localStorage.setItem('eventStatuses', JSON.stringify(eventStatuses)), [eventStatuses]);
  useEffect(() => localStorage.setItem('eventTypes', JSON.stringify(eventTypes)), [eventTypes]);
  useEffect(() => localStorage.setItem('primePeriods', JSON.stringify(primePeriods)), [primePeriods]);

  const navigate = useNavigate();
  const currentUser = users.find(u => u.role === 'Admin') || users[0];

  const navigateTo = (routeKeyOrPath) => {
    // Support both route keys ('reports') and direct paths ('/reports/competitive')
    if (routeKeyOrPath.startsWith('/')) {
      navigate(routeKeyOrPath);
    } else {
      navigate(routeConfig[routeKeyOrPath] || routeConfig[DEFAULT_ROUTE]);
    }
  };

  // ── Conflict detection ──
  const findConflicts = (targetBooking, currentBookings, excludeId = null) => {
    const activeStatuses = ['Draft', 'Tentative', 'Confirmed'];
    return currentBookings.filter(b => {
      if (b.id === excludeId) return false;
      if (!activeStatuses.includes(b.status)) return false;
      if (b.venueId !== targetBooking.venueId || b.hall !== targetBooking.hall) return false;
      const bStart = new Date(b.setupDate || b.eventStartDate).getTime();
      const bEnd   = new Date(b.dismantleDate || b.eventEndDate).getTime();
      const fStart = new Date(targetBooking.setupDate || targetBooking.eventStartDate).getTime();
      const fEnd   = new Date(targetBooking.dismantleDate || targetBooking.eventEndDate).getTime();
      return fStart <= bEnd && fEnd >= bStart;
    });
  };

  // ── Booking CRUD ──
  const addBooking = (newBooking) => {
    if (findConflicts(newBooking, bookings).length > 0) return;
    setBookings(prev => [newBooking, ...prev]);
    navigateTo('bookings');
  };
  const updateBooking = (updatedBooking) => {
    if (findConflicts(updatedBooking, bookings, updatedBooking.id).length > 0) return;
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b));
    setEditingBooking(null);
    navigateTo('bookings');
  };
  const updateBookingStatus = (id, status) => {
    if (status !== 'Cancelled' && status !== 'Completed') {
      const booking = bookings.find(b => b.id === id);
      if (booking && findConflicts(booking, bookings, id).length > 0) return;
    }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };
  const deleteBooking = (id) => setBookings(prev => prev.filter(b => b.id !== id));
  const startEditBooking = (booking) => { setEditingBooking(booking); navigateTo('edit-booking'); };

  // ── Venue CRUD ──
  const addVenue = (venue) => setVenues(prev => [...prev, venue]);
  const addHall  = (venueId, hallName) => setVenues(prev =>
    prev.map(v => v.id === venueId
      ? { ...v, halls: [...v.halls, { name: hallName, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop' }] }
      : v
    )
  );

  // ── User CRUD ──
  const addUser          = (user) => { setUsers(prev => [...prev, user]); setUserFormOpen(false); };
  const updateUser       = (u)    => { setUsers(prev => prev.map(x => x.id === u.id ? u : x)); setUserFormOpen(false); };
  const toggleUserStatus = (id)   => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  const removeUser       = (id)   => setUsers(prev => prev.filter(u => u.id !== id));

  // ── Master Data CRUD ──
  const masterCrudHandlers = {
    industries:   { add: i  => setIndustries(p => [...p,i]),    remove: i  => setIndustries(p => p.filter(x => x!==i)),       update: (o,n) => setIndustries(p => p.map(x => x===o?n:x)) },
    sectors:      { add: s  => setSectors(p => [...p,s]),        remove: s  => setSectors(p => p.filter(x => x!==s)),           update: (o,n) => setSectors(p => p.map(x => x===o?n:x)) },
    organizers:   { add: o  => setOrganizers(p => [...p,o]),     remove: o  => setOrganizers(p => p.filter(x => x!==o)),        update: (o,n) => setOrganizers(p => p.map(x => x===o?n:x)) },
    eventStatuses:{ add: s  => setEventStatuses(p => [...p,s]),  remove: s  => setEventStatuses(p => p.filter(x => x!==s)),     update: (o,n) => setEventStatuses(p => p.map(x => x===o?n:x)) },
    eventTypes:   { add: t  => setEventTypes(p => [...p,t]),     remove: t  => setEventTypes(p => p.filter(x => x!==t)),        update: (o,n) => setEventTypes(p => p.map(x => x===o?n:x)) },
    primePeriods: { add: pp => setPrimePeriods(p => [...p,pp]),  remove: pp => setPrimePeriods(p => p.filter(x => x.label!==pp.label)), update: (o,n) => setPrimePeriods(p => p.map(x => x.label===o.label?n:x)) },
  };  const location = useLocation();
  const currentPath = location.pathname;

  let activePage = DEFAULT_ROUTE;
  if (currentPath.startsWith('/reports')) {
    activePage = 'reports';
  } else {
    // 1. Try exact match first
    const exactKey = Object.keys(routeConfig).find(key => routeConfig[key] === currentPath);
    if (exactKey) {
      activePage = exactKey;
    } else {
      // 2. Try prefix match (longest prefix first to match /bookings/new over /bookings)
      const sortedKeys = Object.keys(routeConfig).sort((a, b) => routeConfig[b].length - routeConfig[a].length);
      const matchedKey = sortedKeys.find(key => {
        const routePath = routeConfig[key];
        return routePath !== '/' && currentPath.startsWith(routePath);
      });
      if (matchedKey) activePage = matchedKey;
    }
  }

  const handleAddClick = () => {
    if (activePage === 'users') {
      setUserFormOpen(true);
    }
  };

  return (
    <AdminShell page={activePage} onNav={navigateTo} onAddClick={handleAddClick} currentUser={currentUser} isSidebarOpen={isSidebarOpen} theme={theme} toggleTheme={toggleTheme}>
      <Routes>
        <Route path="/" element={<Navigate to={routeConfig[DEFAULT_ROUTE]} replace />} />

        {/* Core pages */}
        <Route path="/dashboard" element={<Dashboard bookings={bookings} venues={venues} onNav={navigateTo} onUpdateStatus={updateBookingStatus} currentUser={currentUser} />} />
        <Route path="/venues"    element={<Venues venues={venues} />} />
        <Route path="/calendar"  element={<CalendarView bookings={bookings} venues={venues} onEditBooking={startEditBooking} onUpdateStatus={updateBookingStatus} isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(prev => !prev)} theme={theme} />} />
        <Route path="/bookings"  element={<BookingsList bookings={bookings} venues={venues} industries={industries} onNav={navigateTo} onUpdateStatus={updateBookingStatus} onEditBooking={startEditBooking} onDeleteBooking={deleteBooking} />} />
        <Route path="/bookings/new"  element={<BookingForm bookings={bookings} venues={venues} organizers={organizers} industries={industries} sectors={sectors} eventTypes={eventTypes} eventStatuses={eventStatuses} onSave={addBooking} />} />
        <Route path="/bookings/edit" element={<BookingForm bookings={bookings} venues={venues} organizers={organizers} industries={industries} sectors={sectors} eventTypes={eventTypes} eventStatuses={eventStatuses} onSave={updateBooking} editBooking={editingBooking} />} />
        <Route path="/ai-insights"   element={<AIInsights bookings={bookings} />} />
        <Route path="/master-data"   element={<MasterData venues={venues} organizers={organizers} industries={industries} sectors={sectors} eventStatuses={eventStatuses} eventTypes={eventTypes} primePeriods={primePeriods} onAddVenue={addVenue} onAddHall={addHall} masterCrudHandlers={masterCrudHandlers} currentUser={currentUser} />} />
        <Route path="/users" element={<UserManagement users={users} onAddUser={addUser} onUpdateUser={updateUser} onToggleUserStatus={toggleUserStatus} onRemoveUser={removeUser} isFormOpen={userFormOpen} onCloseForm={() => setUserFormOpen(false)} />} />

        {/* Reports root → redirect to overview */}
        <Route path="/reports" element={<Reports />} />

        {/* Individual report sub-pages */}
        <Route path="/reports/overview"     element={<OverviewReport     bookings={bookings} venues={venues} />} />
        <Route path="/reports/competitive"  element={<CompetitiveReport  bookings={bookings} venues={venues} />} />
        <Route path="/reports/own-shows"    element={<OwnShowsReport     bookings={bookings} venues={venues} />} />
        <Route path="/reports/demand"       element={<DemandReport       bookings={bookings} venues={venues} />} />
        <Route path="/reports/hall-alloc"   element={<HallAllocationReport bookings={bookings} venues={venues} />} />
        <Route path="/reports/conflict"     element={<ConflictReport     bookings={bookings} venues={venues} />} />
        <Route path="/reports/revenue"      element={<RevenueReport      bookings={bookings} venues={venues} />} />
        <Route path="/reports/billing"      element={<BillingReport      bookings={bookings} venues={venues} />} />
        <Route path="/reports/utilization"  element={<UtilizationReport  bookings={bookings} venues={venues} />} />

        <Route path="*" element={<Navigate to={routeConfig[DEFAULT_ROUTE]} replace />} />
      </Routes>
    </AdminShell>
  );
}
