import { useMemo, useState } from 'react';
import { Calendar, Download, Search, Edit3, Trash2, Filter, AlertTriangle } from 'lucide-react';

function StatusPill({ status }) {
  const s = status.toLowerCase();
  return <span className={`status-pill ${s}`}>{status}</span>;
}

const ALL_STATUSES = ['all', 'confirmed', 'tentative', 'draft', 'completed', 'cancelled'];

export default function BookingsList({
  bookings, venues, industries = [], onNav,
  onUpdateStatus, onEditBooking, onDeleteBooking
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [venueFilter, setVenueFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [conflictAlert, setConflictAlert] = useState(null);

  const filtered = useMemo(
    () =>
      bookings.filter((booking) => {
        const searchValue = search.toLowerCase();
        const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter;
        const matchesVenue = venueFilter === 'all' || booking.venueId === venueFilter;
        const matchesIndustry = industryFilter === 'all' || booking.industry === industryFilter;
        const matchesSearch =
          !searchValue ||
          (booking.eventName && booking.eventName.toLowerCase().includes(searchValue)) ||
          booking.id.toLowerCase().includes(searchValue) ||
          booking.organizer.toLowerCase().includes(searchValue);

        // Date range filter
        let matchesDate = true;
        if (dateFrom) {
          matchesDate = matchesDate && booking.eventStartDate >= dateFrom;
        }
        if (dateTo) {
          matchesDate = matchesDate && booking.eventEndDate <= dateTo;
        }

        return matchesStatus && matchesVenue && matchesSearch && matchesIndustry && matchesDate;
      }),
    [bookings, search, statusFilter, venueFilter, industryFilter, dateFrom, dateTo],
  );

  const handleStatusChange = (bookingId, newStatus) => {
    // Skip conflict check for terminal statuses
    if (newStatus === 'Cancelled' || newStatus === 'Completed') {
      onUpdateStatus(bookingId, newStatus);
      return;
    }

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Check for overlapping active bookings on the same venue+hall
    const activeStatuses = ['Draft', 'Tentative', 'Confirmed'];
    const conflicts = bookings.filter(b => {
      if (b.id === bookingId) return false;
      if (!activeStatuses.includes(b.status)) return false;
      if (b.venueId !== booking.venueId || b.hall !== booking.hall) return false;

      const bStart = new Date(b.setupDate || b.eventStartDate).getTime();
      const bEnd = new Date(b.dismantleDate || b.eventEndDate).getTime();
      const fStart = new Date(booking.setupDate || booking.eventStartDate).getTime();
      const fEnd = new Date(booking.dismantleDate || booking.eventEndDate).getTime();

      return (fStart <= bEnd && fEnd >= bStart);
    });

    if (conflicts.length > 0) {
      const conflictNames = conflicts.map(c => `${c.eventName} (${c.status})`).join(', ');
      setConflictAlert({
        bookingId,
        newStatus,
        message: `Cannot change status — this would create a duplicate booking. "${booking.eventName}" overlaps with: ${conflictNames} on the same hall (${booking.hall}). Please resolve the date overlap first.`,
      });
      return;
    }

    onUpdateStatus(bookingId, newStatus);
  };

  const handleDelete = (id) => {
    onDeleteBooking(id);
    setDeleteConfirm(null);
  };

  const exportBookings = () => {
    const headers = ['ID', 'Event', 'Organizer', 'Venue', 'Hall', 'Type', 'Industry', 'Start', 'End', 'Status', 'Availability', 'Revenue'];
    const lines = [headers.join(',')];

    filtered.forEach((b) => {
      const venueName = venues.find(v => v.id === b.venueId)?.name || 'Unknown';
      const line = [
        b.id,
        `"${b.eventName}"`,
        `"${b.organizer}"`,
        `"${venueName}"`,
        `"${b.hall}"`,
        b.eventType,
        b.industry,
        b.eventStartDate,
        b.eventEndDate,
        b.status,
        b.availability || 'N/A',
        b.revenue
      ].join(',');
      lines.push(line);
    });

    const csv = lines.join('\n');
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = 'bookings_export.csv';
    link.click();
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setVenueFilter('all');
    setIndustryFilter('all');
    setSearch('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = statusFilter !== 'all' || venueFilter !== 'all' || industryFilter !== 'all' || search || dateFrom || dateTo;

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Bookings Registry</h1>
          <p>Complete lifecycle tracking of all venue and hall reservations.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={exportBookings}><Download size={14} /> Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => onNav('new-booking')}>+ New Booking</button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search event, organizer or ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
        <div style={{ width: 160 }}>
          <select
            className="form-select"
            value={venueFilter}
            onChange={(e) => setVenueFilter(e.target.value)}
            style={{ height: '36px', fontSize: '0.82rem' }}
          >
            <option value="all">All Venues</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div style={{ width: 160 }}>
          <select
            className="form-select"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            style={{ height: '36px', fontSize: '0.82rem' }}
          >
            <option value="all">All Industries</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      {/* Date range + Status chips */}
      <div className="filters-bar" style={{ marginTop: -8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>From</span>
          <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: 150, padding: '6px 10px', fontSize: '0.8rem' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>To</span>
          <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: 150, padding: '6px 10px', fontSize: '0.8rem' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              className={`filter-chip ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ fontSize: '0.72rem', color: '#F87171' }}>
            <Filter size={12} /> Clear
          </button>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Event & Sectors</th>
              <th>Venue / Hall</th>
              <th>Organizer</th>
              <th>Dates</th>
              <th>Revenue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No bookings match your current search criteria.
                </td>
              </tr>
            ) : (
              filtered.map((booking) => {
                const venue = venues.find((item) => item.id === booking.venueId);

                return (
                  <tr key={booking.id}>
                    <td>
                      <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.82rem' }}>{booking.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{booking.eventName}</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                        {(booking.sectors || []).map((sector) => (
                          <span key={sector} style={{ fontSize: '0.64rem', background: 'var(--bg-overlay)', padding: '1px 6px', borderRadius: 4, color: 'var(--text-muted)' }}>{sector}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.84rem' }}>{booking.hall}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{venue?.name}</div>
                    </td>
                    <td className="muted">{booking.organizer}</td>
                    <td className="muted">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={12} />
                        <span style={{ fontSize: '0.8rem' }}>
                          {booking.eventStartDate} — {booking.eventEndDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: 2 }}>
                        Lock: {booking.setupDate} / {booking.dismantleDate}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{(booking.revenue / 100000).toFixed(1)}L</td>
                    <td>
                      <select
                        className={`status-select ${booking.status.toLowerCase()}`}
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {['Draft', 'Tentative', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Edit booking"
                          onClick={(e) => { e.stopPropagation(); onEditBooking(booking); }}
                          style={{ padding: '5px 8px' }}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Delete booking"
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(booking.id); }}
                          style={{ padding: '5px 8px', color: '#F87171', borderColor: 'rgba(239,68,68,0.2)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, width: '90%' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete booking <strong style={{ color: 'var(--gold)' }}>{deleteConfirm}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict alert modal */}
      {conflictAlert && (
        <div className="modal-overlay" onClick={() => setConflictAlert(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, width: '90%' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', color: '#F87171', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} /> Duplicate Booking Conflict
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                {conflictAlert.message}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setConflictAlert(null)}>Dismiss</button>
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(200,160,60,0.15)', color: 'var(--gold)', border: '1px solid rgba(200,160,60,0.3)' }}
                onClick={() => { setConflictAlert(null); onEditBooking(bookings.find(b => b.id === conflictAlert.bookingId)); }}
              >
                <Edit3 size={13} /> Edit Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
