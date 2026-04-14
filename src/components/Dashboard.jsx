import { ArrowUpRight, Building2, Calendar, CalendarCheck, Plus, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { aiResponses } from '../data/staticData';

function StatusPill({ status }) {
  const s = status.toLowerCase();
  return <span className={`status-pill ${s}`}>{status}</span>;
}

function buildMonthlySeries(bookings) {
  const byMonth = new Map();

  bookings.forEach((booking) => {
    const key = (booking.eventStartDate || '').slice(0, 7);
    if (!key) return;
    const date = new Date(`${key}-01`);
    const label = date.toLocaleDateString('en-IN', { month: 'short' });
    const current = byMonth.get(key) || { month: label, revenue: 0, bookings: 0 };
    current.revenue += booking.revenue || 0;
    current.bookings += 1;
    byMonth.set(key, current);
  });

  return [...byMonth.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => ({
      month: value.month,
      revenue: Number((value.revenue / 100000).toFixed(1)),
      bookings: value.bookings,
    }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div style={{ background: '#111927', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: '#C9A84C', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#F0E8D4' }}>Rs{payload[0].value}L revenue</div>
      <div style={{ color: '#9A8F7A' }}>{payload[1]?.value} bookings</div>
    </div>
  );
};

export default function Dashboard({ bookings, venues, onNav, onUpdateStatus }) {
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.revenue || 0), 0);
  const confirmed = bookings.filter((booking) => booking.status.toLowerCase() === 'confirmed').length;
  const tentative = bookings.filter((booking) => booking.status.toLowerCase() === 'tentative').length;
  const monthlySeries = buildMonthlySeries(bookings);
  const recent = [...bookings]
    .sort((left, right) => (right.eventStartDate || '').localeCompare(left.eventStartDate || ''))
    .slice(0, 5);

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Welcome back, Avinash</h1>
          <p>Enterprise Admin · Smart Booking Engine</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNav('new-booking')}>
          <Plus size={18} style={{ marginRight: 8 }} /> Create New Booking
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={17} /></div>
          <div className="stat-label">Total Revenue (YTD)</div>
          <div className="stat-value">Rs{(totalRevenue / 100000).toFixed(1)}L</div>
          <div className="stat-sub" style={{ color: '#4ADE80' }}><ArrowUpRight size={13} /> Synchronized with frontend mock</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CalendarCheck size={17} /></div>
          <div className="stat-label">Active Bookings</div>
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-sub">{confirmed} confirmed, {tentative} tentative</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Building2 size={17} /></div>
          <div className="stat-label">Venues</div>
          <div className="stat-value">{venues.length}</div>
          <div className="stat-sub">Centralized venue management</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Users size={17} /></div>
          <div className="stat-label">Total Pipeline</div>
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-sub">Across all event types</div>
        </div>
      </div>

      <div className="grid-7030">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div className="card-title">Revenue Trend</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Generated from dynamic mock data</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('reports')}>Full Report</button>
          </div>
          <div className="chart-wrap" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySeries} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5A5248', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#revGrad)" dot={{ fill: '#C9A84C', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.9rem' }}>AI</span> Insights
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('ai')}>View All</button>
          </div>
          {Object.keys(aiResponses).slice(0, 2).map((query) => (
            <div key={query} className="ai-insight-card">
              <div className="ai-insight-tag">{query}</div>
              <div className="ai-insight-text" style={{ fontSize: '0.8rem' }}>{aiResponses[query].slice(0, 100)}...</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title">Latest Seed Bookings</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('bookings')}>View All</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Event</th>
              <th>Venue / Hall</th>
              <th>Organizer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((booking) => {
              const venue = venues.find((item) => item.id === booking.venueId);

              return (
                <tr key={booking.id}>
                  <td style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.82rem' }}>{booking.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>{booking.eventName}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{booking.eventType}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.84rem' }}>{booking.hall}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{venue?.name}</div>
                  </td>
                  <td className="muted">{booking.organizer}</td>
                  <td className="muted" style={{ fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      {booking.eventStartDate}
                    </div>
                  </td>
                  <td><StatusPill status={booking.status} /></td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onUpdateStatus(booking.id, booking.status.toLowerCase() === 'confirmed' ? 'completed' : 'confirmed')}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
