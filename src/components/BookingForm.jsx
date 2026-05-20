import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Building2, 
  User, 
  Tag, 
  AlertTriangle, 
  CheckCircle2, 
  Plus,
  Save
} from 'lucide-react';

export default function BookingForm({ 
  bookings, 
  venues, 
  organizers, 
  industries, 
  sectors,
  eventTypes = ['Corporate Event', 'Exhibition', 'Wedding', 'Entertainment', 'Conference'],
  eventStatuses = ['Draft', 'Tentative', 'Confirmed'],
  onSave,
  editBooking = null,
}) {
  const isEditMode = !!editBooking;
  const location = useLocation();

  const getInitialFormData = () => {
    if (editBooking) {
      return {
        eventName: editBooking.eventName || '',
        venueId: editBooking.venueId || venues[0]?.id || '',
        hall: editBooking.hall || '',
        organizer: editBooking.organizer || organizers[0] || '',
        industry: editBooking.industry || industries[0] || '',
        sectors: editBooking.sectors || [],
        eventType: editBooking.eventType || eventTypes[0] || 'Corporate Event',
        setupDate: editBooking.setupDate || '',
        eventStartDate: editBooking.eventStartDate || '',
        eventEndDate: editBooking.eventEndDate || '',
        dismantleDate: editBooking.dismantleDate || '',
        status: editBooking.status || 'Tentative',
        availability: editBooking.availability || 'Required',
        revenue: editBooking.revenue || 0,
        guests: editBooking.guests || 0,
      };
    }

    const state = location.state || {};

    return {
      eventName: '',
      venueId: state.venueId || venues[0]?.id || '',
      hall: state.hall || '',
      organizer: organizers[0] || '',
      industry: industries[0] || '',
      sectors: [],
      eventType: eventTypes[0] || 'Corporate Event',
      setupDate: '',
      eventStartDate: state.date || '',
      eventEndDate: '',
      dismantleDate: '',
      status: 'Tentative',
      availability: 'Required',
      revenue: 0,
      guests: 0,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});
  const [selectionMode, setSelectionMode] = useState(() => {
    if (editBooking && editBooking.hall) {
      const isMulti = editBooking.hall.includes(',') || Array.isArray(editBooking.hall);
      return isMulti ? 'multiple' : 'single';
    }
    return 'single';
  });

  // Reset form when editBooking changes
  useEffect(() => {
    setFormData(getInitialFormData());
    setErrors({});
    if (editBooking && editBooking.hall) {
      const isMulti = editBooking.hall.includes(',') || Array.isArray(editBooking.hall);
      setSelectionMode(isMulti ? 'multiple' : 'single');
    } else {
      setSelectionMode('single');
    }
  }, [editBooking]);

  // Filter halls based on selected venue
  const availableHalls = useMemo(() => {
    const venue = venues.find(v => v.id === formData.venueId);
    return venue ? venue.halls : [];
  }, [venues, formData.venueId]);

  // Set first hall as default when venue changes
  useMemo(() => {
    if (availableHalls.length > 0) {
      const hallNames = availableHalls.map(h => h.name);
      const selected = (formData.hall || '').split(',').map(h => h.trim()).filter(Boolean);
      const hasValidHall = selected.some(h => hallNames.includes(h));
      if (!hasValidHall) {
        setFormData(prev => ({ ...prev, hall: hallNames[0] }));
      }
    }
  }, [availableHalls, formData.hall]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const selectedHallsList = useMemo(() => {
    if (!formData.hall) return [];
    return formData.hall.split(',').map(h => h.trim()).filter(Boolean);
  }, [formData.hall]);

  const handleHallClick = (hallName) => {
    if (selectionMode === 'single') {
      setFormData(prev => ({ ...prev, hall: hallName }));
    } else {
      setFormData(prev => {
        let list = prev.hall.split(',').map(h => h.trim()).filter(Boolean);
        if (list.includes(hallName)) {
          list = list.filter(h => h !== hallName);
        } else {
          list = [...list, hallName];
        }
        return { ...prev, hall: list.join(', ') };
      });
    }
    if (errors.hall) setErrors(prev => ({ ...prev, hall: '' }));
  };

  const toggleSector = (sector) => {
    setFormData(prev => {
      const newSectors = prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector];
      return { ...prev, sectors: newSectors };
    });
    if (errors.sectors) setErrors(prev => ({ ...prev, sectors: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.eventName) newErrors.eventName = 'Event name is required';
    if (!formData.setupDate) newErrors.setupDate = 'Setup date is required';
    if (!formData.eventStartDate) newErrors.eventStartDate = 'Start date is required';
    if (!formData.eventEndDate) newErrors.eventEndDate = 'End date is required';
    if (!formData.dismantleDate) newErrors.dismantleDate = 'Dismantle date is required';
    if (!formData.venueId) newErrors.venueId = 'Venue is required';
    if (!formData.hall) {
      newErrors.hall = 'Hall selection is required';
    } else if (formData.venueId) {
      const venue = venues.find(v => v.id === formData.venueId);
      if (venue) {
        const selectedNames = formData.hall.split(',').map(h => h.trim()).filter(Boolean);
        const naHallsSelected = venue.halls.filter(h => h.notAvailable && selectedNames.includes(h.name));
        if (naHallsSelected.length > 0) {
          newErrors.hall = `Selected hall is marked as Not Available: ${naHallsSelected.map(h => h.name).join(', ')}`;
        }
      }
    }
    if (!formData.sectors || formData.sectors.length === 0) newErrors.sectors = 'Please select at least one sector';
    if (!formData.revenue || Number(formData.revenue) <= 0) newErrors.revenue = 'Estimated revenue must be greater than 0';
    if (!formData.guests || Number(formData.guests) <= 0) newErrors.guests = 'Expected guests must be greater than 0';

    // Date logic: Setup <= Event Start <= Event End <= Dismantle
    const setup = formData.setupDate ? new Date(formData.setupDate) : null;
    const eventS = formData.eventStartDate ? new Date(formData.eventStartDate) : null;
    const eventE = formData.eventEndDate ? new Date(formData.eventEndDate) : null;
    const dismantle = formData.dismantleDate ? new Date(formData.dismantleDate) : null;

    if (eventS && eventE && eventS > eventE) {
      newErrors.eventEndDate = 'Event end cannot be before event start';
    }
    if (setup && eventS && setup > eventS) {
      newErrors.setupDate = 'Setup cannot be after event start';
    }
    if (dismantle && eventE && dismantle < eventE) {
      newErrors.dismantleDate = 'Dismantle cannot be before event end';
    }

    // Conflict detection — check against ALL active bookings (not just Confirmed)
    if (formData.venueId && formData.hall && formData.eventStartDate && formData.eventEndDate) {
      const activeStatuses = ['Draft', 'Tentative', 'Confirmed'];
      const conflictingBookings = bookings.filter(b => {
        if (isEditMode && b.id === editBooking.id) return false;
        if (!activeStatuses.includes(b.status)) return false;
        
        const bHalls = typeof b.hall === 'string' ? b.hall.split(',').map(h => h.trim()) : [b.hall];
        const fHalls = typeof formData.hall === 'string' ? formData.hall.split(',').map(h => h.trim()) : [formData.hall];
        const hasOverlapHall = bHalls.some(h => fHalls.includes(h));
        
        if (b.venueId !== formData.venueId || !hasOverlapHall) return false;
        
        const bStart = new Date(b.setupDate || b.eventStartDate).getTime();
        const bEnd = new Date(b.dismantleDate || b.eventEndDate).getTime();
        const fStart = new Date(formData.setupDate || formData.eventStartDate).getTime();
        const fEnd = new Date(formData.dismantleDate || formData.eventEndDate).getTime();
        
        return (fStart <= bEnd && fEnd >= bStart);
      });

      if (conflictingBookings.length > 0) {
        const confirmedConflict = conflictingBookings.some(b => b.status === 'Confirmed');
        const conflictNames = conflictingBookings.map(b => `${b.eventName} (${b.status})`).join(', ');
        if (confirmedConflict) {
          newErrors.conflict = `This hall has a confirmed booking that overlaps: ${conflictNames}. Choose different dates or hall.`;
        } else {
          newErrors.conflict = `Duplicate booking detected — this hall already has overlapping bookings: ${conflictNames}. Please choose different dates or hall to avoid double-booking.`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      if (isEditMode) {
        onSave({ 
          ...editBooking,
          ...formData, 
          revenue: Number(formData.revenue) || 0,
          guests: Number(formData.guests) || 0
        });
      } else {
        const newId = `b${bookings.length + 101}`;
        onSave({ 
          ...formData, 
          id: newId, 
          revenue: Number(formData.revenue) || 0,
          guests: Number(formData.guests) || 0
        });
      }
    }
  };

  return (
    <div className="page" style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="page-header">
        <h1>{isEditMode ? `Edit Booking — ${editBooking.id}` : 'New Booking Block'}</h1>
        <p>{isEditMode ? 'Update booking details and save changes.' : 'Reserve space using the synchronized frontend data model.'}</p>
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
                {errors.eventName && <span style={{ fontSize: '0.72rem', color: '#F87171' }}>{errors.eventName}</span>}
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
                    {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Sectors</label>
                <div className="sectors-chip-grid" style={{ border: errors.sectors ? '1px dashed #F87171' : 'none', borderRadius: 8, padding: errors.sectors ? '6px' : '0' }}>
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
                {errors.sectors && <span style={{ fontSize: '0.72rem', color: '#F87171', marginTop: 6, display: 'block' }}>{errors.sectors}</span>}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">Location & Logistics</div>
              <div style={{ marginBottom: 18 }}>
                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label className="form-label"><MapPin size={12} /> Venue</label>
                  <select className="form-select" name="venueId" value={formData.venueId} onChange={handleChange}>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><Building2 size={12} style={{ marginRight: 6 }} /> Hall Selection</span>
                    <div className="segmented-control" style={{ display: 'flex', background: 'var(--bg-overlay)', padding: 3, borderRadius: 6, border: '1px solid var(--border)' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectionMode('single');
                          const list = formData.hall.split(',').map(h => h.trim()).filter(Boolean);
                          if (list.length > 0) {
                            setFormData(prev => ({ ...prev, hall: list[0] }));
                          }
                        }}
                        style={{
                          padding: '4px 10px', fontSize: '0.72rem', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600,
                          background: selectionMode === 'single' ? 'var(--gold)' : 'transparent',
                          color: selectionMode === 'single' ? 'var(--bg-base)' : 'var(--text-secondary)',
                          transition: 'all 0.2s'
                        }}
                      >
                        Single Hall
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectionMode('multiple')}
                        style={{
                          padding: '4px 10px', fontSize: '0.72rem', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600,
                          background: selectionMode === 'multiple' ? 'var(--gold)' : 'transparent',
                          color: selectionMode === 'multiple' ? 'var(--bg-base)' : 'var(--text-secondary)',
                          transition: 'all 0.2s'
                        }}
                      >
                        Multiple Halls
                      </button>
                    </div>
                  </label>

                  {/* Chips Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, marginTop: 8 }}>
                    {availableHalls.map(h => {
                      const isSelected = selectedHallsList.includes(h.name);
                      return (
                        <div
                          key={h.name}
                          onClick={() => {
                            if (!h.notAvailable) handleHallClick(h.name);
                          }}
                          style={{
                            background: h.notAvailable ? 'var(--bg-surface)' : (isSelected ? 'var(--gold-faint)' : 'var(--bg-overlay)'),
                            border: h.notAvailable ? '1px dashed rgba(239, 68, 68, 0.25)' : (isSelected ? '1px solid var(--gold)' : '1px solid var(--border)'),
                            borderRadius: 8, padding: '8px 12px', 
                            cursor: h.notAvailable ? 'not-allowed' : 'pointer', 
                            textAlign: 'center', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', gap: 3,
                            opacity: h.notAvailable ? 0.45 : 1
                          }}
                          title={h.notAvailable ? 'This hall is currently marked as Not Available' : ''}
                        >
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: h.notAvailable ? 'var(--text-muted)' : (isSelected ? 'var(--gold)' : 'var(--text-primary)') }}>
                            {h.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {h.notAvailable ? 'Not Available' : (h.areaSqm ? `${h.areaSqm} sqm` : '—')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {errors.hall && <span style={{ fontSize: '0.72rem', color: '#F87171', marginTop: 4, display: 'block' }}>{errors.hall}</span>}
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
                <input type="date" className={`form-input ${errors.setupDate ? 'error' : ''}`} name="setupDate" value={formData.setupDate} onChange={handleChange} />
              </div>
              {errors.setupDate && <div style={{ fontSize: '0.72rem', color: '#F87171', marginBottom: 8, paddingLeft: 106 }}>{errors.setupDate}</div>}
              <div className="date-range-row">
                <div className="range-label" style={{ color: 'var(--gold)' }}>Event Live</div>
                <div className="range-inputs">
                  <input type="date" className={`form-input ${errors.eventStartDate ? 'error' : ''}`} name="eventStartDate" value={formData.eventStartDate} onChange={handleChange} />
                  <span className="range-sep">➜</span>
                  <input type="date" className={`form-input ${errors.eventEndDate ? 'error' : ''}`} name="eventEndDate" value={formData.eventEndDate} onChange={handleChange} />
                </div>
              </div>
              {errors.eventStartDate && <div style={{ fontSize: '0.72rem', color: '#F87171', marginBottom: 8, paddingLeft: 106 }}>{errors.eventStartDate}</div>}
              {errors.eventEndDate && <div style={{ fontSize: '0.72rem', color: '#F87171', marginBottom: 8, paddingLeft: 106 }}>{errors.eventEndDate}</div>}
              <div className="date-range-row">
                <div className="range-label">Dismantle</div>
                <input type="date" className={`form-input ${errors.dismantleDate ? 'error' : ''}`} name="dismantleDate" value={formData.dismantleDate} onChange={handleChange} />
              </div>
              {errors.dismantleDate && <div style={{ fontSize: '0.72rem', color: '#F87171', marginBottom: 8, paddingLeft: 106 }}>{errors.dismantleDate}</div>}
            </div>
          </div>

          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">Commercials & Status</div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Booking Status</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  {eventStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Availability</label>
                <select className="form-select" name="availability" value={formData.availability} onChange={handleChange}>
                  <option value="Booked">Booked</option>
                  <option value="Required">Required</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Est. Revenue (₹)</label>
                <input 
                  type="number" 
                  className={`form-input ${errors.revenue ? 'error' : ''}`} 
                  name="revenue" 
                  value={formData.revenue} 
                  onChange={handleChange} 
                />
                {errors.revenue && <span style={{ fontSize: '0.72rem', color: '#F87171', marginTop: 4, display: 'block' }}>{errors.revenue}</span>}
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Expected Guests</label>
                <input 
                  type="number" 
                  className={`form-input ${errors.guests ? 'error' : ''}`} 
                  name="guests" 
                  value={formData.guests} 
                  onChange={handleChange} 
                />
                {errors.guests && <span style={{ fontSize: '0.72rem', color: '#F87171', marginTop: 4, display: 'block' }}>{errors.guests}</span>}
              </div>

              {errors.conflict && (
                <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: 8, marginBottom: 20, border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.8rem', color: '#FCA5A5' }}>
                  <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  {errors.conflict}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {isEditMode ? <><Save size={16} /> Update Booking</> : <><Plus size={16} /> Create Booking</>}
              </button>
            </div>

            <div className="card" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
               <CheckCircle2 size={16} style={{ color: 'var(--gold)', marginBottom: 10 }} />
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                 {isEditMode 
                   ? 'Changes will be validated against existing bookings for conflict detection.'
                   : 'Validation and conflict checking will be applied against the master booking registry.'
                 }
               </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
