import { useState, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  Building2, 
  User, 
  Tag, 
  AlertTriangle, 
  CheckCircle2, 
  Plus
} from 'lucide-react';

export default function BookingForm({ 
  bookings, 
  venues, 
  organizers, 
  industries, 
  sectors, 
  onSave 
}) {
  const [formData, setFormData] = useState({
    eventName: '',
    venueId: venues[0]?.id || '',
    hall: '',
    organizer: organizers[0] || '',
    industry: industries[0] || '',
    sectors: [],
    eventType: 'Corporate Event',
    setupDate: '',
    eventStartDate: '',
    eventEndDate: '',
    dismantleDate: '',
    status: 'Tentative',
    revenue: 0,
    guests: 0,
  });

  const [errors, setErrors] = useState({});

  // Filter halls based on selected venue
  const availableHalls = useMemo(() => {
    const venue = venues.find(v => v.id === formData.venueId);
    return venue ? venue.halls : [];
  }, [venues, formData.venueId]);

  // Set first hall as default when venue changes
  useMemo(() => {
    if (availableHalls.length > 0) {
      const hallNames = availableHalls.map(h => h.name);
      if (!hallNames.includes(formData.hall)) {
        setFormData(prev => ({ ...prev, hall: hallNames[0] }));
      }
    }
  }, [availableHalls, formData.hall]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleSector = (sector) => {
    setFormData(prev => {
      const newSectors = prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector];
      return { ...prev, sectors: newSectors };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.eventName) newErrors.eventName = 'Event name is required';
    if (!formData.eventStartDate) newErrors.eventStartDate = 'Start date is required';
    if (!formData.eventEndDate) newErrors.eventEndDate = 'End date is required';
    if (!formData.venueId) newErrors.venueId = 'Venue is required';
    if (!formData.hall) newErrors.hall = 'Hall is required';

    // Date logic: Setup <= Event Start <= Event End <= Dismantle
    const setup = formData.setupDate ? new Date(formData.setupDate) : null;
    const eventS = new Date(formData.eventStartDate);
    const eventE = new Date(formData.eventEndDate);
    const dismantle = formData.dismantleDate ? new Date(formData.dismantleDate) : null;

    if (eventS > eventE) {
      newErrors.eventEndDate = 'Event end cannot be before event start';
    }
    if (setup && setup > eventS) {
      newErrors.setupDate = 'Setup cannot be after event start';
    }
    if (dismantle && dismantle < eventE) {
      newErrors.dismantleDate = 'Dismantle cannot be before event end';
    }

    // Conflict detection
    if (formData.status === 'Confirmed') {
      const hasConflict = bookings.some(b => {
        if (b.status !== 'Confirmed') return false;
        if (b.venueId !== formData.venueId || b.hall !== formData.hall) return false;
        
        const bStart = new Date(b.setupDate || b.eventStartDate).getTime();
        const bEnd = new Date(b.dismantleDate || b.eventEndDate).getTime();
        const fStart = new Date(formData.setupDate || formData.eventStartDate).getTime();
        const fEnd = new Date(formData.dismantleDate || formData.eventEndDate).getTime();
        
        return (fStart <= bEnd && fEnd >= bStart);
      });

      if (hasConflict) {
        newErrors.conflict = 'This hall is already confirmed for these dates. Please resolve the conflict or choose different dates.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const newId = `b${bookings.length + 101}`;
      onSave({ 
        ...formData, 
        id: newId, 
        revenue: Number(formData.revenue) || 0,
        guests: Number(formData.guests) || 0
      });
    }
  };

  return (
    <div className="page" style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="page-header">
        <h1>New Booking Block</h1>
        <p>Reserve space using the synchronized frontend data model.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-7030" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">Event Basics</div>
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Event Name</label>
                <input 
                  className={`form-input ${errors.eventName ? 'error' : ''}`}
                  name="eventName" 
                  placeholder="e.g. Future of Digital Tech 2026"
                  value={formData.eventName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-grid" style={{ marginBottom: 18 }}>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select className="form-select" name="industry" value={formData.industry} onChange={handleChange}>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <select className="form-select" name="eventType" value={formData.eventType} onChange={handleChange}>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Conference">Conference</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Sectors</label>
                <div className="sectors-chip-grid">
                  {sectors.map(s => (
                    <div 
                      key={s} 
                      className={`sector-chip ${formData.sectors.includes(s) ? 'active' : ''}`}
                      onClick={() => toggleSector(s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">Location & Logistics</div>
              <div className="form-grid" style={{ marginBottom: 18 }}>
                <div className="form-group">
                  <label className="form-label"><MapPin size={12} /> Venue</label>
                  <select className="form-select" name="venueId" value={formData.venueId} onChange={handleChange}>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label"><Building2 size={12} /> Hall</label>
                  <select className="form-select" name="hall" value={formData.hall} onChange={handleChange}>
                    {availableHalls.map(h => <option key={h.name} value={h.name}>{h.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><User size={12} /> Organizer</label>
                <select className="form-select" name="organizer" value={formData.organizer} onChange={handleChange}>
                  {organizers.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="card">
              <div className="section-title"><Calendar size={12} /> Event Schedule</div>
              <div className="date-range-row">
                <div className="range-label">Setup</div>
                <input type="date" className="form-input" name="setupDate" value={formData.setupDate} onChange={handleChange} />
              </div>
              <div className="date-range-row">
                <div className="range-label" style={{ color: 'var(--gold)' }}>Event Live</div>
                <div className="range-inputs">
                  <input type="date" className="form-input" name="eventStartDate" value={formData.eventStartDate} onChange={handleChange} />
                  <span className="range-sep">➜</span>
                  <input type="date" className="form-input" name="eventEndDate" value={formData.eventEndDate} onChange={handleChange} />
                </div>
              </div>
              <div className="date-range-row">
                <div className="range-label">Dismantle</div>
                <input type="date" className="form-input" name="dismantleDate" value={formData.dismantleDate} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">Commercials</div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Initial Status</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="Tentative">Tentative</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Est. Revenue (₹)</label>
                <input type="number" className="form-input" name="revenue" value={formData.revenue} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Expected Guests</label>
                <input type="number" className="form-input" name="guests" value={formData.guests} onChange={handleChange} />
              </div>

              {errors.conflict && (
                <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: 8, marginBottom: 20, border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.8rem', color: '#FCA5A5' }}>
                  <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  {errors.conflict}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={16} /> Create Booking
              </button>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
               <CheckCircle2 size={16} style={{ color: 'var(--gold)', marginBottom: 10 }} />
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                 Validation and conflict checking will be applied against the master booking registry.
               </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
