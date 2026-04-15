import { useState } from 'react';
import { Building2, User, Plus, X, Edit3, Trash2, Check } from 'lucide-react';

// Reusable CRUD section for string-based master entities
function MasterCrudSection({ title, items, handlers, isAdmin, icon: Icon }) {
  const [newItem, setNewItem] = useState('');
  const [editingIdx, setEditingIdx] = useState(-1);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed || items.includes(trimmed)) return;
    handlers.add(trimmed);
    setNewItem('');
  };

  const startEdit = (idx) => {
    setEditingIdx(idx);
    setEditValue(items[idx]);
  };

  const confirmEdit = (oldVal) => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== oldVal) {
      handlers.update(oldVal, trimmed);
    }
    setEditingIdx(-1);
    setEditValue('');
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon && <Icon size={16} style={{ color: 'var(--gold)' }} />}
          {title}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 400, marginLeft: 4 }}>({items.length})</span>
        </h2>
      </div>
      <div className="card">
        <div className="master-grid">
          {items.map((item, idx) => (
            <div key={idx} className="crud-item">
              {editingIdx === idx ? (
                <>
                  <input
                    className="form-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmEdit(item)}
                    autoFocus
                    style={{ padding: '6px 10px', fontSize: '0.82rem', flex: 1 }}
                  />
                  <div className="crud-item-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => confirmEdit(item)} style={{ color: '#4ADE80' }}><Check size={12} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingIdx(-1)}><X size={12} /></button>
                  </div>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '0.84rem', fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item}</span>
                  {isAdmin && (
                    <div className="crud-item-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(idx)}><Edit3 size={11} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handlers.remove(item)} style={{ color: '#F87171' }}><Trash2 size={11} /></button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        {isAdmin && (
          <div className="inline-add-row">
            <input
              className="form-input"
              placeholder={`Add new ${title.toLowerCase().replace(/s$/, '')}...`}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button className="btn btn-primary btn-sm" onClick={handleAdd} style={{ flexShrink: 0 }}>
              <Plus size={14} /> Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Prime Period CRUD (object-based)
function PrimePeriodSection({ items, handlers, isAdmin }) {
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('HD');

  const handleAdd = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    handlers.add({ label: trimmed, type: newType });
    setNewLabel('');
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Prime Periods
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 400, marginLeft: 8 }}>({items.length})</span>
        </h2>
      </div>
      <div className="card">
        <div className="master-grid">
          {items.map((item, idx) => (
            <div key={idx} className="crud-item">
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 500 }}>{item.label}</span>
                <span style={{
                  fontSize: '0.64rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                  background: item.type === 'HD' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                  color: item.type === 'HD' ? '#F87171' : '#4ADE80',
                }}>{item.type}</span>
              </div>
              {isAdmin && (
                <div className="crud-item-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => handlers.remove(item)} style={{ color: '#F87171' }}><Trash2 size={11} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
        {isAdmin && (
          <div className="inline-add-row">
            <input
              className="form-input"
              placeholder="e.g. Jan-Mar (HD)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <select className="form-select" value={newType} onChange={(e) => setNewType(e.target.value)} style={{ width: 80, padding: '8px 10px', fontSize: '0.82rem' }}>
              <option value="HD">HD</option>
              <option value="LD">LD</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={handleAdd} style={{ flexShrink: 0 }}>
              <Plus size={14} /> Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MasterData({ 
  venues, 
  organizers,
  industries,
  sectors,
  eventStatuses,
  eventTypes,
  primePeriods,
  onAddVenue, 
  onAddHall,
  masterCrudHandlers,
  currentUser
}) {
  const isAdmin = currentUser?.role === 'Admin';
  
  return (
    <div className="page">
      <div className="page-header">
        <h1>Master Data Configuration</h1>
        <p>Manage raw assets, organizer registries, and operational parameters. {!isAdmin && <span style={{ color: '#FBBF24' }}>(View Only — Admin access required for edits)</span>}</p>
      </div>

      {/* Venues & Halls combined section */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={16} style={{ color: 'var(--gold)' }} />
            Venue Hierarchy
          </h2>
          {isAdmin && (
            <button className="btn btn-ghost btn-sm" onClick={() => onAddVenue({ id: `v${venues.length + 1}`, name: 'New Prime Venue', location: 'Delhi NCR', halls: [], color: '#C9A84C', coverImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000&auto=format&fit=crop' })}>+ Add Venue</button>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {venues.map(v => (
            <div key={v.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', border: `2px solid ${v.color}44` }}>
                    <img src={v.coverImage} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{v.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.location} · {v.halls.length} halls</div>
                  </div>
                </div>
                {isAdmin && (
                  <button className="btn btn-primary btn-sm" onClick={() => onAddHall(v.id, `New Hall ${v.halls.length + 1}`)}>+ Add Hall</button>
                )}
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {v.halls.map(h => (
                    <div key={h.name} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-overlay)', padding: 8, borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ width: 50, height: 50, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={h.image} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Ready for booking</div>
                      </div>
                    </div>
                  ))}
                  {v.halls.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: 10 }}>No halls configured.</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Organizers */}
      <MasterCrudSection title="Organizers" items={organizers} handlers={masterCrudHandlers.organizers} isAdmin={isAdmin} icon={User} />

      {/* Industries */}
      <MasterCrudSection title="Industries" items={industries} handlers={masterCrudHandlers.industries} isAdmin={isAdmin} />

      {/* Sectors */}
      <MasterCrudSection title="Sectors" items={sectors} handlers={masterCrudHandlers.sectors} isAdmin={isAdmin} />

      {/* Event Statuses */}
      <MasterCrudSection title="Event Statuses" items={eventStatuses} handlers={masterCrudHandlers.eventStatuses} isAdmin={isAdmin} />

      {/* Event Types */}
      <MasterCrudSection title="Event Types" items={eventTypes} handlers={masterCrudHandlers.eventTypes} isAdmin={isAdmin} />

      {/* Prime Periods */}
      <PrimePeriodSection items={primePeriods} handlers={masterCrudHandlers.primePeriods} isAdmin={isAdmin} />
    </div>
  );
}
