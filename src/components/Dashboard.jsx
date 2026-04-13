import { TrendingUp, Calendar, MapPin, Users, ArrowUpRight, LayoutDashboard, CalendarCheck, Building2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { venues, halls, revenueData, aiInsights } from '../data/staticData';

function StatusPill({ status }) {
  return <span className={`status-pill ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#111927', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
        <div style={{ color: '#C9A84C', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ color: '#F0E8D4' }}>₹{payload[0].value}L revenue</div>
        <div style={{ color: '#9A8F7A' }}>{payload[1]?.value} bookings</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard({ onNav, bookings, onUpdateStatus }) {
  const totalRevenue = bookings.reduce((s, b) => s + (b.revenue || 0), 0);
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const tentative = bookings.filter(b => b.status === 'tentative').length;

  const recent = [...bookings].slice(0, 5);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, Avinash</h1>
        <p>Enterprise Admin · Smart Booking Engine</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={17} /></div>
          <div className="stat-label">Total Revenue (FY)</div>
          <div className="stat-value">₹{(totalRevenue / 100000).toFixed(1)}L</div>
          <div className="stat-sub" style={{ color: '#4ADE80' }}><ArrowUpRight size={13} /> +24% vs last quarter</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CalendarCheck size={17} /></div>
          <div className="stat-label">Active Bookings</div>
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-sub">{confirmed} confirmed, {tentative} tentative</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Building2 size={17} /></div>
          <div className="stat-label">Venues & Halls</div>
          <div className="stat-value">{venues.length} / {halls.length}</div>
          <div className="stat-sub">82% average occupancy</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Users size={17} /></div>
          <div className="stat-label">Organizers</div>
          <div className="stat-value">6</div>
          <div className="stat-sub">3 active this month</div>
        </div>
      </div>

      <div className="grid-7030">
        {/* Revenue chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div className="card-title">Revenue Trend</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last 6 months (in Lakhs ₹)</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('reports')}>Full Report</button>
          </div>
          <div className="chart-wrap" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
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

        {/* AI Insight mini */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.9rem' }}>✦</span> AI Signals
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('ai')}>View All</button>
          </div>
          {aiInsights.slice(0, 3).map((ins, i) => (
            <div key={i} className="ai-insight-card">
              <div className="ai-insight-tag">{ins.tag}</div>
              {ins.value && <div className="ai-insight-val">{ins.value}</div>}
              <div className="ai-insight-text">{ins.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title">Recent Bookings</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('bookings')}>View All</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Event</th>
              <th>Hall</th>
              <th>Date</th>
              <th>Status</th>
              <th>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(b => {
              const hall = halls.find(h => h.id === b.hallId);
              return (
                <tr key={b.id}>
                  <td style={{ color: 'var(--gold)', fontWeight: 500, fontSize: '0.82rem' }}>{b.id}</td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: '0.86rem' }}>{b.eventName}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{b.eventType}</div>
                  </td>
                  <td className="muted">{hall?.name}</td>
                  <td className="muted">{b.eventDate}</td>
                  <td><StatusPill status={b.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(b.status === 'tentative' || b.status === 'draft') && (
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ color: 'var(--status-confirmed-txt)', borderColor: 'var(--status-confirmed-bg)', padding: '2px 8px' }}
                          onClick={() => onUpdateStatus(b.id, 'confirmed')}
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ color: 'var(--status-completed-txt)', borderColor: 'var(--status-completed-bg)', padding: '2px 8px' }}
                          onClick={() => onUpdateStatus(b.id, 'completed')}
                        >
                          Done
                        </button>
                      )}
                    </div>
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
