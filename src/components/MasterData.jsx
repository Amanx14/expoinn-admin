import { venues, halls, organizers } from '../data/staticData';

export default function MasterData() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Master Data</h1>
        <p>Venues, halls, and organizer registry.</p>
      </div>

      {/* Venues */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text-primary)' }}>Venues</h2>
          <button className="btn btn-ghost btn-sm">+ Add Venue</button>
        </div>
        <div className="grid-2">
          {venues.map(v => (
            <div key={v.id} className="card" style={{ borderLeft: `3px solid ${v.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.96rem', marginBottom: 4, color: 'var(--text-primary)' }}>{v.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.location}</div>
                </div>
                <span style={{ fontSize: '0.72rem', color: v.color, background: `${v.color}18`, border: `1px solid ${v.color}40`, padding: '3px 10px', borderRadius: 99 }}>
                  {v.halls.length} halls
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Halls */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text-primary)' }}>Halls & Spaces</h2>
          <button className="btn btn-ghost btn-sm">+ Add Hall</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {halls.map(h => {
            const venue = venues.find(v => v.id === h.venueId);
            return (
              <div key={h.id} className="hall-card">
                <div className="hall-card-img">
                  <span style={{ fontSize: '2.2rem', position: 'relative', zIndex: 1 }}>{h.icon}</span>
                </div>
                <div className="hall-card-body">
                  <div className="hall-card-name">{h.name}</div>
                  <div className="hall-card-meta">{venue?.name}</div>
                  <div className="hall-card-meta">{h.type} · {h.area}</div>
                  <div className="hall-capacity">👥 {h.capacity.toLocaleString()} pax</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organizers */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text-primary)' }}>Organizers</h2>
          <button className="btn btn-ghost btn-sm">+ Add Organizer</button>
        </div>
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Organizer</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizers.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 500 }}>{o.name}</td>
                  <td className="muted">{o.contact}</td>
                  <td className="muted">{o.phone}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      {/* Statuses */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 16 }}>Lifecycle Statuses</h2>
        <div className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Draft','Tentative','Confirmed','Completed','Cancelled'].map(s => (
            <span key={s} className={`status-pill ${s.toLowerCase()}`} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
