import type { DiscussionPost, AlertItem, VisitorPass } from "./model";

export type Coordinate = [number, number];
export type MapFilter = "Traffic" | "Transport" | "Hazards" | "CCTV";
export type PlaceKind = "place" | "transport" | "hazard" | "camera";
export type Place = {
  id: string;
  name: string;
  subtitle: string;
  coordinate: Coordinate;
  kind: PlaceKind;
  detail?: string;
  streamUrl?: string;
  address?: string;
  searchCategory?: string;
  searchStatus?: string;
  announcementId?: string;
  imageUrl?: string;
  announcementCategory?: Announcement["category"];
  announcementPriority?: Announcement["priority"];
  markerOffset?: [number, number];
};
export const CENTER: Coordinate = [101.5118, 3.1796];
// Fixtures are illustrative, including stop/camera placements. Never represent them as verified live observations.
export const places: Place[] = [
  {
    id: "kwasa-hub",
    name: "Kwasa Sentral MRT Station",
    subtitle: "MRT connection & transit terminal · Kwasa Hub",
    address: "Jalan Kwasa Sentral, Kwasa Damansara, Selangor · demo address",
    coordinate: [101.5791, 3.1769],
    kind: "place",
  },
  {
    id: "park",
    name: "Elmina Valley Central Park",
    subtitle: "Park & recreation · City of Elmina",
    coordinate: [101.51425, 3.17901],
    kind: "place",
  },
  {
    id: "mall",
    name: "Elmina Lakeside Mall",
    subtitle: "Shopping & dining · City of Elmina",
    coordinate: [101.5099, 3.18133],
    kind: "place",
  },
  {
    id: "entrance",
    name: "Township entrance",
    subtitle: "Neighbourhood access",
    coordinate: [101.5156, 3.1742],
    kind: "place",
  },
  {
    id: "bottleneck-gce",
    name: "Approach to Elmina Interchange",
    subtitle: "Guthrie Corridor Expressway (GCE) · Heavy Traffic (7:45 AM)",
    coordinate: [101.5175, 3.1735],
    kind: "hazard",
    detail:
      "Guthrie Corridor Expressway (GCE) approach to Elmina Interchange is experiencing Heavy traffic (32 vehicles queued observed at 7:45 AM). 12-min delay reported. AI routing suggests taking Elmina West Bypass.",
  },
  {
    id: "elmina-green-stop",
    name: "Proposed Elmina Green Shuttle Stop",
    subtitle: "Smart Elmina Community Shuttle · Route T102",
    coordinate: [101.5035, 3.1970],
    kind: "transport",
    detail:
      "Proposed community shuttle pickup for Elmina Green residents connecting to Elmina Lakeside Mall (10:20 AM) and Kwasa Sentral MRT Station (10:30 AM). Departure scheduled for 10:10 AM.",
  },
  {
    id: "hazard-pothole",
    name: "Pothole Near Elmina Central Park",
    subtitle: "Damaged Road Surface · Reported 5:30 PM",
    coordinate: [101.51425, 3.17901],
    kind: "hazard",
    detail:
      "Damaged road surface near pedestrian crossing posing hazard to cyclists, pedestrians, and vehicles. Reported 23 October 2026 at 5:30 PM by Daniel. Maintenance inspection in progress.",
  },
  {
    id: "stop-1",
    name: "Park shuttle stop",
    subtitle: "Proposed township shuttle",
    coordinate: [101.5135, 3.1785],
    kind: "transport",
    detail:
      "Proposed connection to public transport. This service is not operating; the timetable below is for demonstration.",
  },
  {
    id: "stop-2",
    name: "Lakeside shuttle stop",
    subtitle: "Proposed township shuttle",
    coordinate: [101.5088, 3.1805],
    kind: "transport",
    detail:
      "A proposed stop beside the retail area. No live arrivals or bookings are available.",
  },
  {
    id: "hazard-1",
    name: "Lane obstruction near the park",
    subtitle: "Park access road",
    coordinate: [101.5138, 3.1778],
    kind: "hazard",
    detail:
      "Demo incident: a fallen branch is obstructing one lane. The sample response shows a maintenance team assigned.",
  },
  {
    id: "camera-1",
    name: "CCTV 01 · GCE Toll Exit 3502",
    subtitle: "GCE Exit 3502 · Highway approach",
    coordinate: [101.5153, 3.1751],
    kind: "camera",
    streamUrl: process.env.EXPO_PUBLIC_CCTV_STREAM_URL,
  },
  {
    id: "camera-2",
    name: "CCTV 02 · Persiaran Atmosfera Merge",
    subtitle: "Persiaran Atmosfera · Merge corridor",
    coordinate: [101.514, 3.1782],
    kind: "camera",
  },
  {
    id: "camera-3",
    name: "CCTV 03 · Central Park Boulevard",
    subtitle: "Central Park Boulevard · Park access",
    coordinate: [101.51, 3.1806],
    kind: "camera",
  },
  { id: "elmina-green-1", name: "Elmina Green 1", subtitle: "Jalan Casuarina U17/59A", coordinate: [101.5118, 3.1796], kind: "place", searchCategory: "Neighbourhood", searchStatus: "Open 24 hours · sample" },
  { id: "atmosfera-stop", name: "Persiaran Atmosfera Bus Stop", subtitle: "Feeder Route S1", coordinate: [101.5135, 3.1785], kind: "transport", searchCategory: "Transit", searchStatus: "Next bus in 6 min · simulated" },
  { id: "temu-hub", name: "Temu Commercial Hub", subtitle: "Persiaran Atmosfera", coordinate: [101.5099, 3.18133], kind: "place", searchCategory: "Shopping", searchStatus: "Stores open · sample" },
  { id: "rainbow-bridge", name: "Elmina Central Park & Rainbow Bridge", subtitle: "Park & recreation · City of Elmina", coordinate: [101.51425, 3.17901], kind: "place", searchCategory: "Recreation", searchStatus: "Open 24 hours · sample" },
  { id: "home-valley-3", name: "Elmina Valley 3", subtitle: "Home · illustrative township location", coordinate: CENTER, kind: "place", searchCategory: "Home" },
  {
    id: "elmina-valley",
    name: "Elmina Valley",
    subtitle: "Home · Persiaran Atmosfera, Precinct 1",
    address: "Jalan Casuarina, Elmina Valley, 40160 Shah Alam, Selangor",
    coordinate: [101.5142, 3.1790],
    kind: "place",
    searchCategory: "Home",
    searchStatus: "Aiman's Residence · Elmina Valley",
  },
  {
    id: "elmina-city-centre",
    name: "Elmina City Centre",
    subtitle: "Commercial & Business Hub · Persiaran Elmina",
    address: "Persiaran Elmina, Elmina City Centre, 40160 Shah Alam, Selangor",
    coordinate: [101.5035, 3.1875],
    kind: "place",
    searchCategory: "Work",
    searchStatus: "Offices & Corporate Hub · open",
  },
  {
    id: "closure-persiaran-elmina",
    announcementId: "ann-01",
    announcementCategory: "Roads",
    announcementPriority: "high",
    imageUrl: "road-closure.jpg",
    name: "Road Closure · Persiaran Elmina",
    subtitle: "Road Resurfacing & Maintenance · 7:00 AM – 11:00 AM",
    address: "Selected section of Persiaran Elmina approaching Elmina City Centre",
    coordinate: [101.5085, 3.1845],
    kind: "hazard",
    detail:
      "Temporary road closure by Township Management today, 23 October 2026 (7:00 AM – 11:00 AM) for road resurfacing and maintenance. Motorists traveling to Elmina City Centre are advised to use the Elmina West Bypass or Persiaran Atmosfera.",
  },
];
export const filters: MapFilter[] = ["Traffic", "Transport", "Hazards", "CCTV"];
export function visiblePlaces(filter: MapFilter): Place[] {
  const kinds: Record<MapFilter, PlaceKind[]> = {
    Traffic: ["place"],
    Transport: ["transport"],
    Hazards: ["hazard"],
    CCTV: ["camera"],
  };
  return places.filter((p) => kinds[filter].includes(p.kind));
}
export function searchPlaces(query: string) {
  const q = query.trim().toLocaleLowerCase();
  return places.filter(
    (p) =>
      (p.kind === "place" || p.id === "atmosfera-stop") &&
      `${p.name} ${p.subtitle} ${p.searchCategory || ""}`.toLocaleLowerCase().includes(q),
  );
}
export type Announcement = {
  id: string;
  title: string;
  category: "Roads" | "Transport" | "Maintenance" | "Power" | "Community" | "Wellness" | "General";
  body: string;
  time: string;
  reactions: number;
  placeId?: string;
  coordinate?: Coordinate;
  active?: boolean;
  routeOriginId?: string;
  routeDestinationId?: string;
  icon: "road" | "tree" | "light";
  summary?: string;
  content?: string;
  impactArea?: string;
  residentSteps?: string[];
  priority?: "high" | "normal";
  actionText?: string;
  actionLink?: string;
  imageUrl?: string;
  dateStr?: string;
  source?: string;
};

