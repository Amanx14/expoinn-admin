import { useMemo, useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight,
  Send,
  MessageSquare
} from 'lucide-react';
import { aiResponses } from '../data/staticData';

function findBestResponse(query) {
  const q = query.toLowerCase().trim();
  // Exact match first
  if (aiResponses[q]) return aiResponses[q];
  // Partial match
  const keys = Object.keys(aiResponses);
  const match = keys.find(k => q.includes(k) || k.includes(q));
  if (match) return aiResponses[match];
  // Keyword match
  const keywords = q.split(/\s+/);
  for (const key of keys) {
    const keyWords = key.split(/\s+/);
    const overlap = keywords.filter(w => keyWords.some(kw => kw.includes(w) || w.includes(kw)));
    if (overlap.length >= 2) return aiResponses[key];
  }
  // Fallback
  return `Based on current booking data analysis, I found **${Math.floor(Math.random() * 5) + 3} relevant patterns** for your query "${query}". The system currently tracks ${Object.keys(aiResponses).length} pre-configured insight categories. Try asking about: revenue trends, demand forecasting, conflicts, hall utilization, or billing status for more specific insights.`;
}

function renderMarkdownBold(text) {
  return text.split('**').map((part, idx) =>
    idx % 2 === 1
      ? <strong key={idx} style={{ color: 'var(--text-primary)' }}>{part}</strong>
      : part
  );
}

export default function AIInsights({ bookings }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef(null);

  const upcoming = useMemo(() => {
    return [...bookings]
      .filter(b => b.status.toLowerCase() === 'tentative')
      .sort((a, b) => new Date(a.eventStartDate).getTime() - new Date(b.eventStartDate).getTime());
  }, [bookings]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendQuery = (query) => {
    if (!query.trim()) return;
    const response = findBestResponse(query);
    setChatHistory(prev => [
      ...prev,
      { type: 'user', text: query },
      { type: 'ai', text: response }
    ]);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery(inputValue);
    }
  };

  const exportAnalysis = () => {
    const headers = ['Booking ID', 'Event Name', 'Status', 'Date', 'Revenue (L)'];
    const rows = upcoming.map(b => [b.id, b.eventName, b.status, b.eventStartDate, (b.revenue / 100000).toFixed(1)]);
    let csv = headers.join(',') + '\n';
    rows.forEach(r => { csv += r.join(',') + '\n'; });
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `AI_Analysis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
            {Object.entries(aiResponses).slice(0, 6).map(([query, response], i) => (
              <div key={i} className="card" style={{ borderLeft: '3px solid var(--gold)', cursor: 'pointer' }} onClick={() => handleSendQuery(query)}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ marginTop: 2 }}>
                    {i % 2 === 0 ? <TrendingUp size={16} style={{ color: 'var(--gold)' }} /> : <Lightbulb size={16} style={{ color: 'var(--gold)' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{query}</div>
                    <div style={{ fontSize: '0.84rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                      {renderMarkdownBold(response.slice(0, 120))}...
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
                {upcoming.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No tentative bookings require immediate attention.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 80 }}>
          {/* AI Chat Panel */}
          <div className="card" style={{ background: 'linear-gradient(to bottom, rgba(201,168,76,0.08), transparent)' }}>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={14} style={{ color: 'var(--gold)' }} />
              Ask AI Engine
            </div>
            
            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="chat-container" style={{ marginBottom: 12 }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`chat-bubble ${msg.type}`}>
                    {msg.type === 'ai' ? renderMarkdownBold(msg.text) : msg.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Input */}
            <div className="chat-input-wrap">
              <textarea 
                className="form-input" 
                placeholder="Ask about revenue trends, conflicts, or demand forecasting..." 
                rows={3}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ resize: 'none', padding: '12px 50px 12px 14px', fontSize: '0.84rem' }}
              />
              <button 
                className="btn btn-primary btn-sm chat-send-btn" 
                onClick={() => handleSendQuery(inputValue)}
                disabled={!inputValue.trim()}
              >
                <Send size={14} />
              </button>
            </div>
            
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 12, marginBottom: 8 }}>SUGGESTED QUERIES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Highest revenue sectors?', 'Risk of cancellation?', 'Q4 demand forecast?', 'Hall utilization?', 'Billing status?'].map(q => (
                <div 
                  key={q} 
                  style={{ fontSize: '0.78rem', color: 'var(--gold)', cursor: 'pointer', padding: '6px 10px', background: 'rgba(201,168,76,0.05)', borderRadius: 6, border: '1px solid rgba(201,168,76,0.1)', transition: 'all 0.2s' }}
                  onClick={() => handleSendQuery(q.replace('?', ''))}
                  onMouseEnter={(e) => { e.target.style.background = 'rgba(201,168,76,0.12)'; e.target.style.borderColor = 'rgba(201,168,76,0.25)'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'rgba(201,168,76,0.05)'; e.target.style.borderColor = 'rgba(201,168,76,0.1)'; }}
                >
                  {q}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
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
