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
  corridors: 1000, stairwells: 200, elevatorLandings: 75, wasteRooms: 55, publicDoors: 25,
};
const RES_DIST_LABELS: Record<string, string> = {
  corridors: "Residential Corridors",
  stairwells: "Stairwells",
  elevatorLandings: "Elevator Landings",
  wasteRooms: "Garbage / Waste Rooms",
  publicDoors: "Public Entry / Exit Doors",
};
const RES_DIST_INFO: Record<string, string> = {
  corridors: "Shared hallways serving resident units on each floor. Enter the total floor sqft of all corridor area on a typical floor. Typically 6–8 ft wide — measure total hallway length × width.",
  stairwells: "Interior stairwells including stair walls, landing walls, and soffits. Enter the footprint sqft of the stair shaft per landing; the 3.5× multiplier captures the full vertical wall surface.",
  elevatorLandings: "Vestibule areas in front of elevator doors on each floor. Typically 8–12 ft wide × 10–15 ft deep. Enter floor sqft per landing.",
  wasteRooms: "Dedicated garbage, recycling, and waste rooms located on each floor. High-moisture, high-contact surfaces require scrubbable finishes. Enter floor sqft per room.",
  publicDoors: "Non-stairwell public entry and exit doors in corridors and common areas — door frames, surrounds, and adjacent wall panels. Enter the count of door openings as QTY and approximate sqft of the door + surround area per unit.",
};
const RES_HUB_SQFT: Record<string, number> = {
  mainLobby: 2500, mailroom: 750, coworking: 1750, gym: 2000,
  bathrooms: 750, leasingOffice: 1500, packageRoom: 400,
};
const RES_HUB_LABELS: Record<string, string> = {
  mainLobby: "Main Lobby", mailroom: "Mailroom", coworking: "Co-working Space",
  gym: "Gym Area", bathrooms: "Public Bathrooms", leasingOffice: "Leasing Office", packageRoom: "Package Room",
};
const TU_SURFACE_RATIO = 0.25;

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

// ─── Pricing Engine ─────────────────────────────────────────────────────────
const BASE_RATES: Record<string, number> = {
  multifamily: 1.00,
  office: 1.15,
  medical: 1.30,
  retail: 1.25,
  industrial: 0.90,
  automotive: 1.20,
  education: 1.10,
  "gyms-fitness": 1.20,
};

const MIN_JOB_SQFT = 2500;

// Maps URL facility param → BASE_RATES key
const FACILITY_RATE_KEY: Record<string, string> = {
  "multi-family":    "multifamily",
  "office-corporate": "office",
  medical:           "medical",
  retail:            "retail",
  industrial:        "industrial",
  automotive:        "automotive",
  education:         "education",
  "gyms-fitness":    "gyms-fitness",
};

interface ComplexityInputs {
  occupancy?: "occupied" | "vacant";
  height?: "standard" | "high";
  access?: "normal" | "tight";
  schedule?: "standard" | "after_hours";
}

function getAdjustedRate(
  baseRate: number,
  inputs: ComplexityInputs,
  paintableSqFt: number,
): number {
  let multiplier = 1.0;
  if (inputs.occupancy === "occupied")    multiplier += 0.15;
  if (inputs.height    === "high")        multiplier += 0.20;
  if (inputs.access    === "tight")       multiplier += 0.15;
  if (inputs.schedule  === "after_hours") multiplier += 0.25;

  let adjusted = baseRate * multiplier;

  // Margin protection — small-job surcharge
  if (paintableSqFt < MIN_JOB_SQFT) adjusted *= 1.25;

  return adjusted;
}

// ─── Commercial Simplification Layer ────────────────────────────────────────
const CONDITION_FACTORS: Record<string, number> = {
  light:    0.30,
  moderate: 0.45,
  heavy:    0.60,
};

function calculateCommercialMaintenance(sf: number, condition: string): number {
  const factor = CONDITION_FACTORS[condition] ?? 0.45;
  return sf * 3.5 * factor; // paintable sqft for one maintenance cycle
}

// ─── MF Turn Engine ──────────────────────────────────────────────────────────
interface MFUnit {
  count: number;
  avgSqFt: number;
  turnRate: number;       // % of units turning per month
  repaintPercent: number; // % of those turns that are full repaints
}

