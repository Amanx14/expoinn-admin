// ═══════════════════════════════════════════════════════
// MOCK DATABASE — Static JSON for Smart Booking Engine
// ═══════════════════════════════════════════════════════

export const masterData = {
  venues: [
    { 
      id: "v1", 
      name: "Bharat Mandapam", 
      location: "New Delhi", 
      color: "#C9A84C",
      coverImage: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop",
      halls: [
        { name: "Hall 1", image: "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000&auto=format&fit=crop" },
        { name: "Hall 2", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000&auto=format&fit=crop" },
        { name: "Hall 3", image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=1000&auto=format&fit=crop" },
        { name: "Hall 4", image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1000&auto=format&fit=crop" },
        { name: "Hall 5", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop" }
      ] 
    },
    { 
      id: "v2", 
      name: "Pragati Maidan", 
      location: "New Delhi", 
      color: "#6B9EC9",
      coverImage: "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?q=80&w=2069&auto=format&fit=crop",
      halls: [
        { name: "Hall A", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop" },
        { name: "Hall B", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop" },
        { name: "Hall C", image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1000&auto=format&fit=crop" },
        { name: "Hall D", image: "https://images.unsplash.com/photo-1520242739010-44e95bde329e?q=80&w=1000&auto=format&fit=crop" },
        { name: "Hall E", image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop" }
      ] 
    },
    { 
      id: "v3", 
      name: "Expo Mart", 
      location: "Greater Noida", 
      color: "#C96B9E",
      coverImage: "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2069&auto=format&fit=crop",
      halls: [
        { name: "Expo 1", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1000&auto=format&fit=crop" },
        { name: "Expo 2", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1000&auto=format&fit=crop" },
        { name: "Expo 3", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop" },
        { name: "Expo 4", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop" }
      ] 
    },
  ],
  organizers: [
    "AI Summit Secretariat", "Startup India", "CII Events", "NASSCOM", "FICCI",
    "Auto Expo Group", "Fashion Design Council", "Pharma India", "AgriTech Forum", "EdTech Alliance"
  ],
  industries: [
    "Technology & IT", "Automotive", "Medical & Pharma", "Education",
    "Fashion & Apparel", "Agriculture", "Real Estate", "FMCG", "Defense"
  ],
  sectors: [
    "Software", "Hardware", "Electric Vehicles", "Medical Devices",
    "EdTech", "Textiles", "Commercial", "Consumer Electronics", "Aerospace"
  ],
  eventStatus: ["Tentative", "Confirmed", "Cancelled", "Completed"],
  eventTypes: ["Corporate Event", "Exhibition", "Wedding", "Entertainment", "Conference"],
  primePeriods: [
    { label: "Jan-Mar (HD)", type: "HD" },
    { label: "Apr-Jun (LD)", type: "LD" },
    { label: "Jul-Sep (HD)", type: "HD" },
    { label: "Oct-Dec (HD)", type: "HD" },
  ]
};

// Rich seed bookings
export const initialBookings = [
  {
    id: "b1", organizer: "AI Summit Secretariat", venueId: "v1", hall: "Hall 1",
    eventName: "AI Summit 2026", // Added name field
    industry: "Technology & IT", sectors: ["Software"], eventType: "Corporate Event",
    status: "confirmed", setupDate: "2026-04-10", eventStartDate: "2026-04-12",
    eventEndDate: "2026-04-14", dismantleDate: "2026-04-15", guests: 5000, revenue: 1200000,
  },
  {
    id: "b2", organizer: "Startup India", venueId: "v2", hall: "Hall A",
    eventName: "Startup India Expo",
    industry: "Technology & IT", sectors: ["Software", "Hardware"], eventType: "Exhibition",
    status: "tentative", setupDate: "2026-04-18", eventStartDate: "2026-04-20",
    eventEndDate: "2026-04-22", dismantleDate: "2026-04-23", guests: 12000, revenue: 2500000,
  },
  {
    id: "b3", organizer: "CII Events", venueId: "v1", hall: "Hall 3",
    eventName: "EV Expo 2026",
    industry: "Automotive", sectors: ["Electric Vehicles"], eventType: "Exhibition",
    status: "confirmed", setupDate: "2026-04-25", eventStartDate: "2026-04-27",
    eventEndDate: "2026-04-30", dismantleDate: "2026-05-01", guests: 20000, revenue: 4500000,
  },
  {
    id: "b4", organizer: "Fashion Design Council", venueId: "v3", hall: "Expo 1",
    eventName: "Fashion Week 2026",
    industry: "Fashion & Apparel", sectors: ["Textiles"], eventType: "Exhibition",
    status: "confirmed", setupDate: "2026-03-05", eventStartDate: "2026-03-08",
    eventEndDate: "2026-03-12", dismantleDate: "2026-03-13", guests: 8000, revenue: 1800000,
  },
  {
    id: "b5", organizer: "Pharma India", venueId: "v2", hall: "Hall B",
    eventName: "Pharma Summit",
    industry: "Medical & Pharma", sectors: ["Medical Devices"], eventType: "Conference",
    status: "completed", setupDate: "2026-02-10", eventStartDate: "2026-02-12",
    eventEndDate: "2026-02-14", dismantleDate: "2026-02-15", guests: 3000, revenue: 900000,
  },
  {
    id: "b6", organizer: "NASSCOM", venueId: "v1", hall: "Hall 2",
    eventName: "NASSCOM Tech Days",
    industry: "Technology & IT", sectors: ["Software", "Hardware"], eventType: "Conference",
    status: "confirmed", setupDate: "2026-05-10", eventStartDate: "2026-05-12",
    eventEndDate: "2026-05-15", dismantleDate: "2026-05-16", guests: 7000, revenue: 2100000,
  },
  {
    id: "b7", organizer: "FICCI", venueId: "v2", hall: "Hall C",
    eventName: "Consumer Tech Expo",
    industry: "FMCG", sectors: ["Consumer Electronics"], eventType: "Exhibition",
    status: "tentative", setupDate: "2026-05-20", eventStartDate: "2026-05-22",
    eventEndDate: "2026-05-25", dismantleDate: "2026-05-26", guests: 15000, revenue: 3200000,
  },
  {
    id: "b8", organizer: "Auto Expo Group", venueId: "v1", hall: "Hall 4",
    eventName: "Auto Expo 2026",
    industry: "Automotive", sectors: ["Electric Vehicles"], eventType: "Exhibition",
    status: "confirmed", setupDate: "2026-06-01", eventStartDate: "2026-06-04",
    eventEndDate: "2026-06-08", dismantleDate: "2026-06-09", guests: 30000, revenue: 8000000,
  },
  {
    id: "b9", organizer: "AgriTech Forum", venueId: "v3", hall: "Expo 2",
    eventName: "AgriTech Summit",
    industry: "Agriculture", sectors: ["Commercial"], eventType: "Conference",
    status: "tentative", setupDate: "2026-04-05", eventStartDate: "2026-04-07",
    eventEndDate: "2026-04-09", dismantleDate: "2026-04-10", guests: 2000, revenue: 500000,
  },
  {
    id: "b10", organizer: "EdTech Alliance", venueId: "v2", hall: "Hall D",
    eventName: "EdTech Conf 2026",
    industry: "Education", sectors: ["EdTech"], eventType: "Conference",
    status: "confirmed", setupDate: "2026-04-02", eventStartDate: "2026-04-03",
    eventEndDate: "2026-04-04", dismantleDate: "2026-04-05", guests: 1500, revenue: 400000,
  },
];

// Monthly occupancy data
export const occupancyData = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  v1: [62, 54, 87, 78, 65, 48, 52, 70, 83, 92, 74, 68],
  v2: [70, 60, 75, 85, 72, 55, 60, 65, 78, 88, 80, 72],
  v3: [45, 38, 68, 55, 50, 35, 40, 55, 70, 78, 60, 50],
};

// Revenue data by industry
export const revenueByIndustry = [
  { industry: "Technology & IT", revenue: 5800000, bookings: 4 },
  { industry: "Automotive", revenue: 12500000, bookings: 2 },
  { industry: "Medical & Pharma", revenue: 900000, bookings: 1 },
  { industry: "Fashion & Apparel", revenue: 1800000, bookings: 1 },
  { industry: "FMCG", revenue: 3200000, bookings: 1 },
  { industry: "Agriculture", revenue: 500000, bookings: 1 },
  { industry: "Education", revenue: 400000, bookings: 1 },
];

// Activity feed
export const recentActivity = [
  { time: "2 min ago", action: "Booking Confirmed", detail: "AI Summit — Hall 1, Bharat Mandapam", type: "success" },
  { time: "15 min ago", action: "Tentative Created", detail: "Startup India — Hall A, Pragati Maidan", type: "warning" },
  { time: "1 hr ago", action: "Conflict Resolved", detail: "CII Events moved to Hall 3", type: "info" },
  { time: "3 hrs ago", action: "Booking Completed", detail: "Pharma India — Hall B, Pragati Maidan", type: "success" },
  { time: "5 hrs ago", action: "New Inquiry", detail: "AgriTech Forum interested in Expo 2", type: "info" },
  { time: "1 day ago", action: "Payment Received", detail: "₹12,00,000 — AI Summit Secretariat", type: "success" },
];

// AI mock responses
export const aiResponses = {
  "show high demand months": "Based on booking data, **October** (92% occupancy) and **March** (87% occupancy) are peak demand months at Bharat Mandapam. Technology & Automotive industries drive 65% of bookings during these periods. Consider premium pricing for Oct-Dec quarter.",
  "top revenue industries": "**Automotive** leads with ₹1.25 Cr across 2 bookings, followed by **Technology & IT** at ₹58L across 4 bookings. The average revenue per Automotive event (₹62.5L) is 3x higher than Technology events (₹14.5L).",
  "upcoming conflicting events": "No active conflicts detected. However, **Startup India** (Apr 18-23, Tentative) and a potential new booking for Hall A could overlap. Recommend confirming or releasing the tentative hold by Apr 15.",
  "demand forecast": "Based on historical patterns, **Q4 2026** will see 35% higher demand than Q2. Bharat Mandapam Hall 1 and Hall 4 are likely to be fully booked. Recommend opening advance bookings for Oct-Dec now.",
  "revenue summary": "**YTD Revenue: ₹2.52 Cr** across 10 bookings. Confirmed bookings account for 78% of revenue. Average booking value: ₹25.2L. Projected annual revenue at current pace: ₹5.04 Cr.",
};

// Users (kept from previous setup)
export const users = [
  { id: 1, name: 'Avinash Sharma', role: 'Admin', email: 'avinash@expoinn.com', status: 'active', initials: 'AS' },
  { id: 2, name: 'Soonam Kapoor', role: 'Event Sales Team', email: 'soonam@expoinn.com', status: 'active', initials: 'SK' },
  { id: 3, name: 'Barun Kumar', role: 'Event Sales Team', email: 'barun@expoinn.com', status: 'active', initials: 'BK' },
  { id: 4, name: 'Tanuja Mishra', role: 'Admin', email: 'tanuja@expoinn.com', status: 'active', initials: 'TM' },
  { id: 5, name: 'Salman Qureshi', role: 'Event Sales Team', email: 'salman@expoinn.com', status: 'inactive', initials: 'SQ' },
];

// Helpers
export function isDateOverlap(start1, end1, start2, end2) {
  return Math.max(new Date(start1).getTime(), new Date(start2).getTime()) <=
         Math.min(new Date(end1).getTime(), new Date(end2).getTime());
}

export function checkConflicts(bookings, newBooking) {
  return bookings.filter(b => {
    if (b.id === newBooking.id) return false;
    if (b.status === "Cancelled") return false;
    if (b.venueId !== newBooking.venueId || b.hall !== newBooking.hall) return false;
    return isDateOverlap(b.setupDate, b.dismantleDate, newBooking.setupDate, newBooking.dismantleDate);
  });
}

export function getVenueName(id) {
  return masterData.venues.find(v => v.id === id)?.name || "Unknown";
}

export function formatCurrency(num) {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  return `₹${num.toLocaleString("en-IN")}`;
}
