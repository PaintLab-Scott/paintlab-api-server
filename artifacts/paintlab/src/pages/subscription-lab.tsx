import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Phone, MessageSquare, Send, Info } from "lucide-react";
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

// ─── Residential Constants ──────────────────────────────────────────────────
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
interface UnitRow { count: number; turns: number }
interface ResZoneRow { qty: number; floors: number }
interface CommZoneRow { qty: number; floors: number; sqft: number }
interface CommHubRow { qty: number; sqft: number }

const defaultUnitMix = (): Record<string, UnitRow> => ({
  studio: { count: 0, turns: 0 },
  oneBD: { count: 0, turns: 0 },
  twoBD: { count: 0, turns: 0 },
  threeBD: { count: 0, turns: 0 },
  fourBD: { count: 0, turns: 0 },
});
const defaultResDistZones = (): Record<string, ResZoneRow> => ({
  corridors: { qty: 0, floors: 0 },
  stairwells: { qty: 0, floors: 0 },
  elevatorLandings: { qty: 0, floors: 0 },
  wasteRooms: { qty: 0, floors: 0 },
});
const defaultSingularHubs = (): Record<string, number> => ({
  mainLobby: 0, mailroom: 0, coworking: 0, gym: 0, bathrooms: 0, leasingOffice: 0,
});
const defaultResExtZones = (): Record<string, boolean> => ({
  mainFacade: false, floorSurface: false, poolDeck: false,
  doorway: false, garbageArea: false, garageEntrance: false,
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

  // Multi-Family State
  const [unitMix, setUnitMix] = useState(defaultUnitMix());
  const [resDistZones, setResDistZones] = useState(defaultResDistZones());
  const [singularHubs, setSingularHubs] = useState(defaultSingularHubs());
  const [resExtZones, setResExtZones] = useState(defaultResExtZones());

  // Commercial State
  const [commDist, setCommDist] = useState(defaultCommDistZones());
  const [commHubs, setCommHubs] = useState(defaultCommHubs());
  const [commExtZones, setCommExtZones] = useState(defaultCommExtZones());

  // UI State
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", propertyName: "", address: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  // ─── Math Engine ─────────────────────────────────────────────────────────
  // Multi-Family: per-turn sqft rate climbs each tier (T1→T4: $0.18→$0.21→$0.24→$0.30)
  // + hub/corridor service at increasing frequency and rates per tier.
  // Commercial: user-entered sqft drives hub/corridor costs; tiers step up frequency & rates.
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
      const extCostPerVisit = Object.entries(resExtZones)
        .filter(([, on]) => on)
        .reduce((acc, [zone]) => acc + (EXT_ZONE_COST[zone] ?? 0), 0);

      const t1 = Math.round(unitTurnsSqFt * 0.18);
      const t2 = Math.round(
        unitTurnsSqFt * 0.21 +
        (hubAreaSqFt * 0.10 + touchUpSqFt * 0.05) / 12 +
        extCostPerVisit / 12
      );
      const t3 = Math.round(
        unitTurnsSqFt * 0.24 +
        (hubAreaSqFt * 0.13 + touchUpSqFt * 0.07) / 3 +
        (extCostPerVisit * 4) / 12
      );
      const t4 = Math.round(
        unitTurnsSqFt * 0.30 +
        hubAreaSqFt * 0.18 +
        touchUpSqFt * 0.10 +
        extCostPerVisit
      );
      const onboarding = Math.round(t2 * 1.5);

      return { unitTurnsSqFt, hubAreaSqFt, touchUpSqFt, extCostPerVisit, onboarding, tiers: [t1, t2, t3, t4] };
    } else {
      const hubAreaSqFt = Object.values(commHubs).reduce(
        (acc, row) => acc + row.qty * row.sqft, 0
      );
      const touchUpSqFt = Object.values(commDist).reduce(
        (acc, row) => acc + row.qty * row.floors * row.sqft, 0
      );
      const extCostPerVisit = Object.entries(commExtZones)
        .filter(([, on]) => on)
        .reduce((acc, [zone]) => acc + (COMM_EXT_COST[zone] ?? 0), 0);

      const ct1 = Math.round((hubAreaSqFt * 0.10 + touchUpSqFt * 0.05) / 12 + extCostPerVisit / 12);
      const ct2 = Math.round((hubAreaSqFt * 0.13 + touchUpSqFt * 0.07) / 3 + (extCostPerVisit * 4) / 12);
      const ct3 = Math.round(
        (hubAreaSqFt * 0.17 + touchUpSqFt * 0.10) / 3 +
        (hubAreaSqFt * 0.04 + touchUpSqFt * 0.02) +
        (extCostPerVisit * 4) / 12
      );
      const onboarding = Math.round(ct2 * 1.5);

      return { hubAreaSqFt, touchUpSqFt, extCostPerVisit, onboarding, tiers: [ct1, ct2, ct3] };
    }
  }, [unitMix, resDistZones, singularHubs, resExtZones, commDist, commHubs, commExtZones, isMultiFamily]);

  // ─── Tier Configs ─────────────────────────────────────────────────────────
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
      popular: false,
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
      features: [
        "Annual full repaint of all hubs",
        "Annual corridor touch-ups",
        "Annual exterior wash",
      ],
      note: "Pay monthly or save 5% with an annual upfront payment.",
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
        "Monthly condition reports",
      ],
    },
  ];

  const activeTiers = isMultiFamily ? resTiers : commTiers;

  // ─── Breakdown Text ───────────────────────────────────────────────────────
  const buildBreakdown = () => {
    const lines: string[] = [
      `PAINTLAB SUBSCRIPTION CONFIGURATION`,
      `Facility Type: ${facilityLabel}`,
      `Calculator: ${isMultiFamily ? "Residential Autopilot" : "Commercial Area-Based"}`,
      `Selected Tier: ${selectedTier ?? "Not yet selected"}`,
      `\nONBOARDING FEE (1.5×): ${fmt(calc.onboarding)}`,
      `\n───────────────────────────────────`,
    ];

    if (isMultiFamily) {
      lines.push(`\nUNIT TURN VOLUME (Monthly):`);
      Object.entries(unitMix).forEach(([type, row]) => {
        if (row.turns > 0) lines.push(`  ${UNIT_LABELS[type]}: ${row.turns} turns/mo × ${UNIT_SQFT[type]} sqft = ${(row.turns * UNIT_SQFT[type]).toLocaleString()} sqft`);
      });
      lines.push(`  TOTAL: ${(calc as any).unitTurnsSqFt?.toLocaleString() ?? 0} sqft`);
      lines.push(`\nCORRIDOR / TRANSIT ZONES:`);
      Object.entries(resDistZones).forEach(([zone, row]) => {
        if (row.qty > 0) lines.push(`  ${RES_DIST_LABELS[zone]}: ${row.qty} × ${row.floors} floors = ${(row.qty * row.floors * RES_DIST_SQFT[zone]).toLocaleString()} sqft`);
      });
      lines.push(`\nHUB AREAS:`);
      Object.entries(singularHubs).forEach(([hub, qty]) => {
        if (qty > 0) lines.push(`  ${RES_HUB_LABELS[hub]}: ${qty} × ${RES_HUB_SQFT[hub]} sqft = ${(qty * RES_HUB_SQFT[hub]).toLocaleString()} sqft`);
      });
      const selExt = Object.entries(resExtZones).filter(([, on]) => on).map(([z]) => EXT_ZONE_LABELS[z]);
      lines.push(`\nEXTERIOR ZONES: ${selExt.length > 0 ? selExt.join(", ") : "None"}`);
    } else {
      lines.push(`\nCORRIDOR / TRANSIT ZONES:`);
      Object.entries(commDist).forEach(([zone, row]) => {
        if (row.sqft > 0) lines.push(`  ${COMM_DIST_LABELS[zone]}: ${row.qty} qty × ${row.floors} floors × ${row.sqft} sqft = ${(row.qty * row.floors * row.sqft).toLocaleString()} sqft`);
      });
      lines.push(`\nHUB AREAS:`);
      Object.entries(commHubs).forEach(([hub, row]) => {
        if (row.sqft > 0) lines.push(`  ${COMM_HUB_LABELS[hub]}: ${row.qty} × ${row.sqft} sqft = ${(row.qty * row.sqft).toLocaleString()} sqft`);
      });
      const selExt = Object.entries(commExtZones).filter(([, on]) => on).map(([z]) => COMM_EXT_LABELS[z]);
      lines.push(`\nEXTERIOR ZONES: ${selExt.length > 0 ? selExt.join(", ") : "None"}`);
    }

    lines.push(`\n───────────────────────────────────`);
    lines.push(`TIER PRICING:`);
    activeTiers.forEach((tier, i) => {
      const mo = calc.tiers[i] ?? 0;
      const annual = Math.round(mo * 12 * 0.95);
      lines.push(`  ${tier.label}: ${fmt(mo)}/mo  |  ${fmt(annual)}/yr (5% discount)`);
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
      <div className="p-6">{content}</div>
    </div>
  );

  const colHdr = (label: string, hint?: string) => (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-foreground">{label}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );

  const extToggle = (
    zones: Record<string, boolean>,
    setter: (fn: (p: Record<string, boolean>) => Record<string, boolean>) => void,
    labels: Record<string, string>,
    costs: Record<string, number>
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Object.entries(zones).map(([zone, on]) => (
        <button
          key={zone}
          type="button"
          onClick={() => setter(p => ({ ...p, [zone]: !p[zone] }))}
          className={`flex items-center gap-3 p-3 border text-left transition-colors ${on ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}
        >
          <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${on ? "border-primary bg-primary" : "border-muted-foreground"}`}>
            {on && <span className="text-background text-xs font-bold">✓</span>}
          </div>
          <div>
            <p className="text-sm font-medium">{labels[zone]}</p>
            <p className="text-xs text-muted-foreground">${costs[zone]}/visit</p>
          </div>
        </button>
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
      <section className="py-16 bg-background border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="space-y-4">
            {isMultiFamily ? (
              <>
                {sectionCard("Unit Mix", "STEP 01", (
                  <div>
                    <div className="grid grid-cols-4 gap-3 mb-3 px-2">
                      <div />
                      {colHdr("# of Units", "total")}
                      {colHdr("Avg Turns / Mo", "per size")}
                      {colHdr("Paintable SqFt", "standard est.")}
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

                {sectionCard("Distributed Touch-up Zones", "STEP 02", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">These zones span multiple floors. Enter quantity of each zone type and the number of floors it covers.</p>
                    <div className="grid grid-cols-4 gap-3 mb-3 px-2">
                      <div />
                      {colHdr("Qty")}
                      {colHdr("# of Floors")}
                      {colHdr("~SqFt", "per floor")}
                    </div>
                    {Object.entries(resDistZones).map(([zone, row]) => (
                      <div key={zone} className="grid grid-cols-4 gap-3 items-center mb-2.5">
                        <p className="text-sm font-medium text-foreground pl-2 leading-tight">{RES_DIST_LABELS[zone]}</p>
                        {numInput(row.qty, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], qty: v } })))}
                        {numInput(row.floors, v => setResDistZones(p => ({ ...p, [zone]: { ...p[zone], floors: v } })))}
                        <div className="h-10 border border-border/40 bg-secondary/20 flex items-center justify-center text-sm text-muted-foreground">
                          {RES_DIST_SQFT[zone]} sqft
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {sectionCard("Singular Hubs", "STEP 03", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Enter the quantity of each hub type in your property.</p>
                    <div className="grid grid-cols-3 gap-3 mb-3 px-2">
                      <div />
                      {colHdr("Qty")}
                      {colHdr("~SqFt ea.", "standard est.")}
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

                {sectionCard("Exterior Power / Soft Wash Zones", "STEP 04", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Select the exterior zones included in your subscription. Wash frequency is determined by your selected tier.</p>
                    {extToggle(resExtZones, setResExtZones, EXT_ZONE_LABELS, EXT_ZONE_COST)}
                  </div>
                ))}
              </>
            ) : (
              <>
                {sectionCard("Distributed Touch-up Zones", "STEP 01", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Enter quantity, floor count and approximate square footage for each transit zone type. Typical office hallways/circulation space occupy 20%–30% of the total usable office square footage. After submitting your choice, we will schedule a walk-through to confirm details and investment structure.
                    </p>
                    <div className="grid grid-cols-5 gap-3 mb-3 px-2">
                      <div className="col-span-2" />
                      {colHdr("Qty")}
                      {colHdr("Floors")}
                      {colHdr("SqFt / Floor", "your estimate")}
                    </div>
                    {Object.entries(commDist).map(([zone, row]) => (
                      <div key={zone} className="grid grid-cols-5 gap-3 items-center mb-2.5">
                        <p className="text-sm font-medium text-foreground pl-2 leading-tight col-span-2">{COMM_DIST_LABELS[zone]}</p>
                        {numInput(row.qty, v => setCommDist(p => ({ ...p, [zone]: { ...p[zone], qty: v } })))}
                        {numInput(row.floors, v => setCommDist(p => ({ ...p, [zone]: { ...p[zone], floors: v } })))}
                        {numInput(row.sqft, v => setCommDist(p => ({ ...p, [zone]: { ...p[zone], sqft: v } })), "sqft")}
                      </div>
                    ))}
                    {Object.values(commDist).some(r => r.sqft > 0) && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-end">
                        <span className="text-sm text-muted-foreground">
                          Total zone sqft: <strong className="text-foreground">{Object.values(commDist).reduce((a, r) => a + r.qty * r.floors * r.sqft, 0).toLocaleString()}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {sectionCard("Singular Hubs (Full Repaint Zones)", "STEP 02", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Enter quantity and approximate square footage for each hub type. These receive full repaints at the cycle frequency of your chosen tier.
                    </p>
                    <div className="grid grid-cols-4 gap-3 mb-3 px-2">
                      <div className="col-span-2" />
                      {colHdr("Qty")}
                      {colHdr("SqFt ea.", "your estimate")}
                    </div>
                    {Object.entries(commHubs).map(([hub, row]) => (
                      <div key={hub} className="grid grid-cols-4 gap-3 items-center mb-2.5">
                        <p className="text-sm font-medium text-foreground pl-2 col-span-2">{COMM_HUB_LABELS[hub]}</p>
                        {numInput(row.qty, v => setCommHubs(p => ({ ...p, [hub]: { ...p[hub], qty: v } })))}
                        {numInput(row.sqft, v => setCommHubs(p => ({ ...p, [hub]: { ...p[hub], sqft: v } })), "sqft")}
                      </div>
                    ))}
                    {Object.values(commHubs).some(r => r.sqft > 0) && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-end">
                        <span className="text-sm text-muted-foreground">
                          Total hub sqft: <strong className="text-foreground">{Object.values(commHubs).reduce((a, r) => a + r.qty * r.sqft, 0).toLocaleString()}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {sectionCard("Exterior Pressure / Soft Wash Services", "STEP 03", (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">Select exterior zones to include in your subscription. Wash frequency is determined by your selected tier.</p>
                    {extToggle(commExtZones, setCommExtZones, COMM_EXT_LABELS, COMM_EXT_COST)}
                    <div className="mt-5 p-4 border border-border/50 bg-secondary/10 flex gap-3">
                      <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground mb-1">Other areas requiring further scope:</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Roofs · Pedestrian walkways & sidewalks · Parking garages & lots · Windows & trim · Drive-thrus · Parking curbs — these will be assessed during your complimentary walk-through and quoted separately.
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
              const hasNote = !isMultiFamily && (tier as any).note;

              return (
                <motion.button
                  key={tier.id}
                  variants={fadeInUp}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`relative bg-card p-7 flex flex-col text-left transition-all ${isSelected ? "ring-2 ring-primary ring-inset" : "hover:bg-secondary/30"}`}
                >
                  {(tier as any).popular && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
                  )}
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
                          <div className="mt-2 text-xs text-muted-foreground">
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

                  {hasNote && (
                    <p className="text-[10px] text-muted-foreground mb-4 italic border-t border-border/50 pt-3">
                      * {(tier as any).note}
                    </p>
                  )}

                  <div className={`mt-auto h-9 border text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors ${
                    isSelected ? "bg-primary text-background border-primary" : "border-border text-muted-foreground"
                  }`}>
                    {isSelected ? "✓ Selected" : "Select this tier"}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

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
              <p className="text-muted-foreground mt-2">We'll send your full configuration summary and schedule a complimentary walkthrough to finalize scope and investment.</p>
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
            <p className="text-xs text-muted-foreground text-center mt-3">(512) 484-3124 · Mon–Fri 8am–6pm CT · Available for emergency dispatch</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
