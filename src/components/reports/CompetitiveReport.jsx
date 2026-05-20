import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useReportData, formatMoney, CHART_COLORS } from './useReportData';
import { CustomTooltip, SectionTitle, ReportTable } from './SharedComponents';
import ReportLayout from './ReportLayout';

export default function CompetitiveReport({ bookings, venues }) {
  const report = useReportData(bookings, venues);
  const { computed } = report;

  const exportData = {
    title: 'Competitive Analytics',
    headers: ['Industry','Sectors','Bookings','Organizers','Market Share','Revenue','Avg/Event'],
    rows: computed.industrySeries.map(i => [i.name,i.sectorCount,i.bookings,i.organizerCount,`${i.marketShare}%`,formatMoney(i.revenue),formatMoney(i.bookings?i.revenue/i.bookings:0)]),
  };

  return (
    <ReportLayout title="Competitive Analytics" exportData={exportData} {...report}>
      <SectionTitle icon={TrendingUp} subtitle="Industry revenue trends, sector competitor signals, and organizer concentration analysis.">
        Competitive Analytics
      </SectionTitle>

      <div className="grid-2" style={{ marginBottom:20 }}>
        <div className="card">
          <div className="card-title">Industry Revenue Trends</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:16 }}>Revenue in Rs L</div>
          <div style={{ height:280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computed.industrySeries} layout="vertical" margin={{ top:5, right:20, bottom:5, left:88 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={88} tick={{ fill:'var(--text-secondary)', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenueLakhs" name="Revenue (Rs L)" radius={[0,4,4,0]}>
                  {computed.industrySeries.map(e => <Cell key={e.name} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Sector Competitor Signals</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:16 }}>Organizer count = competitor intensity per sector</div>
          <ReportTable
            headers={['Sector','Industries','Bookings','Competitors','Revenue']}
            rows={computed.sectorSeries.slice(0,8).map(s => ({
              key: s.name,
              cells: [
                s.name, s.industries.size, s.bookings,
                <strong style={{ color: s.organizerCount > 2 ? '#F87171' : '#4ADE80' }}>{s.organizerCount}</strong>,
                <span style={{ color:'var(--gold)', fontWeight:600 }}>{formatMoney(s.revenue)}</span>,
              ],
            }))}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom:14 }}>Competitor Insights by Industry</div>
        <ReportTable
          headers={['Industry','Bookings','Sectors','Competitors','Market Share','Revenue','Insight']}
          rows={computed.industrySeries.map(item => ({
            key: item.name,
            cells: [
              <strong>{item.name}</strong>, item.bookings, item.sectorCount, item.organizerCount,
              <span style={{ color: item.marketShare > 30 ? 'var(--gold)' : 'inherit' }}>{item.marketShare}%</span>,
              <span style={{ color:'var(--gold)', fontWeight:600 }}>{formatMoney(item.revenue)}</span>,
              <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                {item.organizerCount > 2 ? `High competition: ${item.organizerCount} organizers` : item.organizerCount === 2 ? 'Duopoly — monitor closely' : 'Single-organizer: captive opportunity'}
              </span>,
            ],
          }))}
        />
      </div>

      <div className="card" style={{ marginTop:16 }}>
        <div className="card-title" style={{ marginBottom:14 }}>Top Organizers by Revenue</div>
        <div style={{ height:200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={computed.organizerSeries.slice(0,8)} layout="vertical" margin={{ top:5, right:20, bottom:5, left:100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill:'var(--text-secondary)', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenueLakhs" name="Revenue (Rs L)" radius={[0,4,4,0]}>
                {computed.organizerSeries.slice(0,8).map((e,i) => <Cell key={e.name} fill={CHART_COLORS[i%CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ReportLayout>
  );
}