export const announcements: Announcement[] = [
  {
    id: "ann-01",
    title: "Temporary Road Closure Along Persiaran Elmina",
    category: "Roads",
    body: "Road resurfacing and maintenance by Township Management along Persiaran Elmina today, 23 October 2026 (7:00 AM – 11:00 AM). Selected section approaching Elmina City Centre is closed.",
    time: "Today, 7:30 AM",
    reactions: 54,
    placeId: "closure-persiaran-elmina",
    icon: "road",
    priority: "high",
    source: "Township Management",
    dateStr: "23 October 2026 · 7:00 AM – 11:00 AM",
    imageUrl: "road-closure.jpg",
    routeOriginId: "elmina-valley",
    routeDestinationId: "elmina-city-centre",
    summary: "Temporary road closure along Persiaran Elmina approaching Elmina City Centre for road resurfacing and maintenance (7:00 AM – 11:00 AM).",
    content: "Township Management wishes to inform residents that road resurfacing and maintenance works will be carried out along a selected section of Persiaran Elmina approaching Elmina City Centre today, Friday, 23 October 2026, between 7:00 AM and 11:00 AM.\n\nTraffic management teams and auxiliary wardens are stationed to guide traffic flow. Commuters heading from Elmina Valley towards Elmina City Centre are advised to review alternative routes in the Journey Planner or use the Elmina West Bypass.",
    impactArea: "Selected section of Persiaran Elmina approaching Elmina City Centre",
    residentSteps: [
      "Closure period: 7:00 AM – 11:00 AM on 23 October 2026.",
      "Reason: Road resurfacing and maintenance.",
      "Detour: Use Persiaran Atmosfera or Elmina West Bypass towards Elmina City Centre.",
      "Plan extra 10–12 minutes buffer during morning commute.",
      "Feeder Bus S1 runs on dedicated priority bypass lanes."
    ],
    actionText: "Journey Planner",
    actionLink: "/(tabs)/explore?sheet=plan_journey&origin=elmina-valley&destination=elmina-city-centre",
  },
  {
    id: "ann-02",
    title: "Scheduled Power Substation Maintenance in Elmina Green",
    category: "Maintenance",
    body: "Preventive upkeep on Substation EG-04 scheduled for Thursday night window (11:00 PM - 3:00 AM). Backup generators on standby for street lights and lift lobbies.",
    time: "Yesterday, 2:00 PM",
    reactions: 21,
    placeId: "park",
    icon: "light",
    priority: "normal",
    source: "Tenaga Nasional Berhad & Sime Darby",
    dateStr: "Thursday, 11:00 PM - 3:00 AM",
    summary: "Routine electrical grid optimization across Precinct 12 and Elmina Green.",
    content: "Routine electrical grid optimization across Precinct 12 and Elmina Green. Main security boom gates will operate on uninterrupted backup power.",
  },
  {
    id: "ann-03",
    title: "Free Community Health & Mobility Screening at Central Pavilion",
    category: "Community",
    body: "Comprehensive glucose, blood pressure, joint assessment, and eye checks tailored for senior residents and active adults. Dedicated buggy transit provided.",
    time: "Oct 22, 2026",
    reactions: 45,
    placeId: "park",
    icon: "tree",
    priority: "normal",
    source: "Thomson Hospital & Elmina Residents Association",
    dateStr: "This Thursday 9:00 AM - 1:00 PM",
    summary: "Complimentary healthcare profiling and consultations with step-free wheelchair ramp access.",
    content: "In collaboration with Thomson Hospital Kota Damansara, complimentary health profiling and physiotherapy consultations will be held at Central Pavilion with step-free wheelchair ramp access.",
  },
  {
    id: "ann-04",
    title: "Scheduled Smart Sensor Calibration at Gate 3",
    category: "Roads",
    body: "Sensor calibration between 10:00 AM - 02:00 PM tomorrow. Gate 3 Lane 1 bypass active with auxiliary police assisting flow.",
    time: "Effective Tomorrow",
    reactions: 19,
    placeId: "entrance",
    icon: "road",
    priority: "normal",
    source: "Resident Association Notice",
  },
  {
    id: "ann-05",
    title: "Community Centre Multipurpose Hall Re-opens",
    category: "Community",
    body: "Bookings for badminton courts, community banquets, and senior exercise sessions are now open following acoustical upgrades.",
    time: "Yesterday, 4:30 PM",
    reactions: 28,
    placeId: "park",
    icon: "tree",
    priority: "normal",
    source: "Sime Darby Property",
  },
];

