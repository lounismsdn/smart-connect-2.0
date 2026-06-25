import { generateId } from "./utils";

// ─── Types ───────────────────────────────────────────────

export interface QRCode {
  id: string;
  name: string;
  shortCode: string;
  destinationUrl: string;
  status: "active" | "paused" | "draft";
  totalScans: number;
  uniqueScans: number;
  lastActivity: string;
  createdAt: string;
  clientId?: string;
  clientName?: string;
  style: QRStyle;
  scanHistory: { date: string; scans: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  geoBreakdown: { country: string; city: string; count: number }[];
}

export interface QRStyle {
  preset: string;
  fgColor: string;
  bgColor: string;
  moduleStyle: "square" | "rounded" | "dots" | "liquid";
  finderStyle: "square" | "circle" | "rounded";
  logoUrl?: string;
  frameText?: string;
  glowEnabled: boolean;
  glowIntensity: number;
}

export interface NFCTag {
  id: string;
  name: string;
  uid: string;
  status: "active" | "inactive" | "error";
  writable: boolean;
  locked: boolean;
  assignedStandId?: string;
  assignedStandName?: string;
  lastActivity: string;
  totalTaps: number;
  createdAt: string;
  technology: string;
  memorySize: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "paused" | "completed";
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  qrCodes: string[];
  nfcTags: string[];
  totalImpressions: number;
  totalConversions: number;
  conversionRate: number;
  createdAt: string;
  clientId?: string;
  clientName?: string;
}

export interface ActivityEvent {
  id: string;
  type: "scan" | "tap" | "campaign" | "client" | "system";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface Client {
  id: string;
  email: string;
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  createdAt: string;
  activeQRCodes: number;
  activeNFCTags: number;
  totalScans: number;
}

// ─── Helpers ─────────────────────────────────────────────

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date.toISOString();
}

function generateScanHistory(days: number = 30): { date: string; scans: number }[] {
  const history: { date: string; scans: number }[] = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split("T")[0],
      scans: Math.floor(Math.random() * 200) + 10,
    });
  }
  return history;
}

const companyNames = [
  "Apex Digital", "Nova Studio", "Zenith Agency", "Pulse Media",
  "Vertex Creative", "Prism Works", "Orbit Group", "Flux Design",
  "Helix Marketing", "Quantum Brands", "Onyx Labs", "Cipher Digital",
];

const qrNames = [
  "Summer Campaign QR", "Product Launch", "Event Check-in", "Menu Display",
  "VIP Access", "Loyalty Program", "Restaurant Review", "Store Locator",
  "Feedback Form", "WiFi Connect", "Portfolio Link", "Contact Card",
  "App Download", "Social Media Hub", "Promo Code", "Ticket Scanner",
  "Business Card QR", "Exhibition Stand", "Workshop Registration", "Donation Link",
];

const nfcTagNames = [
  "Reception Desk", "Conference Room A", "VIP Lounge Entry", "Product Display #1",
  "Checkout Counter", "Restaurant Table 5", "Event Badge Scanner", "Parking Gate",
  "Meeting Room B", "Staff Access Point", "Customer Kiosk", "Warehouse Shelf A3",
  "Gallery Exhibit 7", "Hotel Room 204", "Gym Equipment Tag", "Library Shelf B2",
];

const campaignNames = [
  "Summer Blitz 2024", "Product Launch Wave", "Holiday Special", "Brand Awareness Q3",
  "Referral Drive", "Customer Feedback Sprint", "Pop-up Event Series", "Digital Menu Rollout",
  "Loyalty Boost Program", "Year-End Review Campaign", "New Market Entry", "Flash Sale Promo",
  "Partner Showcase", "Industry Conference", "Customer Appreciation", "Beta Launch Campaign",
];

const countries = ["US", "UK", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "NL"];
const cities = [
  "New York", "London", "Berlin", "Paris", "Toronto", "Sydney",
  "Tokyo", "São Paulo", "Mumbai", "Amsterdam",
];
const devices = ["iOS", "Android", "Windows", "macOS", "Linux"];
const browsers = ["Chrome", "Safari", "Firefox", "Edge", "Samsung Internet"];

// ─── Generate Mock Data ──────────────────────────────────

