import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Phone, MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

// ─── Animation variants ────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

// ─── Constants ──────────────────────────────────────────────────────────────
const UNIT_SQFT: Record<string, number> = {
  studio: 1250, oneBD: 1750, twoBD: 2500, threeBD: 3000, fourBD: 3500,
};
const UNIT_LABELS: Record<string, string> = {
  studio: "Studio", oneBD: "1 Bedroom", twoBD: "2 Bedroom", threeBD: "3 Bedroom", fourBD: "4 Bedroom",
};

const RES_DIST_SQFT: Record<string, number> = {
  corridors: 200, stairwells: 180, elevatorLandings: 75, wasteRooms: 55,
};
const RES_DIST_LABELS: Record<string, string> = {
  corridors: "Residential Corridors",
  stairwells: "Stairwells",
  elevatorLandings: "Elevator Landings",
  wasteRooms: "Garbage / Waste Rooms",
};

const RES_HUB_SQFT: Record<string, number> = {
  mainLobby: 2500, mailroom: 750, coworking: 1750, gym: 2000, bathrooms: 750, leasingOffice: 1500,
};
const RES_HUB_LABELS: Record<string, string> = {
  mainLobby: "Main Lobby",
  mailroom: "Mailroom",
  coworking: "Co-working Space",
  gym: "Gym Area",
  bathrooms: "Shared Bathrooms",
  leasingOffice: "Leasing Office",
};

const EXT_ZONE_COST: Record<string, number> = {
  mainFacade: 250, floorSurface: 150, poolDeck: 450,
  doorway: 250, garbageArea: 100, garageEntrance: 175,
};
const EXT_ZONE_LABELS: Record<string, string> = {
  mainFacade: "Main Entrance Facade",
  floorSurface: "Entrance Floor Surface",
  poolDeck: "Pool Deck Area",
  doorway: "Entries — Walls & Floor Surface",
  garbageArea: "Garbage Area",
  garageEntrance: "Garage Entrance",
};

const COMM_DIST_SQFT: Record<string, number> = {
  officeHallways: 180, serviceCorridors: 280, elevatorLandings: 75, stairwells: 180,
};
const COMM_DIST_LABELS: Record<string, string> = {
  officeHallways: "Office Hallways",
  serviceCorridors: "Main Service Corridors",
  elevatorLandings: "Elevator Landings",
  stairwells: "Stairwells",
};

const COMM_HUB_SQFT: Record<string, number> = {
  lobbies: 550, breakRooms: 190, bathrooms: 140, vestibules: 110,
};
const COMM_HUB_LABELS: Record<string, string> = {
  lobbies: "Main Lobbies",
  breakRooms: "Break Rooms",
  bathrooms: "Public Bathrooms",
  vestibules: "Entry Vestibules",
};

