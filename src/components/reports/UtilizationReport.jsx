import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Info } from 'lucide-react';
import { useReportData } from './useReportData';
import { CustomTooltip, SectionTitle, StatCard, ReportTable, OccupancyBar } from './SharedComponents';
import ReportLayout from './ReportLayout';

export default function UtilizationReport({ bookings, venues }) {
  const report = useReportData(bookings, venues);
  const { computed } = report;

  const exportData = {
    title: 'Utilization Report',
    headers: ['Venue','Hall','Bookings','Booked Days','Idle Days','Utilization %','Confirmed Usage %'],
    rows: computed.hallAllocation.map(h => [h.venue, h.hall, h.totalBookings, h.bookedDays, h.idleDays, `${h.occupancy}%`, `${h.confirmedOccupancy}%`]),
  };

  return (
    <ReportLayout title="Utilization Report" exportData={exportData} {...report}>
      <SectionTitle icon={Activity} subtitle="Venue and hall-level utilization, idle capacity analysis, and confirmed usage tracking.">
        Utilization Report
      </SectionTitle>

      <div className="stats-grid" style={{ marginBottom:20 }}>
        <StatCard label="Overall Utilization" value={`${computed.utilizationPercent}%`}  sub={`${computed.activeBookedDays} of ${computed.totalHallDays} hall-days`} color="var(--gold)" highlight />
        <StatCard label="Confirmed Usage"      value={`${Math.round((computed.confirmedHallDays/Math.max(1,computed.totalHallDays))*100)}%`} sub={`${computed.confirmedHallDays} confirmed hall-days`} color="#4ADE80" />
        <StatCard label="Idle Capacity"        value={computed.idleHallDays}              sub="Available hall-days in range"  color="#F87171" />
        <StatCard label="Tracked Halls"        value={computed.hallAllocation.length}     sub={`Across ${venues.length} venue(s)`} />
      </div>

      <div className="grid-2" style={{ marginBottom:20 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom:14 }}>Venue Utilization</div>
          <ReportTable
            headers={['Venue','Halls','Booked Days','Idle Days','Utilization']}
            rows={computed.venueUtilization.map(v => ({
              key: v.name,
              cells: [
                <strong>{v.name}</strong>, v.halls, v.bookedDays,
                <span style={{ color: v.idleDays > 60 ? '#F87171' : 'inherit' }}>{v.idleDays}</span>,
                <OccupancyBar pct={v.utilization} />,
              ],
            }))}
          />
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom:14 }}>Utilization by Hall</div>
          <div style={{ height:260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={computed.hallAllocation.slice(0,8).map(h => ({
                  name: `${h.venue.split(' ')[0]} / ${h.hall}`,
                  utilization: h.occupancy, confirmed: h.confirmedOccupancy,
                }))}
                layout="vertical" margin={{ top:5, right:20, bottom:5, left:90 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" domain={[0,100]} tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fill:'var(--text-secondary)', fontSize:9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={v => <span style={{ fontSize:10, color:'var(--text-secondary)' }}>{v}</span>} iconSize={6} />
                <Bar dataKey="utilization" name="Utilization %" fill="var(--gold)" radius={[0,4,4,0]} />
                <Bar dataKey="confirmed"   name="Confirmed %"  fill="#4ADE80" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom:14 }}>Hall Utilization Detail</div>
        <ReportTable
          headers={['Venue','Hall','Bookings','Booked Days','Idle Days','Utilization','Confirmed Usage']}
          rows={computed.hallAllocation.map(h => ({
            key: `${h.venue}-${h.hall}`,
            cells: [
              h.venue, <strong>{h.hall}</strong>, h.totalBookings, h.bookedDays,
              <span style={{ color: h.idleDays > computed.rangeDays * 0.5 ? '#F87171' : 'inherit' }}>{h.idleDays}</span>,
              <OccupancyBar pct={h.occupancy} />,
              <OccupancyBar pct={h.confirmedOccupancy} color="#4ADE80" />,
            ],
          }))}
        />
      </div>

      {computed.idleHallDays > 0 && (
        <div className="card" style={{ marginTop:16, border:'1px solid rgba(201,168,76,0.2)', background:'rgba(201,168,76,0.04)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Info size={16} style={{ color:'var(--gold)' }} />
            <div>
              <div style={{ fontWeight:600, color:'var(--gold)', marginBottom:2 }}>Idle Capacity Opportunity</div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>
                {computed.idleHallDays} hall-days are currently unbooked in the selected date range.
                {computed.venueUtilization.length > 0 && ` ${computed.venueUtilization[computed.venueUtilization.length-1]?.name} has the most idle capacity at ${100-(computed.venueUtilization[computed.venueUtilization.length-1]?.utilization??0)}% idle.`}
              </div>
            </div>
          </div>
        </div>
      )}
    </ReportLayout>
  );
}