export function generateClients(count: number = 8): Client[] {
  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    email: `contact@${companyNames[i % companyNames.length].toLowerCase().replace(/\s/g, "")}.com`,
    companyName: companyNames[i % companyNames.length],
    primaryColor: ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#ec4899", "#6366f1"][i % 8],
    createdAt: randomDate(180),
    activeQRCodes: Math.floor(Math.random() * 15) + 2,
    activeNFCTags: Math.floor(Math.random() * 10) + 1,
    totalScans: Math.floor(Math.random() * 5000) + 500,
  }));
}

export function generateQRCodes(count: number = 24): QRCode[] {
  const clients = generateClients();
  return Array.from({ length: count }, (_, i) => {
    const client = clients[i % clients.length];
    const totalScans = Math.floor(Math.random() * 8000) + 100;
    return {
      id: generateId(),
      name: qrNames[i % qrNames.length],
      shortCode: Math.random().toString(36).substring(2, 8),
      destinationUrl: `https://${client.companyName.toLowerCase().replace(/\s/g, "")}.com/landing`,
      status: (["active", "active", "active", "paused", "draft"] as const)[Math.floor(Math.random() * 5)],
      totalScans,
      uniqueScans: Math.floor(totalScans * (0.6 + Math.random() * 0.3)),
      lastActivity: randomDate(3),
      createdAt: randomDate(90),
      clientId: client.id,
      clientName: client.companyName,
      style: {
        preset: (["Classic", "Rounded Flow", "Liquid Wave", "Premium Frame", "Dot Matrix", "Minimal Editorial"] as const)[i % 6],
        fgColor: "#ffffff",
        bgColor: "#0a0a0f",
        moduleStyle: (["square", "rounded", "dots", "liquid"] as const)[i % 4],
        finderStyle: (["square", "circle", "rounded"] as const)[i % 3],
        glowEnabled: Math.random() > 0.5,
        glowIntensity: Math.floor(Math.random() * 100),
        frameText: i % 3 === 0 ? "Scan Me" : undefined,
      },
      scanHistory: generateScanHistory(),
      deviceBreakdown: devices.map(d => ({ device: d, count: Math.floor(Math.random() * 500) + 20 })),
      browserBreakdown: browsers.map(b => ({ browser: b, count: Math.floor(Math.random() * 400) + 10 })),
      geoBreakdown: countries.map((c, ci) => ({
        country: c,
        city: cities[ci],
        count: Math.floor(Math.random() * 300) + 5,
      })),
    };
  });
}

export function generateNFCTags(count: number = 16): NFCTag[] {
  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    name: nfcTagNames[i % nfcTagNames.length],
    uid: Array.from({ length: 7 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase()).join(":"),
    status: (["active", "active", "active", "inactive", "error"] as const)[Math.floor(Math.random() * 5)],
    writable: Math.random() > 0.3,
    locked: Math.random() > 0.7,
    assignedStandName: i % 2 === 0 ? qrNames[i % qrNames.length] : undefined,
    lastActivity: randomDate(7),
    totalTaps: Math.floor(Math.random() * 3000) + 50,
    createdAt: randomDate(120),
    technology: (["NFC-A (ISO 14443-3A)", "NFC-V (ISO 15693)", "NFC-F (JIS 6319-4)"] as const)[i % 3],
    memorySize: (["48 bytes", "137 bytes", "504 bytes", "888 bytes"] as const)[i % 4],
  }));
}

export function generateCampaigns(count: number = 12): Campaign[] {
  const clients = generateClients();
  return Array.from({ length: count }, (_, i) => {
    const budget = Math.floor(Math.random() * 20000) + 2000;
    const spent = Math.floor(budget * (0.3 + Math.random() * 0.6));
    const impressions = Math.floor(Math.random() * 50000) + 5000;
    const conversions = Math.floor(impressions * (0.02 + Math.random() * 0.08));
    const client = clients[i % clients.length];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 60) + 14);
    return {
      id: generateId(),
      name: campaignNames[i % campaignNames.length],
      description: `Campaign for ${client.companyName} targeting new customer acquisition and brand awareness.`,
      status: (["draft", "active", "active", "paused", "completed"] as const)[Math.floor(Math.random() * 5)],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      budget,
      spent,
      qrCodes: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => generateId()),
      nfcTags: Array.from({ length: Math.floor(Math.random() * 3) }, () => generateId()),
      totalImpressions: impressions,
      totalConversions: conversions,
      conversionRate: Number(((conversions / impressions) * 100).toFixed(1)),
      createdAt: randomDate(90),
      clientId: client.id,
      clientName: client.companyName,
    };
  });
}

