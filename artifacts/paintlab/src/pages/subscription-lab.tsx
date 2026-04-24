import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Phone, MessageSquare, Send, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

// ─── Residential Constants ──────────────────────────────────────────────────
const UNIT_SQFT: Record<string, number> = {
  studio: 600, oneBD: 900, twoBD: 1150, threeBD: 1500, fourBD: 1800,
};
const UNIT_LABELS: Record<string, string> = {
  studio: "Studio", oneBD: "1 Bedroom", twoBD: "2 Bedroom", threeBD: "3 Bedroom", fourBD: "4 Bedroom",
};
const UNIT_WALL_RATIO: Record<string, number> = {
  studio: 3, oneBD: 3.5, twoBD: 4, threeBD: 4, fourBD: 4,
};
const RES_DIST_SQFT: Record<string, number> = {
  corridors: 1000, stairwells: 200, elevatorLandings: 75, wasteRooms: 55,
};
const RES_DIST_LABELS: Record<string, string> = {
  corridors: "Residential Corridors",
  stairwells: "Stairwells",
  elevatorLandings: "Elevator Landings",
  wasteRooms: "Garbage / Waste Rooms",
};
const RES_HUB_SQFT: Record<string, number> = {
  mainLobby: 2500, mailroom: 750, coworking: 1750, gym: 2000,
  bathrooms: 750, leasingOffice: 1500, packageRoom: 400,
};
const RES_HUB_LABELS: Record<string, string> = {
  mainLobby: "Main Lobby", mailroom: "Mailroom", coworking: "Co-working Space",
  gym: "Gym Area", bathrooms: "Public Bathrooms", leasingOffice: "Leasing Office", packageRoom: "Package Room",
};
// Scope-only exterior zones (no per-visit cost — scoped at walkthrough)
const SCOPED_EXT_ZONES = new Set(["buildingCladding", "commCladding"]);
const EXT_ZONE_COST: Record<string, number> = {
  mainFacade: 250, floorSurface: 150, poolDeck: 450,
  doorway: 250, garbageArea: 100, garageEntrance: 175, buildingCladding: 0,
};
const EXT_ZONE_LABELS: Record<string, string> = {
  mainFacade: "Main Entrance Facade",
  floorSurface: "Main Entrance Floor Surface",
  poolDeck: "Pool Deck Area",
  doorway: "Building Entries — Walls & Floor Surface",
  garbageArea: "Garbage Area",
  garageEntrance: "Garage Entrance",
  buildingCladding: "Building Cladding / Siding",
};
const EXT_ZONE_INFO: Record<string, string> = {
  buildingCladding: "Scope assessed during your complimentary walk-through and priced separately based on material type and linear footage.",
};

// ─── Commercial Constants ───────────────────────────────────────────────────
const COMM_WALL_MULTIPLIER = 3.5;
const COMM_EXT_COST: Record<string, number> = {
  commFacade: 250, commEntranceFloor: 250, commDumpsterPad: 200,
  commEntries: 150, commGarage: 150, commCladding: 0,
};
const COMM_EXT_LABELS: Record<string, string> = {
  commFacade: "Main Entrance Facade",
  commEntranceFloor: "Main Entrance Floor Surface",
  commDumpsterPad: "Dumpster Pad Area",
  commEntries: "Building Entries — Walls & Floor Surface",
  commGarage: "Garage Entrance",
  commCladding: "Building Cladding / Siding",
};
const COMM_EXT_INFO: Record<string, string> = {
  commCladding: "Scope assessed during your complimentary walk-through and priced separately based on material type and linear footage.",
};

const COMM_PAINT_SERVICES = [
  {
    key: "curbPainting",
    label: "Curb Painting",
    description: "Color-code fire lanes, no-parking zones, and reserved stalls to keep safety and traffic markings visible and code-compliant.",
    info: "Fire lane, no-parking, and reserved-stall curb markings. Colors and linear footage confirmed during walk-through. Priced per scope.",
  },
  {
    key: "lotStriping",
    label: "Parking Lot Striping",
    description: "Full re-striping of standard stalls, drive lanes, and fire lanes with traffic-grade paint. Keeps your lot sharp and ADA-compliant.",
    info: "Full re-striping of standard stalls, drive lanes, and fire lanes with traffic-grade paint. Layout and stall count confirmed during walk-through.",
  },
  {
    key: "decalPainting",
    label: "Parking Lot Decal / Logo Painting",
    description: "Custom stenciled logos, ADA symbols, directional arrows, and numbered stalls that reinforce your brand right at the curb.",
    info: "Custom stenciled logos, ADA symbols, directional arrows, and numbered stalls. Design and placement scoped separately prior to service.",
  },
];

const FACILITY_LABELS: Record<string, string> = {
  "multi-family": "Multi-Family Residential",
  medical: "Medical / Healthcare",
  industrial: "Industrial / Warehouse",
  "office-corporate": "Office / Corporate",
  automotive: "Automotive",
  education: "Education",
  retail: "Retail",
  "gyms-fitness": "Gyms & Fitness Centers",
  commercial: "Commercial / Industrial",
};

// ─── Facility Zone Configs ──────────────────────────────────────────────────
interface ZoneConfig { key: string; label: string; info: string; defaultSqFt?: number; }
interface FacilityConfig {
  touchUpDesc: string;
  hubDesc: string;
  touchUpZones: ZoneConfig[];
  hubZones: ZoneConfig[];
}

