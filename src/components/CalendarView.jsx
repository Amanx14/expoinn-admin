import { useState, useMemo } from 'react';
import { X, Maximize, Minimize, Plus, CalendarPlus, CheckCircle2, Clock, Wrench, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── helpers ───────────────────────────────────────────────────────────────────

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
  return 'exhibition';
}

function getStatusClass(booking, date) {
  const status = (booking.status || '').toLowerCase();
  if (status === 'cancelled' || status === 'completed') return 'cn-na';
  const type = getCellType(date, booking);
  if (type === 'mounting' || type === 'dismantling') return 'cn-mounting';
  if (status === 'confirmed') return 'cn-booked';
  if (status === 'tentative' || status === 'draft') return 'cn-reserved';
  return 'cn-booked';
}

// ── Legend pill ───────────────────────────────────────────────────────────────
function LegendPill({ color, label, icon, bgColor }) {
  const bg = bgColor || color;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 26, height: 26, borderRadius: 6, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, boxShadow: `0 0 10px ${color}33`,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
}

// ── Booking Detail Modal ──────────────────────────────────────────────────────
function BookingDetailModal({ booking, onClose, onEdit, onCancel }) {
  if (!booking) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--modal-backdrop)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)', borderRadius: 14, maxWidth: 700, width: '94%',
          border: '1px solid var(--border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.08)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-overlay) 100%)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>
              Booking Details
            </div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {booking.eventName || '—'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: 8,
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Info rows */}
        <div style={{ padding: '0 24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <tbody>
              {[
                ['Hall', booking.hall || '—'],
                ['Organisation', booking.organizer || '—'],
                ['Product Profile', booking.industry || '—'],
              ].map(([label, val]) => (
                <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 0', fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.82rem', width: '36%' }}>{label}</td>
                  <td style={{ padding: '11px 0', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Period table */}
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
            Date Breakdown
          </div>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)' }}>
                  {[
                    { label: 'Mounting Period', color: '#D97706' },
                    { label: 'Exhibition Period', color: '#DC2626' },
                    { label: 'Dismantling Period', color: '#D97706' },
                  ].map(({ label, color }) => (
                    <th key={label} colSpan={2} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: '0.75rem', fontWeight: 700, color,
                      borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                    }}>
                      {label}
                    </th>
                  ))}
                </tr>
                <tr style={{ background: 'var(--bg-overlay)', borderBottom: '1px solid var(--border)' }}>
                  {['Start', 'End', 'Start', 'End', 'Start', 'End'].map((h, i) => (
                    <th key={i} style={{
                      padding: '8px 14px', textAlign: 'left', fontSize: '0.72rem',
                      fontWeight: 500, color: 'var(--text-muted)',
                      borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {[
                    booking.setupDate, booking.eventStartDate,
                    booking.eventStartDate, booking.eventEndDate,
                    booking.eventEndDate, booking.dismantleDate,
                  ].map((d, i) => (
                    <td key={i} style={{
                      padding: '12px 14px', fontSize: '0.83rem', color: 'var(--text-primary)',
                      borderRight: '1px solid var(--border)', fontWeight: 500,
                    }}>
                      {fmtDate(d)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          padding: '16px 24px', marginTop: 16,
          borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', gap: 10,
        }}>
          {booking.status !== 'Cancelled' && onCancel && (
            <button
              onClick={() => { onCancel(booking.id); onClose(); }}
              style={{
                marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8,
                background: 'rgba(239,68,68,0.08)', color: '#FCA5A5', fontSize: '0.82rem',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Ban size={13} /> Cancel Booking
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => { onEdit(booking); onClose(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', border: '1px solid var(--gold)', borderRadius: 8,
                background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', fontSize: '0.82rem',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Edit Booking
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.82rem',
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS = Array.from({ length: 10 }, (_, i) => 2024 + i);

// ── Main CalendarView ─────────────────────────────────────────────────────────

export default function CalendarView({ bookings, venues, onEditBooking, onUpdateStatus, isSidebarOpen, toggleSidebar, theme }) {
  const isLightTheme = theme === 'light';

  const CELL_COLORS = {
    'cn-booked': { bg: '#DC2626', accent: '#FCA5A5', light: 'rgba(220,38,38,0.25)', text: '#ffffff' },
    'cn-mounting': { bg: '#D97706', accent: '#FDE68A', light: 'rgba(217,119,6,0.25)', text: '#ffffff' },
    'cn-reserved': { bg: '#7C3AED', accent: '#C4B5FD', light: 'rgba(124,58,237,0.25)', text: '#ffffff' },
    'cn-available': isLightTheme
      ? { bg: '#E8E6FC', accent: '#A5B4FC', light: 'rgba(79,70,229,0.12)', text: '#4F46E5' }
      : { bg: '#16294A', accent: '#3B82F6', light: 'rgba(59,130,246,0.15)', text: '#60A5FA' },
    'cn-na': isLightTheme
      ? { bg: '#EEEDF5', accent: '#C4C1E0', light: 'rgba(30,27,75,0.10)', text: '#8B85AD' }
      : { bg: '#223047', accent: '#475569', light: 'rgba(51,65,85,0.20)', text: '#64748B' },
  };
  const navigate = useNavigate();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id || '');
  const [detailBooking, setDetailBooking] = useState(null);
  const [availableSlot, setAvailableSlot] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  const selectedVenue = useMemo(() => venues.find(v => v.id === selectedVenueId), [venues, selectedVenueId]);
  const halls = useMemo(() => selectedVenue?.halls || [], [selectedVenue]);

  const daysInMonth = useMemo(() => {
    const days = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return days;
  }, [year, month]);

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

  const getCell = (date, hallName) => bookingMap[`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${hallName}`] || [];
  const isToday = (date) => date.toDateString() === now.toDateString();
  const isWeekend = (date) => { const d = date.getDay(); return d === 0 || d === 6; };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .cn-select {
          appearance: none;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 7px 32px 7px 12px;
          font-size: 0.82rem;
          font-weight: 600;
          background-color: var(--bg-surface);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A84C' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          cursor: pointer;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s;
          font-family: var(--font-body);
        }
        .cn-select:focus { border-color: var(--gold); }
        .cn-select option { background: var(--bg-overlay); }

        .cn-table { border-collapse: collapse; min-width: 100%; }

        .cn-th-date {
          position: sticky; left: 0; z-index: 4;
          background: var(--bg-surface);
          min-width: 80px; width: 80px;
          text-align: left;
          padding: 10px 14px;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--text-muted);
          border-right: 2px solid var(--border);
          border-bottom: 1px solid var(--border);
          font-family: var(--font-display);
        }
        .cn-th-hall {
          background: var(--bg-surface);
          padding: 10px 8px;
          text-align: center;
          font-size: 0.76rem; font-weight: 700;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border);
          border-right: 1px solid var(--border);
          white-space: nowrap;
          min-width: 60px;
        }

        .cn-td-date {
          position: sticky; left: 0; z-index: 1;
          background: var(--bg-card);
          padding: 0 14px;
          border-right: 2px solid var(--border);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
          height: 38px;
          vertical-align: middle;
        }
        .cn-td-date.is-today {
          background: rgba(201,168,76,0.07);
        }
        .cn-td-date.is-weekend {
          background: var(--bg-overlay);
        }
        .cn-date-label {
          display: flex; align-items: center; gap: 8px;
        }
        .cn-date-num {
          font-size: 0.85rem; font-weight: 700; color: var(--text-primary);
          min-width: 20px;
          font-family: var(--font-display);
        }
        .cn-date-day {
          font-size: 0.68rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase;
        }
        .cn-today-badge {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 6px var(--gold);
          flex-shrink: 0;
        }

        .cn-hall-td {
          padding: 2px;
          border-bottom: 1px solid var(--border);
          border-right: 1px solid var(--border);
          height: 38px;
          vertical-align: middle;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }

        .cn-cell {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          border-radius: 4px;
          transition: all 0.15s ease;
        }

        .cn-area-row td {
          background: var(--bg-surface);
          color: var(--text-muted);
          font-size: 0.7rem; font-weight: 500;
          padding: 7px 8px; text-align: center;
          border-bottom: 2px solid var(--border);
          border-right: 1px solid var(--border);
        }
        .cn-area-row td.cn-td-date {
          background: var(--bg-overlay);
          color: var(--text-muted);
          font-size: 0.68rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
          text-align: left;
          font-family: var(--font-display);
        }

        .cn-today-stripe {
          background: rgba(201,168,76,0.025) !important;
        }

        .cn-scroll-wrap { overflow-x: auto; overscroll-behavior-x: none; flex: 1; }
      `}</style>

      <div className="page">
        {/* ── Page header ── */}
        <div className="page-header" style={{ marginBottom: 20 }}>
          <h1 style={{ marginBottom: 4 }}>Calendar Module</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>
            Resource-based visualisation of hall availability and event schedules.
          </p>
        </div>

        {/* ── Card container ── */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}>

          {/* ── Controls bar ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-surface)',
          }}>
            {/* Month */}
            <select className="cn-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>

            {/* Year */}
            <select className="cn-select" style={{ color: 'var(--gold)' }} value={year} onChange={e => setYear(Number(e.target.value))}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            {/* Venue */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Venue</span>
              <select className="cn-select" value={selectedVenueId} onChange={e => setSelectedVenueId(e.target.value)}>
                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleSidebar}
              title={!isSidebarOpen ? 'Exit Full Screen' : 'Full Screen'}
              style={{
                background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, transition: 'all 0.2s',
              }}
            >
              {!isSidebarOpen ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>
          </div>

          {/* ── Legend ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            padding: '10px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)',
          }}>
            <LegendPill color={CELL_COLORS['cn-booked'].accent} bgColor={CELL_COLORS['cn-booked'].bg} label="Booked — Exhibition" icon={<CheckCircle2 size={12} color="#fff" strokeWidth={2.5} />} />
            <LegendPill color={CELL_COLORS['cn-mounting'].accent} bgColor={CELL_COLORS['cn-mounting'].bg} label="Mounting / Dismantling" icon={<Wrench size={12} color="#fff" strokeWidth={2.5} />} />
            <LegendPill color={CELL_COLORS['cn-reserved'].accent} bgColor={CELL_COLORS['cn-reserved'].bg} label="Reserved / In Progress" icon={<Clock size={12} color="#fff" strokeWidth={2.5} />} />
            <LegendPill color={CELL_COLORS['cn-available'].accent} bgColor={CELL_COLORS['cn-available'].bg} label="Available" icon={<Plus size={12} color={isLightTheme ? CELL_COLORS['cn-available'].text : '#60A5FA'} strokeWidth={3} />} />
            <LegendPill color={CELL_COLORS['cn-na'].accent} bgColor={CELL_COLORS['cn-na'].bg} label="Not Available" icon={<Ban size={12} color={isLightTheme ? CELL_COLORS['cn-na'].text : '#64748B'} strokeWidth={2.5} />} />
          </div>

          {/* ── Table ── */}
          <div className="cn-scroll-wrap" style={{ overflowY: isSidebarOpen ? 'visible' : 'auto' }}>
            <table className="cn-table">
              <thead>
                <tr>
                  <th className="cn-th-date">Halls</th>
                  {halls.map(h => <th key={h.name} className="cn-th-hall">{h.name}</th>)}
                </tr>
                <tr className="cn-area-row">
                  <td className="cn-td-date">Area (sqm)</td>
                  {halls.map(h => <td key={h.name}>{h.areaSqm ?? '—'}</td>)}
                </tr>
              </thead>

              <tbody>
                {daysInMonth.map((date, idx) => {
                  const today = isToday(date);
                  const weekend = isWeekend(date);
                  const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });

                  return (
                    <tr key={idx} className={today ? 'cn-today-stripe' : ''}>
                      {/* Date cell */}
                      <td className={`cn-td-date${today ? ' is-today' : ''}${weekend ? ' is-weekend' : ''}`}>
                        <div className="cn-date-label">
                          {today && <span className="cn-today-badge" />}
                          <span className="cn-date-num">{date.getDate()}</span>
                          <span className="cn-date-day">{dayName}</span>
                        </div>
                      </td>

                      {/* Hall cells */}
                      {halls.map(hall => {
                        const cellBookings = getCell(date, hall.name);
                        const hasBooking = cellBookings.length > 0;
                        const booking = cellBookings[0];
                        const cellKey = `${idx}-${hall.name}`;
                        const isHovered = hoveredCell === cellKey;

                        let statusKey = 'cn-available';
                        let IconComp = <Plus size={12} strokeWidth={3} />;

                        if (hall.notAvailable) {
                          statusKey = 'cn-na';
                          IconComp = <Ban size={12} strokeWidth={2.5} />;
                        } else if (hasBooking) {
                          statusKey = getStatusClass(booking, date);
                          if (statusKey === 'cn-booked') IconComp = <CheckCircle2 size={12} strokeWidth={2.5} />;
                          else if (statusKey === 'cn-reserved') IconComp = <Clock size={12} strokeWidth={2.5} />;
                          else if (statusKey === 'cn-mounting') IconComp = <Wrench size={12} strokeWidth={2.5} />;
                          else if (statusKey === 'cn-na') IconComp = <Ban size={12} strokeWidth={2.5} />;
                        }

                        const colors = CELL_COLORS[statusKey] || CELL_COLORS['cn-available'];
                        const cellBg = isHovered ? colors.accent : colors.bg;

                        return (
                          <td
                            key={hall.name}
                            className="cn-hall-td"
                            title={
                              hasBooking
                                ? `${booking.eventName || booking.organizer} · ${booking.status}`
                                : hall.notAvailable ? 'Not Available' : 'Available — click to book'
                            }
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() => {
                              if (hasBooking) {
                                setDetailBooking({ ...booking, _venueName: selectedVenue?.name });
                              } else if (!hall.notAvailable) {
                                setAvailableSlot({ date, hall, venue: selectedVenue });
                              }
                            }}
                          >
                            <div
                              className="cn-cell"
                              style={{
                                background: cellBg,
                                color: isHovered ? '#fff' : (colors.text || '#fff'),
                                boxShadow: isHovered ? `0 0 12px ${colors.accent}66` : 'none',
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                              }}
                            >
                              {IconComp}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>

              {/* Sticky footer repeating hall names */}
              <tfoot>
                <tr>
                  <th className="cn-th-date" style={{ position: 'sticky', bottom: 38, zIndex: 4, borderTop: '1px solid var(--border)' }}>Halls</th>
                  {halls.map(h => (
                    <th key={h.name} className="cn-th-hall" style={{ position: 'sticky', bottom: 38, zIndex: 3, borderTop: '1px solid var(--border)' }}>
                      {h.name}
                    </th>
                  ))}
                </tr>
                <tr className="cn-area-row">
                  <td className="cn-td-date" style={{ position: 'sticky', bottom: 0, zIndex: 4, background: 'var(--bg-overlay)', borderTop: '1px solid var(--border)' }}>Area (sqm)</td>
                  {halls.map(h => (
                    <td key={h.name} style={{ position: 'sticky', bottom: 0, background: 'var(--bg-overlay)', borderTop: '1px solid var(--border)' }}>
                      {h.areaSqm ?? '—'}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ── Booking detail modal ── */}
      <BookingDetailModal
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
        onEdit={onEditBooking}
        onCancel={(id) => onUpdateStatus(id, 'Cancelled')}
      />

      {/* ── Available slot modal ── */}
      {availableSlot && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'var(--modal-backdrop)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setAvailableSlot(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)', borderRadius: 14, maxWidth: 380, width: '90%',
              border: '1px solid var(--border)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.06)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '18px 22px',
              background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-overlay) 100%)',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#22C55E', marginBottom: 4 }}>
                Slot Available
              </div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {availableSlot.hall.name}
              </h2>
            </div>

            {/* Info */}
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Venue', availableSlot.venue.name],
                ['Area Size', availableSlot.hall.areaSqm ? `${availableSlot.hall.areaSqm} sqm` : 'Not specified'],
                ['Date', fmtDate(availableSlot.date)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{
              padding: '14px 22px', borderTop: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              display: 'flex', gap: 10,
            }}>
              <button
                onClick={() => setAvailableSlot(null)}
                style={{
                  flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 8,
                  background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.82rem',
                  fontWeight: 500, cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  const tzoffset = availableSlot.date.getTimezoneOffset() * 60000;
                  const localISO = (new Date(availableSlot.date - tzoffset)).toISOString().slice(0, -1);
                  const dateString = localISO.split('T')[0];
                  navigate('/bookings/new', {
                    state: { venueId: availableSlot.venue.id, hall: availableSlot.hall.name, date: dateString },
                  });
                }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px', border: 'none', borderRadius: 8,
                  background: 'var(--gold)', color: 'var(--bg-base)', fontSize: '0.82rem',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                <CalendarPlus size={15} /> Book Directly
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}