export function generateActivityEvents(count: number = 20): ActivityEvent[] {
  const types: ActivityEvent["type"][] = ["scan", "tap", "campaign", "client", "system"];
  const templates: Record<ActivityEvent["type"], { title: string; description: string }[]> = {
    scan: [
      { title: "QR Code Scanned", description: "Summer Campaign QR was scanned from New York, US" },
      { title: "New Unique Visitor", description: "First-time scan detected on Product Launch QR" },
      { title: "High Traffic Alert", description: "Menu Display QR exceeded 100 scans today" },
    ],
    tap: [
      { title: "NFC Tag Tapped", description: "Reception Desk tag was tapped via Android device" },
      { title: "NFC Verification OK", description: "VIP Lounge Entry tag passed integrity check" },
      { title: "NFC Write Complete", description: "Conference Room A tag URL updated successfully" },
    ],
    campaign: [
      { title: "Campaign Activated", description: "Summer Blitz 2024 is now live" },
      { title: "Campaign Milestone", description: "Holiday Special reached 10,000 impressions" },
      { title: "Campaign Ended", description: "Product Launch Wave has completed its run" },
    ],
    client: [
      { title: "New Client Added", description: "Apex Digital has been onboarded to the platform" },
      { title: "Client Export", description: "Nova Studio downloaded their monthly analytics report" },
    ],
    system: [
      { title: "System Update", description: "Platform version 2.4.0 deployed successfully" },
      { title: "Database Backup", description: "Automated backup completed — 36.8 MB" },
    ],
  };

  return Array.from({ length: count }, (_, i) => {
    const type = types[i % types.length];
    const template = templates[type][i % templates[type].length];
    return {
      id: generateId(),
      type,
      title: template.title,
      description: template.description,
      timestamp: randomDate(7),
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ─── Dashboard KPIs ──────────────────────────────────────

export function getDashboardKPIs() {
  return {
    totalQRScans: 47_832,
    qrScansTrend: 12.4,
    totalNFCTaps: 18_294,
    nfcTapsTrend: 8.7,
    activeCampaigns: 14,
    campaignsTrend: 3.2,
    revenue: 128_450,
    revenueTrend: 22.1,
  };
}

export function getDailyScansTimeline(days: number = 30) {
  const data: { date: string; qrScans: number; nfcTaps: number }[] = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      qrScans: Math.floor(Math.random() * 800) + 200,
      nfcTaps: Math.floor(Math.random() * 400) + 80,
    });
  }
  return data;
}

export function getDeviceDistribution() {
  return [
    { name: "iOS", value: 38, fill: "#3b82f6" },
    { name: "Android", value: 32, fill: "#8b5cf6" },
    { name: "Windows", value: 15, fill: "#06b6d4" },
    { name: "macOS", value: 11, fill: "#f59e0b" },
    { name: "Linux", value: 4, fill: "#10b981" },
  ];
}

export function getBrowserDistribution() {
  return [
    { name: "Chrome", value: 45 },
    { name: "Safari", value: 28 },
    { name: "Firefox", value: 12 },
    { name: "Edge", value: 10 },
    { name: "Other", value: 5 },
  ];
}

export function getGeographicData() {
  return [
    { country: "United States", code: "US", scans: 12840, percentage: 26.8 },
    { country: "United Kingdom", code: "GB", scans: 8420, percentage: 17.6 },
    { country: "Germany", code: "DE", scans: 6210, percentage: 13.0 },
    { country: "France", code: "FR", scans: 4830, percentage: 10.1 },
    { country: "Canada", code: "CA", scans: 3920, percentage: 8.2 },
    { country: "Australia", code: "AU", scans: 3100, percentage: 6.5 },
    { country: "Japan", code: "JP", scans: 2640, percentage: 5.5 },
    { country: "Brazil", code: "BR", scans: 2180, percentage: 4.6 },
    { country: "India", code: "IN", scans: 1920, percentage: 4.0 },
    { country: "Netherlands", code: "NL", scans: 1772, percentage: 3.7 },
  ];
}

export function getCampaignPerformance() {
  return campaignNames.slice(0, 6).map((name) => ({
    name: name.length > 18 ? name.substring(0, 18) + "…" : name,
    impressions: Math.floor(Math.random() * 30000) + 5000,
    conversions: Math.floor(Math.random() * 3000) + 200,
    revenue: Math.floor(Math.random() * 15000) + 1000,
  }));
}
