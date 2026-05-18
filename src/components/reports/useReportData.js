import { useMemo, useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

export const CHART_COLORS = [
  '#C9A84C', '#6B9EC9', '#C96B9E', '#6BC99E',
  '#A5B4FC', '#FBBF24', '#F87171', '#94A3B8', '#4ADE80',
];

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ACTIVE_STATUSES = ['Draft', 'Tentative', 'Confirmed'];

export const PAYMENT_STATUS_MAP = {
  Completed:  'Paid',
  Confirmed:  'Invoice Sent',
  Tentative:  'Follow-up Required',
  Cancelled:  'Cancelled',
  Draft:      'Not Raised',
};

// ─── Pure Utilities ───────────────────────────────────────────────────────────

export function toDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function daysInclusive(start, end) {
  const s = toDate(start), e = toDate(end);
  if (!s || !e || e < s) return 0;
  return Math.floor((e - s) / 86400000) + 1;
}

function clampRange(start, end, min, max) {
  const s = toDate(start), e = toDate(end);
  if (!s || !e) return null;
  const cs = new Date(Math.max(s.getTime(), min.getTime()));
  const ce = new Date(Math.min(e.getTime(), max.getTime()));
  return ce < cs ? null : { start: cs, end: ce };
}

export function getLockStart(b) { return b.setupDate || b.eventStartDate; }
export function getLockEnd(b)   { return b.dismantleDate || b.eventEndDate; }

function overlaps(aS, aE, bS, bE) {
  const sa = toDate(aS), ea = toDate(aE), sb = toDate(bS), eb = toDate(bE);
  if (!sa || !ea || !sb || !eb) return false;
  return sa <= eb && ea >= sb;
}

export function getMonthDemandType(monthIndex) {
  return (monthIndex >= 3 && monthIndex <= 5) ? 'LD' : 'HD';
}

export function formatMoney(v) {
  const n = Number(v || 0);
  if (n >= 10000000) return `Rs ${(n/10000000).toFixed(1)} Cr`;
  if (n >= 100000)   return `Rs ${(n/100000).toFixed(1)}L`;
  return `Rs ${n.toLocaleString('en-IN')}`;
}

export function formatLakhs(v) { return Number(((v||0)/100000).toFixed(1)); }

export function dayKey(d) { return d?.toISOString?.()?.slice(0,10) ?? ''; }

export function buildCsv(rows) {
  return rows.map(row =>
    row.map(cell => {
      const v = String(cell ?? '');
      return /[",\n]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v;
    }).join(',')
  ).join('\n');
}

export function downloadText(filename, content, mime = 'text/csv;charset=utf-8') {
  const a = document.createElement('a');
  a.href = `data:${mime},${encodeURIComponent(content)}`;
  a.download = filename;
  a.click();
}

// ─── Shared Hook ──────────────────────────────────────────────────────────────

export function useReportData(bookings, venues) {
  const [filters, setFilters] = useState({
    industry:'all', sector:'all', venue:'all', status:'all', from:'', to:''
  });

  const options = useMemo(() => ({
    industries: [...new Set(bookings.map(b => b.industry).filter(Boolean))].sort(),
    sectors:    [...new Set(bookings.flatMap(b => b.sectors || []).filter(Boolean))].sort(),
    statuses:   [...new Set(bookings.map(b => b.status).filter(Boolean))].sort(),
  }), [bookings]);

  const filteredBookings = useMemo(() => bookings.filter(b => {
    if (filters.industry !== 'all' && b.industry !== filters.industry) return false;
    if (filters.sector   !== 'all' && !(b.sectors||[]).includes(filters.sector)) return false;
    if (filters.venue    !== 'all' && b.venueId !== filters.venue) return false;
    if (filters.status   !== 'all' && b.status !== filters.status) return false;
    if (filters.from && b.eventEndDate < filters.from) return false;
    if (filters.to   && b.eventStartDate > filters.to) return false;
    return true;
  }), [bookings, filters]);

  const computed = useMemo(() => {
    const now        = new Date();
    const reportYear = now.getFullYear();
    const rangeStart = toDate(filters.from) || new Date(reportYear, 0, 1);
    const rangeEnd   = toDate(filters.to)   || new Date(reportYear, 11, 31);
    const rangeDays  = Math.max(1, daysInclusive(rangeStart, rangeEnd));

    const halls         = venues.flatMap(v => v.halls.map(h => ({ venueId:v.id, venue:v.name, hall:h.name })));
    const totalHallDays = Math.max(1, halls.length * rangeDays);

    const confirmed  = filteredBookings.filter(b => b.status === 'Confirmed');
    const tentative  = filteredBookings.filter(b => b.status === 'Tentative');
    const draft      = filteredBookings.filter(b => b.status === 'Draft');
    const completed  = filteredBookings.filter(b => b.status === 'Completed');
    const cancelled  = filteredBookings.filter(b => b.status === 'Cancelled');
    const totalRevenue = filteredBookings.reduce((s,b) => s+(b.revenue||0), 0);

    const monthlyMap = new Map(MONTH_LABELS.map((month, mi) => [mi, {
      month, bookings:0, revenue:0, confirmed:0, tentative:0,
      demandType: getMonthDemandType(mi),
    }]));
    filteredBookings.forEach(b => {
      const d = toDate(b.eventStartDate);
      if (!d) return;
      const m = monthlyMap.get(d.getMonth());
      m.bookings++;
      m.revenue += b.revenue || 0;
      if (b.status === 'Confirmed') m.confirmed++;
      if (b.status === 'Tentative') m.tentative++;
    });
    const monthlySeries = [...monthlyMap.values()].map(m => ({ ...m, revenueLakhs: formatLakhs(m.revenue) }));

    // ── A. Competitive ──
    const industryMap = new Map(), sectorMap = new Map(), organizerMap = new Map();
    const statusMap = new Map(), eventTypeMap = new Map();

    filteredBookings.forEach(b => {
      const ind = b.industry || 'Unassigned';
      const iRow = industryMap.get(ind) || { name:ind, bookings:0, revenue:0, organizers:new Set(), sectors:new Set() };
      iRow.bookings++; iRow.revenue += b.revenue||0;
      iRow.organizers.add(b.organizer);
      (b.sectors||[]).forEach(s => iRow.sectors.add(s));
      industryMap.set(ind, iRow);

      (b.sectors||['Unassigned']).forEach(sec => {
        const sr = sectorMap.get(sec) || { name:sec, bookings:0, revenue:0, industries:new Set(), organizers:new Set() };
        sr.bookings++; sr.revenue += b.revenue||0;
        sr.industries.add(ind); sr.organizers.add(b.organizer);
        sectorMap.set(sec, sr);
      });

      const org = b.organizer || 'Unassigned';
      const or = organizerMap.get(org) || { name:org, bookings:0, revenue:0 };
      or.bookings++; or.revenue += b.revenue||0;
      organizerMap.set(org, or);

      statusMap.set(b.status, (statusMap.get(b.status)||0)+1);
      eventTypeMap.set(b.eventType, (eventTypeMap.get(b.eventType)||0)+1);
    });

    const industrySeries = [...industryMap.values()].map((item,i) => ({
      ...item, revenueLakhs: formatLakhs(item.revenue),
      organizerCount: item.organizers.size, sectorCount: item.sectors.size,
      color: CHART_COLORS[i%CHART_COLORS.length],
      marketShare: totalRevenue ? Math.round((item.revenue/totalRevenue)*100) : 0,
    })).sort((a,b) => b.revenue - a.revenue);

    const sectorSeries = [...sectorMap.values()].map((item,i) => ({
      ...item, revenueLakhs: formatLakhs(item.revenue),
      organizerCount: item.organizers.size, color: CHART_COLORS[i%CHART_COLORS.length],
    })).sort((a,b) => b.revenue - a.revenue);

    const organizerSeries = [...organizerMap.values()].map((item,i) => ({
      ...item, revenueLakhs: formatLakhs(item.revenue), color: CHART_COLORS[i%CHART_COLORS.length],
    })).sort((a,b) => b.revenue - a.revenue);

    const statusSeries    = [...statusMap.entries()].map(([name,value],i) => ({ name, value, color: CHART_COLORS[i%CHART_COLORS.length] }));
    const eventTypeSeries = [...eventTypeMap.entries()].map(([name,value],i) => ({ name, value, color: CHART_COLORS[i%CHART_COLORS.length] }));

    // ── C. Demand ──
    const hdBucket = { type:'High Demand (HD)', bookings:0, revenue:0 };
    const ldBucket = { type:'Low Demand (LD)',  bookings:0, revenue:0 };
    monthlySeries.forEach(m => {
      if (m.demandType === 'HD') { hdBucket.bookings += m.bookings; hdBucket.revenue += m.revenue; }
      else                       { ldBucket.bookings += m.bookings; ldBucket.revenue += m.revenue; }
    });
    const demandSeries    = [hdBucket, ldBucket].map(d => ({ ...d, revenueLakhs: formatLakhs(d.revenue * 100000) }));
    const demandChartData = [
      { type:'High Demand', bookings: hdBucket.bookings, revenue: hdBucket.revenue },
      { type:'Low Demand',  bookings: ldBucket.bookings, revenue: ldBucket.revenue },
    ];
    const peakMonths = [...monthlySeries].sort((a,b) => b.bookings - a.bookings || b.revenueLakhs - a.revenueLakhs).slice(0,4);

    // ── D. Hall Allocation ──
    const hallAllocation = halls.map(hi => {
      const hb = filteredBookings.filter(b => b.venueId === hi.venueId && b.hall === hi.hall);
      let bookedDays = 0, confirmedDays = 0, primeDateDays = 0;
      hb.forEach(b => {
        const range = clampRange(getLockStart(b), getLockEnd(b), rangeStart, rangeEnd);
        if (!range) return;
        const ld = daysInclusive(range.start, range.end);
        bookedDays += ld;
        if (['Confirmed','Completed'].includes(b.status)) confirmedDays += ld;
        if (getMonthDemandType(toDate(b.eventStartDate)?.getMonth() ?? 0) === 'HD') primeDateDays += ld;
      });
      return {
        ...hi, totalBookings: hb.length, bookedDays, confirmedDays, primeDateDays,
        idleDays: Math.max(0, rangeDays - bookedDays),
        occupancy: Math.min(100, Math.round((bookedDays/rangeDays)*100)),
        confirmedOccupancy: Math.min(100, Math.round((confirmedDays/rangeDays)*100)),
        primeDateUsagePct: Math.min(100, Math.round((primeDateDays/rangeDays)*100)),
      };
    }).sort((a,b) => b.occupancy - a.occupancy || a.venue.localeCompare(b.venue));

    // ── E. Conflicts ──
    const conflicts = [];
    filteredBookings.forEach((b, i) => {
      if (!ACTIVE_STATUSES.includes(b.status)) return;
      filteredBookings.slice(i+1).forEach(c => {
        if (!ACTIVE_STATUSES.includes(c.status)) return;
        if (b.venueId !== c.venueId || b.hall !== c.hall) return;
        if (!overlaps(getLockStart(b), getLockEnd(b), getLockStart(c), getLockEnd(c))) return;
        const os = new Date(Math.max(toDate(getLockStart(b)).getTime(), toDate(getLockStart(c)).getTime()));
        const oe = new Date(Math.min(toDate(getLockEnd(b)).getTime(), toDate(getLockEnd(c)).getTime()));
        conflicts.push({
          key: `${b.id}-${c.id}`, booking1: b, booking2: c,
          overlapDays: daysInclusive(os, oe),
          overlapStart: dayKey(os), overlapEnd: dayKey(oe),
          severity: b.status === 'Confirmed' && c.status === 'Confirmed' ? 'Critical' : 'Warning',
          conflictType: 'Resource Conflict',
        });
      });
    });
    const criticalConflicts = conflicts.filter(c => c.severity === 'Critical');
    const warningConflicts  = conflicts.filter(c => c.severity === 'Warning');

    // ── B. Own Shows ──
    const pastShows     = filteredBookings.filter(b => toDate(b.eventEndDate) < now);
    const upcomingShows = filteredBookings.filter(b => toDate(b.eventStartDate) >= now && b.status === 'Confirmed');
    const probableShows = filteredBookings.filter(b => toDate(b.eventStartDate) >= now && ['Tentative','Draft'].includes(b.status));

    // ── F. Revenue ──
    const eventRevenue = [...filteredBookings].sort((a,b) => (b.revenue||0)-(a.revenue||0)).map(b => ({ ...b, revenueLakhs: formatLakhs(b.revenue) }));
    const dateRevenue  = monthlySeries.filter(m => m.bookings > 0);

    // ── G. Billing ──
    const billingRows      = filteredBookings.map(b => ({ ...b, paymentStatus: PAYMENT_STATUS_MAP[b.status] || 'Unknown' }));
    const tentativeRevenue = tentative.reduce((s,b) => s+(b.revenue||0), 0);
    const confirmedRevenue = confirmed.reduce((s,b) => s+(b.revenue||0), 0);
    const completedRevenue = completed.reduce((s,b) => s+(b.revenue||0), 0);

    // ── H. Utilization ──
    const activeBookedDays   = hallAllocation.reduce((s,h) => s+h.bookedDays, 0);
    const confirmedHallDays  = hallAllocation.reduce((s,h) => s+h.confirmedDays, 0);
    const idleHallDays       = Math.max(0, totalHallDays - activeBookedDays);
    const utilizationPercent = Math.min(100, Math.round((activeBookedDays/totalHallDays)*100));
    const venueUtilization   = venues.map(v => {
      const vh  = hallAllocation.filter(h => h.venueId === v.id);
      const vhd = Math.max(1, vh.length * rangeDays);
      const vbd = vh.reduce((s,h) => s+h.bookedDays, 0);
      const vid = vh.reduce((s,h) => s+h.idleDays, 0);
      return { name:v.name, halls:vh.length, bookedDays:vbd, idleDays:vid, utilization: Math.min(100, Math.round((vbd/vhd)*100)) };
    }).sort((a,b) => b.utilization - a.utilization);

    return {
      rangeStart, rangeEnd, rangeDays, totalRevenue,
      confirmed, tentative, draft, completed, cancelled,
      confirmedRevenue, tentativeRevenue, completedRevenue,
      invoicePending: confirmed.length, followUpRequired: tentative.length,
      monthlySeries, industrySeries, sectorSeries, organizerSeries, statusSeries, eventTypeSeries,
      demandSeries, demandChartData, peakMonths, hallAllocation,
      conflicts, criticalConflicts, warningConflicts,
      pastShows, upcomingShows, probableShows,
      eventRevenue, dateRevenue, billingRows,
      totalHallDays, activeBookedDays, confirmedHallDays, idleHallDays, utilizationPercent, venueUtilization,
    };
  }, [filteredBookings, filters.from, filters.to, venues]);

  const updateFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const clearFilters = () => setFilters({ industry:'all', sector:'all', venue:'all', status:'all', from:'', to:'' });
  const hasFilters   = Object.values(filters).some(v => v && v !== 'all');
  const venueName    = id => venues.find(v => v.id === id)?.name || '';
  const cardSubText  = `${filteredBookings.length} of ${bookings.length} bookings | ${dayKey(computed.rangeStart)} → ${dayKey(computed.rangeEnd)}`;

  return { filters, options, computed, updateFilter, clearFilters, hasFilters, venueName, cardSubText, venues };
}
