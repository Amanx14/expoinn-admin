import { useMemo, useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight,
  Send,
  MessageSquare,
  Trash2,
  FileText,
  CheckCircle2,
  HelpCircle,
  Database,
  PieChart,
  DollarSign
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
  return `Based on current booking data analysis, I found some relevant patterns for your query "${query}". Try asking one of the suggested questions about peak demand, revenue by industry, or scheduling conflicts for more precise data.`;
}

function renderMarkdownBold(text) {
  return text.split('**').map((part, idx) =>
    idx % 2 === 1
      ? <strong key={idx} style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{part}</strong>
      : part
  );
}

export default function AIInsights({ bookings }) {
  const [chatHistory, setChatHistory] = useState([
    { 
      type: 'ai', 
      text: "Hello! I am your AI Booking Engine Assistant. I have fully indexed the current booking documents, hall allocations, and revenue metrics. Ask me any question, or select one of the quick analysis options below to start.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Derived statistics representing the "Document" database
  const stats = useMemo(() => {
    const totalRev = bookings.reduce((sum, b) => sum + (b.revenue || 0), 0);
    const confirmedCount = bookings.filter(b => b.status.toLowerCase() === 'confirmed').length;
    const tentativeCount = bookings.filter(b => b.status.toLowerCase() === 'tentative').length;
    const avgBookingVal = bookings.length ? totalRev / bookings.length : 0;
    
    return {
      totalRevenue: totalRev,
      confirmed: confirmedCount,
      tentative: tentativeCount,
      total: bookings.length,
      average: avgBookingVal
    };
  }, [bookings]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSendQuery = (queryText) => {
    if (!queryText.trim()) return;
    
    // Add user message
    const userMsg = { type: 'user', text: queryText, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setInputValue('');
    
    // Simulate AI typing delay
    setIsTyping(true);
    
    setTimeout(() => {
      const responseText = findBestResponse(queryText);
      const aiMsg = { type: 'ai', text: responseText, timestamp: new Date() };
      setChatHistory(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery(inputValue);
    }
  };

  const clearChat = () => {
    setChatHistory([
      { 
        type: 'ai', 
        text: "Chat cleared. I am ready to analyze the booking database. Ask me any question below.",
        timestamp: new Date()
      }
    ]);
  };

  const staticQuestions = [
    { label: "Peak demand periods?", query: "peak booking periods", icon: <TrendingUp size={14} /> },
    { label: "Top industries by revenue?", query: "top revenue industries", icon: <DollarSign size={14} /> },
    { label: "Any upcoming conflicts?", query: "upcoming conflicting events", icon: <AlertTriangle size={14} /> },
    { label: "Q4 2026 demand forecast?", query: "q4 demand forecast", icon: <Sparkles size={14} /> },
    { label: "Hall utilization report?", query: "hall utilization", icon: <Database size={14} /> },
    { label: "Current billing pipeline?", query: "billing status", icon: <PieChart size={14} /> },
  ];

  return (
    <div className="page">
      <style>{`
        .chat-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          height: calc(100vh - 200px);
          min-height: 520px;
        }
        @media (max-width: 1024px) {
          .chat-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          .chat-sidebar {
            display: none;
          }
        }
        
        /* Chat Box Container */
        .chat-box {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
          height: 100%;
        }
        
        /* Chat Header */
        .chat-header {
          padding: 16px 20px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        /* Chat Message Thread */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: radial-gradient(circle at top right, rgba(201, 168, 76, 0.02), transparent 40%);
        }
        
        /* Messages bubbles */
        .message-row {
          display: flex;
          width: 100%;
          margin-bottom: 4px;
        }
        .message-row.user {
          justify-content: flex-end;
        }
        .message-row.ai {
          justify-content: flex-start;
        }
        
        .message-bubble {
          max-width: 75%;
          padding: 12px 16px;
          font-size: 0.88rem;
          line-height: 1.5;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .message-row.user .message-bubble {
          background: var(--gold);
          color: var(--bg-base);
          font-weight: 500;
          border-radius: 14px 14px 2px 14px;
        }
        .message-row.ai .message-bubble {
          background: var(--bg-overlay);
          color: var(--text-primary);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 14px 14px 14px 2px;
        }
        
        .message-time {
          font-size: 0.68rem;
          color: var(--text-muted);
          margin-top: 4px;
          display: block;
        }
        .message-row.user .message-time {
          text-align: right;
          color: rgba(255,255,255,0.6);
        }
        
        /* Typing Dots */
        .typing-bubble {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 12px 20px;
          background: var(--bg-overlay);
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.03);
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          background: var(--text-secondary);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        
        /* Chat Welcome View */
        .chat-welcome {
          text-align: center;
          margin: auto;
          max-width: 480px;
          padding: 20px;
        }
        
        /* Quick starter question button grid */
        .static-questions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 24px;
        }
        .static-q-btn {
          background: rgba(201, 168, 76, 0.05);
          border: 1px solid rgba(201, 168, 76, 0.12);
          color: var(--text-primary);
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .static-q-btn:hover {
          background: rgba(201, 168, 76, 0.12);
          border-color: var(--gold);
          transform: translateY(-1px);
        }
        
        /* Chat Input Bar */
        .chat-input-bar {
          padding: 16px 20px;
          background: var(--bg-surface);
          border-top: 1px solid var(--border);
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .chat-textarea {
          flex: 1;
          background: var(--bg-overlay);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.86rem;
          resize: none;
          outline: none;
          height: 42px;
          line-height: 20px;
          transition: border-color 0.2s;
        }
        .chat-textarea:focus {
          border-color: var(--gold);
        }
        
        .chat-send-btn {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: var(--gold);
          color: var(--bg-base);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s, background-color 0.2s;
        }
        .chat-send-btn:hover:not(:disabled) {
          background: var(--gold-light);
          transform: scale(1.03);
        }
        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Sidebar Document Context Panel */
        .chat-sidebar {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
          height: 100%;
        }
        
        .side-title {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .data-kpi {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          padding: 12px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .data-kpi-val {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--gold);
        }
        
        .doc-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .doc-item {
          padding: 8px 10px;
          background: rgba(255, 255, 255, 0.01);
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.03);
          font-size: 0.78rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'linear-gradient(135deg, var(--gold), #8A6E2E)', padding: 6, borderRadius: 8 }}>
              <Sparkles size={18} style={{ color: 'var(--bg-base)' }} />
            </div>
            <h1 style={{ margin: 0 }}>AI Assistant</h1>
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Interact with the booking catalog document and database parameters.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={clearChat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trash2 size={13} /> Reset Chat
        </button>
      </div>

      <div className="chat-layout">
        {/* Left Column: Chat Window */}
        <div className="chat-box">
          {/* Box Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={16} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>Chat Session</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }}></span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>SmartEngine v1.0</span>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="chat-messages">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`message-row ${msg.type}`}>
                <div className="message-bubble">
                  {msg.type === 'ai' ? renderMarkdownBold(msg.text) : msg.text}
                </div>
              </div>
            ))}
            
            {/* Simulated typing dot animation */}
            {isTyping && (
              <div className="message-row ai">
                <div className="typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />

            {/* If there is only the welcome message, show the large welcome grid of static questions */}
            {chatHistory.length === 1 && !isTyping && (
              <div className="chat-welcome">
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                  DOCUMENT DATABASE QUICK ACTIONS
                </div>
                <div className="static-questions-grid">
                  {staticQuestions.map((q, idx) => (
                    <button key={idx} className="static-q-btn" onClick={() => handleSendQuery(q.query)}>
                      <span style={{ color: 'var(--gold)' }}>{q.icon}</span>
                      <span>{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="chat-input-bar">
            <input 
              type="text"
              className="chat-textarea" 
              placeholder="Ask a question about demand, utilization, or billing..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button 
              className="chat-send-btn" 
              onClick={() => handleSendQuery(inputValue)}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send size={15} />
            </button>
          </div>
        </div>

        {/* Right Column: Reference Data Panel */}
        <div className="chat-sidebar">
          {/* Segment 2: Document Rows Preview */}
          <div>
            <div className="side-title">
              <FileText size={13} /> Booking Catalog
            </div>
            <div className="doc-list">
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} className="doc-item">
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.eventName}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{b.hall} · {b.organizer}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold)' }}>
                    ₹{(b.revenue / 100000).toFixed(0)}L
                  </div>
                </div>
              ))}
              {bookings.length > 5 && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
                  + {bookings.length - 5} more records indexed...
                </div>
              )}
            </div>
          </div>

          {/* Segment 3: Document Warnings */}
          <div>
            <div className="side-title">
              <AlertTriangle size={13} style={{ color: '#FBBF24' }} /> Alerts & Anomalies
            </div>
            <div style={{ 
              background: 'rgba(251, 191, 36, 0.03)', 
              border: '1px solid rgba(251, 191, 36, 0.15)', 
              borderRadius: 8, 
              padding: 12, 
              fontSize: '0.78rem',
              lineHeight: 1.4,
              color: 'var(--text-secondary)'
            }}>
              Bharat Mandapam Hall 2 shows unusually high setup duration (4 days) for a Corporate Event. Check logistics.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
