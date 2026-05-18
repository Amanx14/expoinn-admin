import { AlertTriangle, Zap } from 'lucide-react';
import { useReportData, getLockStart, getLockEnd } from './useReportData';
import { SectionTitle, StatCard, ReportTable, StatusPill } from './SharedComponents';
import ReportLayout from './ReportLayout';

export default function ConflictReport({ bookings, venues }) {
  const report = useReportData(bookings, venues);
  const { computed } = report;

  const exportData = {
    title: 'Conflict Report',
    headers: ['Event A','Status A','Event B','Status B','Hall','Type','Overlap Days','Severity'],
    rows: computed.conflicts.map(c => [c.booking1.eventName,c.booking1.status,c.booking2.eventName,c.booking2.status,c.booking1.hall,c.conflictType,c.overlapDays,c.severity]),
  };

  const ConflictTable = ({ rows, accentColor }) => (
    <ReportTable
      headers={['Booking A','Booking B','Venue / Hall','Type','Overlap Period','Overlap Days']}
      rows={rows.map(c => {
        const venue = venues.find(v => v.id === c.booking1.venueId);
        return {
          key: c.key,
          cells: [
            <div>
              <strong>{c.booking1.eventName}</strong>
              <div style={{ color:'var(--text-muted)', fontSize:'0.72rem' }}>{getLockStart(c.booking1)} → {getLockEnd(c.booking1)}</div>
              <StatusPill status={c.booking1.status} />
            </div>,
            <div>
              <strong>{c.booking2.eventName}</strong>
              <div style={{ color:'var(--text-muted)', fontSize:'0.72rem' }}>{getLockStart(c.booking2)} → {getLockEnd(c.booking2)}</div>
              <StatusPill status={c.booking2.status} />
            </div>,
            `${venue?.name || ''} / ${c.booking1.hall}`,
            <span style={{ color:accentColor, fontWeight:600 }}>{c.conflictType}</span>,
            `${c.overlapStart} → ${c.overlapEnd}`,
            <span style={{ color:accentColor, fontWeight:700 }}>{c.overlapDays} day(s)</span>,
          ],
        };
      })}
    />
  );

  return (
    <ReportLayout title="Conflict Report" exportData={exportData} {...report}>
      <SectionTitle icon={Zap} subtitle="Overlapping bookings for active (Draft/Tentative/Confirmed) statuses across halls.">
        Conflict Report
      </SectionTitle>

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(3,1fr)', marginBottom:20 }}>
        <StatCard label="Total Conflicts" value={computed.conflicts.length} sub={computed.conflicts.length ? 'Overlapping active bookings' : 'No conflicts detected'} color={computed.conflicts.length ? '#F87171' : '#4ADE80'} />
        <StatCard label="Critical"        value={computed.criticalConflicts.length} sub="Confirmed vs Confirmed" color={computed.criticalConflicts.length ? '#F87171' : '#4ADE80'} />
        <StatCard label="Warnings"        value={computed.warningConflicts.length}  sub="Draft/Tentative overlaps"  color={computed.warningConflicts.length ? '#FBBF24' : '#4ADE80'} />
      </div>

      {computed.conflicts.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'40px 20px' }}>
          <Zap size={32} style={{ color:'#4ADE80', marginBottom:12 }} />
          <div style={{ fontWeight:700, color:'#4ADE80', marginBottom:6 }}>No Active Conflicts</div>
          <div style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No overlapping resource conflicts match the current filters.</div>
        </div>
      ) : (
        <>
          {computed.criticalConflicts.length > 0 && (
            <div className="card" style={{ marginBottom:16, border:'1px solid rgba(248,113,113,0.3)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <AlertTriangle size={16} style={{ color:'#F87171' }} />
                <div className="card-title" style={{ margin:0, color:'#F87171' }}>Critical Conflicts ({computed.criticalConflicts.length})</div>
                <span style={{ fontSize:'0.72rem', color:'#F87171', marginLeft:'auto' }}>Confirmed vs Confirmed — requires immediate action</span>
              </div>
              <ConflictTable rows={computed.criticalConflicts} accentColor="#F87171" />
            </div>
          )}
          {computed.warningConflicts.length > 0 && (
            <div className="card">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <AlertTriangle size={16} style={{ color:'#FBBF24' }} />
                <div className="card-title" style={{ margin:0, color:'#FBBF24' }}>Warnings ({computed.warningConflicts.length})</div>
                <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginLeft:'auto' }}>Draft/Tentative overlaps — monitor and resolve</span>
              </div>
              <ConflictTable rows={computed.warningConflicts} accentColor="#FBBF24" />
            </div>
          )}
        </>
      )}
    </ReportLayout>
  );
}
