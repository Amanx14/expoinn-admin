import { MapPin, Building2, LayoutGrid, ArrowRight } from 'lucide-react';

export default function Venues({ venues }) {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Venue Catalog</h1>
        <p>Browse available venues and their respective halls across the Delhi NCR region.</p>
      </div>

      <div className="grid-3">
        {venues.map((venue) => (
          <div key={venue.id} className="card venue-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="venue-card-img-wrap" style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
              <img 
                src={venue.coverImage} 
                alt={venue.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(17,25,39,0.9), transparent)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 15, right: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ padding: '4px 10px', borderRadius: 99, background: 'rgba(201,168,76,0.2)', backdropFilter: 'blur(4px)', color: 'var(--gold)', fontSize: '0.68rem', fontWeight: 600, border: '1px solid rgba(201,168,76,0.3)' }}>
                    {venue.halls.length} Configured Halls
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 15 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 4 }}>{venue.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <MapPin size={12} />
                  {venue.location}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>Featured Spaces</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {venue.halls.slice(0, 4).map((hall) => (
                    <div 
                      key={hall.name} 
                      style={{ 
                        position: 'relative',
                        height: 70,
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <img src={hall.image} alt={hall.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,25,39,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#fff', textAlign: 'center', lineHeight: 1.1 }}>{hall.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 20, justifyContent: 'center', border: '1px solid var(--border)' }}>
                View Availability <ArrowRight size={14} style={{ marginLeft: 6 }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats summary */}
      <div className="grid-3" style={{ marginTop: 30 }}>
         <div className="stat-card">
            <div className="stat-label">Enterprise Venues</div>
            <div className="stat-value">{venues.length}</div>
            <div className="stat-sub">Managed via central engine</div>
         </div>
         <div className="stat-card">
            <div className="stat-label">Visual Assets</div>
            <div className="stat-value">{venues.reduce((acc, v) => acc + v.halls.length, 0)}</div>
            <div className="stat-sub">High-resolution floor previews</div>
         </div>
         <div className="stat-card">
            <div className="stat-label">Market Coverage</div>
            <div className="stat-value">NCR</div>
            <div className="stat-sub">Central & Greater Noida</div>
         </div>
      </div>
    </div>
  );
}
