import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { venues, halls, organizers } from '../data/staticData';

function detectConflict(hallId, setupDate, dismantleDate, bookingsList) {
  if (!hallId || !setupDate || !dismantleDate) return null;
  const overlap = bookingsList.find(b => {
    if (b.hallId !== hallId) return false;
    if (b.status === 'cancelled') return false;
    const newStart = new Date(setupDate);
    const newEnd   = new Date(dismantleDate);
    const bStart   = new Date(b.setupDate);
    const bEnd     = new Date(b.dismantleDate);
    return newStart <= bEnd && newEnd >= bStart;
  });
  return overlap || null;
}

const INITIAL = {
  venueId: '', hallId: '', organizerId: '',
  eventName: '', sector: '', industry: '', eventType: '',
  setupDate: '', eventDate: '', dismantleDate: '',
};

export default function BookingForm({ bookings: bookingsList, onSave }) {
  const [form, setForm]       = useState(INITIAL);
  const [conflict, setConflict] = useState(null);
  const [saved, setSaved]     = useState(false);

  const availableHalls = halls.filter(h => !form.venueId || h.venueId === form.venueId);

  const set = (key, val) => {
    const updated = { ...form, [key]: val };
    if (key === 'venueId') updated.hallId = '';
    setForm(updated);
    setSaved(false);

    const c = detectConflict(
      updated.hallId,
      updated.setupDate,
      updated.dismantleDate,
      bookingsList
    );
    setConflict(c);
  };

  const handleSave = (status) => {
    if (conflict) return;
    const newId = `BK-${new Date().getFullYear()}-${String(bookingsList.length + 1).padStart(3, '0')}`;
    const newBooking = {
      ...form,
      id: newId,
      status: status.toLowerCase(),
      revenue: Math.floor(Math.random() * 2000000) + 500000, // Simulated revenue
    };
    onSave(newBooking);
    setSaved(status);
    setForm(INITIAL);
    setConflict(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>New Booking Request</h1>
        <p>Fill in all details. Conflicts are detected automatically on save.</p>
      </div>

      {/* Conflict alert */}
      {conflict && (
        <div className="conflict-alert">
          <AlertTriangle size={18} style={{ color: '#F87171', flexShrink: 0, marginTop: 1 }} />
          <div className="conflict-alert-text">
            <strong>Conflict detected!</strong> The selected hall is already booked by <strong>{conflict.eventName}</strong> ({conflict.id}) from {conflict.setupDate} to {conflict.dismantleDate}. Please choose different dates or another hall.
          </div>
        </div>
      )}

      {/* Success */}
      {saved && (
        <div className="success-alert">
          <CheckCircle2 size={18} style={{ color: '#4ADE80', flexShrink: 0, marginTop: 1 }} />
          <div className="success-alert-text">
            Booking saved as <strong>{saved}</strong> successfully. The organizer will be notified.
          </div>
        </div>
      )}

      <div className="grid-7030" style={{ alignItems: 'flex-start' }}>
        <div className="card">
          {/* Venue & Hall */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14, fontWeight: 500 }}>Venue & Hall</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Venue</label>
                <select className="form-select" value={form.venueId} onChange={e => set('venueId', e.target.value)}>
                  <option value="">Select venue…</option>
                  {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hall</label>
                <select className="form-select" value={form.hallId} onChange={e => set('hallId', e.target.value)} disabled={!form.venueId}>
                  <option value="">Select hall…</option>
                  {availableHalls.map(h => <option key={h.id} value={h.id}>{h.name} (cap. {h.capacity.toLocaleString()})</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Organizer & Event */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14, fontWeight: 500 }}>Organizer & Event</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Organizer</label>
                <select className="form-select" value={form.organizerId} onChange={e => set('organizerId', e.target.value)}>
                  <option value="">Select organizer…</option>
                  {organizers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Event Name</label>
                <input className="form-input" value={form.eventName} onChange={e => set('eventName', e.target.value)} placeholder="e.g. EPCH Textiles Expo 2025" />
              </div>
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select className="form-select" value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                  <option value="">Select type…</option>
                  {['Exhibition','Conference','Wedding','Seminar','Product Launch','Corporate','Other'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Industry / Sector</label>
                <input className="form-input" value={form.sector} onChange={e => set('sector', e.target.value)} placeholder="e.g. Textiles & Handicrafts" />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14, fontWeight: 500 }}>Dates</div>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Setup Date</label>
                <input className="form-input" type="date" value={form.setupDate} onChange={e => set('setupDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Event Date</label>
                <input className="form-input" type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Dismantle Date</label>
                <input className="form-input" type="date" value={form.dismantleDate} onChange={e => set('dismantleDate', e.target.value)} />
              </div>
            </div>
          </div>


          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-ghost"
              onClick={() => handleSave('Tentative')}
              disabled={!!conflict || !form.eventName || !form.hallId}
            >
              Save as Tentative
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleSave('Confirmed')}
              disabled={!!conflict || !form.eventName || !form.hallId || !form.setupDate}
            >
              Save as Confirmed
            </button>
          </div>
        </div>

        {/* Side info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {form.hallId && (() => {
            const hall = halls.find(h => h.id === form.hallId);
            return (
              <div className="card" style={{ border: '1px solid var(--gold-border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hall Details</div>
                <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{hall.icon}</div>
                <div style={{ fontWeight: 500, marginBottom: 5 }}>{hall.name}</div>
                <div className="hall-card-meta">{venue?.name}</div>
                <div className="hall-card-meta">{hall?.type} · {hall?.area}</div>
              </div>
            );
          })()}

          <div className="card">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lifecycle States</div>
            {[
              { s: 'Draft', desc: 'Initial entry, not confirmed' },
              { s: 'Tentative', desc: 'Slot held, deposit pending' },
              { s: 'Confirmed', desc: 'Blocked — no overlap allowed' },
              { s: 'Completed', desc: 'Post-event, record archived' },
            ].map(({ s, desc }) => (
              <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                <span className={`status-pill ${s.toLowerCase()}`} style={{ flexShrink: 0, marginTop: 1 }}>{s}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