export const initialDiscussions: DiscussionPost[] = [
  {
    id: "disc-01",
    authorName: "Farhan H.",
    authorInitials: "FH",
    authorNeighborhood: "Elmina Valley 3",
    timestamp: "45 mins ago",
    category: "transport",
    categoryLabel: "Transportation",
    trending: true,
    badgeLabel: "Trending",
    title: "What's the best time to leave during the morning peak?",
    content: "Noticing heavier queue near Persiaran Atmosfera and GCE Exit 3502 after 7:45 AM. Is 7:15 AM significantly smoother for the Kwasa Sentral transit link?",
    highlightNote: "Peak slow period: 7:50 - 8:25 AM (12 votes)",
    likes: 34,
    commentsCount: 18,
    isLiked: false,
  },
  {
    id: "disc-02",
    authorName: "Aunty Fatimah",
    authorInitials: "AF",
    authorNeighborhood: "Elmina Valley 2",
    timestamp: "2 hours ago",
    category: "neighbourhood",
    categoryLabel: "Neighbourhood",
    title: "Any recommendations for nearby walking routes?",
    content: "Looking for shaded paved trails with plenty of resting benches suitable for evening walks with a senior companion. Does Central Park loop have good lighting after 7pm?",
    locationTag: "Elmina Central Park & West Forest Trail Link",
    likes: 42,
    commentsCount: 24,
    isLiked: false,
  },
  {
    id: "disc-03",
    authorName: "David K.",
    authorInitials: "DK",
    authorNeighborhood: "Elmina Green 1",
    timestamp: "Yesterday",
    category: "events",
    categoryLabel: "Events",
    badgeLabel: "This Sunday",
    eventDate: "Sun, 8:00 AM • Rainbow Bridge",
    title: "Weekend neighbourhood activities: Lakeside Sunday Pet Gathering & Cycling",
    content: "Organizing an informal meet-up by the Rainbow Bridge this Sunday 8:00 AM. Bring water and dogs on leash! Everyone welcome.",
    likes: 29,
    commentsCount: 12,
    isLiked: false,
  },
  {
    id: "disc-04",
    authorName: "Siti Nurhaliza",
    authorInitials: "SN",
    authorNeighborhood: "Elmina Ridge",
    timestamp: "2 days ago",
    category: "general",
    categoryLabel: "General",
    title: "Recommended eco-friendly home composting bins suitable for terrace houses?",
    content: "Has anyone tried the municipal subsidized compost bins from Sime Darby Property? Would love to hear your experience with smell and pest control.",
    highlightAuthor: "Dr. Tan",
    highlightNote: '"The Bokashi starter system works wonderfully for terrace courtyards with zero fruit fly issues..."',
    likes: 15,
    commentsCount: 9,
    isLiked: false,
  },
  {
    id: "disc-05",
    authorName: "Uncle Ramesh",
    authorInitials: "UR",
    authorNeighborhood: "Elmina Ridge",
    timestamp: "5 hours ago",
    category: "neighbourhood",
    categoryLabel: "Gardening Club",
    title: "Elmina Lakeside Community Garden: Extra heirloom tomato & basil seedlings to share",
    content: "Planted too many organic cuttings this monsoon season! Welcome to pick up from Lot 4B plots.",
    likes: 35,
    commentsCount: 21,
    isLiked: false,
  },
];

