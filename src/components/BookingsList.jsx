import { useMemo, useState } from 'react';
import { Calendar, Download, Search } from 'lucide-react';

function StatusPill({ status }) {
  const s = status.toLowerCase();
  return <span className={`status-pill ${s}`}>{status}</span>;
}

const ALL_STATUSES = ['all', 'confirmed', 'tentative', 'draft', 'completed', 'cancelled'];

export default function BookingsList({ bookings, venues, onNav, onUpdateStatus }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [venueFilter, setVenueFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      bookings.filter((booking) => {
        const searchValue = search.toLowerCase();
        const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter;
        const matchesVenue = venueFilter === 'all' || booking.venueId === venueFilter;
        const matchesSearch =
          !searchValue ||
          (booking.eventName && booking.eventName.toLowerCase().includes(searchValue)) ||
          booking.id.toLowerCase().includes(searchValue) ||
          booking.organizer.toLowerCase().includes(searchValue);

        return matchesStatus && matchesVenue && matchesSearch;
      }),
    [bookings, search, statusFilter, venueFilter],
  );

  const exportBookings = () => {
    const headers = ['ID', 'Event', 'Organizer', 'Venue', 'Hall', 'Type', 'Start', 'End', 'Status', 'Revenue'];
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
        b.eventStartDate,
        b.eventEndDate,
        b.status,
        b.revenue
      ].join(',');
      lines.push(line);
    });

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bookings_export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

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
        <div style={{ width: 180 }}>
          <select 
            className="form-select" 
            value={venueFilter} 
            onChange={(e) => setVenueFilter(e.target.value)}
            style={{ height: '36px', fontSize: '0.85rem' }}
          >
            <option value="all">All Venues</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
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
      </div>

      <div className="card">
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
                          {booking.eventStartDate} - {booking.eventEndDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: 2 }}>
                        Lock: {booking.setupDate} / {booking.dismantleDate}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{(booking.revenue / 100000).toFixed(1)}L</td>
                    <td><StatusPill status={booking.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => onUpdateStatus(booking.id, booking.status.toLowerCase() === 'confirmed' ? 'completed' : 'confirmed')}
                        >
                          Update
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
    </div>
  );
}
