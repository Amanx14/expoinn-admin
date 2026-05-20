import { Activity } from 'lucide-react';

export const CHART_COLORS = [
  '#C9A84C', '#6B9EC9', '#C96B9E', '#6BC99E',
  '#A5B4FC', '#FBBF24', '#F87171', '#94A3B8', '#4ADE80',
];

export const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--gold-border)', borderRadius:8, padding:'10px 14px', fontSize:12, boxShadow: 'var(--shadow-gold)' }}>
      <div style={{ color:'var(--gold)', fontWeight:600, marginBottom:4 }}>{label}</div>
      {payload.map((item, i) => (
        <div key={i} style={{ color:'var(--text-primary)' }}>
          {item.name}: {typeof item.value === 'number' ? item.value.toLocaleString('en-IN') : item.value}
        </div>
      ))}
    </div>
  );
};

export function StatusPill({ status }) {
  return <span className={`status-pill ${String(status).toLowerCase()}`}>{status}</span>;
}

export function DemandBadge({ type }) {
  const hd = type === 'HD';
  return (
    <span style={{
      display:'inline-block', padding:'2px 8px', borderRadius:4, fontSize:'0.7rem', fontWeight:700,
      background: hd ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.15)',
      color: hd ? '#F87171' : '#4ADE80',
      border: `1px solid ${hd ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'}`,
    }}>{type === 'HD' ? 'High Demand' : 'Low Demand'}</span>
  );
}

export function SectionTitle({ icon: Icon, children, subtitle }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {Icon && <Icon size={16} style={{ color:'var(--gold)' }} />}
        <h2 style={{ margin:0, fontSize:'1rem', fontWeight:700, color:'var(--text-primary)' }}>{children}</h2>
      </div>
      {subtitle && <p style={{ margin:'4px 0 0 24px', fontSize:'0.75rem', color:'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  );
}

export function StatCard({ label, value, sub, color, highlight }) {
  return (
    <div className="stat-card" style={highlight ? { border:'1px solid rgba(201,168,76,0.3)' } : {}}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function ReportTable({ headers, rows, emptyText = 'No records match the current filters.' }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table className="data-table">
        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} style={{ textAlign:'center', padding:34, color:'var(--text-muted)' }}>{emptyText}</td></tr>
          ) : (
            rows.map((row, ri) => (
              <tr key={row.key ?? ri}>
                {row.cells.map((cell, ci) => <td key={ci}>{cell}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function OccupancyBar({ pct, color = 'var(--gold)' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, minWidth:80, height:6, borderRadius:3, background:'var(--bg-overlay)', border:'1px solid var(--border)' }}>
        <div style={{ width:`${Math.min(100, pct)}%`, height:'100%', borderRadius:3, background:color, transition:'width 0.4s' }} />
      </div>
      <span style={{ width:38, color:'var(--gold)', fontWeight:600, fontSize:'0.8rem' }}>{pct}%</span>
    </div>
  );
}

export function InsightBox({ icon: Icon, color, title, value, sub }) {
  return (
    <div style={{
      background:'var(--bg-overlay)', border:'1px solid var(--border)',
      borderRadius:8, padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:12,
    }}>
      <div style={{ marginTop:2, color }}>
        {Icon && <Icon size={16} />}
      </div>
      <div>
        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:2 }}>{title}</div>
        <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--text-primary)' }}>{value}</div>
        {sub && <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function formatMoney(v) {
  const n = Number(v || 0);
  if (n >= 10000000) return `Rs ${(n/10000000).toFixed(1)} Cr`;
  if (n >= 100000)   return `Rs ${(n/100000).toFixed(1)}L`;
  return `Rs ${n.toLocaleString('en-IN')}`;
}

export function formatLakhs(v) { return Number(((v||0)/100000).toFixed(1)); }

export function dayKey(d) { return d?.toISOString?.()?.slice(0,10) ?? ''; }