function calculateMultifamilyMonthlyPSSF(units: MFUnit[]): number {
  let totalMonthlyPSSF = 0;
  units.forEach(unit => {
    const { count, avgSqFt, turnRate, repaintPercent } = unit;
    const monthlyTurns   = count * (turnRate / 100);
    const repaintUnits   = monthlyTurns * (repaintPercent / 100);
    const touchupUnits   = monthlyTurns - repaintUnits;
    const pssf           = avgSqFt * 3.5;          // paintable wall sqft per unit
    const repaintPSSF    = repaintUnits * pssf;
    const touchupPSSF    = touchupUnits * pssf * 0.5; // touch-up covers 50% of surface
    totalMonthlyPSSF    += repaintPSSF + touchupPSSF;
  });
  return totalMonthlyPSSF;
}

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
      { key: "conferenceRooms", label: "Conference Rooms", info: "All meeting and conference rooms. Full repaint at each cycle. Enter combined floor sqft.", defaultSqFt: 600 },
      { key: "breakRooms", label: "Break Rooms", info: "Employee break rooms and kitchens. Scrubbable finishes required. Enter combined floor sqft.", defaultSqFt: 400 },
      { key: "bathrooms", label: "Restrooms", info: "All restroom facilities. Moisture-resistant finishes. Enter combined floor sqft.", defaultSqFt: 300 },
    ],
  },
};

// ─── State Interfaces ────────────────────────────────────────────────────────
interface UnitRow { count: number; turns: number; sqft: number; repaintPct: number; }
interface ResDistRow { qty: number; floors: number; sqft: number; service: "repaint" | "touch-up"; }
interface ResHubRow { qty: number; sqft: number; service: "repaint" | "touch-up"; }

