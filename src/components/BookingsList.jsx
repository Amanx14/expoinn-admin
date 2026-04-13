import { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { bookings, halls, venues } from '../data/staticData';

function StatusPill({ status }) {
  return <span className={`status-pill ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

const ALL_STATUSES = ['all', 'confirmed', 'tentative', 'draft', 'completed', 'cancelled'];

export default function BookingsList({ onNav, bookings, onUpdateStatus }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchSearch = !search || b.eventName.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>All Bookings</h1>
          <p>{bookings.length} total bookings across {venues.length} venues</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm"><Download size={14} /> Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => onNav('new-booking')}>+ New Booking</button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search event or booking ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Event Name</th>
              <th>Venue / Hall</th>
              <th>Event Type</th>
              <th>Event Date</th>
              <th>Revenue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No bookings match your filters.
                </td>
              </tr>
            ) : (
              filtered.map(b => {
                const hall  = halls.find(h => h.id === b.hallId);
                const venue = venues.find(v => v.id === b.venueId);
                return (
                  <tr key={b.id}>
                    <td>
                      <span style={{ color: 'var(--gold)', fontWeight: 500, fontSize: '0.82rem' }}>{b.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.86rem' }}>{b.eventName}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{b.sector}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.84rem' }}>{hall?.name}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{venue?.name}</div>
                    </td>
                    <td className="muted">{b.eventType}</td>
                    <td className="muted">{b.eventDate}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>₹{(b.revenue / 100000).toFixed(1)}L</td>
                    <td><StatusPill status={b.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(b.status === 'tentative' || b.status === 'draft') && (
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ color: 'var(--status-confirmed-txt)', borderColor: 'var(--status-confirmed-bg)' }}
                            onClick={() => onUpdateStatus(b.id, 'confirmed')}
                          >
                            Confirm
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ color: 'var(--status-completed-txt)', borderColor: 'var(--status-completed-bg)' }}
                            onClick={() => onUpdateStatus(b.id, 'completed')}
                          >
                            Complete
                          </button>
                        )}
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ color: 'var(--status-cancelled-txt)', borderColor: 'var(--status-cancelled-bg)' }}
                            onClick={() => onUpdateStatus(b.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        )}
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
