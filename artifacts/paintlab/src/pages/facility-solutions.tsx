import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Building2, Briefcase, ShoppingBag, Factory, Building,
  Utensils, Heart, Package, Home, GraduationCap, Activity,
  ArrowRight, ChevronRight, ChevronDown, Target
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const facilities = [
  {
    slug: "/facility-solutions/multifamily-repaint-pilot",
    icon: <Building2 className="w-6 h-6" />,
    label: "Multifamily Residential",
    sub: "Apartments · Condos · HOAs · Mixed-Use",
    value: "Reduce repaint friction across unit turns, common areas, amenities, and portfolio maintenance.",
  },
  {
    slug: "/facility-solutions/office-cre-repaint-support",
    icon: <Briefcase className="w-6 h-6" />,
    label: "Office / Corporate / CRE",
    sub: "Class A/B/C · Tech Campuses",
    value: "Keep office buildings, tenant spaces, lobbies, and shared areas presentation-ready.",
  },
  {
    slug: "/facility-solutions/retail-repaint-support",
    icon: <ShoppingBag className="w-6 h-6" />,
    label: "Retail / Shopping Centers",
    sub: "Strip Malls · Storefronts · Centers",
    value: "Protect customer-facing spaces with fast, clean, low-disruption repaint support.",
  },
  {
    slug: "/facility-solutions/industrial-warehouse-repaint-support",
    icon: <Factory className="w-6 h-6" />,
    label: "Industrial / Warehouse",
    sub: "Distribution · Manufacturing · Cold Storage",
    value: "Support facility appearance and operational continuity without disrupting production.",
  },
  {
    slug: "/facility-solutions/hospitality-repaint-support",
    icon: <Building className="w-6 h-6" />,
    label: "Hospitality",
    sub: "Hotels · Resorts · Extended Stay",
    value: "Maintain guest-facing presentation across hotels, resorts, restaurants, and amenity spaces.",
  },
  {
    slug: "/facility-solutions/restaurant-repaint-support",
    icon: <Utensils className="w-6 h-6" />,
    label: "Restaurants",
    sub: "Dining · Fast Casual · Back-of-House",
    value: "Refresh dining rooms, back-of-house areas, exteriors, and brand-critical surfaces.",
  },
  {
    slug: "/facility-solutions/senior-living-repaint-support",
    icon: <Heart className="w-6 h-6" />,
    label: "Senior Living",
    sub: "Assisted Living · Memory Care · Independent",
    value: "Deliver professional repaint support with resident comfort, cleanliness, and scheduling sensitivity.",
  },
  {
    slug: "/facility-solutions/self-storage-repaint-support",
    icon: <Package className="w-6 h-6" />,
    label: "Self Storage",
    sub: "Climate-Controlled · Drive-Up · Mixed Storage",
    value: "Improve curb appeal, corridors, offices, doors, and high-visibility storage areas.",
  },
  {
    slug: "/facility-solutions/hoa-community-repaint-support",
    icon: <Home className="w-6 h-6" />,
    label: "HOA / Community Associations",
    sub: "Residential Communities · Condos · Mixed-Use",
    value: "Support clubhouses, amenity centers, gates, shared structures, and community assets.",
  },
  {
    slug: "/facility-solutions/education-facility-repaint-support",
    icon: <GraduationCap className="w-6 h-6" />,
    label: "Education / Schools",
    sub: "K-12 · Universities · Daycare · Libraries",
    value: "Refresh classrooms, corridors, offices, gyms, and high-use spaces around academic schedules.",
  },
  {
    slug: "/facility-solutions/healthcare-facility-repaint-support",
    icon: <Activity className="w-6 h-6" />,
    label: "Healthcare",
    sub: "Clinics · Hospitals · Dental · Senior Care",
    value: "Support clean, professional repaint execution for patient-facing and staff-facing environments.",
  },
];

