import { Building2, User, LayoutGrid, MapPin } from 'lucide-react';

export default function MasterData({ 
  venues, 
  organizers, 
  onAddVenue, 
  onAddHall, 
  currentUser
}) {
  const isAdmin = currentUser?.role === 'Admin';
  
  return (
    <div className="page">
      <div className="page-header">
        <h1>Master Data Configuration</h1>
        <p>Manage raw assets, organizer registries, and operational parameters.</p>
      </div>

      {/* Venues & Halls combined section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Venue Hierarchy</h2>
          {isAdmin && (
            <button className="btn btn-ghost btn-sm" onClick={() => onAddVenue({ id: `v${venues.length + 1}`, name: 'New Prime Venue', location: 'Delhi NCR', halls: [], color: '#C9A84C', coverImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000&auto=format&fit=crop' })}>+ Add Venue</button>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {venues.map(v => (
            <div key={v.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', border: `2px solid ${v.color}44` }}>
                    <img src={v.coverImage} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{v.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.location}</div>
                  </div>
                </div>
                {isAdmin && (
                  <button className="btn btn-primary btn-sm" onClick={() => onAddHall(v.id, `New Hall ${v.halls.length + 1}`)}>+ Add Hall</button>
                )}
              </div>

              <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  {v.halls.map(h => (
                    <div key={h.name} className="hall-card-mini" style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-overlay)', padding: 8, borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ width: 50, height: 50, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={h.image} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Ready for booking</div>
                      </div>
                    </div>
                  ))}
                  {v.halls.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: 10 }}>No halls configured for this venue.</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Organizers */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Organizer Registry</h2>
        </div>
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {organizers.map((o, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-overlay)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{o}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 15 }}>Event Lifecycle Status</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Draft', 'Tentative', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
              <span key={s} className={`status-pill ${s.toLowerCase()}`}>{s}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 15 }}>Event Categories</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Exhibition', 'Conference', 'Corporate', 'Social', 'Entertainment'].map(c => (
              <span key={c} style={{ fontSize: '0.78rem', background: 'var(--bg-overlay)', padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