// ─── Default State Factories ──────────────────────────────────────────────────
const defaultUnitMix = (): Record<string, UnitRow> => ({
  studio: { count: 0, turns: 0, sqft: 0, repaintPct: 100 },
  oneBD:  { count: 0, turns: 0, sqft: 0, repaintPct: 100 },
  twoBD:  { count: 0, turns: 0, sqft: 0, repaintPct: 100 },
  threeBD: { count: 0, turns: 0, sqft: 0, repaintPct: 100 },
  fourBD:  { count: 0, turns: 0, sqft: 0, repaintPct: 100 },
});
const defaultResDistZones = (): Record<string, ResDistRow> => ({
  corridors:       { qty: 0, floors: 1, sqft: 0, service: "touch-up" },
  stairwells:      { qty: 0, floors: 1, sqft: 0, service: "touch-up" },
  elevatorLandings:{ qty: 0, floors: 1, sqft: 0, service: "touch-up" },
  wasteRooms:      { qty: 0, floors: 1, sqft: 0, service: "touch-up" },
  publicDoors:     { qty: 0, floors: 1, sqft: 0, service: "touch-up" },
});
const defaultSingularHubs = (): Record<string, ResHubRow> => ({
  mainLobby:    { qty: 0, sqft: 0, service: "repaint" },
  mailroom:     { qty: 0, sqft: 0, service: "touch-up" },
  coworking:    { qty: 0, sqft: 0, service: "repaint" },
  gym:          { qty: 0, sqft: 0, service: "repaint" },
  bathrooms:    { qty: 0, sqft: 0, service: "repaint" },
  leasingOffice:{ qty: 0, sqft: 0, service: "repaint" },
  packageRoom:  { qty: 0, sqft: 0, service: "touch-up" },
});
const defaultResExtZones = (): Record<string, boolean> => ({
  mainFacade: false, floorSurface: false, poolDeck: false,
  doorway: false, garbageArea: false, garageEntrance: false, buildingCladding: false,
});
const defaultCommExtZones = (): Record<string, boolean> => ({
  commFacade: false, commEntranceFloor: false, commDumpsterPad: false,
  commEntries: false, commGarage: false, commCladding: false,
});

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

  const [extInfoZone, setExtInfoZone] = useState<string | null>(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [paintServicesOpen, setPaintServicesOpen] = useState(false);

  const [unitMix, setUnitMix] = useState(defaultUnitMix);
  const [resDistZones, setResDistZones] = useState(defaultResDistZones);
  const [singularHubs, setSingularHubs] = useState(defaultSingularHubs);
  const [resExtZones, setResExtZones] = useState(defaultResExtZones);
  const [commTotalSqFt, setCommTotalSqFt] = useState(0);
  const [commCondition, setCommCondition] = useState<"light" | "moderate" | "heavy">("moderate");
  const [commExtZones, setCommExtZones] = useState(defaultCommExtZones);
  const [paintInterest, setPaintInterest] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COMM_PAINT_SERVICES.map(s => [s.key, false]))
  );
  const [annualUpfront, setAnnualUpfront] = useState({ t1: false, t2: false, t3: false });
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [optionalExpanded, setOptionalExpanded] = useState(false);
  const [formData, setFormData] = useState({ name: "", propertyName: "", address: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // ─── MF zone/step data presence ───────────────────────────────────────────
  const hasMFZoneData = useMemo(() => (
    Object.values(resDistZones).some(r => r.qty > 0) ||
    Object.values(singularHubs).some(r => r.qty > 0) ||
    Object.values(resExtZones).some(on => on)
  ), [resDistZones, singularHubs, resExtZones]);

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
      // ── MF Turn Engine ────────────────────────────────────────────────────
      // Map existing unitMix rows → MFUnit[].
      // UI `turns` = monthly turn count; turnRate % = (turns / count) × 100,
      // which collapses back to monthlyTurns = row.turns inside the function.
      const mfUnits: MFUnit[] = Object.entries(unitMix)
        .filter(([, row]) => row.count > 0)
        .map(([type, row]) => ({
          count:          row.count,
          avgSqFt:        row.sqft > 0 ? row.sqft : (UNIT_SQFT[type] ?? 0),
          turnRate:       row.count > 0 ? (row.turns / row.count) * 100 : 0,
          repaintPercent: row.repaintPct ?? 100,
        }));

      const totalMonthlyPSSF = calculateMultifamilyMonthlyPSSF(mfUnits);
      const mfBaseRate       = BASE_RATES["multifamily"]; // $1.00/paintable sqft
      const mfAdjRate        = getAdjustedRate(mfBaseRate, {}, totalMonthlyPSSF);
      const interiorMonthly  = totalMonthlyPSSF * mfAdjRate;
      const zoneCostPerYear = (repaintRate: number, tuRate: number) => {
        const distCost = Object.entries(resDistZones).reduce((acc, [zone, row]) => {
          const eff = row.sqft > 0 ? row.sqft : (RES_DIST_SQFT[zone] ?? 0);
          const wall = row.qty * row.floors * eff * 3.5;
          return acc + (row.service === "repaint" ? wall * repaintRate : wall * TU_SURFACE_RATIO * tuRate);
        }, 0);
        const hubCost = Object.entries(singularHubs).reduce((acc, [hub, row]) => {
          const eff = row.sqft > 0 ? row.sqft : (RES_HUB_SQFT[hub] ?? 0);
          const wall = row.qty * eff * 3.5;
          return acc + (row.service === "repaint" ? wall * repaintRate : wall * TU_SURFACE_RATIO * tuRate);
        }, 0);
        return distCost + hubCost;
      };
      const extCostPerVisit = Object.entries(resExtZones)
        .filter(([zone, on]) => on && !SCOPED_EXT_ZONES.has(zone))
        .reduce((acc, [zone]) => acc + (EXT_ZONE_COST[zone] ?? 0), 0);
      const t1 = Math.round(interiorMonthly);
      const t2 = Math.round(interiorMonthly * 1.17 + zoneCostPerYear(0.10, 0.05) / 12 + extCostPerVisit / 12);
      const t3 = Math.round(interiorMonthly * 1.33 + zoneCostPerYear(0.13, 0.07) * 4 / 12 + extCostPerVisit * 4 / 12);
      const t4 = Math.round(interiorMonthly * 1.67 + zoneCostPerYear(0.18, 0.10) * 12 / 12 + extCostPerVisit);
      return { tiers: [t1, t2, t3, t4], tiersRaw: [t1, t2, t3, t4], onboarding: 250 };
    } else {
      // ── Commercial Simplification Layer ────────────────────────────────────
      const rateKey     = FACILITY_RATE_KEY[facilityParam] ?? "office";
      const baseRate    = BASE_RATES[rateKey] ?? 1.0;
      const paintableSqFt = calculateCommercialMaintenance(commTotalSqFt, commCondition);
      // Complexity inputs wired in a future phase (UI toggles)
      const adjRate     = getAdjustedRate(baseRate, {}, paintableSqFt);
      // Cost per service visit
      const visitCost   = paintableSqFt * adjRate;

      const extCost = Object.entries(commExtZones)
        .filter(([zone, on]) => on && !SCOPED_EXT_ZONES.has(zone))
        .reduce((acc, [zone]) => acc + (COMM_EXT_COST[zone] ?? 0), 0);

      // Monthly subscription = annualised visit cost ÷ 12
      const r1 = Math.round(visitCost * 1 / 12 + extCost * 1 / 12); // 1 visit/yr
      const r2 = Math.round(visitCost * 2 / 12 + extCost * 2 / 12); // 2 visits/yr
      const r3 = Math.round(visitCost * 4 / 12 + extCost * 4 / 12); // 4 visits/yr
      const t2 = Math.round(r2 * 0.98);
      const t3 = Math.round(r3 * 0.97);
      return { tiers: [r1, t2, t3], tiersRaw: [r1, r2, r3], onboarding: 250 };
    }
  }, [unitMix, resDistZones, singularHubs, resExtZones, commTotalSqFt, commCondition, commExtZones, isMultiFamily, facilityParam]);

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
    { id: "essential", tierNum: "Tier 1", label: "Essential", sub: "Unit Turns Only",
      features: ["Full unit turn repaints or touch-ups based on your selection", "Consistent color system applied", "2-year workmanship guarantee"] },
    { id: "asset-shield-annual", tierNum: "Tier 2", label: "Asset Shield", sub: "Annual Cycle",
      features: ["Everything in Tier 1 (unit turns)", "Annual repaint or touch-ups of selected zones", "Annual exterior paint & cleaning services selected"] },
    { id: "asset-shield-quarterly", tierNum: "Tier 3", label: "Asset Shield Plus", sub: "Quarterly Cycle", popular: true,
      features: ["Everything in Tier 1 (unit turns)", "Quarterly repaint or touch-ups of selected zones", "Quarterly exterior paint & cleaning services selected"] },
    { id: "signature-monthly", tierNum: "Tier 4", label: "Signature", sub: "Monthly Full Cycle",
      features: ["Everything in Tier 3", "Monthly proactive patrol walkthroughs and touch-ups in public areas", "Priority 48-hr dispatch", "Monthly condition reporting dashboard"] },
  ];

  const commTiers = [
    { id: "annual-shield", tierNum: "Tier 1", label: "Annual Shield", sub: "1 Service Visit/Year",
      features: ["Annual repaint of selected zones", "Annual precision touch-ups of selected zones", "Annual exterior paint & cleaning services selected", "Pay monthly or save 2% with annual upfront"] },
    { id: "biannual-shield", tierNum: "Tier 2", label: "Bi-Annual Shield", sub: "2 Service Visits/Year", popular: true,
      features: ["Bi-annual repaint of selected zones", "Spring + fall precision touch-ups of selected zones", "Bi-annual exterior paint & cleaning services selected", "Priority scheduling"] },
    { id: "quarterly-guard", tierNum: "Tier 3", label: "Quarterly Guard", sub: "4 Service Visits/Year",
      features: ["Quarterly repaint of selected zones", "Quarterly precision touch-up painting", "Quarterly exterior paint & cleaning services selected", "Priority scheduling"] },
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
      `\nONBOARDING FEE: $250 (one-time account management setup)`,
      `\n────────────────────────`,
    ].filter(Boolean);
    if (isMultiFamily) {
      lines.push(`\nUNIT TURNS:`);
      Object.entries(unitMix).forEach(([type, row]) => {
        if (row.turns > 0) { const eff = row.sqft > 0 ? row.sqft : UNIT_SQFT[type]; lines.push(`  ${UNIT_LABELS[type]}: ${row.turns}/mo × ${eff} sqft`); }
      });
    } else {
      const paintableSqFt = Math.round(calculateCommercialMaintenance(commTotalSqFt, commCondition));
      lines.push(`\nFACILITY SIZE: ${commTotalSqFt.toLocaleString()} sqft`);
      lines.push(`WEAR CONDITION: ${commCondition.charAt(0).toUpperCase() + commCondition.slice(1)} (${Math.round((CONDITION_FACTORS[commCondition] ?? 0.45) * 100)}% factor)`);
      lines.push(`PAINTABLE SURFACE / VISIT: ${paintableSqFt.toLocaleString()} sqft`);
      lines.push(`NOTE: Full Repaint / specialty coatings scoped separately at walk-through.`);
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
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-border bg-secondary/20">
        <div className="bg-primary px-3 py-1.5 flex-shrink-0">
          <span className="text-background font-black text-sm tracking-widest uppercase leading-none">{step}</span>
        </div>
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
            <motion.p variants={fadeInUp} className="text-muted-foreground">Facility type: <strong className="text-primary">{facilityLabel}</strong></motion.p>
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
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Enter the count of each unit type, average turns per month, and the average percentage of turns that require a <strong className="text-foreground">full repaint</strong> vs. touch-up only. Override sqft for your actual unit sizes.</p>
                    {/* Desktop */}
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2fr_0.7fr_0.7fr_0.9fr_1fr_1fr] gap-2 mb-2 px-1">
                        <div />{colHdr("Units")}{colHdr("Turns/Mo")}{colHdr("% Full Repaint", "vs touch-up")}{colHdr("SQFT EACH", "enter or use default")}{colHdr("Wall Surface", "auto-calc")}
                      </div>
                      {Object.entries(unitMix).map(([type, row]) => {
                        const eff = row.sqft > 0 ? row.sqft : UNIT_SQFT[type];
                        const wall = Math.round(eff * UNIT_WALL_RATIO[type]);
                        return (
                          <div key={type} className="grid grid-cols-[2fr_0.7fr_0.7fr_0.9fr_1fr_1fr] gap-2 items-center mb-2">
                            <p className="text-sm font-medium text-foreground pl-1">{UNIT_LABELS[type]}</p>
                            {numInput(row.count, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], count: v } })))}
                            {numInput(row.turns, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], turns: v } })))}
                            <div className="relative h-10 flex items-center">
                              <input type="number" inputMode="numeric" min={0} max={100}
                                value={row.repaintPct === 0 ? "" : row.repaintPct}
                                placeholder="100"
                                onChange={e => setUnitMix(p => ({ ...p, [type]: { ...p[type], repaintPct: Math.min(100, Math.max(0, Number(e.target.value) || 0)) } }))}
                                className="w-full h-10 bg-background border border-border text-center text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors pr-5" />
                              <span className="absolute right-2 text-xs text-muted-foreground pointer-events-none">%</span>
                            </div>
                            {numInput(row.sqft, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], sqft: v } })), UNIT_SQFT[type].toString())}
                            <div className="h-10 bg-secondary/30 border border-border flex items-center justify-center">
                              <span className="text-xs font-mono text-muted-foreground">{row.turns > 0 ? `${wall.toLocaleString()} sqft` : "—"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Mobile */}
                    <div className="sm:hidden space-y-3">
                      {Object.entries(unitMix).map(([type, row]) => {
                        const eff = row.sqft > 0 ? row.sqft : UNIT_SQFT[type];
                        const wall = Math.round(eff * UNIT_WALL_RATIO[type]);
                        return (
                          <div key={type} className="border border-border bg-secondary/10 p-3">
                            <p className="text-sm font-bold mb-3">{UNIT_LABELS[type]}</p>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div><p className="text-[10px] text-muted-foreground mb-1">Units</p>{numInput(row.count, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], count: v } })))}</div>
                              <div><p className="text-[10px] text-muted-foreground mb-1">Turns/Mo</p>{numInput(row.turns, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], turns: v } })))}</div>
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">% Full Repaint</p>
                                <div className="relative">
                                  <input type="number" inputMode="numeric" min={0} max={100}
                                    value={row.repaintPct === 0 ? "" : row.repaintPct} placeholder="100"
                                    onChange={e => setUnitMix(p => ({ ...p, [type]: { ...p[type], repaintPct: Math.min(100, Math.max(0, Number(e.target.value) || 0)) } }))}
                                    className="w-full h-10 bg-background border border-border text-center text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors pr-5" />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
                                </div>
                              </div>
                              <div><p className="text-[10px] text-muted-foreground mb-1">SQFT Each</p>{numInput(row.sqft, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], sqft: v } })), UNIT_SQFT[type].toString())}</div>
                            </div>
                            {row.turns > 0 && <div className="h-8 bg-secondary/30 border border-border flex items-center justify-center"><span className="text-xs font-mono text-muted-foreground">{wall.toLocaleString()} wall sqft</span></div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* ── MF STEP 2: Select Paint Zones (OPTIONAL) ── */}
                {sectionCard(
                  <>Select <span className="text-primary">Paint Zones</span></>,
                  "STEP 2",
                  (
                    <div>
                      {/* Expanded OPTIONAL details — only visible when expanded */}
                      {optionalExpanded && (
                        <div className="mb-5 p-3 border border-primary/30 bg-primary/5 text-xs text-muted-foreground leading-relaxed">
                          Corridors, stairwells, amenity spaces, and building exterior. It is completely optional. <strong className="text-foreground">Tier 1 always covers unit turns</strong> regardless of what you select here. Tiers 2–4 become available once you select at least one zone below.
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Enter the quantity of each zone type and select <strong className="text-foreground">Full Repaint</strong> or <strong className="text-foreground">Touch-Up</strong> per zone. Repaints receive a complete two-coat repaint and drywall patches at each service cycle. Touch-ups restore appearance with precision spot coating, scuff repair, and color matching.</p>

                      {/* Service legend — redesigned compact inline */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5 px-3 py-2.5 border border-border/50 bg-secondary/20 rounded-sm">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex-shrink-0">Legend:</span>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-primary flex-shrink-0 inline-block" />
                          <span className="text-xs font-semibold text-foreground">Full Repaint</span>
                          <span className="text-[10px] text-muted-foreground">100% wall surface, higher rate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-secondary border border-border flex-shrink-0 inline-block" />
                          <span className="text-xs font-semibold text-foreground">Touch-Up</span>
                          <span className="text-[10px] text-muted-foreground">~25% of wall surface, lower rate</span>
                        </div>
                      </div>

                      {/* Multi-Floor Common Areas header block */}
                      <div className="flex items-center gap-0 mb-3">
                        <div className="inline-flex items-center gap-2 bg-primary/15 border-l-[3px] border-primary pl-3 pr-4 py-2">
                          <span className="text-xs font-black text-primary uppercase tracking-widest">Multi-Floor Common Areas</span>
                        </div>
                      </div>

                      {/* Desktop multi-floor */}
                      <div className="hidden sm:block mb-1">
                        <div className="grid grid-cols-[2.2fr_0.7fr_0.7fr_1fr_1fr_1.1fr] gap-2 mb-2 px-1">
                          <div />{colHdr("QTY", "per floor")}{colHdr("Floors")}{colHdr("SQFT EACH", "avg floor sqft")}{colHdr("Wall Surface", "×3.5 auto")}{colHdr("Service")}
                        </div>
                        {Object.entries(resDistZones).map(([zone, row]) => {
                          const eff = row.sqft > 0 ? row.sqft : (RES_DIST_SQFT[zone] ?? 0);
                          const totalWall = row.qty * row.floors * eff * 3.5;
                          const effectiveWall = row.service === "repaint" ? totalWall : totalWall * TU_SURFACE_RATIO;
                          return (
                            <div key={zone} className="grid grid-cols-[2.2fr_0.7fr_0.7fr_1fr_1fr_1.1fr] gap-2 items-center mb-2">
                              <div className="flex items-center pl-1">
                                <p className="text-sm font-medium text-foreground leading-tight">{RES_DIST_LABELS[zone]}</p>
                                <InfoTip text={RES_DIST_INFO[zone] ?? ""} />
                              </div>
                              {numInput(row.qty, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], qty: v } })))}
                              {numInput(row.floors, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], floors: v } })))}
                              {numInput(row.sqft, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], sqft: v } })), RES_DIST_SQFT[zone].toString())}
                              <div className={`h-10 border flex items-center justify-center ${row.service === "repaint" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border"}`}>
                                <span className={`text-xs font-mono ${row.service === "repaint" ? "text-primary" : "text-muted-foreground"}`}>{effectiveWall > 0 ? Math.round(effectiveWall).toLocaleString() : "—"}</span>
                              </div>
                              <button type="button" onClick={() => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], service: p[zone].service === "repaint" ? "touch-up" : "repaint" } }))}
                                className={`h-10 border text-[10px] font-bold uppercase tracking-wider transition-colors ${row.service === "repaint" ? "bg-primary text-background border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/50"}`}>
                                {row.service === "repaint" ? "Full Repaint" : "Touch-Up"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      {/* Mobile multi-floor */}
                      <div className="sm:hidden space-y-3 mb-1">
                        {Object.entries(resDistZones).map(([zone, row]) => {
                          const eff = row.sqft > 0 ? row.sqft : (RES_DIST_SQFT[zone] ?? 0);
                          const totalWall = row.qty * row.floors * eff * 3.5;
                          const effectiveWall = row.service === "repaint" ? totalWall : totalWall * TU_SURFACE_RATIO;
                          return (
                            <div key={zone} className={`border p-3 ${row.service === "repaint" ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/10"}`}>
                              <div className="flex items-center gap-1 mb-3">
                                <p className="text-sm font-bold flex-grow">{RES_DIST_LABELS[zone]}</p>
                                <InfoTip text={RES_DIST_INFO[zone] ?? ""} />
                              </div>
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                <div><p className="text-[10px] text-muted-foreground mb-1">QTY/floor</p>{numInput(row.qty, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], qty: v } })))}</div>
                                <div><p className="text-[10px] text-muted-foreground mb-1">Floors</p>{numInput(row.floors, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], floors: v } })))}</div>
                                <div><p className="text-[10px] text-muted-foreground mb-1">SQFT each</p>{numInput(row.sqft, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], sqft: v } })), RES_DIST_SQFT[zone].toString())}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], service: p[zone].service === "repaint" ? "touch-up" : "repaint" } }))}
                                  className={`flex-1 h-9 border text-[10px] font-bold uppercase tracking-wider transition-colors ${row.service === "repaint" ? "bg-primary text-background border-primary" : "bg-background text-muted-foreground border-border"}`}>
                                  {row.service === "repaint" ? "Full Repaint" : "Touch-Up"}
                                </button>
                                {effectiveWall > 0 && <span className="text-[10px] text-muted-foreground">{Math.round(effectiveWall).toLocaleString()} wall sqft</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Amenity section header block */}
                      <div className="flex items-center gap-0 mt-6 mb-3">
                        <div className="inline-flex items-center gap-2 bg-primary/15 border-l-[3px] border-primary pl-3 pr-4 py-2">
                          <span className="text-xs font-black text-primary uppercase tracking-widest">Main Floor Shared Amenity Areas</span>
                        </div>
                      </div>

                      {/* Desktop hubs */}
                      <div className="hidden sm:block">
                        <div className="grid grid-cols-[2.2fr_0.9fr_1fr_1fr_1.1fr] gap-2 mb-2 px-1">
                          <div />{colHdr("Qty")}{colHdr("SQFT EACH", "enter or use default")}{colHdr("Wall Surface", "×3.5 auto")}{colHdr("Service")}
                        </div>
                        {Object.entries(singularHubs).map(([hub, row]) => {
                          const eff = row.sqft > 0 ? row.sqft : (RES_HUB_SQFT[hub] ?? 0);
                          const totalWall = row.qty * eff * 3.5;
                          const effectiveWall = row.service === "repaint" ? totalWall : totalWall * TU_SURFACE_RATIO;
                          return (
                            <div key={hub} className="grid grid-cols-[2.2fr_0.9fr_1fr_1fr_1.1fr] gap-2 items-center mb-2">
                              <p className="text-sm font-medium text-foreground pl-1">{RES_HUB_LABELS[hub]}</p>
                              {numInput(row.qty, v => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], qty: v } })))}
                              {numInput(row.sqft, v => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], sqft: v } })), RES_HUB_SQFT[hub].toString())}
                              <div className={`h-10 border flex items-center justify-center ${row.service === "repaint" ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border"}`}>
                                <span className={`text-xs font-mono ${row.service === "repaint" ? "text-primary" : "text-muted-foreground"}`}>{effectiveWall > 0 ? Math.round(effectiveWall).toLocaleString() : "—"}</span>
                              </div>
                              <button type="button" onClick={() => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], service: p[hub].service === "repaint" ? "touch-up" : "repaint" } }))}
                                className={`h-10 border text-[10px] font-bold uppercase tracking-wider transition-colors ${row.service === "repaint" ? "bg-primary text-background border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/50"}`}>
                                {row.service === "repaint" ? "Full Repaint" : "Touch-Up"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      {/* Mobile hubs */}
                      <div className="sm:hidden space-y-3">
                        {Object.entries(singularHubs).map(([hub, row]) => {
                          const eff = row.sqft > 0 ? row.sqft : (RES_HUB_SQFT[hub] ?? 0);
                          const totalWall = row.qty * eff * 3.5;
                          const effectiveWall = row.service === "repaint" ? totalWall : totalWall * TU_SURFACE_RATIO;
                          return (
                            <div key={hub} className={`border p-3 ${row.service === "repaint" ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/10"}`}>
                              <p className="text-sm font-bold mb-3">{RES_HUB_LABELS[hub]}</p>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div><p className="text-[10px] text-muted-foreground mb-1">Qty</p>{numInput(row.qty, v => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], qty: v } })))}</div>
                                <div><p className="text-[10px] text-muted-foreground mb-1">SQFT each</p>{numInput(row.sqft, v => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], sqft: v } })), RES_HUB_SQFT[hub].toString())}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setSingularHubs(p => ({ ...p, [hub]: { ...p[hub], service: p[hub].service === "repaint" ? "touch-up" : "repaint" } }))}
                                  className={`flex-1 h-9 border text-[10px] font-bold uppercase tracking-wider transition-colors ${row.service === "repaint" ? "bg-primary text-background border-primary" : "bg-background text-muted-foreground border-border"}`}>
                                  {row.service === "repaint" ? "Full Repaint" : "Touch-Up"}
                                </button>
                                {effectiveWall > 0 && <span className="text-[10px] text-muted-foreground">{Math.round(effectiveWall).toLocaleString()} wall sqft</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
                  <div className="flex items-center gap-2 border-2 border-primary/40 bg-primary/5 px-3 py-1.5 flex-shrink-0">
                    <div className="flex-shrink-0 bg-primary text-background text-[9px] font-black uppercase tracking-widest px-2 py-0.5">OPTIONAL</div>
                    <p className="text-xs text-foreground font-medium leading-snug hidden sm:block">
                      This step covers your building's <span className="text-primary">shared public areas only</span>
                    </p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOptionalExpanded(o => !o); }}
                      className="flex-shrink-0 text-primary hover:text-primary/70 transition-colors">
                      {optionalExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {/* ── MF STEP 3: Paint & Cleaning Services ── */}
                {sectionCard("Select Paint & Cleaning Services", "STEP 3", (
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
                {/* ── COMM STEP 1: Select Paint Zones ── */}
                {sectionCard(<>Facility <span className="text-primary">Size & Condition</span></>, "STEP 1", (
                  <div className="space-y-6">
                    {/* Total SqFt */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                        Total Interior Square Footage
                      </label>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        Enter your facility's total interior floor area. Wall surface (3.5× multiplier) and paintable scope are calculated automatically based on your selected wear condition.
                      </p>
                      <div className="flex items-center gap-3 max-w-xs">
                        {numInput(commTotalSqFt, setCommTotalSqFt, "e.g. 8000")}
                        <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">sqft</span>
                      </div>
                      {commTotalSqFt > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Estimated wall surface:&nbsp;
                          <strong className="text-primary">
                            {Math.round(commTotalSqFt * 3.5).toLocaleString()} sqft
                          </strong>
                        </p>
                      )}
                    </div>

                    {/* Wear Condition */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                        Facility Wear Condition
                      </label>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        How heavily does your facility's interior see daily wear? This determines the paintable scope per service visit.
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {(["light", "moderate", "heavy"] as const).map(cond => {
                          const labels: Record<string, { title: string; hint: string; factor: string }> = {
                            light:    { title: "Light",    hint: "Low-traffic, pristine surfaces — offices, professional suites", factor: "30% scope/visit" },
                            moderate: { title: "Moderate", hint: "Standard commercial wear — retail, education, medical",          factor: "45% scope/visit" },
                            heavy:    { title: "Heavy",    hint: "High-impact, industrial or high-traffic environments",           factor: "60% scope/visit" },
                          };
                          const active = commCondition === cond;
                          return (
                            <button key={cond} type="button" onClick={() => setCommCondition(cond)}
                              className={`flex flex-col items-start p-3 border text-left transition-colors ${active ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-3 h-3 border flex-shrink-0 ${active ? "bg-primary border-primary" : "border-muted-foreground"}`} />
                                <span className={`text-sm font-bold ${active ? "text-primary" : "text-foreground"}`}>{labels[cond].title}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-snug mb-1.5">{labels[cond].hint}</p>
                              <span className={`text-[10px] font-mono font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>{labels[cond].factor}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Paintable scope summary */}
                    {commTotalSqFt > 0 && (
                      <div className="flex flex-wrap gap-4 pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          Paintable scope / visit:&nbsp;
                          <strong className="text-primary">
                            {Math.round(calculateCommercialMaintenance(commTotalSqFt, commCondition)).toLocaleString()} sqft
                          </strong>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Condition factor:&nbsp;
                          <strong className="text-foreground">{Math.round((CONDITION_FACTORS[commCondition] ?? 0.45) * 100)}%</strong>
                        </span>
                      </div>
                    )}

                    {/* Full Repaint — scoped separately */}
                    <div className="border border-border/60 bg-secondary/10 p-4 flex gap-3">
                      <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground mb-1">Full Repaint — Scoped Separately</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Full interior repaints, color changes, and specialty coatings are not included in the subscription maintenance pricing above. These are assessed and quoted as standalone projects during your complimentary walk-through.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* ── COMM STEP 2: Exterior Paint & Cleaning Services ── */}
                {sectionCard("Select Exterior Paint & Cleaning Services", "STEP 2", (
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
              {isMultiFamily ? "4-Tier Multi-Family Autopilot Plan" : "3-Tier Commercial Maintenance Plan"}
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              One-time onboarding fee: <strong className="text-foreground">$250</strong>
              <span className="text-muted-foreground ml-1">— covers account management setup</span>
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-1 font-mono tracking-wide">6-month minimum subscription required</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className={`grid gap-4 ${isMultiFamily ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
            {activeTiers.map((tier, i) => {
              const price = displayPrices[i] ?? 0;
              const isSelected = selectedTier === tier.id;
              const savings = !isMultiFamily ? (annualSavings[i] ?? 0) : 0;
              const discountKey = `t${i + 1}` as "t1" | "t2" | "t3";

              // MF tiers 2-4 only show pricing if user has selected zone data
              const isMFHigherTier = isMultiFamily && i > 0;
              const showPrice = isMFHigherTier ? (price > 0 && hasMFZoneData) : price > 0;

              return (
                <div key={tier.id}
                  className={`relative flex flex-col bg-card transition-all cursor-pointer border ${isSelected ? "border-primary border-2" : "border-primary/30 hover:border-primary/60"}`}
                  onClick={() => setSelectedTier(tier.id)}>
                  {(tier as any).popular && (
                    <div className="absolute top-0 right-0 bg-primary text-background text-[9px] font-bold uppercase tracking-widest px-3 py-1">Most Popular</div>
                  )}
                  <div className="flex-grow p-5 sm:p-6">
                    {/* Orange box: grey tier number chip on left + label */}
                    <div className="inline-flex items-stretch gap-0 mb-2">
                      <div className="bg-zinc-300 px-2 flex items-center">
                        <span className="text-zinc-700 font-bold text-[9px] uppercase tracking-widest leading-none whitespace-nowrap">{(tier as any).tierNum}</span>
                      </div>
                      <div className="bg-primary px-3 py-2">
                        <span className="text-background font-black text-sm sm:text-base uppercase tracking-widest leading-none">{tier.label}</span>
                      </div>
                    </div>
                    {/* Sub text — below combined box */}
                    <p className="text-white/60 font-mono text-[10px] tracking-widest uppercase mb-1">{(tier as any).sub ?? tier.sub}</p>
                    {showPrice ? (
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
                    ) : isMFHigherTier && !hasMFZoneData ? (
                      <p className="text-muted-foreground text-xs mt-3 italic">Add public area zones in Step 2 to unlock this tier's pricing.</p>
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

                  {/* Discount controls — commercial only */}
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

                  <div className={`mx-5 sm:mx-6 mb-5 sm:mb-6 h-9 border text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors ${isSelected ? "bg-primary text-background border-primary" : "border-primary/40 text-muted-foreground hover:bg-primary hover:text-background hover:border-primary"}`}>
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
