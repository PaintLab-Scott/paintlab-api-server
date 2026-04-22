import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Link } from "wouter";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const facilityLabels: Record<string, string> = {
  "multi-family": "Multi-Family Residential",
  "medical": "Medical / Healthcare",
  "retail-hospitality": "Retail / Hospitality",
  "industrial": "Industrial / Warehouse",
  "office-corporate": "Office / Corporate",
  "automotive": "Automotive",
  "education": "Education",
};

const facilityRates: Record<string, number> = {
  "multi-family": 0.072,
  "medical": 0.105,
  "retail-hospitality": 0.095,
  "industrial": 0.065,
  "office-corporate": 0.088,
  "automotive": 0.078,
  "education": 0.070,
};

const coverageMultipliers: Record<string, number> = {
  interior: 0.55,
  exterior: 0.55,
  both: 1.0,
};

const tierConfig = [
  {
    id: "essential",
    icon: <Shield className="w-5 h-5" />,
    label: "Essential",
    multiplier: 1.0,
    frequency: "Annual refresh cycle",
    features: [
      "Annual repaint schedule",
      "Priority scheduling windows",
      "2-year workmanship guarantee",
      "Dedicated project coordinator",
      "Digital condition reporting",
    ],
  },
  {
    id: "professional",
    icon: <Zap className="w-5 h-5" />,
    label: "Professional",
    multiplier: 1.55,
    frequency: "Semi-annual service cycle",
    features: [
      "Semi-annual service cycle",
      "Touchup & maintenance calls",
      "Priority dispatch (48-hr response)",
      "Quarterly property inspection",
      "Color library management",
      "2-year workmanship guarantee",
    ],
    highlighted: true,
  },
  {
    id: "premium",
    icon: <Star className="w-5 h-5" />,
    label: "Premium",
    multiplier: 2.1,
    frequency: "Quarterly service + on-demand",
    features: [
      "Quarterly service + on-demand calls",
      "24-hr emergency response",
      "Dedicated site foreman",
      "Portfolio-level management",
      "Monthly condition dashboard",
      "Annual strategic planning session",
      "2-year workmanship guarantee",
    ],
  },
];

const sqftOptions = [2500, 5000, 10000, 25000, 50000, 100000];

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function computeMonthly(sqft: number, coverage: string, tier: string, facilityId: string): number {
  const rate = facilityRates[facilityId] ?? 0.08;
  const covMult = coverageMultipliers[coverage] ?? 1.0;
  const tierMult = tierConfig.find(t => t.id === tier)?.multiplier ?? 1.0;
  return Math.round((sqft * rate * covMult * tierMult) / 12);
}

