import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Phone, MessageSquare, Send, Info } from "lucide-react";
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
  floorSurface: "Entrance Floor Surface",
  poolDeck: "Pool Deck Area",
  doorway: "Entries — Walls & Floor Surface",
  garbageArea: "Garbage Area",
  garageEntrance: "Garage Entrance",
  buildingCladding: "Building Cladding / Siding",
};
const EXT_ZONE_INFO: Record<string, string> = {
  buildingCladding: "Building cladding/siding, Roofs · Pedestrian walkways & sidewalks · Parking garages & lots · Windows & trim — assessed during your complimentary walk-through and quoted separately.",
};

// ─── Commercial Constants ───────────────────────────────────────────────────
const COMM_DIST_LABELS: Record<string, string> = {
  officeHallways: "Office Hallways",
  serviceCorridors: "Main Service Corridors",
  elevatorLandings: "Elevator Landings",
  stairwells: "Stairwells",
};
const COMM_HUB_LABELS: Record<string, string> = {
  lobbies: "Main Lobbies",
  breakRooms: "Break Rooms",
  bathrooms: "Public Bathrooms",
  vestibules: "Entry Vestibules",
};
const COMM_EXT_COST: Record<string, number> = {
  commFacade: 250, commEntranceFloor: 250, commDumpsterPad: 200,
  commEntries: 150, commGarage: 150, commCladding: 950,
};
const COMM_EXT_LABELS: Record<string, string> = {
  commFacade: "Main Entrance Facade",
  commEntranceFloor: "Entrance Floor Surface",
  commDumpsterPad: "Dumpster Pad Area",
  commEntries: "Entries — Walls & Floor Surface",
  commGarage: "Garage Entrance",
  commCladding: "Building Cladding / Siding",
};
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
  corridors: { qty: 0, floors: 0, sqft: 0 },
  stairwells: { qty: 0, floors: 0, sqft: 0 },
  elevatorLandings: { qty: 0, floors: 0, sqft: 0 },
  wasteRooms: { qty: 0, floors: 0, sqft: 0 },
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
const defaultCommDistZones = (): Record<string, CommZoneRow> => ({
  officeHallways: { qty: 0, floors: 0, sqft: 0 },
  serviceCorridors: { qty: 0, floors: 0, sqft: 0 },
  elevatorLandings: { qty: 0, floors: 0, sqft: 0 },
  stairwells: { qty: 0, floors: 0, sqft: 0 },
});
const defaultCommHubs = (): Record<string, CommHubRow> => ({
  lobbies: { qty: 0, sqft: 0 },
  breakRooms: { qty: 0, sqft: 0 },
  bathrooms: { qty: 0, sqft: 0 },
  vestibules: { qty: 0, sqft: 0 },
});
const defaultCommExtZones = (): Record<string, boolean> => ({
  commFacade: false, commEntranceFloor: false, commDumpsterPad: false,
  commEntries: false, commGarage: false, commCladding: false,
});

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function numInput(val: number, onChange: (v: number) => void, placeholder = "0") {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={0}
      value={val === 0 ? "" : val}
      onChange={e => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
      placeholder={placeholder}
      className="w-full h-10 bg-background border border-border px-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors text-center"
    />
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

  const [extInfoZone, setExtInfoZone] = useState<string | null>(null);
  const [unitMix, setUnitMix] = useState(defaultUnitMix());
  const [resDistZones, setResDistZones] = useState(defaultResDistZones());
  const [singularHubs, setSingularHubs] = useState(defaultSingularHubs());
  const [resExtZones, setResExtZones] = useState(defaultResExtZones());
  const [commDist, setCommDist] = useState(defaultCommDistZones());
  const [commHubs, setCommHubs] = useState(defaultCommHubs());
  const [commExtZones, setCommExtZones] = useState(defaultCommExtZones());
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", propertyName: "", address: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  // ─── Math Engine ─────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    if (isMultiFamily) {
      const unitTurnsSqFt = Object.entries(unitMix).reduce((acc, [type, row]) => {
        const eff = row.sqft > 0 ? row.sqft : (UNIT_SQFT[type] ?? 0);
        return acc + row.turns * eff;
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

      const t1 = Math.round(unitTurnsSqFt * 0.18);
      const t2 = Math.round(unitTurnsSqFt * 0.21 + (hubAreaSqFt * 0.10 + touchUpSqFt * 0.05) / 12 + extCostPerVisit / 12);
      const t3 = Math.round(unitTurnsSqFt * 0.24 + (hubAreaSqFt * 0.13 + touchUpSqFt * 0.07) / 3 + (extCostPerVisit * 4) / 12);
      const t4 = Math.round(unitTurnsSqFt * 0.30 + hubAreaSqFt * 0.18 + touchUpSqFt * 0.10 + extCostPerVisit);
      const onboarding = Math.round(t2 * 1.5);

      return { unitTurnsSqFt, hubAreaSqFt, touchUpSqFt, extCostPerVisit, onboarding, tiers: [t1, t2, t3, t4] };
    } else {
      const hubAreaSqFt = Object.values(commHubs).reduce((acc, row) => acc + row.qty * row.sqft, 0);
      const touchUpSqFt = Object.values(commDist).reduce((acc, row) => acc + row.qty * row.floors * row.sqft, 0);
      const extCostPerVisit = Object.entries(commExtZones)
        .filter(([, on]) => on)
        .reduce((acc, [zone]) => acc + (COMM_EXT_COST[zone] ?? 0), 0);

      const ct1 = Math.round((hubAreaSqFt * 0.10 + touchUpSqFt * 0.05) / 12 + extCostPerVisit / 12);
      const ct2 = Math.round((hubAreaSqFt * 0.13 + touchUpSqFt * 0.07) / 3 + (extCostPerVisit * 4) / 12);
      const ct3 = Math.round((hubAreaSqFt * 0.17 + touchUpSqFt * 0.10) / 3 + (hubAreaSqFt * 0.04 + touchUpSqFt * 0.02) + (extCostPerVisit * 4) / 12);
      const onboarding = Math.round(ct2 * 1.5);

      return { hubAreaSqFt, touchUpSqFt, extCostPerVisit, onboarding, tiers: [ct1, ct2, ct3] };
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
      sub: "Annual Cycle",
      features: ["Annual full repaint of all hubs", "Annual corridor touch-ups", "Annual exterior wash"],
      note: "Pay monthly or save 5% with an annual upfront payment.",
    },
    {
      id: "asset-shield-quarterly",
      label: "Tier 2 — Asset Shield",
      sub: "Quarterly Cycle",
      features: ["Quarterly full repaint of all hubs", "Quarterly corridor touch-ups", "Quarterly exterior wash", "Priority scheduling"],
      popular: true,
    },
    {
      id: "signature-quarterly-plus",
      label: "Tier 3 — Signature",
      sub: "Quarterly + Monthly Patrol",
      features: [
        "Quarterly full repaint of all hubs",
        "Quarterly corridor touch-ups",
        "Monthly hub & corridor touch-up patrol",
        "Quarterly exterior wash",
        "Monthly condition reports",
      ],
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
      lines.push(`\nHUBS:`);
      Object.entries(singularHubs).forEach(([hub, row]) => {
        if (row.qty > 0) {
          const eff = row.sqft > 0 ? row.sqft : RES_HUB_SQFT[hub];
          lines.push(`  ${RES_HUB_LABELS[hub]}: ${row.qty} × ${eff} sqft = ${(row.qty * eff).toLocaleString()} sqft`);
        }
      });
      const selExt = Object.entries(resExtZones).filter(([, on]) => on).map(([z]) => EXT_ZONE_LABELS[z]);
      lines.push(`\nEXTERIOR ZONES: ${selExt.length > 0 ? selExt.join(", ") : "None"}`);
    } else {
      lines.push(`\nCORRIDOR ZONES:`);
      Object.entries(commDist).forEach(([zone, row]) => {
        if (row.sqft > 0) lines.push(`  ${COMM_DIST_LABELS[zone]}: ${row.qty} × ${row.floors} floors × ${row.sqft} sqft`);
      });
      lines.push(`\nHUBS:`);
      Object.entries(commHubs).forEach(([hub, row]) => {
        if (row.sqft > 0) lines.push(`  ${COMM_HUB_LABELS[hub]}: ${row.qty} × ${row.sqft} sqft`);
      });
      const selExt = Object.entries(commExtZones).filter(([, on]) => on).map(([z]) => COMM_EXT_LABELS[z]);
      lines.push(`\nEXTERIOR ZONES: ${selExt.length > 0 ? selExt.join(", ") : "None"}`);
    }
    lines.push(`\n────────────────────────\nTIER PRICING:`);
    activeTiers.forEach((tier, i) => {
      const mo = calc.tiers[i] ?? 0;
      const annual = Math.round(mo * 12 * 0.95);
      lines.push(`  ${tier.label}: ${fmt(mo)}/mo  |  ${fmt(annual)}/yr (5% off)`);
    });
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
          </motion.div>
        </div>
      </section>

      {/* CONFIGURATION */}
      <section className="py-12 md:py-16 bg-background border-b border-border">
        <div className="container mx-auto px-4 md:px-12">
          <div className="space-y-4">
            {isMultiFamily ? (
              <>
                {/* STEP 1: Unit Mix */}
                {sectionCard("Unit Mix", "STEP 1", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Enter unit counts, monthly turns, and approximate square footage per unit type.
                      <span className="text-primary ml-1">*</span> Paintable wall surface = floor sqft × ratio (excluding ceiling).
                    </p>
                    {/* Desktop grid */}
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_1.1fr] gap-2 mb-2 px-1">
                        <div />
                        {colHdr("# of Units")}
                        {colHdr("Turns / Mo")}
                        {colHdr("SqFt each", "your est.")}
                        {colHdr("Paintable Wall Surface", "excl. ceiling")}
                      </div>
                      {Object.entries(unitMix).map(([type, row]) => {
                        const effSqFt = row.sqft > 0 ? row.sqft : UNIT_SQFT[type];
                        const wallSurface = Math.round(effSqFt * UNIT_WALL_RATIO[type]);
                        return (
                          <div key={type} className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_1.1fr] gap-2 items-center mb-2">
                            <p className="text-sm font-semibold text-foreground pl-1 whitespace-nowrap">{UNIT_LABELS[type]}</p>
                            {numInput(row.count, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], count: v } })))}
                            {numInput(row.turns, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], turns: v } })))}
                            {numInput(row.sqft, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], sqft: v } })), UNIT_SQFT[type].toString())}
                            <div className="h-10 border border-primary/30 bg-primary/5 flex items-center justify-center gap-1">
                              <span className="text-sm font-semibold text-primary">{wallSurface.toLocaleString()}</span>
                              <span className="text-[10px] text-muted-foreground">sqft ({UNIT_WALL_RATIO[type]}×)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Mobile cards */}
                    <div className="sm:hidden space-y-3">
                      {Object.entries(unitMix).map(([type, row]) => {
                        const effSqFt = row.sqft > 0 ? row.sqft : UNIT_SQFT[type];
                        const wallSurface = Math.round(effSqFt * UNIT_WALL_RATIO[type]);
                        return (
                          <div key={type} className="border border-border bg-secondary/10 p-3 rounded-none">
                            <p className="text-sm font-bold mb-3 whitespace-nowrap">{UNIT_LABELS[type]}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1"># of Units</p>
                                {numInput(row.count, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], count: v } })))}
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Turns / Mo</p>
                                {numInput(row.turns, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], turns: v } })))}
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">SqFt each</p>
                                {numInput(row.sqft, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], sqft: v } })), UNIT_SQFT[type].toString())}
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Wall Surface ({UNIT_WALL_RATIO[type]}×)</p>
                                <div className="h-10 border border-primary/30 bg-primary/5 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-primary">{wallSurface.toLocaleString()} sqft</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {calc.unitTurnsSqFt > 0 && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-end">
                        <span className="text-sm text-muted-foreground">Total monthly turn sqft: <strong className="text-foreground">{calc.unitTurnsSqFt.toLocaleString()}</strong></span>
                      </div>
                    )}
                  </div>
                ))}

                {/* STEP 2: Distributed Zones */}
                {sectionCard("Distributed Touch-up Zones", "STEP 2", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">These zones span multiple floors. Enter quantity and floor count — adjust the sqft per floor or leave blank to use the standard estimate.</p>
                    {/* Desktop */}
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr] gap-3 mb-2 px-1">
                        <div />
                        {colHdr("Qty")}
                        {colHdr("# of Floors")}
                        {colHdr("SqFt / Floor", "enter or use default")}
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
                    {/* Mobile */}
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
                              <p className="text-[10px] text-muted-foreground mb-1">SqFt / Floor</p>
                              {numInput(row.sqft, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], sqft: v } })), RES_DIST_SQFT[zone].toString())}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* STEP 3: Singular Hubs */}
                {sectionCard("Singular Hubs", "STEP 3", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Enter the quantity of each hub type. If you know the exact size, enter it — otherwise the standard estimate will be used for the calculation.</p>
                    {/* Desktop */}
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
                    {/* Mobile */}
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

                {/* STEP 4: Exterior Zones */}
                {sectionCard("Exterior Power / Soft Wash Zones", "STEP 4", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Select the exterior zones included in your subscription. Wash frequency is determined by your selected tier.</p>
                    {extToggle(resExtZones, setResExtZones, EXT_ZONE_LABELS, EXT_ZONE_COST, EXT_ZONE_INFO)}
                  </div>
                ))}
              </>
            ) : (
              <>
                {sectionCard("Distributed Touch-up Zones", "STEP 1", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Enter quantity, floor count and approximate square footage for each transit zone type. Typical office hallways/circulation space occupy 20%–30% of total usable square footage. After submitting, we'll schedule a walk-through to confirm details and investment structure.
                    </p>
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr] gap-2 mb-2 px-1">
                        <div />
                        {colHdr("Qty")}
                        {colHdr("Floors")}
                        {colHdr("SqFt / Floor", "your estimate")}
                      </div>
                      {Object.entries(commDist).map(([zone, row]) => (
                        <div key={zone} className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr] gap-2 items-center mb-2">
                          <p className="text-sm font-medium text-foreground pl-1 leading-tight">{COMM_DIST_LABELS[zone]}</p>
                          {numInput(row.qty, v => setCommDist(p => ({ ...p, [zone]: { ...p[zone], qty: v } })))}
                          {numInput(row.floors, v => setCommDist(p => ({ ...p, [zone]: { ...p[zone], floors: v } })))}
                          {numInput(row.sqft, v => setCommDist(p => ({ ...p, [zone]: { ...p[zone], sqft: v } })), "sqft")}
                        </div>
                      ))}
                    </div>
                    <div className="sm:hidden space-y-3">
                      {Object.entries(commDist).map(([zone, row]) => (
                        <div key={zone} className="border border-border bg-secondary/10 p-3">
                          <p className="text-sm font-bold mb-3">{COMM_DIST_LABELS[zone]}</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">Qty</p>
                              {numInput(row.qty, v => setCommDist(p => ({ ...p, [zone]: { ...p[zone], qty: v } })))}
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">Floors</p>
                              {numInput(row.floors, v => setCommDist(p => ({ ...p, [zone]: { ...p[zone], floors: v } })))}
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">SqFt/Floor</p>
                              {numInput(row.sqft, v => setCommDist(p => ({ ...p, [zone]: { ...p[zone], sqft: v } })), "sqft")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {Object.values(commDist).some(r => r.sqft > 0) && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-end">
                        <span className="text-sm text-muted-foreground">Total zone sqft: <strong className="text-foreground">{Object.values(commDist).reduce((a, r) => a + r.qty * r.floors * r.sqft, 0).toLocaleString()}</strong></span>
                      </div>
                    )}
                  </div>
                ))}

                {sectionCard("Singular Hubs (Full Repaint Zones)", "STEP 2", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Enter quantity and approximate square footage for each hub type. These receive full repaints at the cycle frequency of your chosen tier.
                    </p>
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[2fr_0.8fr_1fr] gap-3 mb-2 px-1">
                        <div />
                        {colHdr("Qty")}
                        {colHdr("SqFt ea.", "your estimate")}
                      </div>
                      {Object.entries(commHubs).map(([hub, row]) => (
                        <div key={hub} className="grid grid-cols-[2fr_0.8fr_1fr] gap-3 items-center mb-2">
                          <p className="text-sm font-medium text-foreground pl-1">{COMM_HUB_LABELS[hub]}</p>
                          {numInput(row.qty, v => setCommHubs(p => ({ ...p, [hub]: { ...p[hub], qty: v } })))}
                          {numInput(row.sqft, v => setCommHubs(p => ({ ...p, [hub]: { ...p[hub], sqft: v } })), "sqft")}
                        </div>
                      ))}
                    </div>
                    <div className="sm:hidden space-y-3">
                      {Object.entries(commHubs).map(([hub, row]) => (
                        <div key={hub} className="border border-border bg-secondary/10 p-3">
                          <p className="text-sm font-bold mb-3">{COMM_HUB_LABELS[hub]}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">Qty</p>
                              {numInput(row.qty, v => setCommHubs(p => ({ ...p, [hub]: { ...p[hub], qty: v } })))}
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">SqFt ea.</p>
                              {numInput(row.sqft, v => setCommHubs(p => ({ ...p, [hub]: { ...p[hub], sqft: v } })), "sqft")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {Object.values(commHubs).some(r => r.sqft > 0) && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-end">
                        <span className="text-sm text-muted-foreground">Total hub sqft: <strong className="text-foreground">{Object.values(commHubs).reduce((a, r) => a + r.qty * r.sqft, 0).toLocaleString()}</strong></span>
                      </div>
                    )}
                  </div>
                ))}

                {sectionCard("Exterior Pressure / Soft Wash Services", "STEP 3", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Select exterior zones to include. Wash frequency is determined by your selected tier.</p>
                    {extToggle(commExtZones, setCommExtZones, COMM_EXT_LABELS, COMM_EXT_COST)}
                    <div className="mt-5 p-4 border border-border/50 bg-secondary/10 flex gap-3">
                      <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground mb-1">Other areas requiring further scope:</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Roofs · Pedestrian walkways & sidewalks · Parking garages & lots · Windows & trim · Drive-thrus · Parking curbs — assessed during your complimentary walk-through and quoted separately.
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
              {isMultiFamily ? "4-Tier Residential Autopilot Plan" : "3-Tier Commercial Maintenance Plan"}
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
            className={`grid gap-px bg-border ${isMultiFamily ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}
          >
            {activeTiers.map((tier, i) => {
              const price = calc.tiers[i] ?? 0;
              const annualPrice = price > 0 ? Math.round(price * 12 * 0.95) : 0;
              const isSelected = selectedTier === tier.id;
              return (
                <motion.button
                  key={tier.id}
                  variants={fadeInUp}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`relative bg-card p-7 flex flex-col text-left transition-all ${isSelected ? "ring-2 ring-primary ring-inset" : "hover:bg-secondary/30"}`}
                >
                  {(tier as any).popular && <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-primary flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-background" />
                    </div>
                  )}
                  <p className="text-xs font-mono uppercase tracking-widest text-primary mb-1">{tier.sub}</p>
                  <h3 className="text-base font-bold mb-1 tracking-tight">{tier.label}</h3>
                  <div className="my-4">
                    {price > 0 ? (
                      <>
                        <div className="text-3xl font-black tracking-tighter">
                          {fmt(price)}<span className="text-base font-normal text-muted-foreground">/mo</span>
                        </div>
                        {!isMultiFamily && (
                          <div className="mt-2 text-xs text-muted-foreground border border-border/50 p-2 bg-secondary/20">
                            <span className="text-primary font-bold">*</span> Or pay <span className="font-semibold text-foreground">{fmt(annualPrice)}</span> upfront and save 5%
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-xl text-muted-foreground">Enter data above</span>
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
                  <div className={`mt-auto h-9 border text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors ${isSelected ? "bg-primary text-background border-primary" : "border-border text-muted-foreground"}`}>
                    {isSelected ? "✓ Selected" : "Select this tier"}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="mt-8 p-5 border border-border/60 bg-secondary/10">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Important:</strong> The PaintLab Subscription covers routine upkeep and precision touch-ups. Large-surface repaints or full-wall color changes will be scoped as separate incremental projects to ensure the highest quality results.
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
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Tell us about your property.</h2>
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

                <motion.button
                  variants={fadeInUp}
                  type="submit"
                  className="w-full h-14 bg-primary text-background font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send Full Breakdown to PaintLab
                </motion.button>
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
