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
  reports: '/reports',
  ai: '/ai-insights',
  master: '/master-data',
  users: '/users',
};

function AdminShell({ page, onNav, currentUser, children }) {
  return (
    <div className="app-shell" data-route={routeConfig[page] || routeConfig[DEFAULT_ROUTE]}>
      <Sidebar active={page} onNav={onNav} currentUser={currentUser} />
      <div className="main-content">
        <Topbar page={page} onNav={onNav} />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [bookings, setBookings] = useState(initialBookings);
  const [venues, setVenues] = useState(masterData.venues);
  const [users, setUsers] = useState(initialUsers);
  const navigate = useNavigate();

  const currentUser = users.find((user) => user.role === 'Admin') || users[0];

  const navigateTo = (routeKey) => {
    navigate(routeConfig[routeKey] || routeConfig[DEFAULT_ROUTE]);
  };

  const addBooking = (newBooking) => {
    setBookings((currentBookings) => [newBooking, ...currentBookings]);
    navigateTo('bookings');
  };

  const updateBookingStatus = (id, status) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === id ? { ...booking, status } : booking,
      ),
    );
  };

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

  const addUser = (user) => {
    setUsers((currentUsers) => [...currentUsers, user]);
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
            <CalendarView bookings={bookings} venues={venues} />
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
              onNav={navigateTo}
              onUpdateStatus={updateBookingStatus}
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
              organizers={masterData.organizers}
              industries={masterData.industries}
              sectors={masterData.sectors}
              onSave={addBooking}
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
              organizers={masterData.organizers}
              onAddVenue={addVenue}
              onAddHall={addHall}
              currentUser={currentUser}
            />
          </AdminShell>
        }
      />
      <Route
        path={routeConfig.users}
        element={
          <AdminShell page="users" onNav={navigateTo} currentUser={currentUser}>
            <UserManagement
              users={users}
              onAddUser={addUser}
              onToggleUserStatus={toggleUserStatus}
              onRemoveUser={removeUser}
            />
          </AdminShell>
        }
      />
      <Route path="*" element={<Navigate to={routeConfig[DEFAULT_ROUTE]} replace />} />
    </Routes>
  );
}
