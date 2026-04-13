import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { halls } from '../data/staticData';

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

export default function CalendarView({ bookings }) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(null);

  const bookingsForDate = (date) => {
    const ds = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    return bookings.filter(b => b.eventDate === ds || b.setupDate === ds);
  };

  const days = getCalendarDays(year, month);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const monthName = new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const selectedBookings = selected ? bookingsForDate(selected) : [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Calendar View</h1>
        <p>Visual overview of all bookings, setup & dismantle dates.</p>
      </div>

      <div className="grid-7030" style={{ alignItems: 'flex-start' }}>
        {/* Calendar */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button className="btn btn-ghost btn-sm" onClick={prevMonth}><ChevronLeft size={15} /></button>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{monthName}</span>
            <button className="btn btn-ghost btn-sm" onClick={nextMonth}><ChevronRight size={15} /></button>
          </div>

          <div className="cal-grid" style={{ marginBottom: 4 }}>
            {DAYS.map(d => <div key={d} className="cal-header-cell">{d}</div>)}
          </div>

          <div className="cal-grid">
            {days.map((day, i) => {
              const dayBookings = bookingsForDate(day.date);
              const isToday = isSameDay(day.date, now);
              const isSelected = selected && isSameDay(day.date, selected);
              return (
                <div
                  key={i}
                  className={`cal-day ${!day.current ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  style={isSelected ? { borderColor: 'var(--gold)', background: 'var(--gold-faint)' } : {}}
                  onClick={() => setSelected(day.date)}
                >
                  <div className="cal-day-num">{day.date.getDate()}</div>
                  {dayBookings.slice(0, 2).map(b => (
                    <div key={b.id} className={`cal-event-dot ${b.status}`} title={b.eventName}>
                      {b.eventName.split(' ').slice(0, 3).join(' ')}
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>+{dayBookings.length - 2} more</div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 14, padding: '10px 0 0', borderTop: '1px solid var(--border)' }}>
            {['confirmed','tentative','draft'].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span className={`cal-event-dot ${s}`} style={{ padding: '2px 6px', borderRadius: 3 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          {selected ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Selected Date</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)' }}>
                  {selected.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
              {selectedBookings.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', textAlign: 'center', padding: '24px 0' }}>
                  No events on this date.
                </div>
              ) : (
                selectedBookings.map(b => {
                  const hall = halls.find(h => h.id === b.hallId);
                  return (
                    <div key={b.id} style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 500 }}>{b.id}</span>
                        <span className={`status-pill ${b.status}`}>{b.status}</span>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: 5, color: 'var(--text-primary)' }}>{b.eventName}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{hall?.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 3 }}>
                        Setup: {b.setupDate} → Event: {b.eventDate} → Dismantle: {b.dismantleDate}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8, opacity: 0.3 }}>📅</div>
              Click a date to see details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