export const initialAlerts: AlertItem[] = [
  {
    id: "alt-road-closure",
    title: "🚧 Road Closure: Persiaran Elmina",
    subtitle: "Road resurfacing & maintenance · 7:00 AM – 11:00 AM today",
    source: "Township Management",
    timestamp: "Today, 7:30 AM",
    type: "mobility",
    badgeLabel: "Road Advisory",
    content: "Township Management has temporarily closed a selected section of Persiaran Elmina approaching Elmina City Centre for road resurfacing. Please review detour options in Journey Planner.",
    isRead: false,
    isImportant: true,
    isAcknowledged: false,
    actionType: "mobility_link",
    actionLabel: "Open Journey Planner",
  },
  {
    id: "alt-01",
    title: "Severe Thunderstorm & Flash Ponding Warning",
    subtitle: "Elmina West & Green Spine",
    source: "MetMalaysia & Smart Sump Telemetry",
    timestamp: "12 mins ago",
    type: "urgent",
    badgeLabel: "Urgent Safety",
    content: "Heavy rain advisory issued by MetMalaysia. Retention ponds functioning normally; please avoid lower perimeter walkways near Rain Garden 2 until water recedes.",
    isRead: false,
    isImportant: true,
    isAcknowledged: false,
    actionType: "acknowledge",
    actionLabel: "Tap to Acknowledge",
  },
  {
    id: "alt-02",
    title: "🚗 GCE Exit 3502 Bottleneck Delay",
    subtitle: "Heavy congestion on Persiaran Atmosfera · estimated delay 12 min",
    source: "Traffic Command Center",
    timestamp: "45 mins ago",
    type: "mobility",
    badgeLabel: "Mobility Alert",
    content: "Heavy merging traffic at GCE Exit 3502. Estimated delay: 12 minutes. Allow extra travel time or compare feeder bus and carpool options.",
    isRead: false,
    isImportant: true,
    actionType: "mobility_link",
    actionLabel: "View Traffic & Detour on Map",
  },
  {
    id: "alt-03",
    title: "Feeder Bus S1 Temporary Boarding Bay",
    subtitle: "Township Shuttle Operations",
    source: "Elmina Rapid Transport",
    timestamp: "1 hour ago",
    type: "shuttle",
    badgeLabel: "Shuttle Update",
    content: "Valley Gate stop moved 120m south to Lakeside Bay shelter due to drainage maintenance. Headways remain every 15 mins during peak hours.",
    isRead: false,
    isImportant: false,
    actionType: "shuttle_link",
    actionLabel: "Check Bus S1 Schedule",
  },
  {
    id: "alt-04",
    title: "Community Health & Mobility Screening",
    subtitle: "Community Hub • Central Pavilion",
    source: "Sime Darby Property",
    timestamp: "3 hours ago",
    type: "official",
    badgeLabel: "Sime Darby Property",
    content: "Complimentary blood pressure, vision, and joint assessments this Thursday at Central Pavilion. Free wheelchair-accessible shuttle service provided every 20 minutes from all sub-precincts.",
    isRead: false,
    isImportant: false,
    isAcknowledged: false,
    actionType: "acknowledge",
    actionLabel: "Acknowledge Notice",
  },
  {
    id: "alt-05",
    title: 'Farhan H. replied to your post: "Morning peak traffic"',
    subtitle: "Community Forum",
    source: "Neighbourhood Forum",
    timestamp: "Yesterday, 6:15 PM",
    type: "social",
    badgeLabel: "Community Forum",
    content: "",
    quote: '"Definitely agree! Leaving before 7:20 AM saves at least 15 minutes before the school rush near Junction 4A."',
    isRead: true,
    isImportant: false,
    actionType: "forum_link",
    actionLabel: "Open Forum Discussion",
  },
  {
    id: "alt-06",
    title: "📢 System Maintenance Alert",
    subtitle: "Gate 3 sensor maintenance active today",
    source: "City Infrastructure Council",
    timestamp: "Yesterday, 2:30 PM",
    type: "maintenance",
    badgeLabel: "Municipal Works",
    content: "Scheduled maintenance of Gate 3 access sensors is active today from 9:00 AM to 4:00 PM. Use the marked adjacent lane and follow the wardens’ directions. Visitor passes remain available.",
    isRead: true,
    isImportant: false,
    actionType: "none",
    actionLabel: "View Circular Details",
  },
];

