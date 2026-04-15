import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area
} from 'recharts';
import { occupancyData, revenueByIndustry, checkConflicts } from '../data/staticData';
import { Download, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'competitive', label: 'A. Competitive' },
  { key: 'ownShows', label: 'B. Own Shows' },
  { key: 'demand', label: 'C. Demand' },
  { key: 'hallAlloc', label: 'D. Hall Alloc' },
  { key: 'conflict', label: 'E. Conflicts' },
  { key: 'revenue', label: 'F. Revenue' },
  { key: 'billing', label: 'G. Billing' },
];

const CHART_COLORS = ['#C9A84C', '#6B9EC9', '#C96B9E', '#6BC99E', '#9E9E6B', '#93C5FD', '#FBBF24', '#A78BFA', '#F87171'];

const CustomBar = (props) => {
  const { x, y, width, height } = props;
  return <rect x={x} y={y} width={width} height={height} rx={4} fill="url(#barGrad)" />;
};

const CustomTooltipDark = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#111927', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: '#C9A84C', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: '#F0E8D4' }}>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports({ bookings, venues }) {
  const [activeTab, setActiveTab] = useState('overview');

  // ── Computed Data ──────────────────────────────
  const computed = useMemo(() => {
    const totalRev = bookings.reduce((s, b) => s + (b.revenue || 0), 0);
    const avgRev = bookings.length ? totalRev / bookings.length : 0;
    const confirmed = bookings.filter(b => b.status === 'Confirmed');
    const tentative = bookings.filter(b => b.status === 'Tentative');
    const draft = bookings.filter(b => b.status === 'Draft');
    const completed = bookings.filter(b => b.status === 'Completed');
    const cancelled = bookings.filter(b => b.status === 'Cancelled');

    // Monthly from occupancy data
    const monthlySeries = occupancyData.months.map((m, i) => ({
      month: m,
      revenue: Number((occupancyData.v1[i] * 2.5).toFixed(1)),
      bookings: Math.floor(occupancyData.v1[i] / 15)
    }));

    // Industry pie
    const sectorSeries = revenueByIndustry.map((item, i) => ({
      name: item.industry, value: item.bookings, revenue: item.revenue,
      color: CHART_COLORS[i % CHART_COLORS.length]
    }));

    // Hall performance
    const hallSeries = venues.map(v => {
      const vData = occupancyData[v.id] || [];
      const avgOcc = vData.length ? Math.round(vData.reduce((a,b) => a+b, 0) / vData.length) : 0;
      return { name: v.name, occupancy: avgOcc, bookings: bookings.filter(b => b.venueId === v.id).length };
    });

    // Demand analysis — HD vs LD
    const demandData = [
      { period: 'Jan-Mar (HD)', bookings: bookings.filter(b => { const m = new Date(b.eventStartDate).getMonth(); return m >= 0 && m <= 2; }).length, type: 'HD' },
      { period: 'Apr-Jun (LD)', bookings: bookings.filter(b => { const m = new Date(b.eventStartDate).getMonth(); return m >= 3 && m <= 5; }).length, type: 'LD' },
      { period: 'Jul-Sep (HD)', bookings: bookings.filter(b => { const m = new Date(b.eventStartDate).getMonth(); return m >= 6 && m <= 8; }).length, type: 'HD' },
      { period: 'Oct-Dec (HD)', bookings: bookings.filter(b => { const m = new Date(b.eventStartDate).getMonth(); return m >= 9 && m <= 11; }).length, type: 'HD' },
    ];

    // Hall allocation detail
    const hallAllocData = [];
    venues.forEach(v => {
      v.halls.forEach(h => {
        const hallBookings = bookings.filter(b => b.venueId === v.id && b.hall === h.name);
        const confirmedDays = hallBookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => {
          const s = new Date(b.setupDate || b.eventStartDate);
          const e = new Date(b.dismantleDate || b.eventEndDate);
          return sum + Math.ceil((e - s) / (1000 * 60 * 60 * 24));
        }, 0);
        hallAllocData.push({ venue: v.name, hall: h.name, totalBookings: hallBookings.length, confirmedDays, occupancy: Math.min(100, Math.round(confirmedDays / 3.65)) });
      });
    });

    // Conflicts
    const conflicts = [];
    bookings.forEach(b => {
      if (b.status === 'Cancelled') return;
      const conf = checkConflicts(bookings, b);
      conf.forEach(c => {
        const key = [b.id, c.id].sort().join('-');
        if (!conflicts.find(x => x.key === key)) {
          conflicts.push({ key, booking1: b, booking2: c });
        }
      });
    });

    // Revenue by industry
    const revByIndustry = {};
    bookings.forEach(b => {
      if (!revByIndustry[b.industry]) revByIndustry[b.industry] = { revenue: 0, count: 0 };
      revByIndustry[b.industry].revenue += b.revenue || 0;
      revByIndustry[b.industry].count += 1;
    });
    const revByIndustrySeries = Object.entries(revByIndustry).map(([ind, data], i) => ({
      name: ind, revenue: Number((data.revenue / 100000).toFixed(1)), count: data.count,
      color: CHART_COLORS[i % CHART_COLORS.length]
    })).sort((a, b) => b.revenue - a.revenue);

    // Revenue by event
    const revByEvent = bookings.map(b => ({
      name: b.eventName, revenue: Number((b.revenue / 100000).toFixed(1)), status: b.status
    })).sort((a, b) => b.revenue - a.revenue);

    // Billing
    const confirmedRev = confirmed.reduce((s, b) => s + (b.revenue || 0), 0);
    const tentativeRev = tentative.reduce((s, b) => s + (b.revenue || 0), 0);
    const draftRev = draft.reduce((s, b) => s + (b.revenue || 0), 0);
    const completedRev = completed.reduce((s, b) => s + (b.revenue || 0), 0);

    // Own shows categorization
    const now = new Date();
    const pastShows = bookings.filter(b => new Date(b.eventEndDate) < now);
    const upcomingShows = bookings.filter(b => new Date(b.eventStartDate) > now && b.status === 'Confirmed');
    const probableShows = bookings.filter(b => new Date(b.eventStartDate) > now && (b.status === 'Tentative' || b.status === 'Draft'));

    return {
      totalRev, avgRev, confirmed, tentative, draft, completed, cancelled,
      monthlySeries, sectorSeries, hallSeries, demandData, hallAllocData, conflicts,
      revByIndustrySeries, revByEvent, confirmedRev, tentativeRev, draftRev, completedRev,
      pastShows, upcomingShows, probableShows
    };
  }, [bookings, venues]);

  const exportReport = () => {
    const tabLabels = { overview: 'Overview', competitive: 'Competitive Analytics', ownShows: 'Own Shows (IEML)', demand: 'Demand Analysis', hallAlloc: 'Hall Allocation', conflict: 'Conflict Report', revenue: 'Revenue Report', billing: 'Billing Report' };
    const title = tabLabels[activeTab] || 'Report';
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const doc = new jsPDF();
    const gold = [201, 168, 76];
    const dark = [26, 26, 46];

    // Header bar
    doc.setFillColor(...dark);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setTextColor(...gold);
    doc.setFontSize(18);
    doc.text('ExpoInn', 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('Smart Booking Engine — Admin Report', 14, 24);
    doc.setTextColor(...gold);
    doc.text(dateStr, 196, 16, { align: 'right' });
    doc.setTextColor(180, 180, 180);
    doc.text('Generated by Admin Panel', 196, 24, { align: 'right' });

    // Title
    doc.setTextColor(...dark);
    doc.setFontSize(14);
    doc.text(title, 14, 44);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total bookings: ${bookings.length}  |  Total Revenue: Rs.${(computed.totalRev / 100000).toFixed(1)}L  |  Conflicts: ${computed.conflicts.length}`, 14, 52);

    // Build table data per tab
    let headers = [];
    let rows = [];

    switch (activeTab) {
      case 'overview':
        headers = ['Month', 'Revenue (Rs.L)', 'Bookings'];
        rows = computed.monthlySeries.map(m => [m.month, m.revenue, m.bookings]);
        break;
      case 'competitive':
        headers = ['Industry', 'Bookings', 'Revenue (Rs.L)', 'Avg (Rs.L)'];
        rows = computed.revByIndustrySeries.map(r => [r.name, r.count, r.revenue, (r.revenue / r.count).toFixed(1)]);
        break;
      case 'ownShows':
        headers = ['Category', 'Event', 'Venue/Hall', 'Start', 'End', 'Status', 'Rev (Rs.L)'];
        [['Past', computed.pastShows], ['Upcoming', computed.upcomingShows], ['Probable', computed.probableShows]].forEach(([cat, items]) => {
          items.forEach(b => rows.push([cat, b.eventName, `${b.hall} - ${venues.find(v => v.id === b.venueId)?.name || ''}`, b.eventStartDate, b.eventEndDate, b.status, ((b.revenue||0)/100000).toFixed(1)]));
        });
        break;
      case 'demand':
        headers = ['Period', 'Bookings', 'Type'];
        rows = computed.demandData.map(d => [d.period, d.bookings, d.type]);
        break;
      case 'hallAlloc':
        headers = ['Venue', 'Hall', 'Bookings', 'Conf. Days', 'Occupancy %'];
        rows = computed.hallAllocData.map(h => [h.venue, h.hall, h.totalBookings, h.confirmedDays, `${h.occupancy}%`]);
        break;
      case 'conflict':
        headers = ['Event A', 'Dates A', 'Event B', 'Dates B', 'Hall', 'Severity'];
        if (computed.conflicts.length === 0) rows = [['No conflicts detected', '', '', '', '', '']];
        else rows = computed.conflicts.map(c => {
          const sev = (c.booking1.status === 'Confirmed' && c.booking2.status === 'Confirmed') ? 'Critical' : 'Warning';
          return [c.booking1.eventName, `${c.booking1.setupDate} - ${c.booking1.dismantleDate}`, c.booking2.eventName, `${c.booking2.setupDate} - ${c.booking2.dismantleDate}`, c.booking1.hall, sev];
        });
        break;
      case 'revenue':
        headers = ['Event', 'Industry', 'Type', 'Status', 'Revenue (Rs.L)'];
        rows = [...bookings].sort((a,b) => (b.revenue||0)-(a.revenue||0)).map(b => [b.eventName, b.industry, b.eventType, b.status, ((b.revenue||0)/100000).toFixed(1)]);
        break;
      case 'billing':
        headers = ['Event', 'Organizer', 'Status', 'Revenue (Rs.L)', 'Payment'];
        rows = bookings.map(b => {
          const pay = b.status === 'Confirmed' ? 'Invoice Sent' : b.status === 'Completed' ? 'Paid' : 'Pending';
          return [b.eventName, b.organizer, b.status, ((b.revenue||0)/100000).toFixed(1), pay];
        });
        break;
      default:
        headers = ['ID', 'Event', 'Industry', 'Status', 'Revenue'];
        rows = bookings.map(b => [b.id, b.eventName, b.industry, b.status, b.revenue]);
    }

    autoTable(doc, {
      startY: 58,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: dark, textColor: gold, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 246, 241] },
      styles: { cellPadding: 3, lineColor: [220, 220, 220], lineWidth: 0.2 },
      margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('ExpoInn Smart Booking Engine — Confidential', 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' });
    }

    doc.save(`ExpoInn_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Reports & Analytics</h1>
          <p>Comprehensive performance metrics with 7 dedicated report modules per PRD.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={exportReport}><Download size={14} /> Download PDF</button>
      </div>

      {/* Tabs */}
      <div className="report-tabs">
        {TABS.map(tab => (
          <button key={tab.key} className={`report-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Revenue (YTD)', value: `₹${(computed.totalRev / 100000).toFixed(1)}L`, sub: `${bookings.length} total bookings` },
              { label: 'Avg. Value / Booking', value: `₹${(computed.avgRev / 100000).toFixed(1)}L`, sub: 'Per event average' },
              { label: 'Confirmed Pipeline', value: computed.confirmed.length, sub: 'Legally blocked slots' },
              { label: 'Active Conflicts', value: computed.conflicts.length, sub: computed.conflicts.length > 0 ? 'Needs attention' : 'All clear' },
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
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Monthly Projection (₹L)</div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computed.monthlySeries} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
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
                    <Pie data={computed.sectorSeries} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {computed.sectorSeries.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Legend formatter={(value) => <span style={{ fontSize: 10, color: '#9A8F7A' }}>{value}</span>} iconSize={6} />
                    <Tooltip contentStyle={{ background: '#111927', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 18 }}>Venue Performance Index</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {computed.hallSeries.map((h, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 40px', gap: 10, alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>{h.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>{h.occupancy}% Avg</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${h.occupancy}%` }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.76rem', color: 'var(--text-muted)' }}>{h.bookings}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── A. COMPETITIVE ANALYTICS ───────────── */}
      {activeTab === 'competitive' && (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 4 }}>Industry & Sector Trends</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Revenue distribution by industry (₹L)</div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={computed.revByIndustrySeries} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#9A8F7A', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltipDark />} />
                  <Bar dataKey="revenue" name="Revenue (₹L)" radius={[0, 4, 4, 0]}>
                    {computed.revByIndustrySeries.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Competitor Insights by Sector</div>
            <table className="data-table">
              <thead><tr><th>Industry</th><th>Bookings</th><th>Revenue (₹L)</th><th>Avg Revenue</th><th>Market Share</th></tr></thead>
              <tbody>
                {computed.revByIndustrySeries.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td>{r.count}</td>
                    <td style={{ color: 'var(--gold)' }}>₹{r.revenue}L</td>
                    <td>₹{(r.revenue / r.count).toFixed(1)}L</td>
                    <td>
                      <div className="progress-bar-wrap" style={{ width: 80, display: 'inline-block' }}>
                        <div className="progress-bar-fill" style={{ width: `${Math.round(r.revenue / computed.revByIndustrySeries[0].revenue * 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── B. OWN SHOWS ─────────────────────── */}
      {activeTab === 'ownShows' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card">
              <div className="stat-label">Past Events</div>
              <div className="stat-value">{computed.pastShows.length}</div>
              <div className="stat-sub">Completed shows</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Upcoming Confirmed</div>
              <div className="stat-value">{computed.upcomingShows.length}</div>
              <div className="stat-sub">Locked-in events</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Probable Pipeline</div>
              <div className="stat-value">{computed.probableShows.length}</div>
              <div className="stat-sub">Tentative + Draft</div>
            </div>
          </div>
          {[
            { label: 'Past Events', items: computed.pastShows, color: '#A5B4FC' },
            { label: 'Upcoming Confirmed', items: computed.upcomingShows, color: '#4ADE80' },
            { label: 'Probable Events', items: computed.probableShows, color: '#FBBF24' },
          ].map(section => (
            <div key={section.label} className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 14, color: section.color }}>{section.label}</div>
              {section.items.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', padding: 20, textAlign: 'center' }}>No events in this category.</div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Event</th><th>Venue/Hall</th><th>Dates</th><th>Status</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {section.items.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600 }}>{b.eventName}</td>
                        <td className="muted">{b.hall} · {venues.find(v => v.id === b.venueId)?.name}</td>
                        <td className="muted">{b.eventStartDate} — {b.eventEndDate}</td>
                        <td><span className={`status-pill ${b.status.toLowerCase()}`}>{b.status}</span></td>
                        <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{(b.revenue / 100000).toFixed(1)}L</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </>
      )}

      {/* ── C. DEMAND ANALYSIS ──────────────── */}
      {activeTab === 'demand' && (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 4 }}>High Demand vs Low Demand Periods</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Booking density by quarter</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={computed.demandData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="period" tick={{ fill: '#5A5248', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltipDark />} />
                  <Bar dataKey="bookings" name="Bookings" radius={[4, 4, 0, 0]}>
                    {computed.demandData.map((entry, i) => (
                      <Cell key={i} fill={entry.type === 'HD' ? '#F87171' : '#4ADE80'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Peak Booking Months</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Monthly occupancy trend across all venues</div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={computed.monthlySeries} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltipDark />} />
                  <Area type="monotone" dataKey="bookings" stroke="#C9A84C" strokeWidth={2} fill="url(#demandGrad)" name="bookings" dot={{ fill: '#C9A84C', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ── D. HALL ALLOCATION ──────────────── */}
      {activeTab === 'hallAlloc' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>Hall Occupancy & Prime Date Usage</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Detailed allocation per hall across all venues</div>
          <table className="data-table">
            <thead><tr><th>Venue</th><th>Hall</th><th>Bookings</th><th>Confirmed Days</th><th>Occupancy</th></tr></thead>
            <tbody>
              {computed.hallAllocData.map((h, i) => (
                <tr key={i}>
                  <td className="muted">{h.venue}</td>
                  <td style={{ fontWeight: 600 }}>{h.hall}</td>
                  <td>{h.totalBookings}</td>
                  <td>{h.confirmedDays} days</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar-wrap" style={{ flex: 1 }}>
                        <div className="progress-bar-fill" style={{ width: `${h.occupancy}%` }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600, width: 40 }}>{h.occupancy}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── E. CONFLICT REPORT ─────────────── */}
      {activeTab === 'conflict' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <AlertTriangle size={18} style={{ color: computed.conflicts.length > 0 ? '#F87171' : '#4ADE80' }} />
            <div className="card-title" style={{ margin: 0 }}>
              {computed.conflicts.length > 0 ? `${computed.conflicts.length} Overlapping Conflict(s) Detected` : 'No Active Conflicts'}
            </div>
          </div>
          {computed.conflicts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.2 }}>✓</div>
              All bookings are conflict-free.
            </div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Booking A</th><th>Booking B</th><th>Hall</th><th>Date Overlap</th><th>Severity</th></tr></thead>
              <tbody>
                {computed.conflicts.map(c => {
                  const venue = venues.find(v => v.id === c.booking1.venueId);
                  return (
                    <tr key={c.key}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.booking1.eventName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.booking1.setupDate} – {c.booking1.dismantleDate}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.booking2.eventName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.booking2.setupDate} – {c.booking2.dismantleDate}</div>
                      </td>
                      <td className="muted">{c.booking1.hall} · {venue?.name}</td>
                      <td><span className="status-pill cancelled">Overlap</span></td>
                      <td>
                        <span style={{ color: (c.booking1.status === 'Confirmed' && c.booking2.status === 'Confirmed') ? '#F87171' : '#FBBF24', fontWeight: 600 }}>
                          {(c.booking1.status === 'Confirmed' && c.booking2.status === 'Confirmed') ? 'Critical' : 'Warning'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── F. REVENUE REPORTS ────────────── */}
      {activeTab === 'revenue' && (
        <>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 4 }}>Revenue by Industry (₹L)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Cumulative industry-wise revenue</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={computed.revByIndustrySeries} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="revenue">
                      {computed.revByIndustrySeries.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Legend formatter={(value) => <span style={{ fontSize: 9, color: '#9A8F7A' }}>{value}</span>} iconSize={6} />
                    <Tooltip content={<CustomTooltipDark />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Top Events by Revenue</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {computed.revByEvent.slice(0, 6).map((e, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 500 }}>{e.name}</div>
                      <span className={`status-pill ${e.status.toLowerCase()}`} style={{ fontSize: '0.62rem' }}>{e.status}</span>
                    </div>
                    <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.9rem' }}>₹{e.revenue}L</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Event-wise Revenue Detail</div>
            <table className="data-table">
              <thead><tr><th>Event</th><th>Industry</th><th>Type</th><th>Status</th><th>Revenue</th></tr></thead>
              <tbody>
                {bookings.sort((a,b) => (b.revenue||0)-(a.revenue||0)).map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.eventName}</td>
                    <td className="muted">{b.industry}</td>
                    <td className="muted">{b.eventType}</td>
                    <td><span className={`status-pill ${b.status.toLowerCase()}`}>{b.status}</span></td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{((b.revenue||0) / 100000).toFixed(1)}L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── G. BILLING REPORT ─────────────── */}
      {activeTab === 'billing' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Confirmed Revenue', value: `₹${(computed.confirmedRev / 100000).toFixed(1)}L`, sub: `${computed.confirmed.length} bookings`, color: '#4ADE80' },
              { label: 'Tentative Revenue', value: `₹${(computed.tentativeRev / 100000).toFixed(1)}L`, sub: `${computed.tentative.length} bookings`, color: '#FBBF24' },
              { label: 'Draft Pipeline', value: `₹${(computed.draftRev / 100000).toFixed(1)}L`, sub: `${computed.draft.length} bookings`, color: '#94A3B8' },
              { label: 'Completed Revenue', value: `₹${(computed.completedRev / 100000).toFixed(1)}L`, sub: `${computed.completed.length} events done`, color: '#A5B4FC' },
            ].map((k, i) => (
              <div key={i} className="stat-card">
                <div className="stat-label">{k.label}</div>
                <div className="stat-value" style={{ fontSize: '1.6rem', color: k.color }}>{k.value}</div>
                <div className="stat-sub">{k.sub}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 4 }}>Tentative vs Confirmed Pipeline</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Revenue pipeline by booking status</div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { status: 'Draft', revenue: Number((computed.draftRev / 100000).toFixed(1)) },
                    { status: 'Tentative', revenue: Number((computed.tentativeRev / 100000).toFixed(1)) },
                    { status: 'Confirmed', revenue: Number((computed.confirmedRev / 100000).toFixed(1)) },
                    { status: 'Completed', revenue: Number((computed.completedRev / 100000).toFixed(1)) },
                  ]}
                  margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="status" tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltipDark />} />
                  <Bar dataKey="revenue" name="Revenue (₹L)" radius={[4, 4, 0, 0]}>
                    <Cell fill="#94A3B8" />
                    <Cell fill="#FBBF24" />
                    <Cell fill="#4ADE80" />
                    <Cell fill="#A5B4FC" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Billing Breakdown</div>
            <table className="data-table">
              <thead><tr><th>Event</th><th>Organizer</th><th>Status</th><th>Revenue</th><th>Payment Status</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.eventName}</td>
                    <td className="muted">{b.organizer}</td>
                    <td><span className={`status-pill ${b.status.toLowerCase()}`}>{b.status}</span></td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{((b.revenue||0) / 100000).toFixed(1)}L</td>
                    <td>
                      <span style={{
                        fontSize: '0.72rem', padding: '3px 10px', borderRadius: 99,
                        background: b.status === 'Confirmed' ? 'rgba(34,197,94,0.12)' : b.status === 'Completed' ? 'rgba(99,102,241,0.12)' : 'rgba(234,179,8,0.12)',
                        color: b.status === 'Confirmed' ? '#4ADE80' : b.status === 'Completed' ? '#A5B4FC' : '#FBBF24',
                      }}>
                        {b.status === 'Confirmed' ? 'Invoice Sent' : b.status === 'Completed' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
