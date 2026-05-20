import {
  Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import {
  TrendingUp, Home, Zap, Activity, Calendar, DollarSign, CreditCard, ChevronRight, BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReportData, formatMoney } from './useReportData';
import { CustomTooltip, StatCard, InsightBox } from './SharedComponents';
import ReportLayout from './ReportLayout';

export default function OverviewReport({ bookings, venues }) {
  const report = useReportData(bookings, venues);
  const { computed, cardSubText } = report;
  const navigate = useNavigate();

  const reportSummaries = [
    {
      title: 'Competitive Analytics',
      path: '/reports/competitive',
      icon: TrendingUp,
      bgColor: 'rgba(201, 168, 76, 0.1)',
      iconColor: 'var(--gold)',
      metrics: [
        { label: 'Sectors Tracked', value: computed.sectorSeries.length },
        { label: 'Top Industry', value: computed.industrySeries[0]?.name || '—' }
      ],
      desc: 'Industry revenue trends, sector competitor signals, and organizer market share.'
    },
    {
      title: 'Own Shows (IEML)',
      path: '/reports/own-shows',
      icon: Calendar,
      bgColor: 'rgba(107, 158, 201, 0.1)',
      iconColor: '#6B9EC9',
      metrics: [
        { label: 'Upcoming Confirmed', value: computed.upcomingShows.length },
        { label: 'Probable Pipeline', value: computed.probableShows.length }
      ],
      desc: 'IEML internal shows tracking including past, upcoming confirmed, and probable events.'
    },
    {
      title: 'Demand Analysis',
      path: '/reports/demand',
      icon: Activity,
      bgColor: 'rgba(74, 222, 128, 0.1)',
      iconColor: '#4ADE80',
      metrics: [
        { label: 'High Demand (HD)', value: computed.demandSeries.find(d => d.type.includes('High'))?.bookings ?? 0 },
        { label: 'Low Demand (LD)', value: computed.demandSeries.find(d => d.type.includes('Low'))?.bookings ?? 0 }
      ],
      desc: 'Booking distribution analysis based on HD/LD seasonal periods and peak month trends.'
    },
    {
      title: 'Hall Allocation',
      path: '/reports/hall-alloc',
      icon: Home,
      bgColor: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#F59E0B',
      metrics: [
        { label: 'Halls Active', value: computed.hallAllocation.length },
        { label: 'Peak Occupancy', value: computed.hallAllocation[0] ? `${computed.hallAllocation[0].occupancy}%` : '—' }
      ],
      desc: 'Detailed view of prime date usage, booked vs idle days, and confirmed hall usage.'
    },
    {
      title: 'Conflict Report',
      path: '/reports/conflict',
      icon: Zap,
      bgColor: 'rgba(248, 113, 113, 0.1)',
      iconColor: '#F87171',
      metrics: [
        { label: 'Critical Overlaps', value: computed.criticalConflicts.length, highlight: computed.criticalConflicts.length > 0 },
        { label: 'Pending Warnings', value: computed.warningConflicts.length }
      ],
      desc: 'Real-time booking overlap checks across all venues with severity classification.'
    },
    {
      title: 'Revenue Reports',
      path: '/reports/revenue',
      icon: DollarSign,
      bgColor: 'rgba(165, 180, 252, 0.1)',
      iconColor: '#A5B4FC',
      metrics: [
        { label: 'Confirmed Rev', value: formatMoney(computed.confirmedRevenue) },
        { label: 'Tentative Rev', value: formatMoney(computed.tentativeRevenue) }
      ],
      desc: 'Granular, multidimensional revenue breakdown across events, industries, and months.'
    },
    {
      title: 'Billing Report',
      path: '/reports/billing',
      icon: CreditCard,
      bgColor: 'rgba(236, 72, 153, 0.1)',
      iconColor: '#EC4899',
      metrics: [
        { label: 'Paid Revenue', value: formatMoney(computed.completedRevenue) },
        { label: 'Follow-ups Req', value: computed.followUpRequired }
      ],
      desc: 'Billing status, transaction totals, tentative balances, and overall invoicing tracker.'
    },
    {
      title: 'Utilization Report',
      path: '/reports/utilization',
      icon: BarChart2,
      bgColor: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#10B981',
      metrics: [
        { label: 'Overall Rate', value: `${computed.utilizationPercent}%` },
        { label: 'Idle Hall-Days', value: `${computed.idleHallDays} days` }
      ],
      desc: 'Capacity analysis, venue-level efficiency metrics, and potential rental growth opportunities.'
    }
  ];

  return (
    <ReportLayout
      title="Overview"
      subtitle="High-level summary of revenue, pipeline, conflicts, and venue utilization."
      {...report}
    >
      {/* KPI Stats Bar */}
      <div className="stats-grid">
        <StatCard label="Total Revenue"       value={formatMoney(computed.totalRevenue)}    sub={cardSubText} highlight />
        <StatCard label="Confirmed Pipeline"  value={computed.confirmed.length}             sub={formatMoney(computed.confirmedRevenue)} color="#4ADE80" />
        <StatCard label="Active Conflicts"    value={computed.conflicts.length}             sub={computed.conflicts.length ? 'Needs action' : 'No overlaps'} color={computed.conflicts.length ? '#F87171' : '#4ADE80'} />
        <StatCard label="Overall Utilization" value={`${computed.utilizationPercent}%`}     sub={`${computed.activeBookedDays} of ${computed.totalHallDays} hall-days`} />
      </div>

      {/* Grid of Main Charts */}
      <div className="grid-2" style={{ marginTop:16 }}>
        <div className="card">
          <div className="card-title">Monthly Booking &amp; Revenue Trend</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:16 }}>Revenue in Rs L (lakhs)</div>
          <div style={{ height:260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={computed.monthlySeries} margin={{ top:5, right:10, bottom:0, left:-18 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenueLakhs" name="Revenue (Rs L)" stroke="var(--gold)" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Status Distribution</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:16 }}>Booking pipeline by status</div>
          <div style={{ height:260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={computed.statusSeries} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value" nameKey="name">
                  {computed.statusSeries.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Legend formatter={v => <span style={{ fontSize:10, color:'var(--text-secondary)' }}>{v}</span>} iconSize={6} />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Banners of Quick Insights */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginTop:16 }}>
        <InsightBox icon={TrendingUp} color="var(--gold)" title="Top Industry"       value={computed.industrySeries[0]?.name || '—'}           sub={formatMoney(computed.industrySeries[0]?.revenue)} />
        <InsightBox icon={Home}       color="#6B9EC9" title="Busiest Hall"        value={computed.hallAllocation[0] ? `${computed.hallAllocation[0].venue} / ${computed.hallAllocation[0].hall}` : '—'} sub={`${computed.hallAllocation[0]?.occupancy ?? 0}% occupancy`} />
        <InsightBox icon={Activity}   color="#4ADE80" title="Peak Month"          value={computed.peakMonths[0]?.month || '—'}               sub={`${computed.peakMonths[0]?.bookings ?? 0} bookings`} />
        <InsightBox icon={Zap}        color="#F87171" title="Critical Conflicts"  value={computed.criticalConflicts.length}                   sub={computed.criticalConflicts.length ? 'Confirmed vs Confirmed' : 'None detected'} />
      </div>

      {/* Sub-Reports Summaries Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <div className="card-title" style={{ margin: 0 }}>Analytical Sub-Reports Summary</div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Real-time metric previews and single-click access portals to each of the 8 dedicated report suites.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {reportSummaries.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="sub-report-card" onClick={() => navigate(s.path)}>
                <div>
                  <div className="sub-report-header">
                    <div className="sub-report-icon-wrapper" style={{ backgroundColor: s.bgColor, color: s.iconColor }}>
                      <Icon size={16} />
                    </div>
                    <div className="sub-report-title">{s.title}</div>
                  </div>
                  
                  <div className="sub-report-desc">{s.desc}</div>

                  <div className="sub-report-metrics-grid">
                    {s.metrics.map((m, idx) => (
                      <div key={idx} className="sub-report-metric-item">
                        <span className="sub-report-metric-label">{m.label}</span>
                        <span 
                          className="sub-report-metric-value" 
                          style={{ color: m.highlight ? '#F87171' : 'inherit' }}
                        >
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sub-report-footer">
                  <span>Explore full report</span>
                  <span><ChevronRight size={14} /></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ReportLayout>
  );
}
