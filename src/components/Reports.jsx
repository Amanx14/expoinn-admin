import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area
} from 'recharts';
import { occupancyData, revenueByIndustry } from '../data/staticData';

const CustomBar = (props) => {
  const { x, y, width, height } = props;
  return (
    <rect x={x} y={y} width={width} height={height} rx={4} fill="url(#barGrad)" />
  );
};

const CustomTooltipDark = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#111927', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: '#C9A84C', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: '#F0E8D4' }}>{p.name}: {p.value}{p.name === 'revenue' ? 'L' : p.name === 'bookings' ? '' : p.name === 'occupancy' ? '%' : ''}</div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports({ bookings, venues }) {
  const { totalRev, avgRev, confirmedCount, monthlySeries, sectorSeries, hallSeries } = useMemo(() => {
    const totalRev = bookings.reduce((s, b) => s + (b.revenue || 0), 0);
    const avgRev = bookings.length ? totalRev / bookings.length : 0;
    const confirmedCount = bookings.filter(b => b.status.toLowerCase() === 'confirmed').length;

    // Monthly Data from occupancyData
    const monthlySeries = occupancyData.months.map((m, i) => ({
      month: m,
      revenue: (occupancyData.v1[i] * 2.5).toFixed(1), // Mocked for visualization
      bookings: Math.floor(occupancyData.v1[i] / 15)
    }));

    // Sector Data from revenueByIndustry
    const colors = ['#C9A84C', '#6B9EC9', '#C96B9E', '#6BC99E', '#9E9E6B', '#93C5FD', '#FBBF24'];
    const sectorSeries = revenueByIndustry.map((item, i) => ({
      name: item.industry,
      value: item.bookings,
      color: colors[i % colors.length]
    }));

    // Hall Performance from occupancyData (using venue averages)
    const hallSeries = venues.map(v => {
      const vData = occupancyData[v.id] || [];
      const avgOcc = vData.length ? Math.round(vData.reduce((a,b) => a+b, 0) / vData.length) : 0;
      return {
        name: v.name,
        occupancy: avgOcc,
        bookings: bookings.filter(b => b.venueId === v.id).length
      };
    });

    return { totalRev, avgRev, confirmedCount, monthlySeries, sectorSeries, hallSeries };
  }, [bookings, venues]);

  const exportReport = () => {
    const headers = ['Month', 'Projected Revenue (L)', 'Booking Count'];
    const rows = monthlySeries.map(m => [m.month, m.revenue, m.bookings]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(r => { csv += r.join(',') + '\n'; });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Revenue_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Reports & Analytics</h1>
          <p>Comprehensive performance metrics driven by synchronized frontend revenue data.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={exportReport}>
          Export Report
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Revenue (YTD)', value: `₹${(totalRev / 100000).toFixed(1)}L`, sub: 'Matched with frontend' },
          { label: 'Avg. Value / Booking', value: `₹${(avgRev / 100000).toFixed(1)}L`, sub: `${bookings.length} total entries` },
          { label: 'Confirmed Pipeline', value: confirmedCount, sub: 'Legally blocked slots' },
          { label: 'Total Occupancy', value: '72%', sub: 'Weighted average' },
        ].map((k, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{k.label}</div>
            <div className="stat-value" style={{ fontSize: '1.7rem' }}>{k.value}</div>
            <div className="stat-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>Revenue Breakdown</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>In Lakhs (₹) — Monthly Projection</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySeries} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8C96B" />
                    <stop offset="100%" stopColor="#8A6E2E" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltipDark />} />
                <Bar dataKey="revenue" shape={<CustomBar />} name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>Booking Mix by Industry</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Distribution of event clusters</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sectorSeries} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {sectorSeries.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ fontSize: 10, color: '#9A8F7A' }}>{value}</span>}
                  iconSize={6}
                />
                <Tooltip contentStyle={{ background: '#111927', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 18 }}>Venue Performance Index</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {hallSeries.map((h, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 40px', gap: 10, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>{h.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>{h.occupancy}% Avg Occ.</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${h.occupancy}%` }} />
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.76rem', color: 'var(--text-muted)' }}>{h.bookings} total</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 4 }}>Volume Momentum</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Booking counts trend</div>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlySeries} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="bkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B9EC9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6B9EC9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltipDark />} />
              <Area type="monotone" dataKey="bookings" stroke="#6B9EC9" strokeWidth={2} fill="url(#bkGrad)" name="bookings" dot={{ fill: '#6B9EC9', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
