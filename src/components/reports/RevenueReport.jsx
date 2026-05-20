import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DollarSign } from 'lucide-react';
import { useReportData, formatMoney } from './useReportData';
import { CustomTooltip, SectionTitle, StatCard, ReportTable, StatusPill } from './SharedComponents';
import ReportLayout from './ReportLayout';

export default function RevenueReport({ bookings, venues }) {
  const report = useReportData(bookings, venues);
  const { computed, cardSubText } = report;

  const exportData = {
    title: 'Revenue Reports',
    headers: ['Event','Industry','Event Type','Date','Status','Revenue'],
    rows: computed.eventRevenue.map(b => [b.eventName, b.industry, b.eventType, b.eventStartDate, b.status, formatMoney(b.revenue)]),
  };

  return (
    <ReportLayout title="Revenue Reports" exportData={exportData} {...report}>
      <SectionTitle icon={DollarSign} subtitle="Event-wise, industry-wise, and date-wise revenue breakdown.">
        Revenue Reports
      </SectionTitle>

      <div className="stats-grid" style={{ marginBottom:20 }}>
        <StatCard label="Total Revenue" value={formatMoney(computed.totalRevenue)}    sub={cardSubText}                         highlight />
        <StatCard label="Confirmed"     value={formatMoney(computed.confirmedRevenue)} sub={`${computed.confirmed.length} bookings`} color="#4ADE80" />
        <StatCard label="Tentative"     value={formatMoney(computed.tentativeRevenue)} sub={`${computed.tentative.length} bookings`} color="#FBBF24" />
        <StatCard label="Completed"     value={formatMoney(computed.completedRevenue)} sub={`${computed.completed.length} bookings`} color="#A5B4FC" />
      </div>

      <div className="grid-2" style={{ marginBottom:20 }}>
        <div className="card">
          <div className="card-title">Industry-wise Revenue</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:16 }}>Revenue in Rs L</div>
          <div style={{ height:240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={computed.industrySeries} cx="50%" cy="50%" innerRadius={52} outerRadius={84} paddingAngle={2} dataKey="revenueLakhs" nameKey="name">
                  {computed.industrySeries.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Legend formatter={v => <span style={{ fontSize:10, color:'var(--text-secondary)' }}>{v}</span>} iconSize={6} />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Date-wise Revenue (Monthly)</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:16 }}>Monthly booking revenue in Rs L</div>
          <div style={{ height:240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computed.dateRevenue} margin={{ top:5, right:10, bottom:0, left:-18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenueLakhs" name="Revenue (Rs L)" fill="var(--gold)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom:14 }}>Event-wise Revenue</div>
        <ReportTable
          headers={['#','Event','Industry','Event Type','Start Date','Status','Revenue']}
          rows={computed.eventRevenue.map((b,i) => ({
            key: b.id,
            cells: [
              <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{i+1}</span>,
              <strong>{b.eventName}</strong>, b.industry, b.eventType, b.eventStartDate,
              <StatusPill status={b.status} />,
              <span style={{ color:'var(--gold)', fontWeight:600 }}>{formatMoney(b.revenue)}</span>,
            ],
          }))}
        />
      </div>

      <div className="card" style={{ marginTop:16 }}>
        <div className="card-title" style={{ marginBottom:14 }}>Industry-wise Revenue Summary</div>
        <ReportTable
          headers={['Industry','Bookings','Market Share','Revenue','Avg Per Event']}
          rows={computed.industrySeries.map(item => ({
            key: item.name,
            cells: [
              <strong>{item.name}</strong>, item.bookings,
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:60, height:5, borderRadius:3, background:'var(--bg-overlay)', border:'1px solid var(--border)' }}>
                  <div style={{ width:`${item.marketShare}%`, height:'100%', borderRadius:3, background:'var(--gold)' }} />
                </div>
                <span style={{ color:'var(--gold)' }}>{item.marketShare}%</span>
              </div>,
              <span style={{ color:'var(--gold)', fontWeight:600 }}>{formatMoney(item.revenue)}</span>,
              formatMoney(item.bookings ? item.revenue/item.bookings : 0),
            ],
          }))}
        />
      </div>
    </ReportLayout>
  );
}
