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
};
export const CENTER: Coordinate = [101.5118, 3.1796];
// Fixtures are illustrative, including stop/camera placements. Never represent them as verified live observations.
export const places: Place[] = [
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
    name: "GCE Toll Interchange 3502",
    subtitle: "Persiaran Atmosfera merge • Level 4 Saturation",
    coordinate: [101.5175, 3.1735],
    kind: "hazard",
    detail:
      "Demo Junction A: Heavy congestion with 12-min delay. AI routing suggests taking Elmina West Bypass to save 9 minutes.",
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
    name: "Main entrance · Camera 01",
    subtitle: "Township entrance road",
    coordinate: [101.5153, 3.1751],
    kind: "camera",
    streamUrl: process.env.EXPO_PUBLIC_CCTV_STREAM_URL,
  },
  {
    id: "camera-2",
    name: "Park access · Camera 02",
    subtitle: "Park access road",
    coordinate: [101.514, 3.1782],
    kind: "camera",
  },
  {
    id: "camera-3",
    name: "Lakeside · Camera 03",
    subtitle: "Lakeside approach",
    coordinate: [101.51, 3.1806],
    kind: "camera",
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
      p.kind === "place" &&
      `${p.name} ${p.subtitle}`.toLocaleLowerCase().includes(q),
  );
}
export type Announcement = {
  id: string;
  title: string;
  category: "Roads" | "Maintenance" | "Community";
  body: string;
  time: string;
  reactions: number;
  placeId?: string;
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
    title: "Persiaran Atmosfera Eastbound Closure & S1 Adjustment",
    category: "Roads",
    body: "Roadworks between Valley Gate and Central Park from Oct 24–28. Feeder Bus S1 rerouted to Lakeside Bay shelter.",
    time: "Today, 7:30 AM",
    reactions: 38,
    placeId: "entrance",
    icon: "road",
    priority: "high",
    source: "Sime Darby Property Township Management",
    dateStr: "Oct 24–28, 2026",
    summary: "Roadworks between Valley Gate and Central Park from Oct 24–28. Feeder Bus S1 rerouted to Lakeside Bay.",
    content: "Essential culvert and drainage enhancement along the eastbound corridor. Gate 3 Lane 1 temporary bypass active with traffic wardens on duty.",
    impactArea: "Persiaran Atmosfera, opposite Lakeside Promenade roundabout.",
    residentSteps: [
      "Eastbound lanes closed strictly between 9:00 AM – 4:00 PM daily.",
      "Clear directional signboards and auxiliary wardens stationed.",
      "Bus S1 pickup shifted 120m south to Lakeside Bay shelter."
    ],
    actionText: "View Route in Map",
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
    title: "Persiaran Atmosfera Eastbound Detour",
    subtitle: "City Council & Sime Darby",
    source: "Traffic Command Center",
    timestamp: "45 mins ago",
    type: "mobility",
    badgeLabel: "Mobility Alert",
    content: "Culvert installation active between Valley Gate 2 and Central Park. Average delay: 8–10 mins. Feeder Bus S1 diverted via Persiaran Elmina Utama.",
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
    title: "Scheduled Fiber Optic & Smart Lighting Calibration",
    subtitle: "Municipal Works",
    source: "City Infrastructure Council",
    timestamp: "Yesterday, 2:30 PM",
    type: "maintenance",
    badgeLabel: "Municipal Works",
    content: "Night window maintenance (11 PM - 3 AM) completed across Elmina Ridge. All IoT streetlamps and automated crosswalk sensors are fully functional.",
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
