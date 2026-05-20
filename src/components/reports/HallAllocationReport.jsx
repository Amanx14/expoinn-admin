import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Home } from 'lucide-react';
import { useReportData, dayKey } from './useReportData';
import { CustomTooltip, SectionTitle, StatCard, ReportTable, OccupancyBar } from './SharedComponents';
import ReportLayout from './ReportLayout';

export default function HallAllocationReport({ bookings, venues }) {
  const report = useReportData(bookings, venues);
  const { computed } = report;

  const exportData = {
    title: 'Hall Allocation Report',
    headers: ['Venue','Hall','Bookings','Prime Date Days','Booked Days','Idle Days','Occupancy %'],
    rows: computed.hallAllocation.map(h => [h.venue,h.hall,h.totalBookings,h.primeDateDays,h.bookedDays,h.idleDays,`${h.occupancy}%`]),
  };

  return (
    <ReportLayout title="Hall Allocation Report" exportData={exportData} {...report}>
      <SectionTitle icon={Home} subtitle="Prime date usage (HD periods) and hall occupancy across all venues.">
        Hall Allocation Report
      </SectionTitle>

      <div className="stats-grid" style={{ marginBottom:20 }}>
        <StatCard label="Total Halls Tracked"  value={computed.hallAllocation.length} sub={`Across ${venues.length} venues`} />
        <StatCard label="Highest Occupancy"    value={`${computed.hallAllocation[0]?.occupancy ?? 0}%`} sub={`${computed.hallAllocation[0]?.venue} / ${computed.hallAllocation[0]?.hall}`} color="var(--gold)" />
        <StatCard label="Prime Date Usage"     value={`${computed.hallAllocation.reduce((s,h)=>s+h.primeDateDays,0)} days`} sub="Total HD-period bookings" color="#F87171" />
        <StatCard label="Range"                value={`${computed.rangeDays} days`} sub={`${dayKey(computed.rangeStart)} → ${dayKey(computed.rangeEnd)}`} />
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom:14 }}>Prime Date Usage &amp; Hall Occupancy</div>
        <ReportTable
          headers={['Venue','Hall','Bookings','Prime Date Days','Prime Usage %','Booked Days','Occupancy','Confirmed Usage']}
          rows={computed.hallAllocation.map(h => ({
            key: `${h.venue}-${h.hall}`,
            cells: [
              h.venue, <strong>{h.hall}</strong>, h.totalBookings,
              <span style={{ color:'#F87171', fontWeight:600 }}>{h.primeDateDays}</span>,
              <OccupancyBar pct={h.primeDateUsagePct} color="#F87171" />,
              h.bookedDays,
              <OccupancyBar pct={h.occupancy} />,
              <OccupancyBar pct={h.confirmedOccupancy} color="#4ADE80" />,
            ],
          }))}
        />
      </div>

      <div className="card" style={{ marginTop:16 }}>
        <div className="card-title" style={{ marginBottom:14 }}>Hall Occupancy Chart</div>
        <div style={{ height: Math.max(200, computed.hallAllocation.length * 32) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={computed.hallAllocation.map(h => ({ name:`${h.venue.split(' ')[0]} / ${h.hall}`, occupancy:h.occupancy, prime:h.primeDateUsagePct }))}
              layout="vertical" margin={{ top:5, right:20, bottom:5, left:100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0,100]} tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill:'var(--text-secondary)', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={v => <span style={{ fontSize:10, color:'var(--text-secondary)' }}>{v}</span>} iconSize={6} />
              <Bar dataKey="occupancy" name="Occupancy %" fill="var(--gold)" radius={[0,4,4,0]} />
              <Bar dataKey="prime"     name="Prime Usage %" fill="#F87171" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ReportLayout>
  );
}
