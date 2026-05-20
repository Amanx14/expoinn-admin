import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CreditCard } from 'lucide-react';
import { useReportData, formatMoney, formatLakhs } from './useReportData';
import { CustomTooltip, SectionTitle, StatCard, ReportTable, StatusPill } from './SharedComponents';
import ReportLayout from './ReportLayout';

export default function BillingReport({ bookings, venues }) {
  const report = useReportData(bookings, venues);
  const { computed } = report;

  const exportData = {
    title: 'Billing Report',
    headers: ['Event','Organizer','Status','Revenue','Payment Tracking'],
    rows: computed.billingRows.map(b => [b.eventName, b.organizer, b.status, formatMoney(b.revenue), b.paymentStatus]),
  };

  return (
    <ReportLayout title="Billing Report" exportData={exportData} {...report}>
      <SectionTitle icon={CreditCard} subtitle="Tentative vs Confirmed billing pipeline and payment tracking status.">
        Billing Report
      </SectionTitle>

      <div className="grid-2" style={{ marginBottom:20 }}>
        <div className="card" style={{ border:'1px solid rgba(251,191,36,0.25)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#FBBF24' }} />
            <div className="card-title" style={{ margin:0 }}>Tentative</div>
          </div>
          <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#FBBF24' }}>{computed.tentative.length}</div>
          <div style={{ fontSize:'1rem', color:'var(--text-primary)', marginTop:2 }}>{formatMoney(computed.tentativeRevenue)}</div>
          <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:4 }}>Follow-up required for conversion</div>
        </div>
        <div className="card" style={{ border:'1px solid rgba(74,222,128,0.25)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#4ADE80' }} />
            <div className="card-title" style={{ margin:0 }}>Confirmed</div>
          </div>
          <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#4ADE80' }}>{computed.confirmed.length}</div>
          <div style={{ fontSize:'1rem', color:'var(--text-primary)', marginTop:2 }}>{formatMoney(computed.confirmedRevenue)}</div>
          <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:4 }}>Invoice to be raised / sent</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom:20 }}>
        <StatCard label="Completed / Paid"   value={computed.completed.length}                             sub={formatMoney(computed.completedRevenue)}      color="#A5B4FC" />
        <StatCard label="Invoice Pending"     value={computed.invoicePending}                               sub="Confirmed — invoice to send"                  color="#4ADE80" />
        <StatCard label="Follow-up Required"  value={computed.followUpRequired}                             sub="Tentative — pending confirmation"             color="#FBBF24" />
        <StatCard label="Draft / Cancelled"   value={computed.draft.length + computed.cancelled.length}     sub="Billing not applicable" />
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <div className="card-title" style={{ marginBottom:14 }}>Revenue by Payment Status</div>
        <div style={{ height:200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { status:'Paid',                value: formatLakhs(computed.completedRevenue) },
                { status:'Invoice Sent',         value: formatLakhs(computed.confirmedRevenue) },
                { status:'Follow-up Required',   value: formatLakhs(computed.tentativeRevenue) },
              ]}
              margin={{ top:5, right:10, bottom:0, left:-18 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="status" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Revenue (Rs L)" radius={[4,4,0,0]}>
                <Cell fill="#A5B4FC" /><Cell fill="#4ADE80" /><Cell fill="#FBBF24" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom:14 }}>Payment Tracking</div>
        <ReportTable
          headers={['Event','Organizer','Status','Revenue','Payment Tracking']}
          rows={computed.billingRows.map(b => {
            const ptColor =
              b.paymentStatus === 'Paid'               ? '#4ADE80' :
              b.paymentStatus === 'Invoice Sent'       ? '#A5B4FC' :
              b.paymentStatus === 'Follow-up Required' ? '#FBBF24' :
              b.paymentStatus === 'Cancelled'          ? '#F87171' : 'var(--text-muted)';
            return {
              key: b.id,
              cells: [
                <strong>{b.eventName}</strong>, b.organizer,
                <StatusPill status={b.status} />,
                <span style={{ color:'var(--gold)', fontWeight:600 }}>{formatMoney(b.revenue)}</span>,
                <span style={{ color:ptColor, fontWeight:600 }}>{b.paymentStatus}</span>,
              ],
            };
          })}
        />
      </div>
    </ReportLayout>
  );
}