export const initialVisitorPasses: VisitorPass[] = [
  {
    id: "VP-9942",
    visitorName: "Nurul Aisyah",
    vehiclePlate: "WXY 8192",
    entryDate: "Today, 2:30 PM",
    validHours: 8,
    passCode: "ELM-8829-G3",
    createdAt: "Just now",
    status: "active",
  },
];

export type ShuttleStop = {
  id: number;
  name: string;
  subtitle: string;
  badge?: string;
  time: string;
  note: string;
  isOrigin?: boolean;
  isTerminal?: boolean;
  isMedical?: boolean;
};

export const shuttleStops: ShuttleStop[] = [
  {
    id: 1,
    name: "Central Park Pavilion",
    subtitle: "Covered walkway • Bay 2",
    badge: "Origin Stop • Ready to Board",
    time: "08:32 AM",
    note: "Scheduled",
    isOrigin: true,
  },
  {
    id: 2,
    name: "Elmina Valley Community Center",
    subtitle: "Opposite Multipurpose Hall",
    time: "08:38 AM",
    note: "+6 min",
  },
  {
    id: 3,
    name: "Lakeside Promenade & Klinik Kesihatan",
    subtitle: "Priority Medical Zone Access",
    time: "08:44 AM",
    note: "+12 min",
    isMedical: true,
  },
  {
    id: 4,
    name: "Elmina Lakeside Mall (West Entrance)",
    subtitle: "Direct lift & escalator connection",
    time: "08:50 AM",
    note: "+18 min",
  },
  {
    id: 5,
    name: "Kwasa Damansara Transit Hub",
    subtitle: "MRT Putrajaya & Kajang Line link",
    badge: "Interchange",
    time: "09:02 AM",
    note: "Arrival",
    isTerminal: true,
  },
];

