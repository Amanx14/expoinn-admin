import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  X,
  MapPin,
  Clock,
  Info
} from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const days = [];
  for (let i = 0; i < first.getDay(); i++) {
    const d = new Date(year, month, -i);
    days.unshift({ date: d, current: false });
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push({ date: new Date(year, month, d), current: true });
  }
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), current: false });
  }
  return days;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function BookingModal({ date, bookings, venues, onClose }) {
  if (!date) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '90%' }}>
        <div className="modal-header">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Schedule for
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--gold)' }}>
              {date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '20px' }}>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <CalendarIcon size={40} style={{ opacity: 0.1, marginBottom: 12 }} />
              <p>No event bookings or setup blocks scheduled for this date.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bookings.map(b => {
                const venue = venues.find(v => v.id === b.venueId);
                const isSetup = new Date(date).getTime() < new Date(b.eventStartDate).getTime();
                const isDismantle = new Date(date).getTime() > new Date(b.eventEndDate).getTime();
                const typeLabel = isSetup ? 'Setup' : isDismantle ? 'Dismantle' : 'Event Live';
                const typeColor = isSetup ? '#6B9EC9' : isDismantle ? '#9E9E6B' : 'var(--gold)';

                return (
                  <div key={b.id} className="card" style={{ borderLeft: `4px solid ${typeColor}`, background: 'var(--bg-overlay)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: typeColor, textTransform: 'uppercase' }}>{typeLabel}</span>
                      <span className={`status-pill ${b.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{b.status}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{b.eventName || b.organizer}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={12} /> {b.hall} · {venue?.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Clock size={12} /> {b.eventStartDate} to {b.eventEndDate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-start', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
          <Info size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total of {bookings.length} active block{bookings.length !== 1 ? 's' : ''} on this date.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarView({ bookings, venues }) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(null);

  const bookingsForDate = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return bookings.filter(b => {
      const s = new Date(b.setupDate || b.eventStartDate).getTime();
      const e = new Date(b.dismantleDate || b.eventEndDate).getTime();
      return d >= s && d <= e;
    });
  };

  const days = getCalendarDays(year, month);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const monthName = new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  
  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Event Calendar</h1>
          <p>Comprehensive visualization of bookings including setup, live, and dismantle periods.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
           <div style={{ display: 'flex', gap: 15, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} /> Confirmed
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6B9EC9' }} /> Tentative
              </div>
           </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600 }}>{monthName}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-ghost btn-sm" onClick={prevMonth} style={{ padding: 4 }}><ChevronLeft size={18} /></button>
              <button className="btn btn-ghost btn-sm" onClick={nextMonth} style={{ padding: 4 }}><ChevronRight size={18} /></button>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }}>Today</button>
        </div>

        <div className="cal-grid" style={{ background: 'rgba(255,255,255,0.01)' }}>
          {DAYS.map(d => <div key={d} className="cal-header-cell" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>{d}</div>)}
        </div>

        <div className="cal-grid">
          {days.map((day, i) => {
            const dayBookings = bookingsForDate(day.date);
            const isToday = isSameDay(day.date, now);
            
            return (
              <div
                key={i}
                className={`cal-day ${!day.current ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                style={{ minHeight: 120, cursor: 'pointer' }}
                onClick={() => setSelected(day.date)}
              >
                <div className="cal-day-num" style={{ marginBottom: 8, fontWeight: isToday ? 700 : 400 }}>{day.date.getDate()}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {dayBookings.map(b => (
                    <div 
                      key={b.id} 
                      className={`cal-event-dot ${b.status.toLowerCase()}`} 
                      style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        padding: '2px 6px',
                        fontSize: '0.65rem'
                      }}
                    >
                      {b.eventName || b.organizer}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BookingModal 
        date={selected} 
        bookings={selected ? bookingsForDate(selected) : []} 
        venues={venues}
        onClose={() => setSelected(null)} 
      />
    </div>
  );
}
