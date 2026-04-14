import { useMemo } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight
} from 'lucide-react';
import { aiResponses } from '../data/staticData';

export default function AIInsights({ bookings }) {
  const upcoming = useMemo(() => {
    return [...bookings]
      .filter(b => b.status.toLowerCase() === 'tentative')
      .sort((a, b) => new Date(a.eventStartDate).getTime() - new Date(b.eventStartDate).getTime());
  }, [bookings]);

  const exportAnalysis = () => {
    const headers = ['Booking ID', 'Event Name', 'Status', 'Date', 'Revenue (L)'];
    const rows = upcoming.map(b => [b.id, b.eventName, b.status, b.eventStartDate, (b.revenue / 100000).toFixed(1)]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(r => { csv += r.join(',') + '\n'; });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Analysis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ background: 'linear-gradient(135deg, var(--gold), #8A6E2E)', padding: 6, borderRadius: 8 }}>
              <Sparkles size={18} style={{ color: 'var(--bg-base)' }} />
            </div>
            <h1 style={{ margin: 0 }}>AI Insights</h1>
          </div>
          <p>Intelligent analysis of booking patterns, revenue trends, and operational risks.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={exportAnalysis}>
          Export Analysis
        </button>
      </div>

      <div className="grid-7030" style={{ alignItems: 'flex-start' }}>
        <div>
          {/* AI Response Cards */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            {Object.entries(aiResponses).map(([query, response], i) => (
              <div key={i} className="card" style={{ borderLeft: '3px solid var(--gold)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ marginTop: 2 }}>
                    {i % 2 === 0 ? <TrendingUp size={16} style={{ color: 'var(--gold)' }} /> : <Lightbulb size={16} style={{ color: 'var(--gold)' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{query}</div>
                    <div style={{ fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                      {response.split('**').map((part, idx) => idx % 2 === 1 ? <strong key={idx} style={{ color: 'var(--text-primary)' }}>{part}</strong> : part)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 18 }}>Immediate Attention Required</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Event Details</th>
                  <th>Revenue</th>
                  <th>Urgency</th>
                  <th>AI Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(b => {
                  const eventDate = new Date(b.eventStartDate);
                  const today     = new Date();
                  const daysLeft  = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                  const priority  = daysLeft < 20 ? 'High' : daysLeft < 40 ? 'Medium' : 'Low';
                  const priorityColor = { High: '#F87171', Medium: '#FBBF24', Low: '#4ADE80' }[priority];
                  return (
                    <tr key={b.id}>
                      <td style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.82rem' }}>{b.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{b.eventName}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{b.eventStartDate}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{(b.revenue / 100000).toFixed(1)}L</td>
                      <td>
                        <span style={{ color: priorityColor, fontWeight: 600 }}>{daysLeft}d</span>
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
        </div>

        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card" style={{ background: 'linear-gradient(to bottom, rgba(201,168,76,0.08), transparent)' }}>
            <div className="section-title">Ask AI Engine</div>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <textarea 
                className="form-input" 
                placeholder="Ask about revenue trends, conflicts, or demand forecasting..." 
                rows={4}
                style={{ resize: 'none', padding: '12px', fontSize: '0.84rem' }}
              />
              <button className="btn btn-primary btn-sm" style={{ position: 'absolute', right: 8, bottom: 8, padding: '4px 8px' }}>
                <ArrowRight size={14} />
              </button>
            </div>
            
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12 }}>SUGGESTED QUERIES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Highest revenue sectors?', 'Risk of cancellation?', 'Q4 demand forecast?'].map(q => (
                <div key={q} style={{ fontSize: '0.78rem', color: 'var(--gold)', cursor: 'pointer', padding: '6px 10px', background: 'rgba(201,168,76,0.05)', borderRadius: 6, border: '1px solid rgba(201,168,76,0.1)' }}>
                  {q}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <AlertTriangle size={18} style={{ color: '#FBBF24', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Anomaly Detected</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Bharat Mandapam Hall 2 shows unusually high setup duration (4 days) for a Corporate Event. Check logistics.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