export const hourlyTrafficData = [
  { hour: "6 AM", normal: 22, today: 26, status: "smooth" },
  { hour: "7 AM", normal: 48, today: 58, status: "moderate" },
  { hour: "8 AM", normal: 68, today: 96, isCurrent: true, status: "heavy" },
  { hour: "9 AM", normal: 52, today: 64, status: "moderate" },
  { hour: "10 AM", normal: 35, today: 38, status: "smooth" },
  { hour: "11 AM", normal: 28, today: 30, status: "smooth" },
  { hour: "12 PM", normal: 32, today: 35, status: "smooth" },
];

export const popularDestinations = [
  {
    id: "lakeside_mall",
    name: "Elmina Lakeside Mall",
    category: "Retail & Lakeside Dining",
    distance: "3.2 km",
    eta: "7 mins",
    route: "via Persiaran Atmosfera",
    coordinate: [101.5099, 3.18133] as Coordinate,
  },
  {
    id: "central_park",
    name: "Elmina Central Park Pavilion",
    category: "Recreation & Community Hub",
    distance: "1.4 km",
    eta: "3 mins",
    route: "via Elmina Valley Loop",
    coordinate: [101.51425, 3.17901] as Coordinate,
  },
  {
    id: "west_gate",
    name: "Elmina West Gate 3 Post",
    category: "Township Access & Feeder Point",
    distance: "2.8 km",
    eta: "12 mins",
    route: "via East Promenade Bypass",
    coordinate: [101.5156, 3.1742] as Coordinate,
  },
  {
    id: "kwasa_hub",
    name: "Kwasa Damansara Transit Hub",
    category: "MRT Interchange (Lines 9 & 12)",
    distance: "4.5 km",
    eta: "9 mins",
    route: "via Guthrie Corridor Expressway (GCE)",
    coordinate: [101.5727, 3.1762] as Coordinate,
  },
];

export interface CCTVTelemetry {
  id: string;
  name: string;
  location: string;
  resolution: string;
  camTag: string;
  statusTone: "green" | "amber" | "red";
  statusText: string;
  statusDetail: string;
  statusBadge: string;
  flowRate: string;
  detections: { label: string; top: number | string; left: number | string }[];
  throughput: { value: string; note: string };
  detectedSpeed: { value: string; limit: string };
  roadDensity: { value: string; note: string };
  queueLength: { value: string; note: string };
  vehicleClassification: { cars: number; lorries: number; motorcycles: number; vans: number };
  advisory: string;
}

export const cctvTelemetry: CCTVTelemetry[] = [
  {
    id: "cam-1", name: "CCTV 01 · GCE Toll Exit 3502", location: "GCE Exit 3502 · Highway approach",
    resolution: "1080p 60fps", camTag: "CAM-01 • 1080p", statusTone: "green",
    statusText: "GOOD TRAFFIC", statusDetail: "Smooth Flow • Avg speed 74 km/h • Clear lanes", statusBadge: "Good Flow", flowRate: "32 veh/min",
    detections: [
      { label: "CAR 99% • 74 km/h", top: "49%", left: "18%" },
      { label: "SUV 97% • 74 km/h", top: "65%", left: "56%" },
    ],
    throughput: { value: "32 veh/min", note: "Flowing smoothly (94% optimal index)" },
    detectedSpeed: { value: "74 km/h", limit: "Speed limit: 80 km/h" },
    roadDensity: { value: "22%", note: "Low density • Unhindered headway" },
    queueLength: { value: "0 meters", note: "No delay • Zero tailback" },
    vehicleClassification: { cars: 68, lorries: 18, motorcycles: 10, vans: 4 },
    advisory: "Corridor operating at peak efficiency in this simulation. Recommended for a fast highway exit towards GCE.",
  },
  {
    id: "cam-2", name: "CCTV 02 · Persiaran Atmosfera Merge", location: "Persiaran Atmosfera · Merge corridor",
    resolution: "1080p 60fps", camTag: "CAM-02 • 1080p", statusTone: "amber",
    statusText: "MODERATE DELAY", statusDetail: "Moderate Congestion • Avg speed 38 km/h • Merging traffic", statusBadge: "Moderate Congestion", flowRate: "46 veh/min",
    detections: [
      { label: "CAR 98% • 38 km/h", top: "45%", left: "17%" },
      { label: "LORRY 96% • 31 km/h", top: "63%", left: "56%" },
      { label: "BIKE 94% • 42 km/h", top: "75%", left: "25%" },
    ],
    throughput: { value: "46 veh/min", note: "Elevated demand (68% optimal index)" },
    detectedSpeed: { value: "38 km/h", limit: "Speed limit: 60 km/h" },
    roadDensity: { value: "61%", note: "Moderate density • Reduced headway" },
    queueLength: { value: "180 meters", note: "Estimated delay: 6 minutes" },
    vehicleClassification: { cars: 70, lorries: 14, motorcycles: 12, vans: 4 },
    advisory: "Merging traffic is slowing this simulated corridor. Compare the Elmina West bypass before departing; allow an extra 6 minutes.",
  },
  {
    id: "cam-3", name: "CCTV 03 · Central Park Boulevard", location: "Central Park Boulevard · Park access",
    resolution: "1080p 60fps", camTag: "CAM-03 • 1080p", statusTone: "green",
    statusText: "SMOOTH FLOW", statusDetail: "Smooth Flow • Avg speed 45 km/h • Clear park access", statusBadge: "Smooth Flow", flowRate: "18 veh/min",
    detections: [
      { label: "CAR 99% • 45 km/h", top: "52%", left: "20%" },
      { label: "BUS 98% • 40 km/h", top: "70%", left: "55%" },
    ],
    throughput: { value: "18 veh/min", note: "Light demand (91% optimal index)" },
    detectedSpeed: { value: "45 km/h", limit: "Speed limit: 50 km/h" },
    roadDensity: { value: "16%", note: "Low density • Park access clear" },
    queueLength: { value: "0 meters", note: "No queue at park entrance" },
    vehicleClassification: { cars: 73, lorries: 5, motorcycles: 16, vans: 6 },
    advisory: "Central Park access is clear in this simulation. Continue at the posted speed and give way to pedestrians at crossings.",
  },
];

