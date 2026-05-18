import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReportData, formatMoney } from './useReportData';
import ReportLayout from './ReportLayout';

import OverviewReport from './OverviewReport';
import CompetitiveReport from './CompetitiveReport';
import OwnShowsReport from './OwnShowsReport';
import DemandReport from './DemandReport';
import HallAllocationReport from './HallAllocationReport';
import ConflictReport from './ConflictReport';
import RevenueReport from './RevenueReport';
import BillingReport from './BillingReport';
import UtilizationReport from './UtilizationReport';

export default function ReportsSuite({ bookings, venues }) {
  const { tab } = useParams();
  const activeTab = tab || 'overview';
  const navigate = useNavigate();

  // Instantiate the single, persistent data and filters hook!
  const report = useReportData(bookings, venues);
  const { computed, venueName } = report;

  // Compute exportData dynamically based on active tab
  const exportData = useMemo(() => {
    switch (activeTab) {
      case 'competitive':
        return {
          title: 'Competitive Analytics',
          headers: ['Industry','Sectors','Bookings','Organizers','Market Share','Revenue','Avg/Event'],
          rows: computed.industrySeries.map(i => [
            i.name,
            i.sectorCount,
            i.bookings,
            i.organizerCount,
            `${i.marketShare}%`,
            formatMoney(i.revenue),
            formatMoney(i.bookings ? i.revenue / i.bookings : 0)
          ]),
        };
      case 'own-shows':
        return {
          title: 'Own Shows (IEML)',
          headers: ['Category','Event','Venue / Hall','Start','End','Status','Revenue'],
          rows: [
            ...computed.pastShows.map(b => ['Past', b.eventName, `${venueName(b.venueId)} / ${b.hall}`, b.eventStartDate, b.eventEndDate, b.status, formatMoney(b.revenue)]),
            ...computed.upcomingShows.map(b => ['Upcoming', b.eventName, `${venueName(b.venueId)} / ${b.hall}`, b.eventStartDate, b.eventEndDate, b.status, formatMoney(b.revenue)]),
            ...computed.probableShows.map(b => ['Probable', b.eventName, `${venueName(b.venueId)} / ${b.hall}`, b.eventStartDate, b.eventEndDate, b.status, formatMoney(b.revenue)]),
          ]
        };
      case 'demand':
        return {
          title: 'Demand Analysis',
          headers: ['Month','Demand Type','Bookings','Confirmed','Tentative','Revenue (Rs L)'],
          rows: computed.monthlySeries.filter(m => m.bookings > 0).map(m => [m.month, m.demandType, m.bookings, m.confirmed, m.tentative, m.revenueLakhs]),
        };
      case 'hall-alloc':
        return {
          title: 'Hall Allocation Report',
          headers: ['Venue','Hall','Bookings','Prime Date Days','Booked Days','Idle Days','Occupancy %'],
          rows: computed.hallAllocation.map(h => [h.venue,h.hall,h.totalBookings,h.primeDateDays,h.bookedDays,h.idleDays,`${h.occupancy}%`]),
        };
      case 'conflict':
        return {
          title: 'Conflict Report',
          headers: ['Event A','Status A','Event B','Status B','Hall','Type','Overlap Days','Severity'],
          rows: computed.conflicts.map(c => [c.booking1.eventName,c.booking1.status,c.booking2.eventName,c.booking2.status,c.booking1.hall,c.conflictType,c.overlapDays,c.severity]),
        };
      case 'revenue':
        return {
          title: 'Revenue Reports',
          headers: ['Event','Industry','Event Type','Date','Status','Revenue'],
          rows: computed.eventRevenue.map(b => [b.eventName, b.industry, b.eventType, b.eventStartDate, b.status, formatMoney(b.revenue)]),
        };
      case 'billing':
        return {
          title: 'Billing Report',
          headers: ['Event','Organizer','Status','Revenue','Payment Tracking'],
          rows: computed.billingRows.map(b => [b.eventName, b.organizer, b.status, formatMoney(b.revenue), b.paymentStatus]),
        };
      case 'utilization':
        return {
          title: 'Utilization Report',
          headers: ['Venue','Hall','Bookings','Booked Days','Idle Days','Utilization %','Confirmed Usage %'],
          rows: computed.hallAllocation.map(h => [h.venue, h.hall, h.totalBookings, h.bookedDays, h.idleDays, `${h.occupancy}%`, `${h.confirmedOccupancy}%`]),
        };
      default:
        return null;
    }
  }, [activeTab, computed, venueName]);

  // Determine page metadata
  const { title, subtitle } = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Overview', subtitle: 'High-level summary of revenue, pipeline, conflicts, and venue utilization.' };
      case 'competitive':
        return { title: 'Competitive Analytics', subtitle: 'Industry revenue trends, sector competitor signals, and organizer concentration analysis.' };
      case 'own-shows':
        return { title: 'Own Shows (IEML)', subtitle: 'IEML event pipeline: past, upcoming confirmed, and probable (tentative/draft) shows.' };
      case 'demand':
        return { title: 'Demand Analysis', subtitle: 'High Demand (HD): Jan–Mar, Jul–Dec  |  Low Demand (LD): Apr–Jun' };
      case 'hall-alloc':
        return { title: 'Hall Allocation Report', subtitle: 'Prime date usage (HD periods) and hall occupancy across all venues.' };
      case 'conflict':
        return { title: 'Conflict Report', subtitle: 'Overlapping bookings for active (Draft/Tentative/Confirmed) statuses across halls.' };
      case 'revenue':
        return { title: 'Revenue Reports', subtitle: 'Event-wise, industry-wise, and date-wise revenue breakdown.' };
      case 'billing':
        return { title: 'Billing Report', subtitle: 'Tentative vs Confirmed billing pipeline and payment tracking status.' };
      case 'utilization':
        return { title: 'Utilization Report', subtitle: 'Venue and hall-level utilization, idle capacity analysis, and confirmed usage tracking.' };
      default:
        return { title: 'Overview', subtitle: 'High-level summary of revenue, pipeline, conflicts, and venue utilization.' };
    }
  }, [activeTab]);

  return (
    <ReportLayout
      title={title}
      subtitle={subtitle}
      exportData={exportData}
      {...report}
    >
      {activeTab === 'overview' && <OverviewReport report={report} navigate={navigate} />}
      {activeTab === 'competitive' && <CompetitiveReport report={report} />}
      {activeTab === 'own-shows' && <OwnShowsReport report={report} />}
      {activeTab === 'demand' && <DemandReport report={report} />}
      {activeTab === 'hall-alloc' && <HallAllocationReport report={report} />}
      {activeTab === 'conflict' && <ConflictReport report={report} />}
      {activeTab === 'revenue' && <RevenueReport report={report} />}
      {activeTab === 'billing' && <BillingReport report={report} />}
      {activeTab === 'utilization' && <UtilizationReport report={report} />}
    </ReportLayout>
  );
}
