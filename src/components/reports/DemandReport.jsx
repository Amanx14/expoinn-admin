import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity } from 'lucide-react';
import { useReportData } from './useReportData';
import { CustomTooltip, SectionTitle, ReportTable, DemandBadge } from './SharedComponents';
import ReportLayout from './ReportLayout';

export default function DemandReport({ bookings, venues }) {
  const report = useReportData(bookings, venues);
  const { computed } = report;

  const exportData = {
    title: 'Demand Analysis',
    headers: ['Month','Demand Type','Bookings','Confirmed','Tentative','Revenue (Rs L)'],
    rows: computed.monthlySeries.filter(m => m.bookings > 0).map(m => [m.month, m.demandType, m.bookings, m.confirmed, m.tentative, m.revenueLakhs]),
  };

  return (
    <ReportLayout title="Demand Analysis" exportData={exportData} {...report}>
      <SectionTitle icon={Activity} subtitle="High Demand (HD): Jan–Mar, Jul–Dec  |  Low Demand (LD): Apr–Jun">
        Demand Analysis
      </SectionTitle>

      <div className="grid-2" style={{ marginBottom:20 }}>
        <div className="card">
          <div className="card-title">High Demand vs Low Demand</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:16 }}>
            HD = Jan–Mar, Jul–Sep, Oct–Dec &nbsp;|&nbsp; LD = Apr–Jun
          </div>
          <div style={{ height:240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computed.demandChartData} margin={{ top:5, right:10, bottom:0, left:-18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="type" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="bookings" name="Bookings" radius={[4,4,0,0]}>
                  <Cell fill="#F87171" /><Cell fill="#4ADE80" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:16 }}>
            {computed.demandSeries.map(d => (
              <div key={d.type} style={{ background:'var(--bg-overlay)', borderRadius:6, padding:'10px 14px', border:'1px solid var(--border)' }}>
                <DemandBadge type={d.type.includes('High') ? 'HD' : 'LD'} />
                <div style={{ fontWeight:700, fontSize:'1.2rem', color:'var(--text-primary)', marginTop:6 }}>{d.bookings}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>bookings</div>
                <div style={{ fontSize:'0.8rem', color:'var(--gold)', marginTop:4 }}>Rs {d.revenueLakhs}L revenue</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Peak Booking Periods</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:16 }}>Top months ranked by bookings &amp; revenue</div>
          <ReportTable
            headers={['Rank','Month','Demand','Bookings','Revenue']}
            rows={computed.peakMonths.map((m,i) => ({
              key: m.month,
              cells: [
                <span style={{ color:'var(--gold)', fontWeight:700 }}>#{i+1}</span>,
                <strong>{m.month}</strong>,
                <DemandBadge type={m.demandType} />,
                m.bookings,
                <span style={{ color:'var(--gold)', fontWeight:600 }}>Rs {m.revenueLakhs}L</span>,
              ],
            }))}
          />
          <div style={{ marginTop:20 }}>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:8 }}>Full-year booking pattern</div>
            <div style={{ height:120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={computed.monthlySeries} margin={{ top:0, right:0, bottom:0, left:-30 }}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6B9EC9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6B9EC9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#6B9EC9" strokeWidth={1.5} fill="url(#demandGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom:14 }}>Monthly Demand Detail</div>
        <ReportTable
          headers={['Month','Demand Type','Bookings','Confirmed','Tentative','Revenue']}
          rows={computed.monthlySeries.filter(m => m.bookings > 0).map(m => ({
            key: m.month,
            cells: [
              <strong>{m.month}</strong>, <DemandBadge type={m.demandType} />, m.bookings,
              <span style={{ color:'#4ADE80' }}>{m.confirmed}</span>,
              <span style={{ color:'#FBBF24' }}>{m.tentative}</span>,
              <span style={{ color:'var(--gold)', fontWeight:600 }}>Rs {m.revenueLakhs}L</span>,
            ],
          }))}
        />
      </div>
    </ReportLayout>
  );
}