const FACILITY_LABELS: Record<string, string> = {
  "multi-family": "Multi-Family Residential",
  medical: "Medical / Healthcare",
  industrial: "Industrial / Warehouse",
  "office-corporate": "Office / Corporate",
  automotive: "Automotive",
  education: "Education",
  retail: "Retail",
  commercial: "Commercial / Industrial",
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface UnitRow { count: number; turns: number }
interface ZoneRow { qty: number; floors: number }

const defaultUnitMix = (): Record<string, UnitRow> => ({
  studio: { count: 0, turns: 0 },
  oneBD: { count: 0, turns: 0 },
  twoBD: { count: 0, turns: 0 },
  threeBD: { count: 0, turns: 0 },
  fourBD: { count: 0, turns: 0 },
});
const defaultResDistZones = (): Record<string, ZoneRow> => ({
  corridors: { qty: 0, floors: 0 },
  stairwells: { qty: 0, floors: 0 },
  elevatorLandings: { qty: 0, floors: 0 },
  wasteRooms: { qty: 0, floors: 0 },
});
const defaultSingularHubs = (): Record<string, number> => ({
  mainLobby: 0, mailroom: 0, coworking: 0, gym: 0, bathrooms: 0, leasingOffice: 0,
});
const defaultExtZones = (): Record<string, boolean> => ({
  mainFacade: false, floorSurface: false, poolDeck: false,
  doorway: false, garbageArea: false, garageEntrance: false,
});
const defaultCommDistZones = (): Record<string, ZoneRow> => ({
  officeHallways: { qty: 0, floors: 0 },
  serviceCorridors: { qty: 0, floors: 0 },
  elevatorLandings: { qty: 0, floors: 0 },
  stairwells: { qty: 0, floors: 0 },
});
const defaultCommHubs = (): Record<string, number> => ({
  lobbies: 0, breakRooms: 0, bathrooms: 0, vestibules: 0,
});

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function numInput(val: number, onChange: (v: number) => void, placeholder = "0") {
  return (
    <input
      type="number"
      min={0}
      value={val === 0 ? "" : val}
      onChange={e => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
      placeholder={placeholder}
      className="w-full h-10 bg-background border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors text-center"
    />
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function SubscriptionLab() {
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const typeParam = params.get("type") ?? sessionStorage.getItem("facilityType") ?? "commercial";
  const facilityParam = params.get("facility") ?? typeParam;
  const isMultiFamily = typeParam === "multi-family";
  const facilityLabel = FACILITY_LABELS[facilityParam] ?? "Commercial";
  const calcTitle = isMultiFamily ? "Residential Autopilot Calculator" : "Commercial Area-Based Calculator";

  // Multi-Family State
  const [unitMix, setUnitMix] = useState(defaultUnitMix());
  const [resDistZones, setResDistZones] = useState(defaultResDistZones());
  const [singularHubs, setSingularHubs] = useState(defaultSingularHubs());
  const [extZones, setExtZones] = useState(defaultExtZones());

  // Commercial State
  const [commDist, setCommDist] = useState(defaultCommDistZones());
  const [commHubs, setCommHubs] = useState(defaultCommHubs());

  // UI State
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", propertyName: "", address: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  // ─── Math Engine ──────────────────────────────────────────────────────────
  // Pricing model: each tier carries a higher per-sqft turn rate + more frequent hub/corridor service.
  // This creates a 60–70%+ spread from T1 to T4 even when unit turns dominate.
  //
  // Multi-Family rates by tier:
  //   T1 (turns only):            turns × $0.18/sqft
  //   T2 (annual hubs/corridors): turns × $0.21/sqft + (hub×$0.10 + corridor×$0.05)/12 + ext/12
  //   T3 (quarterly + patrol):    turns × $0.24/sqft + (hub×$0.13 + corridor×$0.07)/3  + ext×4/12
  //   T4 (monthly + signature):   turns × $0.30/sqft + hub×$0.18 + corridor×$0.10      + ext/mo
  //
  // Commercial rates by tier:
  //   T1 (annual):               (hub×$0.10 + corridor×$0.05)/12
  //   T2 (quarterly ×1.15):      (hub×$0.13 + corridor×$0.07)/3
  //   T3 (quarterly+patrol ×1.35):(hub×$0.17 + corridor×$0.10)/3  + patrol add-on
  const calc = useMemo(() => {
    if (isMultiFamily) {
      const unitTurnsSqFt = Object.entries(unitMix).reduce(
        (acc, [type, row]) => acc + row.turns * (UNIT_SQFT[type] ?? 0), 0
      );
      const hubAreaSqFt = Object.entries(singularHubs).reduce(
        (acc, [hub, qty]) => acc + qty * (RES_HUB_SQFT[hub] ?? 0), 0
      );
      const touchUpSqFt = Object.entries(resDistZones).reduce(
        (acc, [zone, row]) => acc + row.qty * row.floors * (RES_DIST_SQFT[zone] ?? 0), 0
      );
      const extCostPerVisit = Object.entries(extZones)
        .filter(([, on]) => on)
        .reduce((acc, [zone]) => acc + (EXT_ZONE_COST[zone] ?? 0), 0);

      // T1: unit turns at base rate
      const t1 = Math.round(unitTurnsSqFt * 0.18);
      // T2: turns at slightly elevated rate + annual hub/corridor cost divided monthly + annual wash
      const t2 = Math.round(
        unitTurnsSqFt * 0.21 +
        (hubAreaSqFt * 0.10 + touchUpSqFt * 0.05) / 12 +
        extCostPerVisit / 12
      );
      // T3: turns at premium rate + quarterly hub/corridor (per-visit premium rate) + quarterly wash
      const t3 = Math.round(
        unitTurnsSqFt * 0.24 +
        (hubAreaSqFt * 0.13 + touchUpSqFt * 0.07) / 3 +
        (extCostPerVisit * 4) / 12
      );
      // T4: turns at signature rate + full monthly hub/corridor (highest rate) + monthly wash
      const t4 = Math.round(
        unitTurnsSqFt * 0.30 +
        hubAreaSqFt * 0.18 +
        touchUpSqFt * 0.10 +
        extCostPerVisit
      );

      const onboarding = Math.round(t2 * 1.5);

      return { unitTurnsSqFt, hubAreaSqFt, touchUpSqFt, extCostPerVisit, onboarding, tiers: [t1, t2, t3, t4] };
    } else {
      const hubAreaSqFt = Object.entries(commHubs).reduce(
        (acc, [hub, qty]) => acc + qty * (COMM_HUB_SQFT[hub] ?? 0), 0
      );
      const touchUpSqFt = Object.entries(commDist).reduce(
        (acc, [zone, row]) => acc + row.qty * row.floors * (COMM_DIST_SQFT[zone] ?? 0), 0
      );
      // T1: annual cycle, base rates
      const ct1 = Math.round((hubAreaSqFt * 0.10 + touchUpSqFt * 0.05) / 12);
      // T2: quarterly cycle, premium rates (~4.5× monthly vs T1 annual ÷12)
      const ct2 = Math.round((hubAreaSqFt * 0.13 + touchUpSqFt * 0.07) / 3);
      // T3: quarterly at signature rates + monthly patrol add-on
      const ct3 = Math.round(
        (hubAreaSqFt * 0.17 + touchUpSqFt * 0.10) / 3 +
        (hubAreaSqFt * 0.04 + touchUpSqFt * 0.02)
      );
      const onboarding = Math.round(ct2 * 1.5);

      return { hubAreaSqFt, touchUpSqFt, onboarding, tiers: [ct1, ct2, ct3] };
    }
  }, [unitMix, resDistZones, singularHubs, extZones, commDist, commHubs, isMultiFamily]);

  // ─── Tier Configs ─────────────────────────────────────────────────────────
  const resTiers = [
    {
      id: "essential",
      label: "Tier 1 — Essential",
      sub: "100% Unit Turns Only",
      features: ["Full interior repaint for every unit turn", "Consistent color system applied", "2-year workmanship guarantee"],
      scope: "Unit Turns",
    },
    {
      id: "asset-shield-annual",
      label: "Tier 2 — Asset Shield",
      sub: "Annual Cycle",
      features: [
        "Everything in Tier 1 (Unit Turns)",
        "Annual full repaint of all hubs",
        "Annual precision touch-ups of corridors (scuffs & chips)",
        "Annual exterior power/soft wash",
      ],
      scope: "Unit Turns + Annual Hubs + Annual Corridors + Annual Wash",
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
      scope: "Unit Turns + Quarterly Hubs + Quarterly Corridors + Quarterly Wash",
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
      scope: "Full Monthly Coverage + Proactive Patrol",
    },
  ];

  const commTiers = [
    {
      id: "annual-shield",
      label: "Tier 1 — Annual Shield",
      sub: "Annual Cycle",
      features: [
        "Annual full repaint of all hubs",
        "Annual corridor touch-ups",
        "Annual exterior wash",
        "2-year workmanship guarantee",
      ],
      scope: "Annual Hubs + Annual Corridors + Annual Wash",
    },
    {
      id: "asset-shield-quarterly",
      label: "Tier 2 — Asset Shield",
      sub: "Quarterly Cycle",
      features: [
        "Quarterly full repaint of all hubs",
        "Quarterly corridor touch-ups",
        "Quarterly exterior wash",
        "Priority scheduling",
      ],
      scope: "Quarterly Hubs + Quarterly Corridors + Quarterly Wash",
      popular: true,
    },
    {
      id: "signature-quarterly-plus",
      label: "Tier 3 — Signature",
      sub: "Quarterly + Monthly Patrol",
      features: [
        "Quarterly full repaint of all hubs",
        "Quarterly corridor touch-ups",
        "Monthly overall hub & corridor touch-up patrol",
        "Quarterly exterior wash",
        "Dedicated site coordinator",
        "Monthly condition reports",
      ],
      scope: "Quarterly Repaint + Monthly Patrol + Quarterly Wash",
    },
  ];

  const activeTiers = isMultiFamily ? resTiers : commTiers;

  // ─── Breakdown Text ────────────────────────────────────────────────────────
  const buildBreakdown = () => {
    const lines: string[] = [];
    lines.push(`PAINTLAB SUBSCRIPTION CONFIGURATION`);
    lines.push(`Facility Type: ${facilityLabel}`);
    lines.push(`Calculator: ${calcTitle}`);
    lines.push(`Selected Tier: ${selectedTier ?? "Not yet selected"}`);
    lines.push(`\nONBOARDING FEE (1.5x Monthly Base): ${fmt(calc.onboarding)}`);
    lines.push(`\n───────────────────────────────────`);

    if (isMultiFamily) {
      lines.push(`\nUNIT TURN VOLUME (Monthly):`);
      Object.entries(unitMix).forEach(([type, row]) => {
        if (row.turns > 0) lines.push(`  ${UNIT_LABELS[type]}: ${row.turns} turns/mo × ${UNIT_SQFT[type]} sqft = ${(row.turns * UNIT_SQFT[type]).toLocaleString()} sqft`);
      });
      lines.push(`  TOTAL Unit Turn SqFt/mo: ${(calc as any).unitTurnsSqFt?.toLocaleString() ?? 0}`);

      lines.push(`\nCORRIDOR / TRANSIT ZONES (Touch-up Maintenance):`);
      Object.entries(resDistZones).forEach(([zone, row]) => {
        if (row.qty > 0) lines.push(`  ${RES_DIST_LABELS[zone]}: ${row.qty} qty × ${row.floors} floors = ${(row.qty * row.floors * RES_DIST_SQFT[zone]).toLocaleString()} sqft`);
      });

      lines.push(`\nHUB AREAS (Full Repaint Cycles):`);
      Object.entries(singularHubs).forEach(([hub, qty]) => {
        if (qty > 0) lines.push(`  ${RES_HUB_LABELS[hub]}: ${qty} × ${RES_HUB_SQFT[hub]} sqft = ${(qty * RES_HUB_SQFT[hub]).toLocaleString()} sqft`);
      });

      const selectedExt = Object.entries(extZones).filter(([, on]) => on).map(([z]) => EXT_ZONE_LABELS[z]);
      lines.push(`\nEXTERIOR WASH ZONES SELECTED:`);
      selectedExt.length > 0 ? selectedExt.forEach(z => lines.push(`  ✓ ${z}`)) : lines.push(`  None selected`);
    } else {
      lines.push(`\nCORRIDOR / TRANSIT ZONES (Touch-up Maintenance):`);
      Object.entries(commDist).forEach(([zone, row]) => {
        if (row.qty > 0) lines.push(`  ${COMM_DIST_LABELS[zone]}: ${row.qty} qty × ${row.floors} floors = ${(row.qty * row.floors * COMM_DIST_SQFT[zone]).toLocaleString()} sqft`);
      });

      lines.push(`\nHUB AREAS (Full Repaint Cycles):`);
      Object.entries(commHubs).forEach(([hub, qty]) => {
        if (qty > 0) lines.push(`  ${COMM_HUB_LABELS[hub]}: ${qty} × ${COMM_HUB_SQFT[hub]} sqft = ${(qty * COMM_HUB_SQFT[hub]).toLocaleString()} sqft`);
      });
    }

    lines.push(`\n───────────────────────────────────`);
    lines.push(`TIER PRICING (Monthly Estimates):`);
    activeTiers.forEach((tier, i) => {
      lines.push(`  ${tier.label} (${tier.sub}): ${fmt(calc.tiers[i] ?? 0)}/mo`);
    });

    return lines.join("\n");
  };

  // ─── Form Submit ──────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const breakdown = buildBreakdown();
    const body = encodeURIComponent(
      `Hi PaintLab Team,\n\nI just configured a subscription plan and would like to discuss it.\n\n` +
      `NAME: ${formData.name}\nPROPERTY: ${formData.propertyName}\nADDRESS: ${formData.address}\nPHONE: ${formData.phone}\n\n` +
      breakdown
    );
    window.open(`mailto:hello@paintlabpro.com?subject=${encodeURIComponent(`[PaintLab Subscription] ${formData.propertyName} — ${selectedTier ?? "Inquiry"}`)}&body=${body}`, "_blank");
    setSubmitted(true);
  };

  const smsBody = encodeURIComponent(
    `I just ran the PaintLab calculator for ${formData.propertyName || "[Property Name]"}. I want to discuss the ${selectedTier ?? "[Selected Tier]"} package.`
  );

  // ─── Input Section Helpers ────────────────────────────────────────────────
  const sectionCard = (title: string, step: string, content: React.ReactNode) => (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-secondary/20">
        <span className="text-primary font-mono text-xs tracking-widest">{step}</span>
        <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-6">{content}</div>
    </div>
  );

  const colHeader = (label: string, hint?: string) => (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-foreground">{label}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
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
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">{calcTitle}</span>
            </motion.div>
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
      <section className="py-16 bg-background border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="space-y-4">
            {isMultiFamily ? (
              <>
                {/* Step 1: Unit Mix */}
                {sectionCard("Unit Mix", "STEP 01", (
                  <div>
                    <div className="grid grid-cols-4 gap-3 mb-3 px-2">
                      <div />
                      {colHeader("# of Units", "total")}
                      {colHeader("Avg Turns / Mo", "per size")}
                      {colHeader("Paintable SqFt", "standard est.")}
                    </div>
                    {Object.entries(unitMix).map(([type, row]) => (
                      <div key={type} className="grid grid-cols-4 gap-3 items-center mb-2.5">
                        <p className="text-sm font-semibold text-foreground pl-2">{UNIT_LABELS[type]}</p>
                        {numInput(row.count, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], count: v } })))}
                        {numInput(row.turns, v => setUnitMix(p => ({ ...p, [type]: { ...p[type], turns: v } })))}
                        <div className="h-10 border border-border/40 bg-secondary/20 flex items-center justify-center text-sm text-muted-foreground">
                          {UNIT_SQFT[type].toLocaleString()} sqft
                        </div>
                      </div>
                    ))}
                    {(calc as any).unitTurnsSqFt > 0 && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-end">
                        <span className="text-sm text-muted-foreground">Total monthly turn sqft: <strong className="text-foreground">{(calc as any).unitTurnsSqFt.toLocaleString()}</strong></span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Step 2: Distributed Touch-up Zones */}
                {sectionCard("Distributed Touch-up Zones", "STEP 02", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">These zones span multiple floors. Enter quantity of each zone type and the number of floors it covers.</p>
                    <div className="grid grid-cols-4 gap-3 mb-3 px-2">
                      <div />
                      {colHeader("Qty")}
                      {colHeader("# of Floors")}
                      {colHeader("~SqFt", "per floor")}
                    </div>
                    {Object.entries(resDistZones).map(([zone, row]) => (
                      <div key={zone} className="grid grid-cols-4 gap-3 items-center mb-2.5">
                        <p className="text-sm font-medium text-foreground pl-2 leading-tight">{RES_DIST_LABELS[zone]}</p>
                        {numInput(row.qty, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], qty: v } })))}
                        {numInput(row.floors, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], floors: v } })), "0")}
                        <div className="h-10 border border-border/40 bg-secondary/20 flex items-center justify-center text-sm text-muted-foreground">
                          {RES_DIST_SQFT[zone]} sqft
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Step 3: Singular Hubs */}
                {sectionCard("Singular Hubs", "STEP 03", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Enter the quantity of each hub type in your property.</p>
                    <div className="grid grid-cols-3 gap-3 mb-3 px-2">
                      <div />
                      {colHeader("Qty")}
                      {colHeader("~SqFt ea.", "standard est.")}
                    </div>
                    {Object.entries(singularHubs).map(([hub, qty]) => (
                      <div key={hub} className="grid grid-cols-3 gap-3 items-center mb-2.5">
                        <p className="text-sm font-medium text-foreground pl-2">{RES_HUB_LABELS[hub]}</p>
                        {numInput(qty, v => setSingularHubs(p => ({ ...p, [hub]: v })))}
                        <div className="h-10 border border-border/40 bg-secondary/20 flex items-center justify-center text-sm text-muted-foreground">
                          {RES_HUB_SQFT[hub]} sqft
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Step 4: Exterior Zones */}
                {sectionCard("Exterior Power / Soft Wash Zones", "STEP 04", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Select the exterior zones included in your subscription. Wash frequency is determined by selected tier.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(extZones).map(([zone, on]) => (
                        <button
                          key={zone}
                          onClick={() => setExtZones(p => ({ ...p, [zone]: !p[zone] }))}
                          className={`flex items-center gap-3 p-3 border text-left transition-colors ${on ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}
                        >
                          <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${on ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                            {on && <span className="text-background text-xs font-bold">✓</span>}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{EXT_ZONE_LABELS[zone]}</p>
                            <p className="text-xs text-muted-foreground">${EXT_ZONE_COST[zone]}/visit</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {/* Commercial Step 1: Distributed Zones */}
                {sectionCard("Distributed Touch-up Zones", "STEP 01", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Enter quantity and floor count for each transit zone type.</p>
                    <div className="grid grid-cols-4 gap-3 mb-3 px-2">
                      <div />
                      {colHeader("Qty")}
                      {colHeader("# of Floors")}
                      {colHeader("~SqFt", "per floor")}
                    </div>
                    {Object.entries(commDist).map(([zone, row]) => (
                      <div key={zone} className="grid grid-cols-4 gap-3 items-center mb-2.5">
                        <p className="text-sm font-medium text-foreground pl-2">{COMM_DIST_LABELS[zone]}</p>
                        {numInput(row.qty, v => setCommDist(p => ({ ...p, [zone]: { ...p[zone], qty: v } })))}
                        {numInput(row.floors, v => setCommDist(p => ({ ...p, [zone]: { ...p[zone], floors: v } })))}
                        <div className="h-10 border border-border/40 bg-secondary/20 flex items-center justify-center text-sm text-muted-foreground">
                          {COMM_DIST_SQFT[zone]} sqft
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Commercial Step 2: Hubs */}
                {sectionCard("Singular Hubs (Full Repaint Qty)", "STEP 02", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Enter the quantity of each hub type. These receive full repaints at the cycle frequency of your chosen tier.</p>
                    <div className="grid grid-cols-3 gap-3 mb-3 px-2">
                      <div />
                      {colHeader("Qty")}
                      {colHeader("~SqFt ea.", "standard est.")}
                    </div>
                    {Object.entries(commHubs).map(([hub, qty]) => (
                      <div key={hub} className="grid grid-cols-3 gap-3 items-center mb-2.5">
                        <p className="text-sm font-medium text-foreground pl-2">{COMM_HUB_LABELS[hub]}</p>
                        {numInput(qty, v => setCommHubs(p => ({ ...p, [hub]: v })))}
                        <div className="h-10 border border-border/40 bg-secondary/20 flex items-center justify-center text-sm text-muted-foreground">
                          {COMM_HUB_SQFT[hub]} sqft
                        </div>
                      </div>
                    ))}
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
                <span className="text-muted-foreground ml-1">(1.5× monthly base — restores all zones to PaintLab standards)</span>
              </p>
            )}
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className={`grid gap-px bg-border ${isMultiFamily ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}
          >
            {activeTiers.map((tier, i) => {
              const price = calc.tiers[i] ?? 0;
              const isSelected = selectedTier === tier.id;
              return (
                <motion.button
                  key={tier.id}
                  variants={fadeInUp}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`relative bg-card p-7 flex flex-col text-left transition-all ${isSelected ? "ring-2 ring-primary ring-inset" : "hover:bg-secondary/30"}`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
                  )}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-primary flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-background" />
                    </div>
                  )}
                  <p className="text-xs font-mono uppercase tracking-widest text-primary mb-1">{tier.sub}</p>
                  <h3 className="text-base font-bold mb-1 tracking-tight">{tier.label}</h3>
                  <div className="text-3xl font-black tracking-tighter my-4">
                    {price > 0 ? (
                      <>{fmt(price)}<span className="text-base font-normal text-muted-foreground">/mo</span></>
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
                  <div className={`mt-auto h-9 border text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors ${
                    isSelected ? "bg-primary text-background border-primary" : "border-border text-muted-foreground"
                  }`}>
                    {isSelected ? "✓ Selected" : "Select this tier"}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Disclaimer */}
          <div className="mt-8 p-5 border border-border/60 bg-secondary/10">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Important:</strong> The PaintLab Subscription covers routine upkeep and precision touch-ups. Should your facility require large-surface repaints or full-wall color changes, these will be scoped as separate, incremental projects to ensure the highest quality results.
            </p>
          </div>
        </div>
      </section>

      {/* LEAD FORM + CTAs */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-primary font-mono text-xs tracking-widest uppercase">Get Your Proposal</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Tell us about your property.</h2>
              <p className="text-muted-foreground mt-2">We'll send your full configuration summary and schedule a complimentary walkthrough.</p>
            </motion.div>

            {submitted ? (
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="border border-primary bg-primary/5 p-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Your email is ready.</h3>
                <p className="text-muted-foreground">Your email client should have opened with the full breakdown pre-filled for hello@paintlabpro.com. You can also call or text us directly below.</p>
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
                    <p className="text-sm"><strong className="text-foreground">Selected:</strong> {activeTiers.find(t => t.id === selectedTier)?.label} — {fmt(calc.tiers[activeTiers.findIndex(t => t.id === selectedTier)] ?? 0)}/mo</p>
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

            {/* Industrial CTA Buttons */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <motion.a
                variants={fadeInUp}
                href="tel:+15124843124"
                className="flex items-center justify-center gap-3 h-16 border-[3px] border-black bg-primary text-black hover:bg-primary/90 transition-colors"
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontSize: "0.85rem",
                  boxShadow: "4px 4px 0px #000000",
                }}
              >
                <Phone className="w-5 h-5 flex-shrink-0" />
                CALL PAINTLAB
              </motion.a>
              <motion.a
                variants={fadeInUp}
                href={`sms:+15124843124?body=${smsBody}`}
                className="flex items-center justify-center gap-3 h-16 border-[3px] border-black bg-primary text-black hover:bg-primary/90 transition-colors"
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontSize: "0.85rem",
                  boxShadow: "4px 4px 0px #000000",
                }}
              >
                <MessageSquare className="w-5 h-5 flex-shrink-0" />
                TEXT PAINTLAB
              </motion.a>
            </motion.div>
            <p className="text-xs text-muted-foreground text-center mt-3">(512) 484-3124 · Mon–Fri 8am–6pm CT · Available for emergency dispatch</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
