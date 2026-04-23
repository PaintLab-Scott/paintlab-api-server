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
  mainLobby: "Main Lobby",
  mailroom: "Mailroom",
  coworking: "Co-working Space",
  gym: "Gym Area",
  bathrooms: "Public Bathrooms",
  leasingOffice: "Leasing Office",
  packageRoom: "Package Room",
};
const EXT_ZONE_COST: Record<string, number> = {
  mainFacade: 250, floorSurface: 150, poolDeck: 450,
  doorway: 250, garbageArea: 100, garageEntrance: 175,
  buildingCladding: 1000,
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
  buildingCladding: "Building cladding/siding, roofs, pedestrian walkways, parking garages & lots, windows & trim — assessed during your complimentary walk-through and quoted separately.",
};

// ─── Commercial Constants ───────────────────────────────────────────────────
const COMM_WALL_MULTIPLIER = 3.5;

const COMM_EXT_COST: Record<string, number> = {
  commFacade: 250, commEntranceFloor: 250, commDumpsterPad: 200,
  commEntries: 150, commGarage: 150, commCladding: 950,
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
  commCladding: "Building cladding/siding scope is assessed during the complimentary walk-through and priced as a separate line. Included here to reserve capacity in your service schedule.",
};

const COMM_PAINT_SERVICES = [
  {
    key: "curbPainting",
    label: "Curb Painting",
    info: "Fire lane, no-parking, and reserved-stall curb markings. Colors and linear footage confirmed during walk-through. Priced per scope.",
  },
  {
    key: "lotStriping",
    label: "Parking Lot Striping",
    info: "Full re-striping of standard stalls, drive lanes, and fire lanes with traffic-grade paint. Layout and stall count confirmed during walk-through.",
  },
  {
    key: "decalPainting",
    label: "Parking Lot Decal / Logo Painting",
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
    touchUpDesc: "Distributed touch-up zones are the corridors, hallways, and circulation spaces that see daily traffic. We apply precision spot coating, edge blending, and color matching — not a full repaint.",
    hubDesc: "Singular hubs are full-repaint destination spaces — lobbies, conference rooms, and break areas that define your brand. Every hub receives a complete, two-coat wall repaint at each service cycle.",
    touchUpZones: [
      { key: "openOfficeHallways", label: "Open Office Hallways", info: "The primary circulation corridors running through your general office space. Estimate sqft by measuring length × width of each hallway per floor. Typical open-office hallway runs 8–12 ft wide.", defaultSqFt: 400 },
      { key: "executiveCorridors", label: "Executive Wing Corridors", info: "Narrower, higher-finish hallways serving executive suites and conference wings. Typically 6–8 ft wide. Enter sqft per floor (length × width).", defaultSqFt: 150 },
      { key: "stairwells", label: "Stairwells", info: "Interior stairwells including stair walls, landings, and undersides. Measure the footprint (length × width of the stair shaft per landing). The 3.5× wall multiplier captures the vertical wall surface automatically.", defaultSqFt: 80 },
      { key: "elevatorLobbies", label: "Elevator Lobbies", info: "The vestibule areas directly in front of elevator banks on each floor. Enter the square footage of this lobby zone per floor (typical: 8 × 15 ft = 120 sqft).", defaultSqFt: 120 },
    ],
    hubZones: [
      { key: "mainLobby", label: "Main Entry Lobby / Reception", info: "Your primary arrival experience — includes reception desk surround, accent walls, and feature surfaces. This is a full 2-coat repaint zone at every service cycle.", defaultSqFt: 1200 },
      { key: "conferenceRooms", label: "Conference & Meeting Rooms", info: "Enter total sqft for all conference/meeting rooms combined. These high-visibility rooms receive a full repaint including walls and ceiling perimeter trim touch-up.", defaultSqFt: 800 },
      { key: "executiveSuites", label: "Executive Suites & Private Offices", info: "Private office square footage across all executive and manager offices. Enter the combined floor sqft for all such spaces.", defaultSqFt: 600 },
      { key: "breakRoom", label: "Break Room / Kitchen", info: "Staff kitchen and break room. Enter floor sqft. These spaces take high humidity and require scrubbable finishes — full repaint at each cycle.", defaultSqFt: 400 },
      { key: "bathrooms", label: "Public & Staff Restrooms", info: "Enter combined floor sqft across all restrooms. Restrooms use moisture-resistant finishes and receive a full repaint at each service cycle.", defaultSqFt: 300 },
    ],
  },
  medical: {
    touchUpDesc: "Touch-up zones in healthcare facilities are the patient-facing corridors, hallways, and circulation paths that experience heavy gurney, wheelchair, and cart traffic. We apply precision impact-zone touch-ups using healthcare-grade, low-VOC finishes.",
    hubDesc: "Hub (full repaint) zones in medical facilities include waiting areas, exam rooms, and nurse stations — spaces requiring the highest hygiene and finish quality. Every hub receives a full 2-coat repaint with antimicrobial-compatible coatings.",
    touchUpZones: [
      { key: "patientHallways", label: "Patient Care Hallways", info: "Primary corridors in clinical zones — typically 8 ft wide to accommodate gurneys and wheelchairs. Measure length × 8 ft per floor. High-impact zones on lower 4 ft of wall require most attention.", defaultSqFt: 600 },
      { key: "adminCorridors", label: "Administrative Corridors", info: "Back-of-house office and administrative hallways. Lower traffic than clinical corridors. Enter sqft per floor (length × width).", defaultSqFt: 300 },
      { key: "stairwells", label: "Stairwells", info: "Staff and emergency stairwells. Enter the footprint sqft of the stair shaft per landing; the 3.5× multiplier captures wall surface.", defaultSqFt: 80 },
      { key: "elevatorLandings", label: "Elevator Lobbies & Landings", info: "The elevator vestibule area on each floor — includes call-button walls and door surrounds. Typical size: 10 × 15 ft = 150 sqft per landing.", defaultSqFt: 150 },
    ],
    hubZones: [
      { key: "waitingArea", label: "Patient Waiting Area / Reception", info: "Primary public waiting and reception zone. Full 2-coat repaint including feature walls. Enter combined floor sqft.", defaultSqFt: 800 },
      { key: "examRooms", label: "Exam Rooms", info: "Enter combined floor sqft across all exam rooms. Each room receives a full repaint to maintain clinical standards and hygiene compliance.", defaultSqFt: 900 },
      { key: "nurseStations", label: "Nurse Stations & Care Hubs", info: "Open-plan nurse station areas including surrounding wall surfaces. Enter total floor sqft across all stations.", defaultSqFt: 500 },
      { key: "adminOffices", label: "Administrative Offices", info: "Staff and provider offices, charting rooms, and back-office areas. Enter combined floor sqft.", defaultSqFt: 600 },
      { key: "bathrooms", label: "Patient & Staff Restrooms", info: "All restroom facilities — moisture-resistant finishes required. Enter combined floor sqft.", defaultSqFt: 400 },
    ],
  },
  industrial: {
    touchUpDesc: "Distributed touch-up zones in warehouse and industrial facilities focus on safety-critical surfaces: aisle markings, emergency exit pathways, and dock approach zones. Touch-ups keep high-visibility safety colors fresh and compliant without taking equipment offline.",
    hubDesc: "Hub (full repaint) zones are the human-occupied spaces within your facility — break rooms, offices, restrooms, and entry vestibules. These spaces set the tone for employee experience and receive a full 2-coat repaint at each service cycle.",
    touchUpZones: [
      { key: "mainAisles", label: "Main Traffic Aisles", info: "The primary forklift and pedestrian aisles running through the warehouse floor. Measure lane width × total length. Aisle markings and lower wall surfaces (wainscot zone) are the focus. Enter sqft per aisle.", defaultSqFt: 800 },
      { key: "loadingDock", label: "Loading Dock Approach Zones", info: "The exterior and interior wall surfaces flanking loading dock bays — including dock bumper surrounds and bay number markings. Enter sqft per bay approach (typical 10 × 20 ft = 200 sqft).", defaultSqFt: 200 },
      { key: "exitPathways", label: "Emergency Exit Pathways", info: "OSHA-required emergency egress corridors and exit door surrounds. Bright yellow/red safety finishes must remain crisp and visible. Enter linear footage × 6 ft height for wall sqft, or enter floor sqft of the pathway.", defaultSqFt: 120 },
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
    touchUpDesc: "Touch-up zones in automotive facilities are the customer-facing circulation paths — showroom walkways, service drive corridors, and parts department aisles. Precise touch-ups maintain showroom-quality finish without disrupting vehicle display.",
    hubDesc: "Hub (full repaint) zones include your primary showroom floor, customer lounge, and sales offices — the spaces that make or break the buyer experience. Full repaints at each tier cycle restore the premium look that closes deals.",
    touchUpZones: [
      { key: "showroomWalkways", label: "Showroom Walkways & Circulation", info: "The pedestrian pathways that wind through your vehicle display floor. Typically 6–8 ft wide between vehicle rows. Enter sqft by measuring total walkway length × width.", defaultSqFt: 400 },
      { key: "serviceDrive", label: "Service Drive Corridors", info: "The enclosed drive lane leading vehicles from drop-off to service bays. Includes the wall surfaces flanking the drive lane. Enter sqft of the corridor (length × average width).", defaultSqFt: 600 },
      { key: "partsAisles", label: "Parts Department Aisles", info: "Shelving-flanked aisles in the parts counter and parts storage area. Enter total aisle sqft (length × width for all aisles combined).", defaultSqFt: 300 },
      { key: "backCorridors", label: "Back-of-House Corridors", info: "Staff hallways behind the showroom and service areas. Lower-finish surfaces but still visible to employees. Enter sqft per floor.", defaultSqFt: 200 },
    ],
    hubZones: [
      { key: "showroomFloor", label: "Vehicle Showroom / Display Floor", info: "The main vehicle display area — focal walls, window reveals, and feature accent surfaces. Does not include the vehicle floor slab itself; wall surfaces only. Enter floor sqft; 3.5× multiplier applies to wall surface.", defaultSqFt: 3000 },
      { key: "customerLounge", label: "Customer Lounge & Waiting Area", info: "The seating area where customers wait during service. Premium finishes, high refresh rate. Enter floor sqft.", defaultSqFt: 600 },
      { key: "serviceAdvisors", label: "Service Advisor Area", info: "The counter and surrounding wall area where advisors interact with customers. Typically 20–30 ft long × 12 ft deep. Enter floor sqft.", defaultSqFt: 350 },
      { key: "salesOffices", label: "Finance & Sales Offices", info: "Closed-door sales and F&I offices. Enter combined floor sqft across all offices.", defaultSqFt: 500 },
      { key: "bathrooms", label: "Customer & Staff Restrooms", info: "All restroom facilities. Enter combined floor sqft.", defaultSqFt: 350 },
    ],
  },
  education: {
    touchUpDesc: "Touch-up zones in educational facilities are the high-traffic hallways, stairwells, and locker bays that see daily student movement. Precise touch-ups restore scuffs, marks, and impact damage without classroom disruption.",
    hubDesc: "Hub (full repaint) zones are the anchor spaces in a school or campus facility: administration, gymnasium, cafeteria, and library. Full repaints at the scheduled tier cycle keep these destination spaces fresh and inspiring.",
    touchUpZones: [
      { key: "mainHallways", label: "Main Hallways & Classroom Corridors", info: "The primary hallways running between classrooms. Measure hallway length × width per floor. Standard school hallway is 8–10 ft wide. Lockers are excluded from the wall surface calculation.", defaultSqFt: 1000 },
      { key: "stairwells", label: "Stairwells", info: "Interior stairwells — stair walls, landing walls, and undersides. Enter the footprint sqft of the stair shaft per landing. The 3.5× multiplier captures vertical wall surface.", defaultSqFt: 100 },
      { key: "lockerBays", label: "Locker Bay Areas", info: "The wall surfaces flanking locker banks. Enter floor sqft of the locker bay zone (bay length × depth from wall to aisle centerline). Locker units themselves are not painted.", defaultSqFt: 400 },
      { key: "cafCorridors", label: "Cafeteria Access Corridors", info: "Hallways and entry vestibules leading into the cafeteria/dining area. Typically 10–12 ft wide. Enter sqft per floor.", defaultSqFt: 200 },
    ],
    hubZones: [
      { key: "adminOffice", label: "Administration Office & Front Desk", info: "The main administrative suite including reception, principal offices, and support staff areas. Enter combined floor sqft.", defaultSqFt: 800 },
      { key: "gymnasium", label: "Gymnasium / Multi-Purpose Room", info: "The main gym or multipurpose room — wall surfaces only, not the wood floor. Enter floor sqft; 3.5× captures wall surface up to 20 ft height (accounts for high ceilings — final height confirmed at walk-through).", defaultSqFt: 5000 },
      { key: "cafeteria", label: "Cafeteria / Dining Hall", info: "Main dining area including serving line surround walls. High-humidity, high-splatter zone requiring scrubbable finishes. Enter floor sqft.", defaultSqFt: 3000 },
      { key: "bathrooms", label: "Student & Staff Restrooms", info: "All restroom facilities. Enter combined floor sqft.", defaultSqFt: 600 },
      { key: "library", label: "Library / Media Center", info: "The library or media center space. Enter floor sqft. Typically lower wall damage but high visibility — full repaint keeps the learning environment fresh.", defaultSqFt: 2000 },
    ],
  },
  retail: {
    touchUpDesc: "Touch-up zones in retail are the customer-facing aisles, fitting room corridors, and back-of-house paths that take daily scuffs from carts, racks, and traffic. Precision touch-ups keep the floor looking freshly opened without a store closure.",
    hubDesc: "Hub (full repaint) zones are the brand-defining spaces: storefront entry, checkout area, and fitting rooms. These receive a complete 2-coat repaint at each service cycle to maintain a consistent, premium brand impression.",
    touchUpZones: [
      { key: "salesFloorAisles", label: "Sales Floor Main Aisles", info: "The primary shopping aisles running through your sales floor. Measure total aisle length × width. Wall surfaces flanking aisles (typically 4–6 ft exposed above fixtures) are the target. Enter floor sqft of the aisle zone.", defaultSqFt: 1500 },
      { key: "bohCorridors", label: "Back-of-House Service Corridors", info: "Staff-only corridors behind the sales floor connecting stockroom, receiving, and break areas. Enter sqft per floor (length × width).", defaultSqFt: 400 },
      { key: "fittingCorridors", label: "Fitting Room Corridors", info: "The hallway leading to and from the fitting room area, not the interior of the rooms themselves. Enter sqft of the approach corridor.", defaultSqFt: 150 },
      { key: "loadingAreas", label: "Loading / Receiving Areas", info: "The interior wall surfaces of the receiving dock and stockroom entry zone. High-impact areas from pallet jacks and hand trucks.", defaultSqFt: 300 },
    ],
    hubZones: [
      { key: "storefrontEntry", label: "Storefront / Entry Zone", info: "The first impression zone — entrance vestibule walls, feature walls, and signage surrounds. Enter floor sqft of the entry/vestibule area.", defaultSqFt: 400 },
      { key: "checkoutArea", label: "Checkout & Service Counter Area", info: "The checkout counter surround and adjacent walls — the space customers spend the most time in before purchasing. Enter floor sqft.", defaultSqFt: 500 },
      { key: "fittingRooms", label: "Fitting Rooms", info: "Interior walls of all fitting room stalls combined. Enter combined floor sqft (each stall ~25–40 sqft). High wear from hanger impacts and clothing contact.", defaultSqFt: 300 },
      { key: "breakOffices", label: "Break Room & Manager's Office", info: "Staff break room and management offices. Enter combined floor sqft.", defaultSqFt: 350 },
      { key: "bathrooms", label: "Customer Restrooms", info: "Customer-facing restrooms. Enter combined floor sqft.", defaultSqFt: 200 },
    ],
  },
  "gyms-fitness": {
    touchUpDesc: "Touch-up zones in fitness facilities are the high-traffic corridors, locker room hallways, and check-in approach areas that take daily scuffs from equipment, bags, and foot traffic. Precision touch-ups keep these zones looking sharp between full repaint cycles.",
    hubDesc: "Hub (full repaint) zones are the training and amenity areas where members spend their time — cardio floor, weights area, class rooms, locker rooms, and the front desk. Full repaints restore the high-energy aesthetic that retains members.",
    touchUpZones: [
      { key: "mainCorridors", label: "Main Corridors & Hallways", info: "Primary circulation hallways connecting zones within the facility. Typically 8–10 ft wide. Enter sqft per floor (length × width). Wall scuffs from equipment and bags are most common here.", defaultSqFt: 400 },
      { key: "lockerHallways", label: "Locker Room Hallways", info: "Entry/exit hallways into men's and women's locker rooms. High humidity at the transition — touch-ups focus on the lower 4 ft of wall (impact zone) and door surrounds.", defaultSqFt: 120 },
      { key: "entryCheckIn", label: "Entry & Check-in Approach Zone", info: "The pathway from the main entrance to the front desk check-in area. First impression zone — should always look fresh. Enter floor sqft of this approach area.", defaultSqFt: 200 },
    ],
    hubZones: [
      { key: "cardioArea", label: "Cardio Area", info: "The primary cardio machine floor — treadmills, bikes, ellipticals, and rowers. Enter floor sqft of this zone. Wall surfaces including accent walls and mirror borders are repainted.", defaultSqFt: 2500 },
      { key: "freeWeights", label: "Free Weights Area", info: "Dumbbell and barbell free weight zone. High wall impact from dropped equipment and mirrors. Enter floor sqft. Lower wall (0–4 ft) receives impact-resistant finish.", defaultSqFt: 2000 },
      { key: "machinezones", label: "Strength Machine Zone", info: "Cable machines, chest press, leg press, and other resistance machine areas. Enter floor sqft.", defaultSqFt: 1500 },
      { key: "classRooms", label: "Class / Training Rooms", info: "Group fitness, yoga, spin, or personal training rooms. Enter combined floor sqft. These rooms often feature accent or brand-colored walls.", defaultSqFt: 1200 },
      { key: "mensLocker", label: "Men's Locker Room", info: "Full locker room including shower area walls, vanity zone, and locker bay surround. High humidity — moisture-resistant finish required. Enter floor sqft.", defaultSqFt: 900 },
      { key: "womensLocker", label: "Women's Locker Room", info: "Full locker room including shower area walls, vanity zone, and locker bay surround. High humidity — moisture-resistant finish required. Enter floor sqft.", defaultSqFt: 900 },
      { key: "frontDesk", label: "Front Desk / Reception Area", info: "The main reception counter surround, feature wall behind desk, and adjacent check-in zone walls. Enter floor sqft of this area.", defaultSqFt: 400 },
      { key: "offices", label: "Offices & Staff Areas", info: "Manager offices, trainer offices, and staff-only back areas. Enter combined floor sqft.", defaultSqFt: 300 },
    ],
  },
  commercial: {
    touchUpDesc: "Distributed touch-up zones are the shared circulation paths in your facility — hallways, corridors, and transition areas. We apply precision spot coating, edge blending, and color matching at the scheduled frequency of your chosen tier.",
    hubDesc: "Singular hubs are the primary destination spaces in your facility that receive a complete, two-coat full repaint at every service cycle. These are the anchor spaces that define the aesthetic quality of your property.",
    touchUpZones: [
      { key: "officeHallways", label: "Office Hallways", info: "General-purpose hallways running through office or work areas. Enter sqft per floor (hallway length × width). Typical office hallway is 6–8 ft wide.", defaultSqFt: 400 },
      { key: "serviceCorridors", label: "Main Service Corridors", info: "Wider back-of-house corridors used for deliveries, equipment movement, and staff circulation. Enter sqft per floor.", defaultSqFt: 300 },
      { key: "elevatorLandings", label: "Elevator Landings & Lobbies", info: "The vestibule areas in front of elevator banks. Enter the floor sqft of this zone per floor (typical: 10 × 15 ft = 150 sqft per landing).", defaultSqFt: 150 },
      { key: "stairwells", label: "Stairwells", info: "Interior stairwells — stair walls, landing walls, and undersides. Enter the footprint sqft of the stair shaft. The 3.5× multiplier captures vertical wall surface.", defaultSqFt: 80 },
    ],
    hubZones: [
      { key: "lobbies", label: "Main Lobbies", info: "Your primary entry lobby or lobbies. Enter combined floor sqft. These are full repaint zones — all walls, feature walls, and reception surrounds are included.", defaultSqFt: 1200 },
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
interface CommHubRow { qty: number; sqft: number }

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
  mainLobby: { qty: 0, sqft: 0 },
  mailroom: { qty: 0, sqft: 0 },
  coworking: { qty: 0, sqft: 0 },
  gym: { qty: 0, sqft: 0 },
  bathrooms: { qty: 0, sqft: 0 },
  leasingOffice: { qty: 0, sqft: 0 },
  packageRoom: { qty: 0, sqft: 0 },
});
const defaultResExtZones = (): Record<string, boolean> => ({
  mainFacade: false, floorSurface: false, poolDeck: false,
  doorway: false, garbageArea: false, garageEntrance: false,
  buildingCladding: false,
});
const defaultCommExtZones = (): Record<string, boolean> => ({
  commFacade: false, commEntranceFloor: false, commDumpsterPad: false,
  commEntries: false, commGarage: false, commCladding: false,
});

function initCommDist(config: FacilityConfig): Record<string, CommZoneRow> {
  return Object.fromEntries(config.touchUpZones.map(z => [z.key, { qty: 0, floors: 1, sqft: 0 }]));
}
function initCommHubs(config: FacilityConfig): Record<string, CommHubRow> {
  return Object.fromEntries(config.hubZones.map(z => [z.key, { qty: 0, sqft: 0 }]));
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function numInput(val: number, onChange: (v: number) => void, placeholder = "0") {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      value={val === 0 ? "" : val}
      placeholder={placeholder}
      onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
      className="w-full h-10 bg-background border border-border text-center text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
    />
  );
}

// ─── InfoTip ─────────────────────────────────────────────────────────────────
function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex flex-shrink-0 align-middle ml-1.5">
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="w-4 h-4 rounded-full border border-muted-foreground/60 text-muted-foreground/70 text-[9px] flex items-center justify-center hover:border-primary hover:text-primary transition-colors leading-none"
        aria-label="More info"
      >
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

// ─── Main Component ─────────────────────────────────────────────────────────
export default function SubscriptionLab() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const typeParam = params.get("type") ?? sessionStorage.getItem("facilityType") ?? "commercial";
  const facilityParam = params.get("facility") ?? typeParam;
  const isMultiFamily = typeParam === "multi-family";
  const facilityLabel = FACILITY_LABELS[facilityParam] ?? "Commercial";

  const facilityConfig: FacilityConfig = FACILITY_CONFIGS[facilityParam] ?? FACILITY_CONFIGS["commercial"];

  const [extInfoZone, setExtInfoZone] = useState<string | null>(null);
  const [unitMix, setUnitMix] = useState(defaultUnitMix());
  const [resDistZones, setResDistZones] = useState(defaultResDistZones());
  const [singularHubs, setSingularHubs] = useState(defaultSingularHubs());
  const [resExtZones, setResExtZones] = useState(defaultResExtZones());
  const [commDist, setCommDist] = useState<Record<string, CommZoneRow>>(() => initCommDist(facilityConfig));
  const [commHubs, setCommHubs] = useState<Record<string, CommHubRow>>(() => initCommHubs(facilityConfig));
  const [commExtZones, setCommExtZones] = useState(defaultCommExtZones());
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", propertyName: "", address: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [paintServicesOpen, setPaintServicesOpen] = useState(false);

  const saveDraft = () => {
    const tierIdx = selectedTier ? activeTiers.findIndex(t => t.id === selectedTier) : -1;
    const tierLabel = tierIdx >= 0 ? activeTiers[tierIdx].label : "";
    const monthlyPrice = tierIdx >= 0 ? (calc.tiers[tierIdx] ?? 0) : 0;
    const draft = {
      id: `${Date.now()}`,
      savedAt: new Date().toISOString(),
      facilityLabel,
      tierLabel,
      monthlyPrice,
      propertyName: formData.propertyName,
    };
    const existing = JSON.parse(localStorage.getItem("paintlab_drafts") ?? "[]");
    existing.unshift(draft);
    localStorage.setItem("paintlab_drafts", JSON.stringify(existing.slice(0, 10)));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  // ─── Math Engine ─────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    if (isMultiFamily) {
      const unitTurnsSqFt = Object.entries(unitMix).reduce((acc, [type, row]) => {
        const eff = row.sqft > 0 ? row.sqft : (UNIT_SQFT[type] ?? 0);
        return acc + row.turns * eff;
      }, 0);
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
        .filter(([, on]) => on)
        .reduce((acc, [zone]) => acc + (EXT_ZONE_COST[zone] ?? 0), 0);

      const t1 = Math.round(unitTurnsWallSqFt * 0.18);
      const t2 = Math.round(unitTurnsWallSqFt * 0.21 + (hubAreaSqFt * 0.10 + touchUpSqFt * 0.05) / 12 + extCostPerVisit / 12);
      const t3 = Math.round(unitTurnsWallSqFt * 0.24 + (hubAreaSqFt * 0.13 + touchUpSqFt * 0.07) / 3 + (extCostPerVisit * 4) / 12);
      const t4 = Math.round(unitTurnsWallSqFt * 0.30 + hubAreaSqFt * 0.18 + touchUpSqFt * 0.10 + extCostPerVisit);
      const onboarding = Math.round(t2 * 1.5);

      return { unitTurnsSqFt, hubAreaSqFt, touchUpSqFt, extCostPerVisit, onboarding, tiers: [t1, t2, t3, t4] };
    } else {
      // All commercial: floor sqft × 3.5 = wall sqft for pricing
      // Hub rate: $0.38/wall sqft/visit (full 2-coat repaint)
      // Touch-up rate: $0.12/wall sqft/visit (precision spot coating)
      const hubFloorSqFt = Object.values(commHubs).reduce((acc, row) => acc + row.qty * row.sqft, 0);
      const touchUpFloorSqFt = Object.values(commDist).reduce((acc, row) => acc + row.qty * row.floors * row.sqft, 0);
      const hubWallSqFt = hubFloorSqFt * COMM_WALL_MULTIPLIER;
      const touchUpWallSqFt = touchUpFloorSqFt * COMM_WALL_MULTIPLIER;
      const extCostPerVisit = Object.entries(commExtZones)
        .filter(([, on]) => on)
        .reduce((acc, [zone]) => acc + (COMM_EXT_COST[zone] ?? 0), 0);

      // Monthly subscription = rate × sqft × visits/yr ÷ 12
      // Annual (1 visit/yr) — slightly higher per-visit rate
      const ct1 = Math.round((hubWallSqFt * 0.38 * 1 + touchUpWallSqFt * 0.12 * 1) / 12 + extCostPerVisit * 1 / 12);
      // Bi-Annual (2 visits/yr)
      const ct2 = Math.round((hubWallSqFt * 0.36 * 2 + touchUpWallSqFt * 0.11 * 2) / 12 + extCostPerVisit * 2 / 12);
      // Quarterly (4 visits/yr)
      const ct3 = Math.round((hubWallSqFt * 0.35 * 4 + touchUpWallSqFt * 0.10 * 4) / 12 + extCostPerVisit * 4 / 12);
      // Monthly (12 visits/yr)
      const ct4 = Math.round(hubWallSqFt * 0.34 + touchUpWallSqFt * 0.09 + extCostPerVisit);
      const onboarding = Math.round(ct2 * 1.5);

      return { hubFloorSqFt, touchUpFloorSqFt, hubWallSqFt, touchUpWallSqFt, extCostPerVisit, onboarding, tiers: [ct1, ct2, ct3, ct4] };
    }
  }, [unitMix, resDistZones, singularHubs, resExtZones, commDist, commHubs, commExtZones, isMultiFamily]);

  // ─── Tiers ────────────────────────────────────────────────────────────────
  const resTiers = [
    {
      id: "essential",
      label: "Tier 1 — Essential",
      sub: "100% Unit Turns Only",
      features: ["Full interior repaint for every unit turn", "Consistent color system applied", "2-year workmanship guarantee"],
    },
    {
      id: "asset-shield-annual",
      label: "Tier 2 — Asset Shield",
      sub: "Annual Cycle",
      features: [
        "Everything in Tier 1 (Unit Turns)",
        "Annual full repaint of all hubs",
        "Annual precision touch-ups of corridors",
        "Annual exterior power/soft wash",
      ],
    },
    {
      id: "asset-shield-quarterly",
      label: "Tier 3 — Asset Shield Plus",
      sub: "Quarterly Cycle",
      features: [
        "Everything in Tier 2 (Annual) + 4× frequency",
        "Quarterly full repaint of all hubs",
        "Quarterly precision touch-ups of corridors",
        "Quarterly exterior power/soft wash",
      ],
      popular: true,
    },
    {
      id: "signature-monthly",
      label: "Tier 4 — Signature",
      sub: "Monthly Full Cycle",
      features: [
        "Everything in Tier 3",
        "Monthly proactive patrol walkthroughs",
        "Priority 24-hr dispatch",
        "Monthly condition reporting dashboard",
      ],
    },
  ];

  const commTiers = [
    {
      id: "annual-shield",
      label: "Tier 1 — Annual Shield",
      sub: "1 Service Visit / Year",
      features: [
        "Annual full repaint of all hub zones",
        "Annual precision touch-ups of corridors",
        "Annual exterior paint & cleaning service",
        "Pay monthly or save 5% with annual upfront",
      ],
      note: "Best for stable, lower-traffic facilities.",
    },
    {
      id: "biannual-shield",
      label: "Tier 2 — Bi-Annual Shield",
      sub: "2 Service Visits / Year",
      features: [
        "Everything in Annual Shield × 2",
        "Spring + Fall full repaint & touch-up cycle",
        "Bi-annual exterior paint & cleaning service",
        "Priority scheduling windows",
      ],
      note: "Recommended for moderate-traffic commercial spaces.",
    },
    {
      id: "quarterly-guard",
      label: "Tier 3 — Quarterly Guard",
      sub: "4 Service Visits / Year",
      features: [
        "Quarterly full repaint of all hub zones",
        "Quarterly precision touch-ups of corridors",
        "Quarterly exterior paint & cleaning service",
        "Dedicated account manager",
      ],
      popular: true,
      note: "Most popular for Class A office and healthcare.",
    },
    {
      id: "monthly-autopilot",
      label: "Tier 4 — Monthly Autopilot",
      sub: "12 Service Visits / Year",
      features: [
        "Monthly hub repaints + corridor touch-ups",
        "Monthly exterior paint & cleaning service",
        "24-hr emergency dispatch",
        "Monthly condition reports & photo log",
        "Priority 48-hr response SLA",
      ],
      note: "Ideal for luxury, hospitality, and high-footfall retail.",
    },
  ];

  const activeTiers = isMultiFamily ? resTiers : commTiers;

  // ─── Breakdown ────────────────────────────────────────────────────────────
  const buildBreakdown = () => {
    const lines: string[] = [
      `PAINTLAB SUBSCRIPTION CONFIGURATION`,
      `Facility: ${facilityLabel}`,
      `Tier: ${selectedTier ?? "Not selected"}`,
      `\nONBOARDING FEE: ${fmt(calc.onboarding)}`,
      `\n────────────────────────`,
    ];
    if (isMultiFamily) {
      lines.push(`\nUNIT TURNS (Monthly):`);
      Object.entries(unitMix).forEach(([type, row]) => {
        if (row.turns > 0) {
          const eff = row.sqft > 0 ? row.sqft : UNIT_SQFT[type];
          const wall = Math.round(eff * UNIT_WALL_RATIO[type]);
          lines.push(`  ${UNIT_LABELS[type]}: ${row.turns}/mo × ${eff} sqft (wall: ${wall} sqft)`);
        }
      });
      lines.push(`\nCORRIDOR ZONES:`);
      Object.entries(resDistZones).forEach(([zone, row]) => {
        if (row.qty > 0) {
          const eff = row.sqft > 0 ? row.sqft : RES_DIST_SQFT[zone];
          lines.push(`  ${RES_DIST_LABELS[zone]}: ${row.qty} × ${row.floors} floors × ${eff} sqft/floor = ${(row.qty * row.floors * eff).toLocaleString()} sqft`);
        }
      });
      lines.push(`\nSINGULAR HUBS:`);
      Object.entries(singularHubs).forEach(([hub, row]) => {
        if (row.qty > 0) {
          const eff = row.sqft > 0 ? row.sqft : RES_HUB_SQFT[hub];
          lines.push(`  ${RES_HUB_LABELS[hub]}: ${row.qty} × ${eff} sqft = ${(row.qty * eff).toLocaleString()} sqft`);
        }
      });
      const extOn = Object.entries(resExtZones).filter(([, on]) => on);
      if (extOn.length > 0) {
        lines.push(`\nEXTERIOR ZONES:`);
        extOn.forEach(([zone]) => lines.push(`  ${EXT_ZONE_LABELS[zone]}: $${EXT_ZONE_COST[zone]}/visit`));
      }
    } else {
      lines.push(`\nDISTRIBUTED TOUCH-UP ZONES:`);
      facilityConfig.touchUpZones.forEach(z => {
        const row = commDist[z.key];
        if (row && row.qty > 0) {
          const wallSqFt = Math.round(row.qty * row.floors * row.sqft * COMM_WALL_MULTIPLIER);
          lines.push(`  ${z.label}: ${row.qty} × ${row.floors} floors × ${row.sqft} sqft = ${(row.qty * row.floors * row.sqft).toLocaleString()} floor sqft → ${wallSqFt.toLocaleString()} wall sqft`);
        }
      });
      lines.push(`\nFULL REPAINT HUBS:`);
      facilityConfig.hubZones.forEach(z => {
        const row = commHubs[z.key];
        if (row && row.qty > 0) {
          const wallSqFt = Math.round(row.qty * row.sqft * COMM_WALL_MULTIPLIER);
          lines.push(`  ${z.label}: ${row.qty} × ${row.sqft} sqft = ${(row.qty * row.sqft).toLocaleString()} floor sqft → ${wallSqFt.toLocaleString()} wall sqft`);
        }
      });
      const extOn = Object.entries(commExtZones).filter(([, on]) => on);
      if (extOn.length > 0) {
        lines.push(`\nEXTERIOR SERVICES:`);
        extOn.forEach(([zone]) => lines.push(`  ${COMM_EXT_LABELS[zone]}: $${COMM_EXT_COST[zone]}/visit`));
      }
    }
    lines.push(`\n────────────────────────`);
    const selectedTierData = activeTiers.find(t => t.id === selectedTier);
    if (selectedTierData) {
      const tierIdx = activeTiers.indexOf(selectedTierData);
      lines.push(`\nSELECTED TIER: ${selectedTierData.label} — ${selectedTierData.sub}`);
      lines.push(`ESTIMATED MONTHLY: ${fmt(calc.tiers[tierIdx] ?? 0)}`);
    }
    return lines.join("\n");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const breakdown = buildBreakdown();
    const body = encodeURIComponent(
      `Hi PaintLab Team,\n\nI just configured a subscription plan.\n\n` +
      `NAME: ${formData.name}\nPROPERTY: ${formData.propertyName}\nADDRESS: ${formData.address}\nPHONE: ${formData.phone}\n\n` + breakdown
    );
    window.open(
      `mailto:hello@paintlabpro.com?subject=${encodeURIComponent(`[PaintLab Subscription] ${formData.propertyName} — ${selectedTier ?? "Inquiry"}`)}&body=${body}`,
      "_blank"
    );
    setSubmitted(true);
  };

  const smsBody = encodeURIComponent(
    `I just ran the PaintLab calculator for ${formData.propertyName || "[Property Name]"}. I want to discuss the ${selectedTier ?? "[Selected Tier]"} package.`
  );

  // ─── UI Helpers ───────────────────────────────────────────────────────────
  const sectionCard = (title: string, step: string, content: React.ReactNode) => (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-secondary/20">
        <span className="text-primary font-mono text-xs tracking-widest">{step}</span>
        <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
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
    labels: Record<string, string>,
    costs: Record<string, number>,
    infoMap?: Record<string, string>
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Object.entries(zones).map(([zone, on]) => (
        <div key={zone} className="relative">
          <button
            type="button"
            onClick={() => setter(p => ({ ...p, [zone]: !p[zone] }))}
            className={`w-full flex items-center gap-3 p-3 border text-left transition-colors ${on ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}
          >
            <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${on ? "border-primary bg-primary" : "border-muted-foreground"}`}>
              {on && <span className="text-background text-xs font-bold">✓</span>}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium">{labels[zone]}</p>
              <p className="text-xs text-muted-foreground">${costs[zone].toLocaleString()}/visit</p>
            </div>
            {infoMap?.[zone] && (
              <span
                role="button"
                onClick={e => { e.stopPropagation(); setExtInfoZone(extInfoZone === zone ? null : zone); }}
                className="ml-auto flex-shrink-0 p-1 text-muted-foreground hover:text-primary transition-colors"
              >
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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* HEADER */}
      <section className="pt-32 pb-12 border-b border-border bg-card">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp} className="mb-6">
              <Link href="/subscription-portal">
                <button className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Facility Selection
                </button>
              </Link>
            </motion.div>
            {isMultiFamily && (
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-primary font-mono text-xs tracking-widest uppercase">Residential Autopilot Calculator</span>
              </motion.div>
            )}
            <motion.h1 variants={fadeInUp} className="text-3xl md:text-5xl font-bold tracking-tighter mb-2">
              Configure Your Plan.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted-foreground">
              Facility type: <strong className="text-foreground">{facilityLabel}</strong>
            </motion.p>
            {!isMultiFamily && (
              <motion.p variants={fadeInUp} className="text-xs text-muted-foreground mt-3 border border-border/40 bg-secondary/10 inline-flex items-start gap-2 px-4 py-2">
                <Info className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                Pricing assumes 10-ft ceiling height with a 3.5× floor-to-wall-surface multiplier. <strong className="text-foreground ml-1">Hub (full repaint) zones</strong> are priced at a higher rate than <strong className="text-foreground">touch-up zones</strong> (precision spot coating). Actual heights and sqft confirmed during your complimentary walk-through before any commitment.
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-5xl mx-auto space-y-6">

            {isMultiFamily ? (
              <>
                {/* ── STEP 1: Unit Mix ── */}
                {sectionCard("Unit Mix", "STEP 1", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Enter the count of each unit type and the average number of turns per month. Use the SQFT EACH column to override our defaults if you know your actual unit sizes. The Paintable Wall Surface auto-calculates using standard wall-to-floor ratios.
                    </p>
                    {/* Desktop */}
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr_1fr] gap-2 mb-2 px-1">
                        <div />
                        {colHdr("Units")}
                        {colHdr("Turns/Mo")}
                        {colHdr("SQFT Each", "enter or use default")}
                        {colHdr("Paintable Wall Surface", "auto-calculated")}
                      </div>
                      {Object.entries(unitMix).map(([type, row]) => {
                        const effSqFt = row.sqft > 0 ? row.sqft : UNIT_SQFT[type];
                        const wallSurface = Math.round(effSqFt * UNIT_WALL_RATIO[type]);
                        return (
                          <div key={type} className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr_1fr] gap-2 items-center mb-2">
                            <p className="text-sm font-medium text-foreground pl-1">{UNIT_LABELS[type]}</p>
                            {numInput(row.count, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], count: v } })))}
                            {numInput(row.turns, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], turns: v } })))}
                            {numInput(row.sqft, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], sqft: v } })), UNIT_SQFT[type].toString())}
                            <div className="h-10 bg-secondary/30 border border-border flex items-center justify-center">
                              <span className="text-xs font-mono text-muted-foreground">{row.turns > 0 ? `${wallSurface.toLocaleString()} sqft` : "—"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Mobile */}
                    <div className="sm:hidden space-y-3">
                      {Object.entries(unitMix).map(([type, row]) => {
                        const effSqFt = row.sqft > 0 ? row.sqft : UNIT_SQFT[type];
                        const wallSurface = Math.round(effSqFt * UNIT_WALL_RATIO[type]);
                        return (
                          <div key={type} className="border border-border bg-secondary/10 p-3">
                            <p className="text-sm font-bold mb-3">{UNIT_LABELS[type]}</p>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Units</p>
                                {numInput(row.count, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], count: v } })))}
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Turns/Mo</p>
                                {numInput(row.turns, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], turns: v } })))}
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">SQFT Each</p>
                                {numInput(row.sqft, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], sqft: v } })), UNIT_SQFT[type].toString())}
                              </div>
                            </div>
                            {row.turns > 0 && (
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Paintable Wall Surface</p>
                                <div className="h-8 bg-secondary/30 border border-border flex items-center justify-center">
                                  <span className="text-xs font-mono text-muted-foreground">{wallSurface.toLocaleString()} sqft ({UNIT_WALL_RATIO[type]}×)</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {Object.values(unitMix).some(r => r.turns > 0) && (
                      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 justify-end">
                        <span className="text-sm text-muted-foreground">
                          Total turns/mo: <strong className="text-foreground">{Object.values(unitMix).reduce((a, r) => a + r.turns, 0)}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* ── STEP 2: Res Touch-up Zones ── */}
                {sectionCard("Distributed Touch-up Zones", "STEP 2", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      These are the shared circulation areas in your building — corridors, stairwells, and elevator landings. We apply precision spot coating, scuff repair, and color matching. These zones are <strong className="text-foreground">not fully repainted</strong> — touch-ups restore appearance without a full coat. Enter quantity, floor count, and sqft per floor (or use our standard estimates).
                    </p>
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr] gap-3 mb-2 px-1">
                        <div />
                        {colHdr("Qty")}
                        {colHdr("Floors")}
                        {colHdr("SqFt / Floor", "or use estimate")}
                      </div>
                      {Object.entries(resDistZones).map(([zone, row]) => (
                        <div key={zone} className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr] gap-3 items-center mb-2">
                          <p className="text-sm font-medium text-foreground pl-1 leading-tight">{RES_DIST_LABELS[zone]}</p>
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
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">Qty</p>
                              {numInput(row.qty, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], qty: v } })))}
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">Floors</p>
                              {numInput(row.floors, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], floors: v } })))}
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">SqFt/Floor</p>
                              {numInput(row.sqft, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], sqft: v } })), RES_DIST_SQFT[zone].toString())}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* ── STEP 3: Singular Hubs ── */}
                {sectionCard("Singular Hubs (Full Repaint Zones)", "STEP 3", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Enter the quantity of each hub type. If you know the exact size, enter it — otherwise our standard estimate will be used for the calculation.</p>
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2fr_0.8fr_1fr] gap-3 mb-2 px-1">
                        <div />
                        {colHdr("Qty")}
                        {colHdr("SqFt ea.", "enter or use default")}
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
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">Qty</p>
                              {numInput(row.qty, v => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], qty: v } })))}
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">SqFt ea.</p>
                              {numInput(row.sqft, v => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], sqft: v } })), RES_HUB_SQFT[hub].toString())}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* ── STEP 4: Res Exterior ── */}
                {sectionCard("Exterior Paint & Cleaning Services", "STEP 4", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">Pressure / Soft Wash Services</p>
                    <p className="text-xs text-muted-foreground mb-4">Select the exterior zones included in your subscription. Wash frequency is determined by your selected tier.</p>
                    {extToggle(resExtZones, setResExtZones, EXT_ZONE_LABELS, EXT_ZONE_COST, EXT_ZONE_INFO)}
                    <div className="mt-5 border border-border/50 bg-secondary/10">
                      <button
                        type="button"
                        onClick={() => setPaintServicesOpen(o => !o)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/20 transition-colors"
                      >
                        <Info className="w-4 h-4 text-primary flex-shrink-0" />
                        <p className="text-xs font-bold text-foreground flex-grow">Paint / Coating Services (scoped separately)</p>
                        {paintServicesOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      {paintServicesOpen && (
                        <div className="px-4 pb-4 space-y-3">
                          {COMM_PAINT_SERVICES.map(svc => (
                            <div key={svc.key} className="flex items-start gap-2">
                              <div className="flex-grow">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-semibold text-foreground">{svc.label}</p>
                                  <InfoTip text={svc.info} />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Pricing scoped & quoted separately after walk-through.</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {/* ── COMMERCIAL STEP 1: Touch-up Zones ── */}
                {sectionCard("Distributed Touch-up Zones", "STEP 1", (
                  <div>
                    <div className="mb-4 p-3 border border-border/40 bg-secondary/10 flex gap-2">
                      <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{facilityConfig.touchUpDesc}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Enter quantity, floor count, and approximate square footage per floor for each zone. Pricing uses wall surface (floor sqft × 3.5×). Touch-up rates are lower than hub full-repaint rates — see pricing note above.</p>
                    {/* Desktop */}
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2.5fr_0.7fr_0.7fr_1fr_1fr] gap-2 mb-2 px-1">
                        <div />
                        {colHdr("Qty")}
                        {colHdr("Floors")}
                        {colHdr("SqFt / Floor", "your estimate")}
                        {colHdr("Wall SqFt", "×3.5 auto")}
                      </div>
                      {facilityConfig.touchUpZones.map(z => {
                        const row = commDist[z.key] ?? { qty: 0, floors: 1, sqft: 0 };
                        const wallSqFt = Math.round(row.qty * row.floors * row.sqft * COMM_WALL_MULTIPLIER);
                        return (
                          <div key={z.key} className="grid grid-cols-[2.5fr_0.7fr_0.7fr_1fr_1fr] gap-2 items-center mb-2">
                            <div className="flex items-center pl-1">
                              <p className="text-sm font-medium text-foreground leading-tight">{z.label}</p>
                              <InfoTip text={z.info} />
                            </div>
                            {numInput(row.qty, v => setCommDist(p => ({ ...p, [z.key]: { ...p[z.key], qty: v } })))}
                            {numInput(row.floors, v => setCommDist(p => ({ ...p, [z.key]: { ...p[z.key], floors: v } })))}
                            {numInput(row.sqft, v => setCommDist(p => ({ ...p, [z.key]: { ...p[z.key], sqft: v } })), z.defaultSqFt?.toString() ?? "sqft")}
                            <div className="h-10 bg-secondary/30 border border-border flex items-center justify-center">
                              <span className="text-xs font-mono text-muted-foreground">{wallSqFt > 0 ? `${wallSqFt.toLocaleString()}` : "—"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Mobile */}
                    <div className="sm:hidden space-y-3">
                      {facilityConfig.touchUpZones.map(z => {
                        const row = commDist[z.key] ?? { qty: 0, floors: 1, sqft: 0 };
                        const wallSqFt = Math.round(row.qty * row.floors * row.sqft * COMM_WALL_MULTIPLIER);
                        return (
                          <div key={z.key} className="border border-border bg-secondary/10 p-3">
                            <div className="flex items-center gap-1 mb-3">
                              <p className="text-sm font-bold">{z.label}</p>
                              <InfoTip text={z.info} />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Qty</p>
                                {numInput(row.qty, v => setCommDist(p => ({ ...p, [z.key]: { ...p[z.key], qty: v } })))}
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Floors</p>
                                {numInput(row.floors, v => setCommDist(p => ({ ...p, [z.key]: { ...p[z.key], floors: v } })))}
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">SqFt/Floor</p>
                                {numInput(row.sqft, v => setCommDist(p => ({ ...p, [z.key]: { ...p[z.key], sqft: v } })), z.defaultSqFt?.toString() ?? "sqft")}
                              </div>
                            </div>
                            {wallSqFt > 0 && (
                              <div className="h-8 bg-secondary/30 border border-border flex items-center justify-center">
                                <span className="text-xs font-mono text-muted-foreground">Wall sqft: {wallSqFt.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {Object.values(commDist).some(r => r.sqft > 0) && (
                      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 justify-end">
                        <span className="text-sm text-muted-foreground">
                          Total touch-up zone wall sqft: <strong className="text-foreground">{Math.round(Object.values(commDist).reduce((a, r) => a + r.qty * r.floors * r.sqft, 0) * COMM_WALL_MULTIPLIER).toLocaleString()}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* ── COMMERCIAL STEP 2: Hub Zones ── */}
                {sectionCard("Singular Hubs (Full Repaint Zones)", "STEP 2", (
                  <div>
                    <div className="mb-4 p-3 border border-border/40 bg-secondary/10 flex gap-2">
                      <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{facilityConfig.hubDesc}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Enter quantity and floor sqft for each hub. Wall surface = floor sqft × 3.5×. Full repaint rate applies — higher than touch-up zones.</p>
                    {/* Desktop */}
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2.5fr_0.7fr_1fr_1fr] gap-3 mb-2 px-1">
                        <div />
                        {colHdr("Qty")}
                        {colHdr("SqFt ea.", "floor sqft")}
                        {colHdr("Wall SqFt", "×3.5 auto")}
                      </div>
                      {facilityConfig.hubZones.map(z => {
                        const row = commHubs[z.key] ?? { qty: 0, sqft: 0 };
                        const wallSqFt = Math.round(row.qty * row.sqft * COMM_WALL_MULTIPLIER);
                        return (
                          <div key={z.key} className="grid grid-cols-[2.5fr_0.7fr_1fr_1fr] gap-3 items-center mb-2">
                            <div className="flex items-center pl-1">
                              <p className="text-sm font-medium text-foreground">{z.label}</p>
                              <InfoTip text={z.info} />
                            </div>
                            {numInput(row.qty, v => setCommHubs(p => ({ ...p, [z.key]: { ...p[z.key], qty: v } })))}
                            {numInput(row.sqft, v => setCommHubs(p => ({ ...p, [z.key]: { ...p[z.key], sqft: v } })), z.defaultSqFt?.toString() ?? "sqft")}
                            <div className="h-10 bg-primary/5 border border-primary/20 flex items-center justify-center">
                              <span className="text-xs font-mono text-primary">{wallSqFt > 0 ? `${wallSqFt.toLocaleString()}` : "—"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Mobile */}
                    <div className="sm:hidden space-y-3">
                      {facilityConfig.hubZones.map(z => {
                        const row = commHubs[z.key] ?? { qty: 0, sqft: 0 };
                        const wallSqFt = Math.round(row.qty * row.sqft * COMM_WALL_MULTIPLIER);
                        return (
                          <div key={z.key} className="border border-border bg-secondary/10 p-3">
                            <div className="flex items-center gap-1 mb-3">
                              <p className="text-sm font-bold">{z.label}</p>
                              <InfoTip text={z.info} />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Qty</p>
                                {numInput(row.qty, v => setCommHubs(p => ({ ...p, [z.key]: { ...p[z.key], qty: v } })))}
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">SqFt ea.</p>
                                {numInput(row.sqft, v => setCommHubs(p => ({ ...p, [z.key]: { ...p[z.key], sqft: v } })), z.defaultSqFt?.toString() ?? "sqft")}
                              </div>
                            </div>
                            {wallSqFt > 0 && (
                              <div className="h-8 bg-primary/5 border border-primary/20 flex items-center justify-center">
                                <span className="text-xs font-mono text-primary">Wall sqft: {wallSqFt.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {Object.values(commHubs).some(r => r.sqft > 0) && (
                      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 justify-end">
                        <span className="text-sm text-muted-foreground">
                          Total hub wall sqft: <strong className="text-primary">{Math.round(Object.values(commHubs).reduce((a, r) => a + r.qty * r.sqft, 0) * COMM_WALL_MULTIPLIER).toLocaleString()}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* ── COMMERCIAL STEP 3: Exterior ── */}
                {sectionCard("Exterior Paint & Cleaning Services", "STEP 3", (
                  <div>
                    {/* Sub-block A: Pressure/Soft Wash */}
                    <div className="mb-6">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Pressure / Soft Wash Services</p>
                      <p className="text-xs text-muted-foreground mb-3">Select the exterior wash zones to include. Wash frequency is determined by your selected tier.</p>
                      {extToggle(commExtZones, setCommExtZones, COMM_EXT_LABELS, COMM_EXT_COST, COMM_EXT_INFO)}
                    </div>

                    {/* Sub-block B: Paint/Coating Services */}
                    <div className="border border-border/50 bg-secondary/10">
                      <button
                        type="button"
                        onClick={() => setPaintServicesOpen(o => !o)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/20 transition-colors"
                      >
                        <Info className="w-4 h-4 text-primary flex-shrink-0" />
                        <p className="text-xs font-bold text-foreground flex-grow">Paint / Coating Services (scoped separately)</p>
                        {paintServicesOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      {paintServicesOpen && (
                        <div className="px-4 pb-4 space-y-3">
                          <p className="text-xs text-muted-foreground mb-3">These services are assessed and scoped during your complimentary walk-through. Pricing is quoted separately based on linear footage, stall counts, and design requirements.</p>
                          {COMM_PAINT_SERVICES.map(svc => (
                            <div key={svc.key} className="flex items-start gap-3 p-3 border border-border/40 bg-background">
                              <div className="flex-grow">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-semibold text-foreground">{svc.label}</p>
                                  <InfoTip text={svc.info} />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">Scoped & priced separately during walk-through.</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 p-4 border border-border/50 bg-secondary/10 flex gap-3">
                      <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground mb-1">Other areas requiring further scope:</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Roofs · Pedestrian walkways & sidewalks · Parking garages & lots · Windows & trim · Drive-thrus — assessed during your complimentary walk-through and quoted separately.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* TIER CARDS */}
      <section className="py-16 bg-card border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">Select Your Tier</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
              {isMultiFamily ? "4-Tier Residential Autopilot Plan" : "4-Tier Commercial Maintenance Plan"}
            </h2>
            {calc.onboarding > 0 && (
              <p className="text-muted-foreground text-sm mt-2">
                One-time onboarding fee: <strong className="text-foreground">{fmt(calc.onboarding)}</strong>
                <span className="text-muted-foreground ml-1">(1.5× Tier 2 base — restores all zones to PaintLab standards)</span>
              </p>
            )}
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid gap-px bg-border grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
          >
            {activeTiers.map((tier, i) => {
              const price = calc.tiers[i] ?? 0;
              const isSelected = selectedTier === tier.id;
              return (
                <motion.button
                  key={tier.id}
                  variants={fadeInUp}
                  type="button"
                  onClick={() => setSelectedTier(tier.id)}
                  className={`relative flex flex-col bg-card p-6 text-left transition-all hover:bg-primary/5 ${isSelected ? "ring-2 ring-inset ring-primary" : ""}`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-background text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-primary font-mono text-xs tracking-widest uppercase mb-1">{tier.sub}</p>
                    <h3 className="font-bold text-base leading-tight">{tier.label}</h3>
                    {price > 0 ? (
                      <div className="mt-3">
                        <span className="text-2xl font-bold">{fmt(price)}</span>
                        <span className="text-muted-foreground text-xs">/mo</span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs mt-3 italic">Fill in zone sizes above for a price estimate.</p>
                    )}
                  </div>
                  <ul className="space-y-2 mb-6 flex-grow">
                    {tier.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-px" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {"note" in tier && tier.note && (
                    <p className="text-[10px] text-muted-foreground italic mb-3 border-t border-border/50 pt-3">{(tier as any).note}</p>
                  )}
                  <div className={`mt-auto h-9 border text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors ${isSelected ? "bg-primary text-background border-primary" : "border-border text-muted-foreground"}`}>
                    {isSelected ? "✓ Selected" : "Select this tier"}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="mt-8 p-5 border border-border/60 bg-secondary/10">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Important:</strong> The PaintLab Subscription covers routine upkeep and precision touch-ups for touch-up zones, and full repaints for hub zones at the selected tier frequency. Large-surface color changes or specialty coatings will be scoped as separate incremental projects to ensure the highest quality results.
            </p>
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-primary font-mono text-xs tracking-widest uppercase">Get Your Proposal</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Fill this form to get your proposal.</h2>
              <p className="text-muted-foreground mt-2">We'll send your full configuration summary and schedule a complimentary walkthrough to finalize scope and investment.</p>
            </motion.div>

            {submitted ? (
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="border border-primary bg-primary/5 p-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Your email is ready.</h3>
                <p className="text-muted-foreground">Your email client should have opened with the full breakdown for hello@paintlabpro.com. You can also call or text us directly below.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-primary hover:underline">Edit & re-send</button>
              </motion.div>
            ) : (
              <motion.form initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Your Name", placeholder: "Jane Smith" },
                    { key: "propertyName", label: "Property Name", placeholder: "Riverside Apartments" },
                    { key: "address", label: "Property Address", placeholder: "123 Main St, Austin, TX 78701" },
                    { key: "phone", label: "Phone Number", placeholder: "(512) 000-0000" },
                  ].map(f => (
                    <motion.div key={f.key} variants={fadeInUp} className={f.key === "address" ? "md:col-span-2" : ""}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">{f.label}</label>
                      <input
                        required
                        type={f.key === "phone" ? "tel" : "text"}
                        inputMode={f.key === "phone" ? "tel" : undefined}
                        value={(formData as any)[f.key]}
                        onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full h-12 bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                      />
                    </motion.div>
                  ))}
                  <motion.div variants={fadeInUp} className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">Email Address</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      placeholder="jane@property.com"
                      className="w-full h-12 bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </motion.div>
                </div>

                {selectedTier && (
                  <motion.div variants={fadeInUp} className="flex items-center gap-3 p-4 border border-primary/30 bg-primary/5">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-sm">
                      <strong className="text-foreground">Selected:</strong>{" "}
                      {activeTiers.find(t => t.id === selectedTier)?.label} — {fmt(calc.tiers[activeTiers.findIndex(t => t.id === selectedTier)] ?? 0)}/mo
                    </p>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    variants={fadeInUp}
                    type="submit"
                    className="flex-1 h-14 bg-primary text-background font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Full Breakdown to PaintLab
                  </motion.button>
                  <motion.button
                    variants={fadeInUp}
                    type="button"
                    onClick={saveDraft}
                    className="h-14 px-6 border border-border text-foreground font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors"
                  >
                    {draftSaved ? <CheckCircle2 className="w-4 h-4 text-primary" /> : null}
                    {draftSaved ? "Draft Saved!" : "Save Draft"}
                  </motion.button>
                </div>
              </motion.form>
            )}

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <motion.a
                variants={fadeInUp}
                href="tel:+15124843124"
                className="flex items-center justify-center gap-3 h-16 border-[3px] border-black bg-primary text-black hover:bg-primary/90 transition-colors"
                style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem", boxShadow: "4px 4px 0px #000000" }}
              >
                <Phone className="w-5 h-5 flex-shrink-0" />
                CALL PAINTLAB
              </motion.a>
              <motion.a
                variants={fadeInUp}
                href={`sms:+15124843124?body=${smsBody}`}
                className="flex items-center justify-center gap-3 h-16 border-[3px] border-black bg-primary text-black hover:bg-primary/90 transition-colors"
                style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem", boxShadow: "4px 4px 0px #000000" }}
              >
                <MessageSquare className="w-5 h-5 flex-shrink-0" />
                TEXT PAINTLAB
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
