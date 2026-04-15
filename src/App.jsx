import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
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
import {
  initialBookings,
  masterData,
  users as initialUsers,
} from './data/staticData';

const DEFAULT_ROUTE = 'dashboard';

const routeConfig = {
  dashboard: '/dashboard',
  calendar: '/calendar',
  venues: '/venues',
  bookings: '/bookings',
  'new-booking': '/bookings/new',
  'edit-booking': '/bookings/edit',
  reports: '/reports',
  ai: '/ai-insights',
  master: '/master-data',
  users: '/users',
};

function AdminShell({ page, onNav, onAddClick, currentUser, children }) {
  return (
    <div className="app-shell" data-route={routeConfig[page] || routeConfig[DEFAULT_ROUTE]}>
      <Sidebar active={page} onNav={onNav} currentUser={currentUser} />
      <div className="main-content">
        <Topbar page={page} onNav={onNav} onAddClick={onAddClick} />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [bookings, setBookings] = useState(initialBookings);
  const [venues, setVenues] = useState(masterData.venues);
  const [users, setUsers] = useState(initialUsers);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  // Master data state (lifted for CRUD)
  const [industries, setIndustries] = useState(masterData.industries);
  const [sectors, setSectors] = useState(masterData.sectors);
  const [organizers, setOrganizers] = useState(masterData.organizers);
  const [eventStatuses, setEventStatuses] = useState(masterData.eventStatuses);
  const [eventTypes, setEventTypes] = useState(masterData.eventTypes);
  const [primePeriods, setPrimePeriods] = useState(masterData.primePeriods);

  const navigate = useNavigate();

  const currentUser = users.find((user) => user.role === 'Admin') || users[0];

  const navigateTo = (routeKey) => {
    navigate(routeConfig[routeKey] || routeConfig[DEFAULT_ROUTE]);
  };

  // ── Conflict detection utility ──────────────
  const findConflicts = (targetBooking, currentBookings, excludeId = null) => {
    const activeStatuses = ['Draft', 'Tentative', 'Confirmed'];
    return currentBookings.filter(b => {
      if (b.id === excludeId) return false;
      if (!activeStatuses.includes(b.status)) return false;
      if (b.venueId !== targetBooking.venueId || b.hall !== targetBooking.hall) return false;

      const bStart = new Date(b.setupDate || b.eventStartDate).getTime();
      const bEnd = new Date(b.dismantleDate || b.eventEndDate).getTime();
      const fStart = new Date(targetBooking.setupDate || targetBooking.eventStartDate).getTime();
      const fEnd = new Date(targetBooking.dismantleDate || targetBooking.eventEndDate).getTime();

      return (fStart <= bEnd && fEnd >= bStart);
    });
  };

  // ── Booking CRUD ──────────────────────────────
  const addBooking = (newBooking) => {
    // Server-side guard: prevent duplicate even if form validation was bypassed
    const conflicts = findConflicts(newBooking, bookings);
    if (conflicts.length > 0) {
      return; // Form-level validation already shows the error
    }
    setBookings((currentBookings) => [newBooking, ...currentBookings]);
    navigateTo('bookings');
  };

  const updateBooking = (updatedBooking) => {
    const conflicts = findConflicts(updatedBooking, bookings, updatedBooking.id);
    if (conflicts.length > 0) {
      return; // Form-level validation already shows the error
    }
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === updatedBooking.id ? { ...booking, ...updatedBooking } : booking,
      ),
    );
    setEditingBooking(null);
    navigateTo('bookings');
  };

  const updateBookingStatus = (id, status) => {
    // Allow terminal statuses (Cancelled/Completed) without conflict check
    if (status !== 'Cancelled' && status !== 'Completed') {
      const booking = bookings.find(b => b.id === id);
      if (booking) {
        const conflicts = findConflicts(booking, bookings, id);
        if (conflicts.length > 0) {
          return; // BookingsList handles showing the conflict modal
        }
      }
    }
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === id ? { ...booking, status } : booking,
      ),
    );
  };

  const deleteBooking = (id) => {
    setBookings((currentBookings) =>
      currentBookings.filter((booking) => booking.id !== id),
    );
  };

  const startEditBooking = (booking) => {
    setEditingBooking(booking);
    navigateTo('edit-booking');
  };

  // ── Venue CRUD ────────────────────────────────
  const addVenue = (venue) => {
    setVenues((currentVenues) => [...currentVenues, venue]);
  };

  const addHall = (venueId, hallName) => {
    setVenues((currentVenues) =>
      currentVenues.map((venue) =>
        venue.id === venueId
          ? { 
              ...venue, 
              halls: [
                ...venue.halls, 
                { 
                  name: hallName, 
                  image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop" 
                }
              ] 
            }
          : venue,
      ),
    );
  };

  // ── User CRUD ─────────────────────────────────
  const addUser = (user) => {
    setUsers((currentUsers) => [...currentUsers, user]);
    setUserFormOpen(false);
  };

  const updateUser = (updatedUser) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
    setUserFormOpen(false);
  };

  const toggleUserStatus = (id) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user,
      ),
    );
  };

  const removeUser = (id) => {
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
  };

  // ── Master Data CRUD Handlers ─────────────────
  const masterCrudHandlers = {
    industries: {
      add: (item) => setIndustries((prev) => [...prev, item]),
      remove: (item) => setIndustries((prev) => prev.filter((i) => i !== item)),
      update: (oldVal, newVal) => setIndustries((prev) => prev.map((i) => i === oldVal ? newVal : i)),
    },
    sectors: {
      add: (item) => setSectors((prev) => [...prev, item]),
      remove: (item) => setSectors((prev) => prev.filter((s) => s !== item)),
      update: (oldVal, newVal) => setSectors((prev) => prev.map((s) => s === oldVal ? newVal : s)),
    },
    organizers: {
      add: (item) => setOrganizers((prev) => [...prev, item]),
      remove: (item) => setOrganizers((prev) => prev.filter((o) => o !== item)),
      update: (oldVal, newVal) => setOrganizers((prev) => prev.map((o) => o === oldVal ? newVal : o)),
    },
    eventStatuses: {
      add: (item) => setEventStatuses((prev) => [...prev, item]),
      remove: (item) => setEventStatuses((prev) => prev.filter((s) => s !== item)),
      update: (oldVal, newVal) => setEventStatuses((prev) => prev.map((s) => s === oldVal ? newVal : s)),
    },
    eventTypes: {
      add: (item) => setEventTypes((prev) => [...prev, item]),
      remove: (item) => setEventTypes((prev) => prev.filter((t) => t !== item)),
      update: (oldVal, newVal) => setEventTypes((prev) => prev.map((t) => t === oldVal ? newVal : t)),
    },
    primePeriods: {
      add: (item) => setPrimePeriods((prev) => [...prev, item]),
      remove: (item) => setPrimePeriods((prev) => prev.filter((p) => p.label !== item.label)),
      update: (oldVal, newVal) => setPrimePeriods((prev) => prev.map((p) => p.label === oldVal.label ? newVal : p)),
    },
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={routeConfig[DEFAULT_ROUTE]} replace />} />
      <Route
        path={routeConfig.dashboard}
        element={
          <AdminShell page="dashboard" onNav={navigateTo} currentUser={currentUser}>
            <Dashboard
              bookings={bookings}
              venues={venues}
              onNav={navigateTo}
              onUpdateStatus={updateBookingStatus}
              currentUser={currentUser}
            />
          </AdminShell>
        }
      />
      <Route
        path={routeConfig.venues}
        element={
          <AdminShell page="venues" onNav={navigateTo} currentUser={currentUser}>
            <Venues venues={venues} />
          </AdminShell>
        }
      />
      <Route
        path={routeConfig.calendar}
        element={
          <AdminShell page="calendar" onNav={navigateTo} currentUser={currentUser}>
            <CalendarView
              bookings={bookings}
              venues={venues}
              onEditBooking={startEditBooking}
              onUpdateStatus={updateBookingStatus}
            />
          </AdminShell>
        }
      />
      <Route
        path={routeConfig.bookings}
        element={
          <AdminShell page="bookings" onNav={navigateTo} currentUser={currentUser}>
            <BookingsList
              bookings={bookings}
              venues={venues}
              industries={industries}
              onNav={navigateTo}
              onUpdateStatus={updateBookingStatus}
              onEditBooking={startEditBooking}
              onDeleteBooking={deleteBooking}
            />
          </AdminShell>
        }
      />
      <Route
        path={routeConfig['new-booking']}
        element={
          <AdminShell page="new-booking" onNav={navigateTo} currentUser={currentUser}>
            <BookingForm
              bookings={bookings}
              venues={venues}
              organizers={organizers}
              industries={industries}
              sectors={sectors}
              eventTypes={eventTypes}
              eventStatuses={eventStatuses}
              onSave={addBooking}
            />
          </AdminShell>
        }
      />
      <Route
        path={routeConfig['edit-booking']}
        element={
          <AdminShell page="edit-booking" onNav={navigateTo} currentUser={currentUser}>
            <BookingForm
              bookings={bookings}
              venues={venues}
              organizers={organizers}
              industries={industries}
              sectors={sectors}
              eventTypes={eventTypes}
              eventStatuses={eventStatuses}
              onSave={updateBooking}
              editBooking={editingBooking}
            />
          </AdminShell>
        }
      />
      <Route
        path={routeConfig.reports}
        element={
          <AdminShell page="reports" onNav={navigateTo} currentUser={currentUser}>
            <Reports bookings={bookings} venues={venues} />
          </AdminShell>
        }
      />
      <Route
        path={routeConfig.ai}
        element={
          <AdminShell page="ai" onNav={navigateTo} currentUser={currentUser}>
            <AIInsights bookings={bookings} />
          </AdminShell>
        }
      />
      <Route
        path={routeConfig.master}
        element={
          <AdminShell page="master" onNav={navigateTo} currentUser={currentUser}>
            <MasterData
              venues={venues}
              organizers={organizers}
              industries={industries}
              sectors={sectors}
              eventStatuses={eventStatuses}
              eventTypes={eventTypes}
              primePeriods={primePeriods}
              onAddVenue={addVenue}
              onAddHall={addHall}
              masterCrudHandlers={masterCrudHandlers}
              currentUser={currentUser}
            />
          </AdminShell>
        }
      />
      <Route
        path={routeConfig.users}
        element={
          <AdminShell 
            page="users" 
            onNav={navigateTo} 
            onAddClick={() => setUserFormOpen(true)} 
            currentUser={currentUser}
          >
            <UserManagement
              users={users}
              onAddUser={addUser}
              onUpdateUser={updateUser}
              onToggleUserStatus={toggleUserStatus}
              onRemoveUser={removeUser}
              isFormOpen={userFormOpen}
              onCloseForm={() => setUserFormOpen(false)}
            />
          </AdminShell>
        }
      />
      <Route path="*" element={<Navigate to={routeConfig[DEFAULT_ROUTE]} replace />} />
    </Routes>
  );
}