export default function SubscriptionLab() {
  const [location] = useLocation();
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const typeFromUrl = params.get("type") ?? sessionStorage.getItem("facilityType") ?? "office-corporate";
  const facilityId = typeFromUrl;
  const facilityLabel = facilityLabels[facilityId] ?? "Commercial";

  const [sqft, setSqft] = useState(10000);
  const [customSqft, setCustomSqft] = useState("");
  const [coverage, setCoverage] = useState("both");
  const [tier, setTier] = useState("professional");

  const activeSqft = customSqft ? parseInt(customSqft.replace(/\D/g, ""), 10) || sqft : sqft;
  const monthly = computeMonthly(activeSqft, coverage, tier, facilityId);
  const annual = monthly * 12;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* HEADER */}
      <section className="pt-32 pb-16 border-b border-border bg-card">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp} className="mb-8">
              <Link href="/subscription-portal">
                <button className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Facility Selection
                </button>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">Subscription Lab</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-bold tracking-tighter mb-3">
              Configure Your Plan.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg">
              Facility type: <strong className="text-foreground">{facilityLabel}</strong>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* CALCULATOR BODY */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">

            {/* LEFT: Inputs */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="xl:col-span-7 space-y-10"
            >

              {/* Step 1: Square Footage */}
              <motion.div variants={fadeInUp} className="border border-border p-8 bg-card">
                <p className="text-xs font-mono uppercase tracking-widest text-primary mb-1">Step 01</p>
                <h3 className="text-xl font-bold mb-6">Total Paintable Square Footage</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
                  {sqftOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setSqft(opt); setCustomSqft(""); }}
                      className={`h-12 text-sm font-semibold border transition-colors ${
                        activeSqft === opt && !customSqft
                          ? "bg-primary text-background border-primary"
                          : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {opt >= 1000 ? `${opt / 1000}K` : opt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Enter custom sq ft..."
                    value={customSqft}
                    onChange={e => setCustomSqft(e.target.value)}
                    className="flex-1 h-12 bg-background border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <span className="text-muted-foreground text-sm">sq ft</span>
                </div>
              </motion.div>

              {/* Step 2: Coverage */}
              <motion.div variants={fadeInUp} className="border border-border p-8 bg-card">
                <p className="text-xs font-mono uppercase tracking-widest text-primary mb-1">Step 02</p>
                <h3 className="text-xl font-bold mb-6">Coverage Scope</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "interior", label: "Interior Only", desc: "Common areas, corridors, units" },
                    { id: "exterior", label: "Exterior Only", desc: "Facades, soffits, trim, curb" },
                    { id: "both", label: "Interior + Exterior", desc: "Full-property coverage" },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setCoverage(opt.id)}
                      className={`p-5 border text-left transition-colors ${
                        coverage === opt.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <p className="font-bold text-sm mb-1">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Step 3: Tier */}
              <motion.div variants={fadeInUp} className="border border-border p-8 bg-card">
                <p className="text-xs font-mono uppercase tracking-widest text-primary mb-1">Step 03</p>
                <h3 className="text-xl font-bold mb-6">Service Tier</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {tierConfig.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTier(t.id)}
                      className={`p-6 border text-left transition-colors flex flex-col ${
                        tier === t.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/40"
                      } ${t.highlighted ? "relative" : ""}`}
                    >
                      {t.highlighted && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
                      )}
                      <div className={`flex items-center gap-2 mb-3 ${tier === t.id ? "text-primary" : "text-muted-foreground"}`}>
                        {t.icon}
                        <span className="font-bold text-sm uppercase tracking-wider">{t.label}</span>
                        {t.highlighted && <span className="ml-auto text-[10px] bg-primary text-background px-2 py-0.5 font-bold uppercase">Popular</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">{t.frequency}</p>
                      <ul className="space-y-1.5">
                        {t.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-px" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </motion.div>

            </motion.div>

            {/* RIGHT: Price Summary */}
            <div className="xl:col-span-5">
              <div className="sticky top-32">
                <motion.div
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                  className="border border-border bg-card p-8 md:p-10"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-[1px] w-8 bg-primary" />
                    <span className="text-primary font-mono text-xs tracking-widest uppercase">Your Estimate</span>
                  </div>

                  <div className="mb-8">
                    <p className="text-muted-foreground text-sm mb-2">Estimated monthly investment</p>
                    <div className="text-5xl md:text-6xl font-black tracking-tighter text-foreground">
                      {formatCurrency(monthly)}
                      <span className="text-xl text-muted-foreground font-normal">/mo</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">{formatCurrency(annual)} billed annually</p>
                  </div>

                  <div className="space-y-3 mb-8 text-sm">
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Facility Type</span>
                      <span className="font-semibold text-right max-w-[180px]">{facilityLabel}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Coverage</span>
                      <span className="font-semibold capitalize">{coverage === "both" ? "Interior + Exterior" : coverage === "interior" ? "Interior Only" : "Exterior Only"}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Square Footage</span>
                      <span className="font-semibold">{activeSqft.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-muted-foreground">Service Tier</span>
                      <span className="font-semibold capitalize">{tier}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-6 leading-relaxed border border-border/50 bg-secondary/20 p-4">
                    Estimate is for planning purposes. Final pricing is determined after a complimentary on-site assessment. All subscriptions include the PaintLab 2-year workmanship guarantee.
                  </p>

                  <a href="/#quote" className="block">
                    <Button size="lg" className="w-full rounded-none bg-primary text-background hover:bg-primary/90 font-semibold uppercase tracking-wider h-14">
                      Request a Formal Proposal <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground text-center mt-4">No commitment required. Response within 1 business day.</p>
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