/** Preserve existing map IDs and deep links while using the requested telemetry IDs. */
export function getCCTVTelemetry(cameraId: string): CCTVTelemetry | undefined {
  const canonical = cameraId.replace(/^camera-/, "cam-");
  return cctvTelemetry.find((camera) => camera.id === canonical);
}

export interface RoadCorridor {
  id: string;
  name: string;
  coordinate: Coordinate;
  speedLimit: number;
  speed: number;
  delay: number;
  queue: number;
  throughput: number;
  status: string;
  tone: "green" | "amber" | "red";
  advisory: string;
}
export const roadCorridors: RoadCorridor[] = [
  {
    id: "persiaran-elmina",
    name: "Persiaran Elmina",
    coordinate: [101.5085, 3.1845],
    speedLimit: 60,
    speed: 6,
    delay: 15,
    queue: 650,
    throughput: 12,
    status: "Road Resurfacing / Closed",
    tone: "red",
    advisory: "Selected section approaching Elmina City Centre is closed for resurfacing (7:00 AM – 11:00 AM). AI Journey Planner advises diverting via Elmina West Bypass or Persiaran Atmosfera."
  },
  {
    id: "gce",
    name: "Approach to Elmina Interchange",
    coordinate: [101.515847, 3.174127],
    speedLimit: 80,
    speed: 14,
    delay: 12,
    queue: 450,
    throughput: 32,
    status: "Heavy",
    tone: "red",
    advisory: "Guthrie Corridor Expressway (GCE) approach to Elmina Interchange is experiencing Heavy traffic (32 vehicles queued observed at 7:45 AM). Allow an extra 12 minutes or divert via Elmina West Bypass."
  },
  { id: "atmosfera", name: "Persiaran Atmosfera", coordinate: [101.512122, 3.173294], speedLimit: 60, speed: 38, delay: 6, queue: 180, throughput: 46, status: "Moderate congestion", tone: "amber", advisory: "Merging traffic is slowing this corridor. Compare route options and leave extra travel time." },
  { id: "central-park", name: "Central Park Boulevard", coordinate: [101.509225, 3.177905], speedLimit: 50, speed: 45, delay: 0, queue: 0, throughput: 18, status: "Smooth flow", tone: "green", advisory: "Park access is clear in this simulation. Follow the posted speed and give way at pedestrian crossings." },
];
export function resolveRoadCorridor(id?: string, name?: string, coordinate?: Coordinate): RoadCorridor {
  const exact = roadCorridors.find((road) => road.id === id);
  if (exact) return { ...exact, coordinate: coordinate || exact.coordinate };
  const label = name?.toLowerCase() || "";
  const matching = roadCorridors.find((road) => label.includes(road.name.toLowerCase()) || (road.id === "persiaran-elmina" && (label.includes("persiaran elmina") || label.includes("elmina city centre") || label.includes("resurfacing"))) || (road.id === "gce" && /gce|e35|interchange|approach/.test(label)) || (road.id === "atmosfera" && label.includes("atmosfera")));
  const nearest = coordinate ? [...roadCorridors].sort((a, b) => Math.hypot(a.coordinate[0] - coordinate[0], a.coordinate[1] - coordinate[1]) - Math.hypot(b.coordinate[0] - coordinate[0], b.coordinate[1] - coordinate[1]))[0] : roadCorridors[0];
  const road = matching || nearest;
  return { ...road, name: name || road.name, coordinate: coordinate || road.coordinate };
}

