import { ChevronRight, Calendar } from 'lucide-react';
import { useReportData, formatMoney } from './useReportData';
import { SectionTitle, StatCard, ReportTable, StatusPill } from './SharedComponents';
import ReportLayout from './ReportLayout';

export default function OwnShowsReport({ bookings, venues }) {
  const report = useReportData(bookings, venues);
  const { computed, venueName } = report;

  const allRows = [
    ...computed.pastShows.map(b    => ['Past',     b.eventName, `${venueName(b.venueId)} / ${b.hall}`, b.eventStartDate, b.eventEndDate, b.status, formatMoney(b.revenue)]),
    ...computed.upcomingShows.map(b => ['Upcoming', b.eventName, `${venueName(b.venueId)} / ${b.hall}`, b.eventStartDate, b.eventEndDate, b.status, formatMoney(b.revenue)]),
    ...computed.probableShows.map(b => ['Probable', b.eventName, `${venueName(b.venueId)} / ${b.hall}`, b.eventStartDate, b.eventEndDate, b.status, formatMoney(b.revenue)]),
  ];

  return (
    <ReportLayout
      title="Own Shows (IEML)"
      exportData={{ title:'Own Shows (IEML)', headers:['Category','Event','Venue / Hall','Start','End','Status','Revenue'], rows:allRows }}
      {...report}
    >
      <SectionTitle icon={Calendar} subtitle="IEML event pipeline: past, upcoming confirmed, and probable (tentative/draft) shows.">
        Own Shows (IEML)
      </SectionTitle>

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(3,1fr)', marginBottom:20 }}>
        <StatCard label="Past Events"     value={computed.pastShows.length}     sub={`Revenue: ${formatMoney(computed.pastShows.reduce((s,b)=>s+(b.revenue||0),0))}`}  color="#A5B4FC" />
        <StatCard label="Upcoming Events" value={computed.upcomingShows.length} sub="Confirmed future events"   color="#4ADE80" />
        <StatCard label="Probable Events" value={computed.probableShows.length} sub="Tentative + Draft pipeline" color="#FBBF24" />
      </div>

      {[
        { title:'Past Events',     rows: computed.pastShows,     emptyText:'No past events in the selected range.' },
        { title:'Upcoming Events', rows: computed.upcomingShows, emptyText:'No confirmed upcoming events.' },
        { title:'Probable Events', rows: computed.probableShows, emptyText:'No tentative or draft events in pipeline.' },
      ].map(section => (
        <div className="card" key={section.title} style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <ChevronRight size={14} style={{ color:'var(--gold)' }} />
            <div className="card-title" style={{ margin:0 }}>{section.title}</div>
            <span style={{ marginLeft:'auto', background:'rgba(201,168,76,0.12)', color:'var(--gold)', fontSize:'0.72rem', fontWeight:700, padding:'2px 8px', borderRadius:4 }}>
              {section.rows.length} event{section.rows.length !== 1 ? 's' : ''}
            </span>
          </div>
          <ReportTable
            headers={['Event','Venue / Hall','Start Date','End Date','Industry','Status','Revenue']}
            emptyText={section.emptyText}
            rows={section.rows.map(b => ({
              key: b.id,
              cells: [
                <strong>{b.eventName}</strong>,
                <span className="muted">{venueName(b.venueId)} / {b.hall}</span>,
                b.eventStartDate, b.eventEndDate, b.industry,
                <StatusPill status={b.status} />,
                <span style={{ color:'var(--gold)', fontWeight:600 }}>{formatMoney(b.revenue)}</span>,
              ],
            }))}
          />
        </div>
      ))}
    </ReportLayout>
  );
}
