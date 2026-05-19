import { useState, useMemo, useEffect } from 'react';
import { X, Maximize, Minimize, Plus, CalendarPlus, CheckCircle2, Clock, Wrench, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── helpers ──────────────────────────────────────────────────────────────────

function toMidnight(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return toMidnight(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function getCellType(date, booking) {
  const d = date.getTime();
  const sDate = toMidnight(booking.setupDate);
  const eDate = toMidnight(booking.eventStartDate);
  const evEnd = toMidnight(booking.eventEndDate);
  const disE = toMidnight(booking.dismantleDate);

  if (sDate && eDate && d >= sDate.getTime() && d < eDate.getTime()) return 'mounting';
  if (eDate && evEnd && d >= eDate.getTime() && d <= evEnd.getTime()) return 'exhibition';
  if (disE && evEnd && d > evEnd.getTime() && d <= disE.getTime()) return 'dismantling';
  return 'exhibition'; // fallback
}

// status → cell colour class
function getStatusClass(booking, date) {
  const status = (booking.status || '').toLowerCase();
  if (status === 'cancelled' || status === 'completed') return 'cell-na';

  const type = getCellType(date, booking);
  if (type === 'mounting' || type === 'dismantling') return 'cell-mounting';

  if (status === 'confirmed') return 'cell-booked';
  if (status === 'tentative' || status === 'draft') return 'cell-reserved';
  return 'cell-booked';
}

function BookingDetailModal({ booking, onClose, onEdit, onCancel }) {
  if (!booking) return null;
  const venue = booking._venueName || '—';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)', borderRadius: 12, maxWidth: 680, width: '94%',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden',
          fontFamily: 'var(--font-body)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header row */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              ['Name of Exhibition', booking.eventName || '—'],
              ['Hall Name', booking.hall || '—'],
              ['Name of Organisation', booking.organizer || '—'],
              ['Product Profile', booking.industry || '—'],
            ].map(([label, val]) => (
              <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 500, color: 'var(--text-secondary)', width: '40%', background: 'var(--bg-surface)', fontSize: '0.88rem' }}>{label}</td>
                <td style={{ padding: '14px 20px', color: 'var(--text-primary)', fontSize: '0.88rem' }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Period table */}
        <div style={{ padding: '0 0 0 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid var(--border)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                {['Mounting Period', 'Exhibition Period', 'Dismantling Period'].map(h => (
                  <th key={h} colSpan={2} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', borderRight: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                {['Start Date', 'End Date', 'Start Date', 'End Date', 'Start Date', 'End Date'].map((h, i) => (
                  <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {[
                  booking.setupDate, booking.eventStartDate,   // mounting
                  booking.eventStartDate, booking.eventEndDate,      // exhibition
                  booking.eventEndDate, booking.dismantleDate,     // dismantle
                ].map((d, i) => (
                  <td key={i} style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-primary)', borderRight: '1px solid var(--border)' }}>{fmtDate(d)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          {booking.status !== 'Cancelled' && onCancel && (
            <button
              onClick={() => {
                onCancel(booking.id);
                onClose();
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', border: '1px solid #EF4444', borderRadius: 8,
                background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', fontSize: '0.85rem',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginRight: 'auto'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            >
              Cancel Booking
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => {
                onEdit(booking);
                onClose();
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', border: '1px solid var(--gold)', borderRadius: 8,
                background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', fontSize: '0.85rem',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginRight: 10
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(201,168,76,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}
            >
              Edit Booking
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 20px', border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem',
              fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-overlay)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            <X size={14} /> Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main CalendarView ─────────────────────────────────────────────────────────

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS = Array.from({ length: 10 }, (_, i) => 2024 + i);

export default function CalendarView({ bookings, venues, onEditBooking, onUpdateStatus, isSidebarOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id || '');
  const [detailBooking, setDetailBooking] = useState(null);
  const [availableSlot, setAvailableSlot] = useState(null);

  const selectedVenue = useMemo(() => venues.find(v => v.id === selectedVenueId), [venues, selectedVenueId]);
  const halls = useMemo(() => selectedVenue?.halls || [], [selectedVenue]);

  const daysInMonth = useMemo(() => {
    const days = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [year, month]);

  // build a map: "date-hall" → booking[]
  const bookingMap = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      if (b.venueId !== selectedVenueId) return;
      const s = toMidnight(b.setupDate || b.eventStartDate);
      const e = toMidnight(b.dismantleDate || b.eventEndDate);
      if (!s || !e) return;
      
      const bookedHalls = typeof b.hall === 'string' 
        ? b.hall.split(',').map(h => h.trim()).filter(Boolean)
        : [b.hall];

      bookedHalls.forEach(hallName => {
        const cur = new Date(s);
        while (cur <= e) {
          const key = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}-${hallName}`;
          if (!map[key]) map[key] = [];
          map[key].push(b);
          cur.setDate(cur.getDate() + 1);
        }
      });
    });
    return map;
  }, [bookings, selectedVenueId]);

  const getCell = (date, hallName) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${hallName}`;
    return bookingMap[key] || [];
  };

  const isToday = (date) => date.toDateString() === now.toDateString();

  const styles = `
    .expo-cal-wrap {
      --cal-bg: #071A24;
      --cal-panel: #0B2430;
      --cal-panel-soft: #123447;
      --cal-header: #0E3A4A;
      --cal-grid: rgba(148, 210, 189, 0.18);
      --cal-grid-strong: rgba(148, 210, 189, 0.34);
      --cal-text: #E7FAF8;
      --cal-muted: #93B8B5;
      --cal-accent: #2DD4BF;
      --cal-accent-soft: rgba(45, 212, 191, 0.14);
      --cal-booked: #E11D48;
      --cal-mounting: #F97316;
      --cal-reserved: #7C3AED;
      --cal-available: #059669;
      --cal-na: #475569;
      font-family: var(--font-body);
      background: var(--cal-bg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--cal-grid-strong);
      overflow: hidden;
      box-shadow: 0 18px 46px rgba(0,0,0,0.28), 0 0 0 1px rgba(45,212,191,0.04);
      display: flex;
      flex-direction: column;
    }
    .expo-cal-header {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--cal-grid-strong);
      background: linear-gradient(135deg, var(--cal-header), #092231);
      flex-wrap: wrap;
    }
    .expo-cal-select {
      appearance: none;
      border: 1px solid var(--cal-grid-strong);
      border-radius: var(--radius-sm);
      padding: 6px 28px 6px 10px;
      font-size: 0.85rem;
      font-weight: 600;
      background: var(--cal-panel) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2393B8B5' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 8px center;
      cursor: pointer;
      color: var(--cal-accent);
      outline: none;
    }
    .expo-cal-select-year { color: var(--cal-accent); }
    .expo-legend {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      padding: 12px 24px;
      border-bottom: 1px solid var(--cal-grid);
      background: var(--cal-panel);
    }
    .expo-legend-item {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 0.78rem;
      color: var(--cal-muted);
    }
    .expo-legend-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .expo-legend-box {
      width: 14px;
      height: 14px;
      border: 2px solid var(--cal-grid-strong);
      flex-shrink: 0;
    }
    .expo-cal-scroll {
      overflow-x: auto;
      overscroll-behavior: none;
    }
    .expo-cal-table {
      border-collapse: collapse;
      min-width: 100%;
      font-size: 0.78rem;
    }
    .expo-cal-table th {
      background: var(--cal-panel);
      color: var(--cal-text);
      font-weight: 600;
      padding: 10px 8px;
      text-align: center;
      border: 1px solid var(--cal-grid);
      white-space: nowrap;
      position: sticky;
      top: 0;
      z-index: 2;
    }
    .expo-cal-table th.date-head {
      min-width: 70px;
      width: 70px;
      text-align: left;
      padding-left: 10px;
      position: sticky;
      left: 0;
      z-index: 3;
    }
    .expo-cal-table td {
      border: 1px solid var(--cal-grid);
      padding: 0;
      text-align: center;
    }
    .expo-cal-table td.date-cell {
      background: var(--cal-panel);
      padding: 6px 10px;
      font-size: 0.78rem;
      color: var(--cal-muted);
      white-space: nowrap;
      min-width: 70px;
      width: 70px;
      position: sticky;
      left: 0;
      z-index: 1;
      border-right: 2px solid var(--cal-grid-strong);
    }
    .expo-cal-table td.date-cell.today {
      background: var(--cal-accent-soft);
      font-weight: 700;
      color: var(--cal-accent);
    }
    .expo-cal-table tr:hover td.date-cell { background: var(--cal-panel-soft); }
    .expo-cal-table tr.today-row { background: rgba(45, 212, 191, 0.06); }

    .hall-cell {
      width: 54px;
      min-width: 54px;
      height: 36px;
      cursor: pointer;
      transition: filter 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hall-cell:hover { filter: brightness(1.14) saturate(1.08); }

    .cell-available   { background: var(--cal-available); color: #ffffff; }
    .cell-booked      { background: var(--cal-booked); color: #ffffff; }
    .cell-mounting    { background: var(--cal-mounting); color: #ffffff; }
    .cell-reserved    { background: var(--cal-reserved); color: #ffffff; }
    .cell-na          { background: var(--cal-na); color: #ffffff; }

    .cell-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      width: 100%;
      height: 100%;
    }

    /* Hall column tds: zero padding so color fills edge-to-edge with strong visible borders */
    .expo-cal-table td.hall-td {
      padding: 0;
      height: 36px;
      vertical-align: middle;
      border: 2px solid rgba(231, 250, 248, 0.78) !important;
      cursor: pointer;
    }
    .expo-cal-table td.hall-td:hover {
      filter: brightness(1.14) saturate(1.08);
    }

    .area-row td {
      background: #0A202C;
      color: var(--cal-muted);
      font-size: 0.72rem;
      padding: 5px 8px;
      text-align: center;
    }
    .area-row td.date-cell {
      background: var(--cal-panel);
      color: var(--cal-muted);
      font-size: 0.72rem;
    }
    .venue-select-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }
    .venue-select-wrap label {
      font-size: 0.8rem;
      color: var(--cal-muted);
      font-weight: 500;
    }
    .venue-select {
      appearance: none;
      border: 1px solid var(--cal-grid-strong);
      border-radius: var(--radius-sm);
      padding: 6px 28px 6px 10px;
      font-size: 0.82rem;
      background: var(--cal-panel) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2393B8B5' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 8px center;
      cursor: pointer;
      color: var(--cal-text);
      outline: none;
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <div className="page">
        <div className="page-header" style={{ marginBottom: 20 }}>
          <h1 style={{ marginBottom: 4 }}>Calendar Module</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>
            Resource-based visualization of hall availability and event schedules.
          </p>
        </div>

        <div className="expo-cal-wrap">
          {/* ── Top controls ── */}
          <div className="expo-cal-header">
            <select
              className="expo-cal-select"
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>

            <select
              className="expo-cal-select expo-cal-select-year"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 14, height: 14, border: '2px solid var(--border)' }} />
              Available Date
            </div>

            <div className="venue-select-wrap">
              <label>Venue:</label>
              <select
                className="venue-select"
                value={selectedVenueId}
                onChange={e => setSelectedVenueId(e.target.value)}
              >
                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>

              <button
                onClick={toggleSidebar}
                style={{
                  background: 'transparent', border: '1px solid var(--border)', borderRadius: 6,
                  color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, marginLeft: 8, transition: 'all 0.2s'
                }}
                title={!isSidebarOpen ? "Exit Full Screen" : "Full Screen Calendar"}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-overlay)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                {!isSidebarOpen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </div>
          </div>

          {/* ── Legend ── */}
          <div className="expo-legend">
            {[
              {
                bg: '#C23B30',
                txt: '#ffffff',
                label: 'Booked - Exhibition',
                icon: <CheckCircle2 size={11} strokeWidth={2.5} />
              },
              {
                bg: '#D15E84',
                txt: '#ffffff',
                label: 'Booked - Mounting / Dismantling',
                icon: <Wrench size={11} strokeWidth={2.5} />
              },
              {
                bg: '#C9A84C',
                txt: '#ffffff',
                label: 'Reserved / Booking in Progress',
                icon: <Clock size={11} strokeWidth={2.5} />
              },
              {
                bg: '#1B8A5A',
                txt: '#ffffff',
                label: 'Available',
                icon: <Plus size={11} strokeWidth={3} />
              },
              {
                bg: '#2D394E',
                txt: '#ffffff',
                label: 'Not Available',
                icon: <Ban size={11} strokeWidth={2.5} />
              },
            ].map(({ bg, txt, label, icon }) => (
              <div key={label} className="expo-legend-item" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  className="expo-legend-dot"
                  style={{
                    background: bg,
                    color: txt,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: '1px solid var(--border)'
                  }}
                >
                  {icon}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* ── Table ── */}
          <div className="expo-cal-scroll" style={{ overflowX: 'auto', paddingBottom: 20, flex: 1, overflowY: !isSidebarOpen ? 'auto' : 'visible' }}>
            <table className="expo-cal-table">
              <thead>
                <tr>
                  <th className="date-head">Halls</th>
                  {halls.map(h => <th key={h.name}>{h.name}</th>)}
                </tr>
                <tr className="area-row">
                  <td className="date-cell" style={{ background: 'var(--bg-surface)', fontWeight: 600 }}>Area (in sqm)</td>
                  {halls.map(h => <td key={h.name}>{h.areaSqm ?? '—'}</td>)}
                </tr>
              </thead>
              <tbody>
                {daysInMonth.map((date, idx) => {
                  const today = isToday(date);
                  return (
                    <tr key={idx} className={today ? 'today-row' : ''}>
                      <td className={`date-cell${today ? ' today' : ''}`}>
                        {date.getDate()} {date.toLocaleDateString('en-IN', { month: 'short' })}
                      </td>
                      {halls.map(hall => {
                        const cellBookings = getCell(date, hall.name);
                        const hasBooking = cellBookings.length > 0;
                        const booking = cellBookings[0];
                        let cellClass = 'cell-available';
                        let IconComponent = null;

                        if (hasBooking) {
                          cellClass = getStatusClass(booking, date);
                          if (cellClass === 'cell-booked') IconComponent = <CheckCircle2 size={13} strokeWidth={2.5} />;
                          else if (cellClass === 'cell-reserved') IconComponent = <Clock size={13} strokeWidth={2.5} />;
                          else if (cellClass === 'cell-mounting') IconComponent = <Wrench size={13} strokeWidth={2.5} />;
                          else if (cellClass === 'cell-na') IconComponent = <Ban size={13} strokeWidth={2.5} />;
                        } else if (hall.notAvailable) {
                          cellClass = 'cell-na';
                          IconComponent = <Ban size={13} strokeWidth={2.5} />;
                        } else {
                          IconComponent = <Plus size={13} strokeWidth={3} />;
                        }

                        return (
                          <td
                            key={hall.name}
                            className={`hall-td ${cellClass}`}
                            title={hasBooking ? `${booking.eventName || booking.organizer} · ${booking.status}` : hall.notAvailable ? 'Not Available' : 'Available'}
                            onClick={() => {
                              if (hasBooking) {
                                setDetailBooking({
                                  ...booking,
                                  _venueName: selectedVenue?.name,
                                });
                              } else if (!hall.notAvailable) {
                                setAvailableSlot({
                                  date,
                                  hall,
                                  venue: selectedVenue
                                });
                              }
                            }}
                          >
                            <div className="cell-icon">
                              {IconComponent}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
              {/* Repeat hall header at bottom */}
              <tfoot>
                <tr>
                  <th className="date-head" style={{ background: 'var(--bg-surface)', position: 'sticky', bottom: 0, zIndex: 10, borderTop: '1px solid var(--border)' }}>Halls</th>
                  {halls.map(h => (
                    <th key={h.name} style={{ background: 'var(--bg-surface)', position: 'sticky', bottom: 0, borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '10px 8px', fontSize: '0.78rem', zIndex: 9 }}>
                      {h.name}
                    </th>
                  ))}
                </tr>
                <tr className="area-row">
                  <td className="date-cell" style={{ background: 'var(--bg-surface)', fontWeight: 600, position: 'sticky', bottom: 0, zIndex: 10 }}>Area (in sqm)</td>
                  {halls.map(h => <td key={h.name} style={{ background: 'var(--bg-overlay)', position: 'sticky', bottom: 0, borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>{h.areaSqm ?? '—'}</td>)}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <BookingDetailModal
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
        onEdit={onEditBooking}
        onCancel={(id) => onUpdateStatus(id, 'Cancelled')}
      />

      {/* Available Slot Modal */}
      {availableSlot && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setAvailableSlot(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)', borderRadius: 12, maxWidth: 400, width: '90%',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden',
              fontFamily: 'var(--font-body)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                Available Slot
              </div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {availableSlot.hall.name}
              </h2>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Venue</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>{availableSlot.venue.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Area Size</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>{availableSlot.hall.areaSqm ? `${availableSlot.hall.areaSqm} sqm` : 'Not specified'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Date</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>{fmtDate(availableSlot.date)}</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', gap: 12 }}>
              <button
                onClick={() => setAvailableSlot(null)}
                style={{
                  flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 8,
                  background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem',
                  fontWeight: 500, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Format date to YYYY-MM-DD local time to pass to form
                  const tzoffset = availableSlot.date.getTimezoneOffset() * 60000; // offset in milliseconds
                  const localISOTime = (new Date(availableSlot.date - tzoffset)).toISOString().slice(0, -1);
                  const dateString = localISOTime.split('T')[0];

                  navigate('/bookings/new', {
                    state: {
                      venueId: availableSlot.venue.id,
                      hall: availableSlot.hall.name,
                      date: dateString
                    }
                  });
                }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px', border: 'none', borderRadius: 8,
                  background: 'var(--gold)', color: 'var(--bg-base)', fontSize: '0.85rem',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                <CalendarPlus size={16} /> Book Directly
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