const FACILITY_CONFIGS: Record<string, FacilityConfig> = {
  "office-corporate": {
    touchUpDesc: "Touch-up zones are your spaces that see daily traffic and you'd like phased touch-ups on — not full repaints. We apply precision spot coating, edge blending, and color matching.",
    hubDesc: "Full repaint zones receive a complete two-coat wall repaint at each service cycle — the destination spaces that define the quality and character of your office.",
    touchUpZones: [
      { key: "hallwaysCorridors", label: "Hallways / Corridors", info: "Primary circulation hallways and corridors throughout your office. Measure length × width per floor. Typical office corridor is 6–10 ft wide. Enter floor sqft of all hallway area per floor.", defaultSqFt: 400 },
      { key: "mainEntryLobby", label: "Main Entry Lobby / Reception", info: "Your primary arrival and reception area. Includes reception desk surround, accent walls, and feature surfaces.", defaultSqFt: 1200 },
      { key: "privateOffices", label: "Private Offices", info: "Individual closed offices. Enter combined floor sqft across all private and executive offices.", defaultSqFt: 600 },
      { key: "stairwells", label: "Stairwells", info: "Interior stairwells — stair walls, landing walls, and undersides. Enter the footprint sqft of the stair shaft per landing. The 3.5× wall multiplier captures the full vertical surface.", defaultSqFt: 80 },
      { key: "elevatorLobbies", label: "Elevator Lobbies", info: "Vestibule areas in front of elevator banks on each floor. Enter sqft of this zone per floor (typical: 8 × 15 ft = 120 sqft).", defaultSqFt: 120 },
    ],
    hubZones: [
      { key: "conferenceRooms", label: "Conference & Meeting Rooms", info: "Enter total floor sqft for all conference and meeting rooms combined. Full repaint including walls and ceiling perimeter.", defaultSqFt: 800 },
      { key: "breakRoom", label: "Break Room / Kitchen", info: "Staff kitchen and break room. High humidity requires scrubbable finishes.", defaultSqFt: 400 },
      { key: "bathrooms", label: "Public & Staff Restrooms", info: "All restroom facilities. Moisture-resistant finishes.", defaultSqFt: 300 },
    ],
  },
  medical: {
    touchUpDesc: "Touch-up zones are patient-facing corridors, hallways, and circulation paths that see daily high-traffic, gurney, and wheelchair movement. We apply precision impact-zone touch-ups using healthcare-grade, low-VOC finishes.",
    hubDesc: "Full repaint zones include waiting areas, exam rooms, and nurse stations — spaces requiring the highest hygiene and finish quality. Every hub receives a full 2-coat repaint with antimicrobial-compatible coatings.",
    touchUpZones: [
      { key: "patientHallways", label: "Patient Care Hallways", info: "Primary corridors in clinical zones — typically 8 ft wide to accommodate gurneys and wheelchairs. Measure length × 8 ft per floor. High-impact lower 4 ft of wall requires most attention.", defaultSqFt: 600 },
      { key: "adminCorridors", label: "Administrative Corridors", info: "Back-of-house office and administrative hallways. Lower traffic than clinical corridors. Enter sqft per floor (length × width).", defaultSqFt: 300 },
      { key: "stairwells", label: "Stairwells", info: "Staff and emergency stairwells. Enter footprint sqft of the stair shaft per landing; the 3.5× multiplier captures wall surface.", defaultSqFt: 80 },
      { key: "elevatorLandings", label: "Elevator Lobbies & Landings", info: "Elevator vestibule areas on each floor — includes call-button walls and door surrounds. Typical size: 10 × 15 ft = 150 sqft per landing.", defaultSqFt: 150 },
    ],
    hubZones: [
      { key: "waitingArea", label: "Patient Waiting Area / Reception", info: "Primary public waiting and reception zone. Full 2-coat repaint including feature walls. Enter combined floor sqft.", defaultSqFt: 800 },
      { key: "examRooms", label: "Exam Rooms", info: "Combined floor sqft across all exam rooms. Each receives a full repaint to maintain clinical standards and hygiene compliance.", defaultSqFt: 900 },
      { key: "nurseStations", label: "Nurse Stations & Care Hubs", info: "Open-plan nurse station areas including surrounding wall surfaces. Enter total floor sqft across all stations.", defaultSqFt: 500 },
      { key: "adminOffices", label: "Administrative Offices", info: "Staff and provider offices, charting rooms, and back-office areas. Enter combined floor sqft.", defaultSqFt: 600 },
      { key: "bathrooms", label: "Patient & Staff Restrooms", info: "All restroom facilities — moisture-resistant finishes required. Enter combined floor sqft.", defaultSqFt: 400 },
    ],
  },
  industrial: {
    touchUpDesc: "Touch-up zones focus on safety-critical surfaces: aisle markings, emergency exit pathways, and dock approach zones. Touch-ups keep high-visibility safety colors fresh and compliant without taking equipment offline.",
    hubDesc: "Full repaint zones are the human-occupied spaces — break rooms, offices, restrooms, and entry vestibules. These spaces set the tone for employee experience and receive a full 2-coat repaint at each service cycle.",
    touchUpZones: [
      { key: "mainAisles", label: "Main Traffic Aisles", info: "Primary forklift and pedestrian aisles. Measure lane width × total length. Aisle markings and lower wall surfaces (wainscot zone) are the focus. Enter sqft per aisle.", defaultSqFt: 800 },
      { key: "loadingDock", label: "Loading Dock Approach Zones", info: "Exterior and interior wall surfaces flanking loading dock bays — including dock bumper surrounds and bay number markings. Enter sqft per bay approach (typical 10 × 20 ft = 200 sqft).", defaultSqFt: 200 },
      { key: "exitPathways", label: "Emergency Exit Pathways", info: "OSHA-required emergency egress corridors and exit door surrounds. Bright safety finishes must remain crisp and visible. Enter floor sqft of the pathway.", defaultSqFt: 120 },
      { key: "safetyCorridors", label: "Safety-Marked Corridors", info: "Striped pedestrian walkways, hazard zones, and equipment staging boundaries. Touch-ups restore faded safety paint to maintain compliance.", defaultSqFt: 300 },
    ],
    hubZones: [
      { key: "breakRooms", label: "Break Rooms & Lunchroom", info: "Employee break rooms, lunchrooms, and lounge areas. High humidity and grease splatter require scrubbable finishes. Enter combined floor sqft.", defaultSqFt: 600 },
      { key: "officeControl", label: "Office / Control Room", info: "On-site office space, control rooms, and supervisor stations. Enter combined floor sqft for all enclosed office areas.", defaultSqFt: 800 },
      { key: "vestibules", label: "Entry Vestibules & Guard Station", info: "Main building entry zones including security desk surround, badge-in areas, and welcome walls. Enter floor sqft of each vestibule.", defaultSqFt: 300 },
      { key: "bathrooms", label: "Employee Restrooms", info: "All restroom facilities — industrial-grade, moisture-resistant finishes. Enter combined floor sqft.", defaultSqFt: 400 },
    ],
  },
  automotive: {
    touchUpDesc: "Touch-up zones are customer-facing circulation paths — showroom walkways, service drive corridors, and parts department aisles. Precise touch-ups maintain showroom-quality finish without disrupting vehicle display.",
    hubDesc: "Full repaint zones include your primary showroom floor, customer lounge, and sales offices — the spaces that make or break the buyer experience. Full repaints at each tier cycle restore the premium look that closes deals.",
    touchUpZones: [
      { key: "showroomWalkways", label: "Showroom Walkways & Circulation", info: "Pedestrian pathways through your vehicle display floor. Typically 6–8 ft wide between vehicle rows. Enter sqft by measuring total walkway length × width.", defaultSqFt: 400 },
      { key: "serviceDrive", label: "Service Drive Corridors", info: "The enclosed drive lane leading vehicles from drop-off to service bays. Includes wall surfaces flanking the drive lane. Enter sqft of the corridor (length × average width).", defaultSqFt: 600 },
      { key: "partsAisles", label: "Parts Department Aisles", info: "Shelving-flanked aisles in the parts counter and storage area. Enter total aisle sqft (length × width for all aisles combined).", defaultSqFt: 300 },
      { key: "backCorridors", label: "Back-of-House Corridors", info: "Staff hallways behind the showroom and service areas. Lower-finish surfaces but still visible to employees. Enter sqft per floor.", defaultSqFt: 200 },
    ],
    hubZones: [
      { key: "showroomFloor", label: "Vehicle Showroom / Display Floor", info: "Main vehicle display area — focal walls, window reveals, and feature accent surfaces. Wall surfaces only (not the floor slab). Enter floor sqft; 3.5× multiplier applies to wall surface.", defaultSqFt: 3000 },
      { key: "customerLounge", label: "Customer Lounge & Waiting Area", info: "The seating area where customers wait during service. Premium finishes, high refresh rate. Enter floor sqft.", defaultSqFt: 600 },
      { key: "serviceAdvisors", label: "Service Advisor Area", info: "The counter and surrounding wall area where advisors interact with customers. Typically 20–30 ft long × 12 ft deep. Enter floor sqft.", defaultSqFt: 350 },
      { key: "salesOffices", label: "Finance & Sales Offices", info: "Closed-door sales and F&I offices. Enter combined floor sqft across all offices.", defaultSqFt: 500 },
      { key: "bathrooms", label: "Customer & Staff Restrooms", info: "All restroom facilities. Enter combined floor sqft.", defaultSqFt: 350 },
    ],
  },
  education: {
    touchUpDesc: "Touch-up zones are high-traffic hallways, stairwells, and locker bays that see daily student movement. Precise touch-ups restore scuffs, marks, and impact damage without classroom disruption.",
    hubDesc: "Full repaint zones are the anchor spaces in a school or campus: administration, gymnasium, cafeteria, and library. Full repaints at the scheduled tier cycle keep these destination spaces fresh and inspiring.",
    touchUpZones: [
      { key: "mainHallways", label: "Main Hallways & Classroom Corridors", info: "Primary hallways running between classrooms. Measure hallway length × width per floor. Standard school hallway is 8–10 ft wide. Lockers are excluded from the wall surface calculation.", defaultSqFt: 1000 },
      { key: "stairwells", label: "Stairwells", info: "Interior stairwells — stair walls, landing walls, and undersides. Enter footprint sqft of the stair shaft per landing. The 3.5× multiplier captures vertical wall surface.", defaultSqFt: 100 },
      { key: "lockerBays", label: "Locker Bay Areas", info: "Wall surfaces flanking locker banks. Enter floor sqft of the locker bay zone (bay length × depth from wall to aisle centerline). Locker units themselves are not painted.", defaultSqFt: 400 },
      { key: "cafCorridors", label: "Cafeteria Access Corridors", info: "Hallways and entry vestibules leading into the cafeteria/dining area. Typically 10–12 ft wide. Enter sqft per floor.", defaultSqFt: 200 },
    ],
    hubZones: [
      { key: "adminOffice", label: "Administration Office & Front Desk", info: "The main administrative suite including reception, principal offices, and support staff areas. Enter combined floor sqft.", defaultSqFt: 800 },
      { key: "gymnasium", label: "Gymnasium / Multi-Purpose Room", info: "Main gym or multipurpose room — wall surfaces only, not the wood floor. Enter floor sqft; 3.5× captures wall surface up to 20 ft height (confirmed at walk-through).", defaultSqFt: 5000 },
      { key: "cafeteria", label: "Cafeteria / Dining Hall", info: "Main dining area including serving line surround walls. High-humidity, high-splatter zone requiring scrubbable finishes. Enter floor sqft.", defaultSqFt: 3000 },
      { key: "bathrooms", label: "Student & Staff Restrooms", info: "All restroom facilities. Enter combined floor sqft.", defaultSqFt: 600 },
      { key: "library", label: "Library / Media Center", info: "Library or media center space. Full repaint keeps the learning environment fresh and inviting. Enter floor sqft.", defaultSqFt: 2000 },
    ],
  },
  retail: {
    touchUpDesc: "Touch-up zones are customer-facing aisles, fitting room corridors, and back-of-house paths that take daily scuffs from carts, racks, and traffic. Precision touch-ups keep the floor looking freshly opened without a store closure.",
    hubDesc: "Full repaint zones are the brand-defining spaces: storefront entry, checkout area, and fitting rooms. Full repaints at each service cycle maintain a consistent, premium brand impression.",
    touchUpZones: [
      { key: "salesFloorAisles", label: "Sales Floor Main Aisles", info: "Primary shopping aisles through your sales floor. Wall surfaces flanking aisles (typically 4–6 ft exposed above fixtures) are the target. Enter floor sqft of the aisle zone.", defaultSqFt: 1500 },
      { key: "bohCorridors", label: "Back-of-House Service Corridors", info: "Staff-only corridors behind the sales floor connecting stockroom, receiving, and break areas. Enter sqft per floor (length × width).", defaultSqFt: 400 },
      { key: "fittingCorridors", label: "Fitting Room Corridors", info: "Hallway leading to and from the fitting room area, not the interior of the rooms. Enter sqft of the approach corridor.", defaultSqFt: 150 },
      { key: "loadingAreas", label: "Loading / Receiving Areas", info: "Interior wall surfaces of the receiving dock and stockroom entry zone. High-impact areas from pallet jacks and hand trucks.", defaultSqFt: 300 },
    ],
    hubZones: [
      { key: "storefrontEntry", label: "Storefront / Entry Zone", info: "First impression zone — entrance vestibule walls, feature walls, and signage surrounds. Enter floor sqft of the entry/vestibule area.", defaultSqFt: 400 },
      { key: "checkoutArea", label: "Checkout & Service Counter Area", info: "Checkout counter surround and adjacent walls. Enter floor sqft.", defaultSqFt: 500 },
      { key: "fittingRooms", label: "Fitting Rooms", info: "Interior walls of all fitting room stalls combined. Enter combined floor sqft (each stall ~25–40 sqft). High wear from hanger impacts and clothing contact.", defaultSqFt: 300 },
      { key: "breakOffices", label: "Break Room & Manager's Office", info: "Staff break room and management offices. Enter combined floor sqft.", defaultSqFt: 350 },
      { key: "bathrooms", label: "Customer Restrooms", info: "Customer-facing restrooms. Enter combined floor sqft.", defaultSqFt: 200 },
    ],
  },
  "gyms-fitness": {
    touchUpDesc: "Touch-up zones are high-traffic corridors, locker room hallways, and check-in approach areas that take daily scuffs from equipment, bags, and foot traffic. Precision touch-ups keep these zones sharp between full repaint cycles.",
    hubDesc: "Full repaint zones are the training and amenity areas where members spend their time — cardio floor, weights area, class rooms, locker rooms, and the front desk. Full repaints restore the high-energy aesthetic that retains members.",
    touchUpZones: [
      { key: "mainCorridors", label: "Main Corridors & Hallways", info: "Primary circulation hallways connecting zones within the facility. Typically 8–10 ft wide. Enter sqft per floor (length × width). Wall scuffs from equipment and bags are most common here.", defaultSqFt: 400 },
      { key: "lockerHallways", label: "Locker Room Hallways", info: "Entry/exit hallways into men's and women's locker rooms. High humidity at the transition — touch-ups focus on the lower 4 ft of wall (impact zone) and door surrounds.", defaultSqFt: 120 },
      { key: "entryCheckIn", label: "Entry & Check-in Approach Zone", info: "Pathway from the main entrance to the front desk check-in area. First impression zone — should always look fresh. Enter floor sqft of this approach area.", defaultSqFt: 200 },
    ],
    hubZones: [
      { key: "cardioArea", label: "Cardio Area", info: "Primary cardio machine floor — treadmills, bikes, ellipticals, and rowers. Wall surfaces including accent walls and mirror borders are repainted. Enter floor sqft.", defaultSqFt: 2500 },
      { key: "freeWeights", label: "Free Weights Area", info: "Dumbbell and barbell free weight zone. High wall impact from dropped equipment and mirrors. Lower wall (0–4 ft) receives impact-resistant finish. Enter floor sqft.", defaultSqFt: 2000 },
      { key: "machinezones", label: "Strength Machine Zone", info: "Cable machines, chest press, leg press, and other resistance machine areas. Enter floor sqft.", defaultSqFt: 1500 },
      { key: "classRooms", label: "Class / Training Rooms", info: "Group fitness, yoga, spin, or personal training rooms. Enter combined floor sqft. These rooms often feature accent or brand-colored walls.", defaultSqFt: 1200 },
      { key: "mensLocker", label: "Men's Locker Room", info: "Full locker room including shower area walls, vanity zone, and locker bay surround. High humidity — moisture-resistant finish required. Enter floor sqft.", defaultSqFt: 900 },
      { key: "womensLocker", label: "Women's Locker Room", info: "Full locker room including shower area walls, vanity zone, and locker bay surround. High humidity — moisture-resistant finish required. Enter floor sqft.", defaultSqFt: 900 },
      { key: "frontDesk", label: "Front Desk / Reception Area", info: "Main reception counter surround, feature wall behind desk, and adjacent check-in zone walls. Enter floor sqft of this area.", defaultSqFt: 400 },
      { key: "offices", label: "Offices & Staff Areas", info: "Manager offices, trainer offices, and staff-only back areas. Enter combined floor sqft.", defaultSqFt: 300 },
    ],
  },
  commercial: {
    touchUpDesc: "Touch-up zones are the shared circulation paths in your facility — hallways, corridors, and transition areas. We apply precision spot coating, edge blending, and color matching at the scheduled frequency of your chosen tier.",
    hubDesc: "Full repaint zones are the primary destination spaces in your facility that receive a complete, two-coat full repaint at every service cycle. These are the anchor spaces that define the aesthetic quality of your property.",
    touchUpZones: [
      { key: "officeHallways", label: "Office Hallways", info: "General-purpose hallways running through office or work areas. Enter sqft per floor (hallway length × width). Typical office hallway is 6–8 ft wide.", defaultSqFt: 400 },
      { key: "serviceCorridors", label: "Main Service Corridors", info: "Wider back-of-house corridors used for deliveries, equipment movement, and staff circulation. Enter sqft per floor.", defaultSqFt: 300 },
      { key: "elevatorLandings", label: "Elevator Landings & Lobbies", info: "Vestibule areas in front of elevator banks. Enter the floor sqft of this zone per floor (typical: 10 × 15 ft = 150 sqft per landing).", defaultSqFt: 150 },
      { key: "stairwells", label: "Stairwells", info: "Interior stairwells — stair walls, landing walls, and undersides. Enter footprint sqft of the stair shaft. The 3.5× multiplier captures vertical wall surface.", defaultSqFt: 80 },
    ],
    hubZones: [
      { key: "lobbies", label: "Main Lobbies", info: "Your primary entry lobby or lobbies. All walls, feature walls, and reception surrounds included. Enter combined floor sqft.", defaultSqFt: 1200 },
      { key: "breakRooms", label: "Break Rooms", info: "Employee break rooms and lunchrooms. High humidity — scrubbable finishes required. Enter combined floor sqft.", defaultSqFt: 400 },
      { key: "bathrooms", label: "Public Bathrooms", info: "All restroom facilities — moisture-resistant finishes. Enter combined floor sqft.", defaultSqFt: 300 },
      { key: "vestibules", label: "Entry Vestibules", info: "Enclosed entry vestibules between exterior and interior doors. Enter floor sqft per vestibule.", defaultSqFt: 150 },
    ],
  },
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface UnitRow { count: number; turns: number; sqft: number }
interface ResZoneRow { qty: number; floors: number; sqft: number }
interface SingularHubRow { qty: number; sqft: number }
interface CommZoneRow { qty: number; floors: number; sqft: number }
interface CommHubRow { qty: number; floors: number; sqft: number }

const defaultUnitMix = (): Record<string, UnitRow> => ({
  studio: { count: 0, turns: 0, sqft: 600 },
  oneBD: { count: 0, turns: 0, sqft: 900 },
  twoBD: { count: 0, turns: 0, sqft: 1150 },
  threeBD: { count: 0, turns: 0, sqft: 1500 },
  fourBD: { count: 0, turns: 0, sqft: 1800 },
});
const defaultResDistZones = (): Record<string, ResZoneRow> => ({
  corridors: { qty: 0, floors: 1, sqft: 0 },
  stairwells: { qty: 0, floors: 1, sqft: 0 },
  elevatorLandings: { qty: 0, floors: 1, sqft: 0 },
  wasteRooms: { qty: 0, floors: 1, sqft: 0 },
});
const defaultSingularHubs = (): Record<string, SingularHubRow> => ({
  mainLobby: { qty: 0, sqft: 0 }, mailroom: { qty: 0, sqft: 0 }, coworking: { qty: 0, sqft: 0 },
  gym: { qty: 0, sqft: 0 }, bathrooms: { qty: 0, sqft: 0 }, leasingOffice: { qty: 0, sqft: 0 }, packageRoom: { qty: 0, sqft: 0 },
});
const defaultResExtZones = (): Record<string, boolean> => ({
  mainFacade: false, floorSurface: false, poolDeck: false,
  doorway: false, garbageArea: false, garageEntrance: false, buildingCladding: false,
});
const defaultCommExtZones = (): Record<string, boolean> => ({
  commFacade: false, commEntranceFloor: false, commDumpsterPad: false,
  commEntries: false, commGarage: false, commCladding: false,
});
function allFacilityZones(cfg: FacilityConfig): ZoneConfig[] {
  const seen = new Set<string>();
  return [...cfg.touchUpZones, ...cfg.hubZones].filter(z => {
    if (seen.has(z.key)) return false;
    seen.add(z.key);
    return true;
  });
}
function initCommDist(cfg: FacilityConfig): Record<string, CommZoneRow> {
  return Object.fromEntries(allFacilityZones(cfg).map(z => [z.key, { qty: 0, floors: 1, sqft: 0 }]));
}
function initCommHubs(cfg: FacilityConfig): Record<string, CommHubRow> {
  return Object.fromEntries(allFacilityZones(cfg).map(z => [z.key, { qty: 0, floors: 1, sqft: 0 }]));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function numInput(val: number, onChange: (v: number) => void, placeholder = "0") {
  return (
    <input
      type="number" inputMode="numeric" min={0}
      value={val === 0 ? "" : val}
      placeholder={placeholder}
      onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
      className="w-full h-10 bg-background border border-border text-center text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
    />
  );
}

// ─── InfoTip ──────────────────────────────────────────────────────────────────
function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex flex-shrink-0 align-middle ml-1.5">
      <button type="button" onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="w-4 h-4 rounded-full border border-muted-foreground/60 text-muted-foreground/70 text-[9px] flex items-center justify-center hover:border-primary hover:text-primary transition-colors leading-none" aria-label="More info">
        i
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 leading-relaxed shadow-xl">
            {text}
            <button onClick={() => setOpen(false)} className="block mt-2 text-primary hover:underline text-[10px]">Dismiss</button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SubscriptionLab() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const typeParam = params.get("type") ?? sessionStorage.getItem("facilityType") ?? "commercial";
  const facilityParam = params.get("facility") ?? typeParam;
  const isMultiFamily = typeParam === "multi-family";
  const facilityLabel = FACILITY_LABELS[facilityParam] ?? "Commercial";
  const facilityConfig: FacilityConfig = FACILITY_CONFIGS[facilityParam] ?? FACILITY_CONFIGS["commercial"];

  const [extInfoZone, setExtInfoZone] = useState<string | null>(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [paintServicesOpen, setPaintServicesOpen] = useState(false);

  const [unitMix, setUnitMix] = useState(defaultUnitMix);
  const [resDistZones, setResDistZones] = useState(defaultResDistZones);
  const [singularHubs, setSingularHubs] = useState(defaultSingularHubs);
  const [resExtZones, setResExtZones] = useState(defaultResExtZones);
  const [commDist, setCommDist] = useState<Record<string, CommZoneRow>>(() => initCommDist(facilityConfig));
  const [commHubs, setCommHubs] = useState<Record<string, CommHubRow>>(() => initCommHubs(facilityConfig));
  const [commExtZones, setCommExtZones] = useState(defaultCommExtZones);
  const [paintInterest, setPaintInterest] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COMM_PAINT_SERVICES.map(s => [s.key, false]))
  );
  const [annualUpfront, setAnnualUpfront] = useState({ t1: false, t2: false, t3: false });
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", propertyName: "", address: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const saveDraft = () => {
    const tierIdx = selectedTier ? activeTiers.findIndex(t => t.id === selectedTier) : -1;
    const tierLabel = tierIdx >= 0 ? activeTiers[tierIdx].label : "";
    const monthlyPrice = tierIdx >= 0 ? (displayPrices[tierIdx] ?? 0) : 0;
    const draft = { id: `${Date.now()}`, savedAt: new Date().toISOString(), facilityLabel, tierLabel, monthlyPrice, propertyName: formData.propertyName };
    const existing = JSON.parse(localStorage.getItem("paintlab_drafts") ?? "[]");
    existing.unshift(draft);
    localStorage.setItem("paintlab_drafts", JSON.stringify(existing.slice(0, 10)));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  // ─── Math Engine ─────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    if (isMultiFamily) {
      const unitTurnsWallSqFt = Object.entries(unitMix).reduce((acc, [type, row]) => {
        const eff = row.sqft > 0 ? row.sqft : (UNIT_SQFT[type] ?? 0);
        return acc + row.turns * eff * (UNIT_WALL_RATIO[type] ?? 3);
      }, 0);
      const hubAreaSqFt = Object.entries(singularHubs).reduce((acc, [hub, row]) => {
        const eff = row.sqft > 0 ? row.sqft : (RES_HUB_SQFT[hub] ?? 0);
        return acc + row.qty * eff;
      }, 0);
      const touchUpSqFt = Object.entries(resDistZones).reduce((acc, [zone, row]) => {
        const eff = row.sqft > 0 ? row.sqft : (RES_DIST_SQFT[zone] ?? 0);
        return acc + row.qty * row.floors * eff;
      }, 0);
      const extCostPerVisit = Object.entries(resExtZones)
        .filter(([zone, on]) => on && !SCOPED_EXT_ZONES.has(zone))
        .reduce((acc, [zone]) => acc + (EXT_ZONE_COST[zone] ?? 0), 0);
      const t1 = Math.round(unitTurnsWallSqFt * 0.18);
      const t2 = Math.round(unitTurnsWallSqFt * 0.21 + (hubAreaSqFt * 0.10 + touchUpSqFt * 0.05) / 12 + extCostPerVisit / 12);
      const t3 = Math.round(unitTurnsWallSqFt * 0.24 + (hubAreaSqFt * 0.13 + touchUpSqFt * 0.07) / 3 + (extCostPerVisit * 4) / 12);
      const t4 = Math.round(unitTurnsWallSqFt * 0.30 + hubAreaSqFt * 0.18 + touchUpSqFt * 0.10 + extCostPerVisit);
      return { tiers: [t1, t2, t3, t4], tiersRaw: [t1, t2, t3, t4], onboarding: Math.round(t2 * 1.5) };
    } else {
      const distFloor = Object.values(commDist).reduce((a, r) => a + r.qty * r.floors * r.sqft, 0);
      const touchUpWall = distFloor * COMM_WALL_MULTIPLIER;
      const hubFloor = Object.values(commHubs).reduce((a, r) => a + r.qty * r.floors * r.sqft, 0);
      const hubWall = hubFloor * COMM_WALL_MULTIPLIER;
      const extCost = Object.entries(commExtZones)
        .filter(([zone, on]) => on && !SCOPED_EXT_ZONES.has(zone))
        .reduce((acc, [zone]) => acc + (COMM_EXT_COST[zone] ?? 0), 0);
      // 3 tiers: Annual (1×/yr), Bi-Annual (2×/yr), Quarterly (4×/yr)
      const r1 = Math.round((hubWall * 0.38 + touchUpWall * 0.12) / 12 + extCost / 12);
      const r2 = Math.round((hubWall * 0.36 * 2 + touchUpWall * 0.11 * 2) / 12 + extCost * 2 / 12);
      const r3 = Math.round((hubWall * 0.35 * 4 + touchUpWall * 0.10 * 4) / 12 + extCost * 4 / 12);
      // T2 has 2% always applied, T3 has 3% always applied
      const t1 = r1;
      const t2 = Math.round(r2 * 0.98);
      const t3 = Math.round(r3 * 0.97);
      return { tiers: [t1, t2, t3], tiersRaw: [r1, r2, r3], onboarding: Math.round(t2 * 1.5) };
    }
  }, [unitMix, resDistZones, singularHubs, resExtZones, commDist, commHubs, commExtZones, isMultiFamily]);

  // Discounted display prices
  const displayPrices = useMemo(() => {
    if (isMultiFamily) return calc.tiers;
    const [r1, r2, r3] = calc.tiersRaw;
    return [
      annualUpfront.t1 ? Math.round(r1 * 0.98) : r1,
      annualUpfront.t2 ? Math.round(r2 * 0.96) : Math.round(r2 * 0.98),
      annualUpfront.t3 ? Math.round(r3 * 0.95) : Math.round(r3 * 0.97),
    ];
  }, [calc, annualUpfront, isMultiFamily]);

  // Annual savings amounts
  const annualSavings = useMemo(() => {
    if (isMultiFamily) return [0, 0, 0, 0];
    const [r1, r2, r3] = calc.tiersRaw;
    return [
      annualUpfront.t1 ? Math.round(r1 * 0.02 * 12) : 0,
      annualUpfront.t2 ? Math.round(r2 * 0.04 * 12) : Math.round(r2 * 0.02 * 12),
      annualUpfront.t3 ? Math.round(r3 * 0.05 * 12) : Math.round(r3 * 0.03 * 12),
    ];
  }, [calc, annualUpfront, isMultiFamily]);

  // ─── Tiers ─────────────────────────────────────────────────────────────────
  const resTiers = [
    { id: "essential", label: "Tier 1 — Essential", sub: "100% Unit Turns Only",
      features: ["Full interior repaint for every unit turn", "Consistent color system applied", "2-year workmanship guarantee"] },
    { id: "asset-shield-annual", label: "Tier 2 — Asset Shield", sub: "Annual Cycle",
      features: ["Everything in Tier 1 (Unit Turns)", "Annual full repaint of all hubs", "Annual precision touch-ups of corridors", "Annual exterior power/soft wash"] },
    { id: "asset-shield-quarterly", label: "Tier 3 — Asset Shield Plus", sub: "Quarterly Cycle", popular: true,
      features: ["Everything in Tier 2 + 4× frequency", "Quarterly full repaint of all hubs", "Quarterly precision touch-ups of corridors", "Quarterly exterior power/soft wash"] },
    { id: "signature-monthly", label: "Tier 4 — Signature", sub: "Monthly Full Cycle",
      features: ["Everything in Tier 3", "Monthly proactive patrol walkthroughs", "Priority 24-hr dispatch", "Monthly condition reporting dashboard"] },
  ];

  const commTiers = [
    { id: "annual-shield", label: "Annual Shield", sub: "Tier 1 · 1 Service Visit / Year",
      features: ["Annual repaint of selected zones", "Annual precision touch-ups of selected zones", "Selected annual exterior paint & cleaning services", "Pay monthly or save 2% with annual upfront"] },
    { id: "biannual-shield", label: "Bi-Annual Shield", sub: "Tier 2 · 2 Service Visits / Year", popular: true,
      features: ["Bi-annual repaint of selected zones", "Spring + fall touch-up zone cycle", "Bi-annual exterior service", "Priority scheduling"] },
    { id: "quarterly-guard", label: "Quarterly Guard", sub: "Tier 3 · 4 Service Visits / Year",
      features: ["Quarterly repaint of selected zones", "Quarterly precision touch-up painting", "Quarterly exterior service", "Priority scheduling"] },
  ];

  const activeTiers = isMultiFamily ? resTiers : commTiers;

  // ─── Breakdown ─────────────────────────────────────────────────────────────
  const buildBreakdown = () => {
    const tierIdx = selectedTier ? activeTiers.findIndex(t => t.id === selectedTier) : -1;
    const lines = [
      `PAINTLAB SUBSCRIPTION CONFIGURATION`,
      `Facility: ${facilityLabel}`,
      `Tier: ${selectedTier ?? "Not selected"}`,
      tierIdx >= 0 ? `Estimated Monthly: ${fmt(displayPrices[tierIdx] ?? 0)}` : "",
      tierIdx >= 0 && annualSavings[tierIdx] > 0 ? `Annual Savings: ${fmt(annualSavings[tierIdx])}` : "",
      `\nONBOARDING FEE: ${fmt(calc.onboarding)}`,
      `\n────────────────────────`,
    ].filter(Boolean);
    if (isMultiFamily) {
      lines.push(`\nUNIT TURNS:`);
      Object.entries(unitMix).forEach(([type, row]) => {
        if (row.turns > 0) { const eff = row.sqft > 0 ? row.sqft : UNIT_SQFT[type]; lines.push(`  ${UNIT_LABELS[type]}: ${row.turns}/mo × ${eff} sqft`); }
      });
    } else {
      const allZones = allFacilityZones(facilityConfig);
      lines.push(`\nTOUCH-UP ZONES:`);
      allZones.forEach(z => {
        const r = commDist[z.key]; if (r && r.qty > 0) lines.push(`  ${z.label}: ${r.qty} × ${r.floors}fl × ${r.sqft} sqft = ${Math.round(r.qty * r.floors * r.sqft * 3.5).toLocaleString()} wall sqft`);
      });
      lines.push(`\nFULL REPAINT ZONES:`);
      allZones.forEach(z => {
        const r = commHubs[z.key]; if (r && r.qty > 0) lines.push(`  ${z.label}: ${r.qty} × ${r.floors}fl × ${r.sqft} sqft = ${Math.round(r.qty * r.floors * r.sqft * 3.5).toLocaleString()} wall sqft`);
      });
      const interested = COMM_PAINT_SERVICES.filter(s => paintInterest[s.key]).map(s => s.label);
      if (interested.length) lines.push(`\nPAINT/COATING INTEREST: ${interested.join(", ")}`);
    }
    return lines.join("\n");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(`Hi PaintLab Team,\n\nI just configured a subscription plan.\n\nNAME: ${formData.name}\nPROPERTY: ${formData.propertyName}\nADDRESS: ${formData.address}\nPHONE: ${formData.phone}\n\n` + buildBreakdown());
    window.open(`mailto:hello@paintlabpro.com?subject=${encodeURIComponent(`[PaintLab Subscription] ${formData.propertyName} — ${selectedTier ?? "Inquiry"}`)}&body=${body}`, "_blank");
    setSubmitted(true);
  };
  const smsBody = encodeURIComponent(`I just ran the PaintLab calculator for ${formData.propertyName || "[Property Name]"}. I want to discuss the ${selectedTier ?? "[Selected Tier]"} package.`);

  // ─── UI Helpers ───────────────────────────────────────────────────────────
  const sectionCard = (title: React.ReactNode, step: string, content: React.ReactNode, headerExtra?: React.ReactNode) => (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border bg-secondary/20">
        <span className="text-primary font-mono text-xs tracking-widest flex-shrink-0">{step}</span>
        <h3 className="font-bold text-sm uppercase tracking-wider flex-grow leading-tight">{title}</h3>
        {headerExtra}
      </div>
      <div className="p-4 md:p-6">{content}</div>
    </div>
  );

  const colHdr = (label: string, hint?: string) => (
    <div className="text-center">
      <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-foreground leading-tight">{label}</p>
      {hint && <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );

  const extToggle = (
    zones: Record<string, boolean>,
    setter: (fn: (p: Record<string, boolean>) => Record<string, boolean>) => void,
    labels: Record<string, string>, costs: Record<string, number>, infoMap?: Record<string, string>
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Object.entries(zones).map(([zone, on]) => (
        <div key={zone} className="relative">
          <button type="button" onClick={() => setter(p => ({ ...p, [zone]: !p[zone] }))}
            className={`w-full flex items-center gap-3 p-3 border text-left transition-colors ${on ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}>
            <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${on ? "border-primary bg-primary" : "border-muted-foreground"}`}>
              {on && <span className="text-background text-xs font-bold">✓</span>}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium">{labels[zone]}</p>
              <p className="text-xs text-muted-foreground">{SCOPED_EXT_ZONES.has(zone) ? "Scoped as needed" : `$${costs[zone].toLocaleString()}/visit`}</p>
            </div>
            {infoMap?.[zone] && (
              <span role="button" onClick={e => { e.stopPropagation(); setExtInfoZone(extInfoZone === zone ? null : zone); }} className="ml-auto flex-shrink-0 p-1 text-muted-foreground hover:text-primary transition-colors">
                <Info className="w-4 h-4" />
              </span>
            )}
          </button>
          {infoMap?.[zone] && extInfoZone === zone && (
            <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-card border border-primary/40 p-3 shadow-lg text-xs text-muted-foreground leading-relaxed">
              {infoMap[zone]}
              <button onClick={() => setExtInfoZone(null)} className="block mt-2 text-primary hover:underline text-[10px]">Dismiss</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const commZoneTableDesktop = (
    zones: ZoneConfig[],
    stateMap: Record<string, CommZoneRow>,
    setFn: (fn: (p: Record<string, CommZoneRow>) => Record<string, CommZoneRow>) => void,
    keyFn: (zKey: string) => string = k => k,
    accent = false
  ) => (
    <div className="hidden sm:block">
      <div className={`grid gap-2 mb-2 px-1 ${accent ? "grid-cols-[2.5fr_0.7fr_0.7fr_1fr_1fr]" : "grid-cols-[2.5fr_0.7fr_0.7fr_1fr_1fr]"}`}>
        <div />
        {colHdr("QTY", "per floor")}
        {colHdr("Floors")}
        {colHdr("SQFT EACH", "avg floor sqft")}
        {colHdr("Paintable Wall Surface", "×3.5 auto")}
      </div>
      {zones.map(z => {
        const key = keyFn(z.key);
        const row = stateMap[key] ?? { qty: 0, floors: 1, sqft: 0 };
        const wall = Math.round(row.qty * row.floors * row.sqft * COMM_WALL_MULTIPLIER);
        return (
          <div key={key} className="grid grid-cols-[2.5fr_0.7fr_0.7fr_1fr_1fr] gap-2 items-center mb-2">
            <div className="flex items-center pl-1"><p className="text-sm font-medium text-foreground leading-tight">{z.label}</p><InfoTip text={z.info} /></div>
            {numInput(row.qty, v => setFn(p => ({ ...p, [key]: { ...p[key], qty: v } })))}
            {numInput(row.floors, v => setFn(p => ({ ...p, [key]: { ...p[key], floors: v } })))}
            {numInput(row.sqft, v => setFn(p => ({ ...p, [key]: { ...p[key], sqft: v } })), z.defaultSqFt?.toString() ?? "enter or use default")}
            <div className={`h-10 border flex items-center justify-center ${accent ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border"}`}>
              <span className={`text-xs font-mono ${accent ? "text-primary" : "text-muted-foreground"}`}>{wall > 0 ? wall.toLocaleString() : "—"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const commZoneTableMobile = (
    zones: ZoneConfig[],
    stateMap: Record<string, CommZoneRow>,
    setFn: (fn: (p: Record<string, CommZoneRow>) => Record<string, CommZoneRow>) => void,
    keyFn: (zKey: string) => string = k => k,
    accent = false
  ) => (
    <div className="sm:hidden space-y-3">
      {zones.map(z => {
        const key = keyFn(z.key);
        const row = stateMap[key] ?? { qty: 0, floors: 1, sqft: 0 };
        const wall = Math.round(row.qty * row.floors * row.sqft * COMM_WALL_MULTIPLIER);
        return (
          <div key={key} className="border border-border bg-secondary/10 p-3">
            <div className="flex items-center gap-1 mb-3"><p className="text-sm font-bold">{z.label}</p><InfoTip text={z.info} /></div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div><p className="text-[10px] text-muted-foreground mb-1">QTY/floor</p>{numInput(row.qty, v => setFn(p => ({ ...p, [key]: { ...p[key], qty: v } })))}</div>
              <div><p className="text-[10px] text-muted-foreground mb-1">Floors</p>{numInput(row.floors, v => setFn(p => ({ ...p, [key]: { ...p[key], floors: v } })))}</div>
              <div><p className="text-[10px] text-muted-foreground mb-1">SQFT each</p>{numInput(row.sqft, v => setFn(p => ({ ...p, [key]: { ...p[key], sqft: v } })), z.defaultSqFt?.toString() ?? "sqft")}</div>
            </div>
            {wall > 0 && <div className={`h-8 border flex items-center justify-center ${accent ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border"}`}><span className={`text-xs font-mono ${accent ? "text-primary" : "text-muted-foreground"}`}>Wall surface: {wall.toLocaleString()} sqft</span></div>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* HEADER */}
      <section className="pt-28 sm:pt-32 pb-10 border-b border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp} className="mb-6">
              <Link href="/subscription-portal">
                <button className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Facility Selection
                </button>
              </Link>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-3xl md:text-5xl font-bold tracking-tighter mb-2">Configure Your Plan.</motion.h1>
            <motion.p variants={fadeInUp} className="text-muted-foreground">Facility type: <strong className="text-foreground">{facilityLabel}</strong></motion.p>
            {!isMultiFamily && (
              <motion.div variants={fadeInUp} className="mt-4">
                <button type="button" onClick={() => setPricingOpen(o => !o)}
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <span className="w-4 h-4 rounded-full border border-primary text-primary text-[9px] flex items-center justify-center flex-shrink-0">i</span>
                  <span>Pricing assumptions</span>
                  {pricingOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {pricingOpen && (
                  <div className="mt-2 max-w-2xl text-xs text-muted-foreground leading-relaxed border border-border/40 bg-secondary/10 p-4">
                    All inputs assume 10-ft ceiling height. A 3.5× floor-to-wall-surface multiplier is applied automatically to convert floor sqft to paintable wall surface. <strong className="text-foreground">Full repaint zones</strong> are priced at a higher rate than <strong className="text-foreground">touch-up zones</strong> (precision spot coating). Actual ceiling heights and square footages are confirmed during your complimentary walk-through — no commitment required before that conversation.
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="py-10 sm:py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-5xl mx-auto space-y-5">

            {isMultiFamily ? (
              <>
                {/* ── MF STEP 1: Unit Mix ── */}
                {sectionCard("Unit Mix", "STEP 1", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Enter the count of each unit type and the average number of turns per month. Override sqft if you know your actual unit sizes — otherwise our defaults are used.</p>
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr_1fr] gap-2 mb-2 px-1">
                        <div />{colHdr("Units")}{colHdr("Turns/Mo")}{colHdr("SQFT EACH", "enter or use default")}{colHdr("Paintable Wall Surface", "auto-calculated")}
                      </div>
                      {Object.entries(unitMix).map(([type, row]) => {
                        const eff = row.sqft > 0 ? row.sqft : UNIT_SQFT[type];
                        const wall = Math.round(eff * UNIT_WALL_RATIO[type]);
                        return (
                          <div key={type} className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr_1fr] gap-2 items-center mb-2">
                            <p className="text-sm font-medium text-foreground pl-1">{UNIT_LABELS[type]}</p>
                            {numInput(row.count, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], count: v } })))}
                            {numInput(row.turns, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], turns: v } })))}
                            {numInput(row.sqft, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], sqft: v } })), UNIT_SQFT[type].toString())}
                            <div className="h-10 bg-secondary/30 border border-border flex items-center justify-center">
                              <span className="text-xs font-mono text-muted-foreground">{row.turns > 0 ? `${wall.toLocaleString()} sqft` : "—"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="sm:hidden space-y-3">
                      {Object.entries(unitMix).map(([type, row]) => {
                        const eff = row.sqft > 0 ? row.sqft : UNIT_SQFT[type];
                        const wall = Math.round(eff * UNIT_WALL_RATIO[type]);
                        return (
                          <div key={type} className="border border-border bg-secondary/10 p-3">
                            <p className="text-sm font-bold mb-3">{UNIT_LABELS[type]}</p>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <div><p className="text-[10px] text-muted-foreground mb-1">Units</p>{numInput(row.count, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], count: v } })))}</div>
                              <div><p className="text-[10px] text-muted-foreground mb-1">Turns/Mo</p>{numInput(row.turns, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], turns: v } })))}</div>
                              <div><p className="text-[10px] text-muted-foreground mb-1">SQFT Each</p>{numInput(row.sqft, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], sqft: v } })), UNIT_SQFT[type].toString())}</div>
                            </div>
                            {row.turns > 0 && <div className="h-8 bg-secondary/30 border border-border flex items-center justify-center"><span className="text-xs font-mono text-muted-foreground">{wall.toLocaleString()} wall sqft</span></div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* ── MF STEP 2: Touch-up Zones ── */}
                {sectionCard(<>Select <span className="text-primary">TOUCH-UP ZONES</span></>, "STEP 2", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Shared circulation areas — corridors, stairwells, elevator landings. We apply precision spot coating, scuff repair, and color matching. These zones are <strong className="text-foreground">not fully repainted</strong> — touch-ups restore appearance only.</p>
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr] gap-3 mb-2 px-1">
                        <div />{colHdr("QTY", "per floor")}{colHdr("Floors")}{colHdr("SQFT EACH", "enter or use default")}
                      </div>
                      {Object.entries(resDistZones).map(([zone, row]) => (
                        <div key={zone} className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr] gap-3 items-center mb-2">
                          <p className="text-sm font-medium text-foreground pl-1">{RES_DIST_LABELS[zone]}</p>
                          {numInput(row.qty, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], qty: v } })))}
                          {numInput(row.floors, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], floors: v } })))}
                          {numInput(row.sqft, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], sqft: v } })), RES_DIST_SQFT[zone].toString())}
                        </div>
                      ))}
                    </div>
                    <div className="sm:hidden space-y-3">
                      {Object.entries(resDistZones).map(([zone, row]) => (
                        <div key={zone} className="border border-border bg-secondary/10 p-3">
                          <p className="text-sm font-bold mb-3">{RES_DIST_LABELS[zone]}</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div><p className="text-[10px] text-muted-foreground mb-1">QTY/floor</p>{numInput(row.qty, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], qty: v } })))}</div>
                            <div><p className="text-[10px] text-muted-foreground mb-1">Floors</p>{numInput(row.floors, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], floors: v } })))}</div>
                            <div><p className="text-[10px] text-muted-foreground mb-1">SQFT each</p>{numInput(row.sqft, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], sqft: v } })), RES_DIST_SQFT[zone].toString())}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* ── MF STEP 3: Full Repaint Zones ── */}
                {sectionCard(<>Select <span className="text-primary">FULL REPAINT ZONES</span></>, "STEP 3", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Enter the quantity of each hub type. Hubs receive a complete, two-coat repaint at each service cycle.</p>
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2fr_0.8fr_1fr] gap-3 mb-2 px-1">
                        <div />{colHdr("Qty")}{colHdr("SQFT EACH", "enter or use default")}
                      </div>
                      {Object.entries(singularHubs).map(([hub, row]) => (
                        <div key={hub} className="grid grid-cols-[2fr_0.8fr_1fr] gap-3 items-center mb-2">
                          <p className="text-sm font-medium text-foreground pl-1">{RES_HUB_LABELS[hub]}</p>
                          {numInput(row.qty, v => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], qty: v } })))}
                          {numInput(row.sqft, v => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], sqft: v } })), RES_HUB_SQFT[hub].toString())}
                        </div>
                      ))}
                    </div>
                    <div className="sm:hidden space-y-3">
                      {Object.entries(singularHubs).map(([hub, row]) => (
                        <div key={hub} className="border border-border bg-secondary/10 p-3">
                          <p className="text-sm font-bold mb-3">{RES_HUB_LABELS[hub]}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div><p className="text-[10px] text-muted-foreground mb-1">Qty</p>{numInput(row.qty, v => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], qty: v } })))}</div>
                            <div><p className="text-[10px] text-muted-foreground mb-1">SQFT each</p>{numInput(row.sqft, v => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], sqft: v } })), RES_HUB_SQFT[hub].toString())}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* ── MF STEP 4: Exterior ── */}
                {sectionCard("Exterior Paint & Cleaning Services", "STEP 4", (
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Pressure / Soft Wash Services</p>
                    <p className="text-xs text-muted-foreground mb-4">Select exterior wash zones to include. Wash frequency is determined by your selected tier. Costs shown are placeholders and will be more accurately scoped and confirmed after the walkthrough.</p>
                    {extToggle(resExtZones, setResExtZones, EXT_ZONE_LABELS, EXT_ZONE_COST, EXT_ZONE_INFO)}
                    <div className="mt-5 border border-border/50 bg-secondary/10">
                      <button type="button" onClick={() => setPaintServicesOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/20 transition-colors">
                        <Info className="w-4 h-4 text-primary flex-shrink-0" />
                        <p className="text-xs font-bold text-foreground flex-grow">Paint / Coating Services (scoped separately)</p>
                        {paintServicesOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      {paintServicesOpen && (
                        <div className="px-4 pb-4 space-y-3">
                          {COMM_PAINT_SERVICES.map(svc => (
                            <label key={svc.key} className="flex items-start gap-3 cursor-pointer p-3 border border-border/40 bg-background hover:border-primary/30 transition-colors">
                              <input type="checkbox" checked={paintInterest[svc.key] ?? false} onChange={e => setPaintInterest(p => ({ ...p, [svc.key]: e.target.checked }))}
                                className="mt-0.5 w-4 h-4 accent-[#FF6600] flex-shrink-0" />
                              <div className="flex-grow">
                                <div className="flex items-center gap-1"><p className="text-xs font-semibold text-foreground">{svc.label}</p><InfoTip text={svc.info} /></div>
                                <p className="text-[10px] text-muted-foreground mt-1">{svc.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-4 border border-border/50 bg-secondary/10 flex gap-3">
                      <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">Pressure/soft wash services for Roof · Pedestrian walkways & sidewalks · Parking garages & lots · Windows — assessed during your complimentary walk-through and quoted separately.</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {/* ── COMM STEP 1: Touch-up Zones ── */}
                {sectionCard(<>Select <span className="text-primary">TOUCH-UP ZONES</span></>, "STEP 1", (
                  <div>
                    <div className="mb-4 p-3 border border-border/40 bg-secondary/10 flex gap-2">
                      <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{facilityConfig.touchUpDesc}</p>
                    </div>
                    {commZoneTableDesktop(allFacilityZones(facilityConfig), commDist, setCommDist)}
                    {commZoneTableMobile(allFacilityZones(facilityConfig), commDist, setCommDist)}
                    {Object.values(commDist).some(r => r.sqft > 0) && (
                      <div className="mt-3 pt-3 border-t border-border flex justify-end">
                        <span className="text-xs text-muted-foreground">Touch-up wall surface: <strong className="text-foreground">{Math.round(Object.values(commDist).reduce((a, r) => a + r.qty * r.floors * r.sqft, 0) * 3.5).toLocaleString()} sqft</strong></span>
                      </div>
                    )}
                  </div>
                ))}

                {/* ── COMM STEP 2: Full Repaint Zones ── */}
                {sectionCard(<>Select <span className="text-primary">FULL REPAINT ZONES</span></>, "STEP 2", (
                  <div>
                    <div className="mb-4 p-3 border border-border/40 bg-secondary/10 flex gap-2">
                      <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{facilityConfig.hubDesc}</p>
                    </div>
                    {commZoneTableDesktop(allFacilityZones(facilityConfig), commHubs, setCommHubs, k => k, true)}
                    {commZoneTableMobile(allFacilityZones(facilityConfig), commHubs, setCommHubs, k => k, true)}
                    {Object.values(commHubs).some(r => r.sqft > 0) && (
                      <div className="mt-3 pt-3 border-t border-border flex justify-end">
                        <span className="text-xs text-muted-foreground">Full repaint wall surface: <strong className="text-primary">{Math.round(Object.values(commHubs).reduce((a, r) => a + r.qty * r.floors * r.sqft, 0) * 3.5).toLocaleString()} sqft</strong></span>
                      </div>
                    )}
                  </div>
                ))}

                {/* ── COMM STEP 3: Exterior ── */}
                {sectionCard("Exterior Paint & Cleaning Services", "STEP 3", (
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Pressure / Soft Wash Services</p>
                    <p className="text-xs text-muted-foreground mb-3">Select exterior wash zones to include. Wash frequency is determined by your selected tier. Costs shown are placeholders and will be more accurately scoped and confirmed after the walkthrough.</p>
                    {extToggle(commExtZones, setCommExtZones, COMM_EXT_LABELS, COMM_EXT_COST, COMM_EXT_INFO)}

                    <div className="mt-5 border border-border/50 bg-secondary/10">
                      <button type="button" onClick={() => setPaintServicesOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/20 transition-colors">
                        <Info className="w-4 h-4 text-primary flex-shrink-0" />
                        <p className="text-xs font-bold text-foreground flex-grow">Paint / Coating Services (scoped separately)</p>
                        {paintServicesOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      {paintServicesOpen && (
                        <div className="px-4 pb-4 space-y-2">
                          <p className="text-xs text-muted-foreground mb-3 pt-1">Check any services you're interested in. These are scoped and priced during your walk-through.</p>
                          {COMM_PAINT_SERVICES.map(svc => (
                            <label key={svc.key} className="flex items-start gap-3 cursor-pointer p-3 border border-border/40 bg-background hover:border-primary/30 transition-colors">
                              <input type="checkbox" checked={paintInterest[svc.key] ?? false} onChange={e => setPaintInterest(p => ({ ...p, [svc.key]: e.target.checked }))}
                                className="mt-0.5 w-4 h-4 accent-[#FF6600] flex-shrink-0" />
                              <div className="flex-grow">
                                <div className="flex items-center gap-1"><p className="text-xs font-semibold text-foreground">{svc.label}</p><InfoTip text={svc.info} /></div>
                                <p className="text-[10px] text-muted-foreground mt-1">{svc.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-4 border border-border/50 bg-secondary/10 flex gap-3">
                      <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">Pressure/soft wash services for Roof · Pedestrian walkways & sidewalks · Parking garages & lots · Windows — assessed during your complimentary walk-through and quoted separately.</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* TIER CARDS */}
      <section className="py-12 sm:py-16 bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">Select Your Tier</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
              {isMultiFamily ? "4-Tier Residential Autopilot Plan" : "3-Tier Commercial Maintenance Plan"}
            </h2>
            {calc.onboarding > 0 && (
              <p className="text-muted-foreground text-sm mt-2">
                One-time onboarding fee: <strong className="text-foreground">{fmt(calc.onboarding)}</strong>
                <span className="text-muted-foreground ml-1">(restores all zones to PaintLab standards)</span>
              </p>
            )}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className={`grid gap-px bg-border ${isMultiFamily ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
            {activeTiers.map((tier, i) => {
              const price = displayPrices[i] ?? 0;
              const isSelected = selectedTier === tier.id;
              const savings = !isMultiFamily ? (annualSavings[i] ?? 0) : 0;
              const hasDiscount = !isMultiFamily && i > 0;
              const discountKey = `t${i + 1}` as "t1" | "t2" | "t3";
              return (
                <div key={tier.id}
                  className={`relative flex flex-col bg-card transition-all cursor-pointer hover:bg-primary/5 ${isSelected ? "ring-2 ring-inset ring-primary" : ""}`}
                  onClick={() => setSelectedTier(tier.id)}>
                  {(tier as any).popular && (
                    <div className="absolute top-0 right-0 bg-primary text-background text-[9px] font-bold uppercase tracking-widest px-3 py-1">Most Popular</div>
                  )}
                  <div className="flex-grow p-5 sm:p-6">
                    <p className="text-primary font-mono text-[10px] tracking-widest uppercase mb-2">{tier.sub}</p>
                    <h3 className="font-black text-xl sm:text-2xl leading-tight tracking-tight text-foreground">{tier.label}</h3>
                    {price > 0 ? (
                      <div className="mt-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">{fmt(price)}</span>
                          <span className="text-muted-foreground text-xs">/mo</span>
                        </div>
                        {!isMultiFamily && i === 0 && (
                          <p className="text-[10px] text-muted-foreground mt-1">No discount applied by default. Check below to activate 2% off.</p>
                        )}
                        {!isMultiFamily && i === 1 && (
                          <p className="text-[10px] text-primary mt-1 font-medium">2% discount applied</p>
                        )}
                        {!isMultiFamily && i === 2 && (
                          <p className="text-[10px] text-primary mt-1 font-medium">3% discount applied</p>
                        )}
                        {savings > 0 && (
                          <div className="mt-1 px-2 py-1 bg-primary/10 border border-primary/20 inline-block">
                            <span className="text-[11px] font-bold text-primary">Saves {fmt(savings)}/year</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs mt-3 italic">Fill in zone sizes above to see your price.</p>
                    )}
                    <ul className="space-y-2 mt-4">
                      {tier.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-px" />{f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Discount controls */}
                  {!isMultiFamily && price > 0 && (
                    <div className="px-5 sm:px-6 pb-4 border-t border-border/30" onClick={e => e.stopPropagation()}>
                      <label className="flex items-start gap-2 cursor-pointer pt-3">
                        <input type="checkbox" checked={annualUpfront[discountKey]} onChange={e => setAnnualUpfront(p => ({ ...p, [discountKey]: e.target.checked }))}
                          className="mt-0.5 w-3.5 h-3.5 accent-[#FF6600] flex-shrink-0" />
                        <span className="text-[10px] text-muted-foreground leading-relaxed">
                          {i === 0 ? "2% discount — annual amount paid in full" : "Additional 2% off — annual amount paid in full, net 30"}
                        </span>
                      </label>
                    </div>
                  )}

                  <div className={`mx-5 sm:mx-6 mb-5 sm:mb-6 h-9 border text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors ${isSelected ? "bg-primary text-background border-primary" : "border-border text-muted-foreground"}`}>
                    {isSelected ? "✓ Selected" : "Select this tier"}
                  </div>
                </div>
              );
            })}
          </motion.div>

          <div className="mt-6 sm:mt-8 p-4 sm:p-5 border border-border/60 bg-secondary/10">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Important:</strong> The PaintLab Subscription covers precision touch-ups for your selected touch-up zones and full repaints for your selected full repaint zones at the chosen tier frequency. Large-surface color changes or specialty coatings will be scoped as separate projects to ensure the highest quality results.
            </p>
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-primary font-mono text-xs tracking-widest uppercase">Get Your Proposal</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Fill this form to get your proposal.</h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">We'll send your full configuration summary and schedule a complimentary walkthrough to finalize scope and investment.</p>
            </motion.div>

            {submitted ? (
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="border border-primary bg-primary/5 p-8 sm:p-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Your email is ready.</h3>
                <p className="text-muted-foreground text-sm">Your email client should have opened with the full breakdown for hello@paintlabpro.com. You can also call or text us directly below.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-primary hover:underline">Edit & re-send</button>
              </motion.div>
            ) : (
              <motion.form initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Your Name", placeholder: "Jane Smith" },
                    { key: "propertyName", label: "Property Name", placeholder: "Riverside Office Park" },
                    { key: "address", label: "Property Address", placeholder: "123 Main St, Austin, TX 78701", full: true },
                    { key: "phone", label: "Phone Number", placeholder: "(512) 000-0000" },
                  ].map(f => (
                    <motion.div key={f.key} variants={fadeInUp} className={f.full ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">{f.label}</label>
                      <input required type={f.key === "phone" ? "tel" : "text"} inputMode={f.key === "phone" ? "tel" : undefined}
                        value={(formData as any)[f.key]} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full h-12 bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors" />
                    </motion.div>
                  ))}
                  <motion.div variants={fadeInUp} className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="jane@property.com"
                      className="w-full h-12 bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors" />
                  </motion.div>
                </div>

                {selectedTier && (
                  <motion.div variants={fadeInUp} className="flex items-center gap-3 p-4 border border-primary/30 bg-primary/5">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm"><strong className="text-foreground">Selected:</strong> {activeTiers.find(t => t.id === selectedTier)?.label}</p>
                      {(displayPrices[activeTiers.findIndex(t => t.id === selectedTier)] ?? 0) > 0 && (
                        <p className="text-xs text-primary font-medium">{fmt(displayPrices[activeTiers.findIndex(t => t.id === selectedTier)] ?? 0)}/mo
                          {annualSavings[activeTiers.findIndex(t => t.id === selectedTier)] > 0 && ` — saves ${fmt(annualSavings[activeTiers.findIndex(t => t.id === selectedTier)])}/year`}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button variants={fadeInUp} type="submit"
                    className="flex-1 h-14 bg-primary text-background font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors">
                    <Send className="w-4 h-4" /> Send Full Breakdown to PaintLab
                  </motion.button>
                  <motion.button variants={fadeInUp} type="button" onClick={saveDraft}
                    className="h-14 px-6 border border-border text-foreground font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors">
                    {draftSaved ? <CheckCircle2 className="w-4 h-4 text-primary" /> : null}
                    {draftSaved ? "Draft Saved!" : "Save Draft"}
                  </motion.button>
                </div>
              </motion.form>
            )}

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <motion.a variants={fadeInUp} href="tel:+15124843124"
                className="flex items-center justify-center gap-3 h-16 border-[3px] border-black bg-primary text-black hover:bg-primary/90 transition-colors"
                style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem", boxShadow: "4px 4px 0px #000000" }}>
                <Phone className="w-5 h-5 flex-shrink-0" /> CALL PAINTLAB
              </motion.a>
              <motion.a variants={fadeInUp} href={`sms:+15124843124?body=${smsBody}`}
                className="flex items-center justify-center gap-3 h-16 border-[3px] border-black bg-primary text-black hover:bg-primary/90 transition-colors"
                style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem", boxShadow: "4px 4px 0px #000000" }}>
                <MessageSquare className="w-5 h-5 flex-shrink-0" /> TEXT PAINTLAB
              </motion.a>
            </motion.div>
            <p className="text-xs text-muted-foreground text-center mt-3">Mon–Fri 8am–6pm CT · Available for emergency dispatch</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