export default function FacilitySolutions() {
  const [, navigate] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Facility Repaint Solutions | PAINTLAB Austin";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "PAINTLAB provides facility-level repaint support for multifamily, office, retail, hospitality, industrial, senior living, self storage, HOA, education, and healthcare properties in Austin and Central Texas.");
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-40 pb-28">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden select-none">
          <img
            src="/images/pl-icon-new.png"
            alt=""
            aria-hidden
            className="opacity-[0.035] w-[600px] sm:w-[800px] max-w-none translate-x-32"
            style={{ mixBlendMode: "lighten" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

        <div className="relative container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">Facility Solutions</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6"
            >
              Facility-Level Repaint<br />
              <span className="text-primary">Solutions Built for</span><br />
              Operational Leaders.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mb-10"
            >
              PAINTLAB helps property, maintenance, and facilities leaders simplify repaint operations through reliable execution, proactive maintenance planning, improved budgeting predictability, and low-risk pilot programs designed to prove value before scaling.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <a
                href="#facility-types"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors"
              >
                Find Your Facility Type
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@paintlabpro.com?subject=Pilot%20Conversation%20Request%20-%20PAINTLAB"
                className="inline-flex items-center gap-2 px-8 py-4 border border-border text-foreground font-semibold uppercase tracking-wider text-sm hover:border-primary hover:text-primary transition-colors"
              >
                Request a Pilot Conversation
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FACILITY TYPE GRID ───────────────────────────────────────────── */}
      <section id="facility-types" className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mb-10"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-black tracking-tighter mb-6">
              Choose Your Facility Type
            </motion.h2>

            {/* Facility Selector Dropdown */}
            <motion.div variants={fadeInUp} className="relative max-w-xl">
              <button
                type="button"
                onClick={() => setDropdownOpen(o => !o)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 border border-primary/50 bg-card hover:border-primary transition-colors text-left"
              >
                <span className="text-sm font-medium text-muted-foreground">Jump to a facility type…</span>
                <ChevronDown className={`w-4 h-4 text-primary flex-shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-20 border border-primary/30 border-t-0 bg-card shadow-xl max-h-72 overflow-y-auto">
                  {facilities.map((f) => (
                    <button
                      key={f.slug}
                      type="button"
                      onClick={() => { setDropdownOpen(false); navigate(f.slug); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-secondary/50 hover:text-primary transition-colors border-b border-border/40 last:border-b-0 group"
                    >
                      <span className="text-primary flex-shrink-0">{f.icon}</span>
                      <div className="flex-grow min-w-0">
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors block leading-tight">{f.label}</span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{f.sub}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary flex-shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-border"
          >
            {facilities.map((f) => (
              <motion.div key={f.slug} variants={fadeInUp}>
                <Link href={f.slug}>
                  <div className="bg-card p-8 md:p-10 hover:bg-secondary/40 transition-colors group flex flex-col text-left relative overflow-hidden h-full cursor-pointer">
                    <div className="absolute top-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300" />

                    <div className="w-12 h-12 bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 mb-6 flex-shrink-0">
                      {f.icon}
                    </div>

                    <h3 className="text-lg font-bold mb-1 tracking-tight leading-snug">{f.label}</h3>
                    <p className="text-primary text-[10px] font-mono uppercase tracking-wider mb-4">{f.sub}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-grow mb-6">{f.value}</p>

                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">
                      <span className="text-sm font-semibold text-primary group-hover:underline transition-all">Explore Solution</span>
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {/* 12th tile — Contact CTA */}
            <motion.div variants={fadeInUp}>
              <div className="bg-card p-8 md:p-10 flex flex-col items-center justify-center gap-6 h-full min-h-[280px] border-t border-border">
                <img src="/images/pl-logo.png" alt="PaintLab" className="h-10 w-auto object-contain" style={{ mixBlendMode: "lighten" }} />
                <p className="text-muted-foreground text-xs text-center leading-relaxed max-w-[200px]">Not sure which solution fits your facility?</p>
                <a
                  href="mailto:hello@paintlabpro.com?subject=Facility%20Solutions%20Inquiry"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary text-sm font-semibold uppercase tracking-wider hover:bg-primary hover:text-background transition-colors"
                >
                  Contact Us
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PROOF MODEL SECTION ──────────────────────────────────────────── */}
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-primary font-mono text-xs tracking-widest uppercase">The Pilot Model</span>
              </motion.div>

              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-black tracking-tighter mb-6">
                Start Small. Prove the Model.<br />
                <span className="text-primary">Scale What Works.</span>
              </motion.h2>

              <motion.p variants={fadeInUp} className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-3xl">
                PAINTLAB is designed for leaders who want a more reliable repaint partner without committing an entire portfolio upfront. We help teams identify a pilot property, define the repaint scope, prove responsiveness and workmanship, then explore a broader maintenance or project-based relationship.
              </motion.p>

              <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border mb-12">
                {[
                  { step: "01", title: "Identify a Pilot Property", desc: "Pick one building, floor, or area where a repaint refresh would have visible impact." },
                  { step: "02", title: "Define the Scope", desc: "We scope the work clearly — no ambiguous bids, no scope creep, no surprises at close." },
                  { step: "03", title: "Scale the Relationship", desc: "Prove the model on one site, then expand to a recurring maintenance program or full portfolio." },
                ].map((item) => (
                  <div key={item.step} className="bg-card p-8">
                    <div className="text-primary font-mono text-xs font-black tracking-widest mb-4">{item.step}</div>
                    <h3 className="font-bold text-base mb-2 tracking-tight">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp}>
                <a
                  href="#facility-types"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors"
                >
                  Start With a Pilot Property
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────────── */}
      <section className="py-14 bg-card border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6">
            {[
              { icon: <Target className="w-4 h-4" />, text: "Budget predictability" },
              { icon: <Activity className="w-4 h-4" />, text: "Pilot-first approach" },
              { icon: <Heart className="w-4 h-4" />, text: "Zero-disruption scheduling" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-muted-foreground text-sm">
                <span className="text-primary">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