// Illustrative partner offers, not connected to merchant redemption systems.
export const voucherCategories = [{ value: "explore", label: "All" }, { value: "transit", label: "Transit" }, { value: "food", label: "Dining" }, { value: "groceries", label: "Groceries" }, { value: "lifestyle", label: "Lifestyle" }] as const;
export const vouchers: import("./rewards").Voucher[] = [
  { id: "nursery", merchant: "ELMINA NURSERY", merchantIcon: "🌱", offer: "RM5 OFF", title: "A greener home", points: 90, category: "lifestyle", image: "https://cdn.jsdelivr.net/gh/StartBootstrap/startbootstrap-business-casual@master/dist/assets/img/products-03.jpg", outlet: "Elmina nursery", description: "A little green for your living space.", terms: ["Illustrative resident offer.", "One use per voucher."] },
  { id: "jaya", merchant: "JAYA GROCER", merchantIcon: "🛒", offer: "RM5.00 OFF", title: "Fresh Produce & Daily Groceries", points: 150, category: "groceries", image: "https://cdn.jsdelivr.net/gh/StartBootstrap/startbootstrap-business-casual@master/dist/assets/img/products-03.jpg", outlet: "Elmina Lakeside Mall", description: "Make your next grocery visit a little more rewarding with this resident offer.", terms: ["Valid at the participating outlet listed above.", "One voucher per resident. Present it before payment.", "Not exchangeable for cash or combinable with other offers."] },
  { id: "bask", merchant: "BASK BEAR", merchantIcon: "🐻", offer: "RM3.00 OFF", title: "Your Daily Coffee, On Us", points: 100, category: "food", image: "https://cdn.jsdelivr.net/gh/StartBootstrap/startbootstrap-business-casual@master/dist/assets/img/intro.jpg", outlet: "Elmina Lakeside Mall", description: "Enjoy your next coffee break with an Eco-Pass resident reward.", terms: ["Valid at the participating outlet listed above.", "One voucher per resident. Selected beverages only.", "Not exchangeable for cash or combinable with other offers."] },
  { id: "eco", merchant: "ECO-MOBILITY", merchantIcon: "🛺", offer: "FREE RIDE", title: "Central Park Buggy Experience", points: 75, category: "transit", image: "https://cdn.jsdelivr.net/gh/StartBootstrap/startbootstrap-grayscale@master/dist/assets/img/bg-masthead.jpg", outlet: "Central Park Pavilion", description: "Explore Central Park with a shared recreational buggy ride.", terms: ["Subject to availability and operating hours.", "One recreational ride per voucher.", "This illustrative offer is separate from Gold Tier privileges."] },
  { id: "komugi", merchant: "KOMUGI", merchantIcon: "🥐", offer: "20% OFF", title: "Fresh Bakes & Sweet Moments", points: 120, category: "food", image: "https://cdn.jsdelivr.net/gh/StartBootstrap/startbootstrap-business-casual@master/dist/assets/img/products-02.jpg", outlet: "Elmina Lakeside Mall", description: "Treat yourself to fresh bakes with a resident reward.", terms: ["Valid on selected bakery products at the listed outlet.", "One voucher per resident. Present it before payment.", "Not exchangeable for cash or combinable with other offers."] },
];
export const residentPerks = [
  { icon: "bus", title: "Free Elmina EV Shuttle Feeder S1", detail: "Unlimited boarding with your resident QR." },
  { icon: "zap", title: "15% off EV fast charging", detail: "Central Park & Temu Hub charging bays." },
  { icon: "car", title: "Complimentary buggy service", detail: "Central Park recreational transit." },
  { icon: "calendar", title: "Priority sports court booking", detail: "Book tennis and futsal up to 7 days ahead." },
  { icon: "sprout", title: "10% off at Community Nursery", detail: "Native shrubs and trees for your home." },
] as const;

export { elminaBusStops, shuttleRouteCoordinates, liveBusLocation } from "./shuttle-data";
