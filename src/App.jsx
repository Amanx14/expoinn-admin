import { useState } from 'react';
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
import { bookings as initialBookings } from './data/staticData';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [bookings, setBookings] = useState(initialBookings);

  const addBooking = (newB) => {
    setBookings([newB, ...bookings]);
    setPage('bookings');
  };

  const updateBookingStatus = (id, status) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':    return <Dashboard    bookings={bookings} onNav={setPage} onUpdateStatus={updateBookingStatus} />;
      case 'calendar':     return <CalendarView  bookings={bookings} />;
      case 'bookings':     return <BookingsList  bookings={bookings} onNav={setPage} onUpdateStatus={updateBookingStatus} />;
      case 'new-booking':  return <BookingForm   bookings={bookings} onSave={addBooking} />;
      case 'reports':      return <Reports       bookings={bookings} />;
      case 'ai':           return <AIInsights    bookings={bookings} />;
      case 'master':       return <MasterData />;
      case 'users':        return <UserManagement />;
      default:             return <Dashboard    bookings={bookings} onNav={setPage} onUpdateStatus={updateBookingStatus} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar active={page} onNav={setPage} />
      <div className="main-content">
        <Topbar page={page} />
        {renderPage()}
      </div>
    </div>
  );
}
