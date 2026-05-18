import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Download, FileSpreadsheet, Filter, BarChart2, TrendingUp, Calendar,
  Activity, Home, Zap, DollarSign, CreditCard,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatMoney, buildCsv, downloadText, dayKey } from './useReportData';

const REPORT_TABS = [
  { path: '/reports/overview',     label: 'Overview',                 icon: BarChart2  },
  { path: '/reports/competitive',  label: 'Competitive Analytics',    icon: TrendingUp },
  { path: '/reports/own-shows',    label: 'Own Shows (IEML)',         icon: Calendar   },
  { path: '/reports/demand',       label: 'Demand Analysis',          icon: Activity   },
  { path: '/reports/hall-alloc',   label: 'Hall Allocation',          icon: Home       },
  { path: '/reports/conflict',     label: 'Conflict Report',          icon: Zap        },
  { path: '/reports/revenue',      label: 'Revenue Reports',          icon: DollarSign },
  { path: '/reports/billing',      label: 'Billing Report',           icon: CreditCard },
  { path: '/reports/utilization',  label: 'Utilization Report',       icon: Activity   },
];

export default function ReportLayout({
  children,
  title,
  subtitle,
  computed,
  filters,
  options,
  venues,
  updateFilter,
  clearFilters,
  hasFilters,
  cardSubText,
  exportData,        // { title, headers, rows[] }
}) {
  const navigate   = useNavigate();
  const { pathname } = useLocation();

  const exportCsv = () => {
    if (!exportData) return;
    downloadText(
      `ExpoInn_${title.replace(/\s+/g,'_')}_${new Date().toISOString().slice(0,10)}.csv`,
      buildCsv([exportData.headers, ...exportData.rows])
    );
  };

  const exportPdf = () => {
    if (!exportData) return;
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
    doc.setFillColor(26,26,46); doc.rect(0,0,210,32,'F');
    doc.setTextColor(201,168,76); doc.setFontSize(18); doc.text('ExpoInn',14,16);
    doc.setFontSize(9); doc.setTextColor(180,180,180);
    doc.text('Smart Booking Engine – Reports & Analytics',14,24);
    doc.text(dateStr,196,16,{align:'right'});
    doc.setTextColor(26,26,46); doc.setFontSize(14); doc.text(exportData.title,14,44);
    doc.setFontSize(9); doc.setTextColor(90,90,90);
    doc.text(`Filters: Industry=${filters.industry}, Venue=${filters.venue}, Status=${filters.status}`,14,52);
    autoTable(doc,{
      startY:58, head:[exportData.headers],
      body: exportData.rows.length ? exportData.rows : [['No records match the current filters']],
      theme:'grid',
      headStyles:{ fillColor:[26,26,46], textColor:[201,168,76], fontSize:8, fontStyle:'bold' },
      bodyStyles:{ fontSize:7.5, textColor:[50,50,50] },
      alternateRowStyles:{ fillColor:[248,246,241] },
      styles:{ cellPadding:3, lineColor:[220,220,220], lineWidth:0.2 },
      margin:{ left:14, right:14 },
    });
    const pc = doc.internal.getNumberOfPages();
    for (let p=1;p<=pc;p++) {
      doc.setPage(p); doc.setFontSize(8); doc.setTextColor(150,150,150);
      doc.text('ExpoInn Smart Booking Engine – Confidential',14,290);
      doc.text(`Page ${p} of ${pc}`,196,290,{align:'right'});
    }
    doc.save(`ExpoInn_${exportData.title.replace(/\s+/g,'_')}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const conflictCount = computed?.conflicts?.length ?? 0;

  return (
    <div className="page">

      {/* ── Page Header ── */}
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
        <div>
          <h1>{title || 'Reports & Analytics'}</h1>
          <p style={{ margin:0 }}>{subtitle || 'PRD §5.6 — Smart Booking Engine Analytics Suite.'}</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'flex-end' }}>
          {exportData && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={exportCsv}>
                <FileSpreadsheet size={14} /> Export Excel
              </button>
              <button className="btn btn-ghost btn-sm" onClick={exportPdf}>
                <Download size={14} /> Download PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Filter Bar (Only shown in Overview tab) ── */}
      {pathname === '/reports/overview' && (
        <div className="card" style={{ marginBottom:16 }}>
          <div className="section-title" style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <Filter size={14} /> Report Filters
            <span style={{ marginLeft:'auto', fontSize:'0.72rem', color:'var(--text-muted)' }}>{cardSubText}</span>
          </div>
          <div className="form-grid-3">
            {[
              { key:'industry', label:'Industry', opts: (options?.industries||[]).map(v=>({v,l:v})) },
              { key:'sector',   label:'Sector',   opts: (options?.sectors||[]).map(v=>({v,l:v})) },
              { key:'venue',    label:'Venue',     opts: (venues||[]).map(v=>({v:v.id,l:v.name})) },
              { key:'status',   label:'Status',    opts: (options?.statuses||[]).map(v=>({v,l:v})) },
            ].map(({ key, label, opts }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <select className="form-select" value={filters[key]} onChange={e => updateFilter(key, e.target.value)}>
                  <option value="all">All {label}s</option>
                  {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">From</label>
              <input className="form-input" type="date" value={filters.from} onChange={e => updateFilter('from', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <input className="form-input" type="date" value={filters.to} onChange={e => updateFilter('to', e.target.value)} />
            </div>
          </div>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ marginTop:12, color:'#F87171' }}>
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* ── Sub-Report Tab Bar ── */}
      <div className="report-tabs" style={{ marginBottom:20 }}>
        {REPORT_TABS.map(tab => {
          const Icon    = tab.icon;
          const active  = pathname === tab.path;
          const badge   = tab.path.includes('conflict') && conflictCount > 0;
          return (
            <button
              key={tab.path}
              className={`report-tab ${active ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
              style={{ position:'relative' }}
            >
              {Icon && <Icon size={12} style={{ marginRight:4, verticalAlign:'middle' }} />}
              {tab.label}
              {badge && (
                <span style={{
                  position:'absolute', top:-4, right:-4, background:'#F87171',
                  color:'#fff', fontSize:'0.6rem', fontWeight:700,
                  borderRadius:'50%', width:16, height:16,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {conflictCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content Area ── */}
      <div>
        {children}
      </div>
    </div>
  );
}
