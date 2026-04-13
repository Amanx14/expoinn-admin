import { Sparkles, TrendingUp, AlertCircle, Lightbulb, DollarSign } from 'lucide-react';
import { aiInsights, halls, venues } from '../data/staticData';

const icons = [TrendingUp, AlertCircle, Lightbulb, DollarSign];

export default function AIInsights({ bookings }) {
  const upcoming = bookings.filter(b => b.status === 'tentative');

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--gold)' }}>✦</span> AI Insights
          </h1>
          <p>Natural language intelligence powered by your booking data.</p>
        </div>
        <div style={{ display: 'flex', align: 'center', gap: 8, padding: '8px 14px', background: 'var(--gold-faint)', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--gold)' }}>
          <Sparkles size={13} style={{ marginRight: 4 }} />
          AI Module Active
        </div>
      </div>

      {/* Big insights */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {aiInsights.map((ins, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div key={i} className="ai-insight-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div className="ai-insight-tag">{ins.tag}</div>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--gold-faint)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                  <Icon size={15} />
                </div>
              </div>
              {ins.value && <div className="ai-insight-val" style={{ marginBottom: 8 }}>{ins.value}</div>}
              <div className="ai-insight-text">{ins.text}</div>
            </div>
          );
        })}
      </div>

      {/* Tentative bookings needing attention */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 4 }}>Bookings Needing Attention</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Tentative bookings without deposit confirmation</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Event</th>
              <th>Revenue at Stake</th>
              <th>Days Until Event</th>
              <th>AI Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map(b => {
              const eventDate = new Date(b.eventDate);
              const today     = new Date();
              const daysLeft  = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
              const priority  = daysLeft < 20 ? 'High' : daysLeft < 40 ? 'Medium' : 'Low';
              const priorityColor = { High: '#F87171', Medium: '#FBBF24', Low: '#4ADE80' }[priority];
              return (
                <tr key={b.id}>
                  <td style={{ color: 'var(--gold)', fontWeight: 500, fontSize: '0.82rem' }}>{b.id}</td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: '0.86rem' }}>{b.eventName}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{b.eventDate}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>₹{(b.revenue / 100000).toFixed(1)}L</td>
                  <td>
                    <span style={{ color: priorityColor, fontWeight: 500 }}>{daysLeft}d</span>
                    <span style={{ fontSize: '0.72rem', color: priorityColor, marginLeft: 6, background: `${priorityColor}18`, padding: '1px 7px', borderRadius: 99 }}>{priority}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {daysLeft < 20 ? 'Send final confirmation request immediately.' : 'Follow up within 5 business days.'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Demand forecast strip */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>May–June Demand Forecast</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { period: 'May Week 1–2', occupancy: 88, label: 'High demand', color: '#F87171' },
            { period: 'May Week 3–4', occupancy: 72, label: 'Moderate', color: '#FBBF24' },
            { period: 'June Week 1–2', occupancy: 61, label: 'Available', color: '#4ADE80' },
          ].map((f, i) => (
            <div key={i} style={{ background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)', padding: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 8 }}>{f.period}</div>
              <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: f.color, marginBottom: 4 }}>{f.occupancy}%</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 10 }}>{f.label}</div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${f.occupancy}%`, background: `linear-gradient(90deg, ${f.color}80, ${f.color})` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
