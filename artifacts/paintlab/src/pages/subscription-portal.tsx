import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Building2, Heart, Factory, Briefcase, Car, GraduationCap, ShoppingCart, ChevronRight, Dumbbell, Phone, Mail } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } }
};

const facilities = [
  {
    id: "multi-family",
    label: "Multi-Family Residential",
    sub: "Apartments, Condos, HOAs, Mixed-Use",
    icon: <Building2 className="w-8 h-8" />,
    desc: "Recurring unit turn programs + common area maintenance for apartment communities, condo associations, and mixed-use developments.",
    badge: "Multi-Family Autopilot",
    path: "multi-family",
  },
  {
    id: "office-corporate",
    label: "Office / Corporate",
    sub: "Class A/B/C Office, Tech Campuses",
    icon: <Briefcase className="w-8 h-8" />,
    desc: "Tenant-ready interiors and polished common areas — hub repaints and corridor touch-up programs that keep your building at its best year-round.",
    badge: "Commercial Calculator",
    path: "commercial",
  },
  {
    id: "medical",
    label: "Medical / Healthcare",
    sub: "Clinics, Hospitals, Dental, Senior Care Facilities",
    icon: <Heart className="w-8 h-8" />,
    desc: "Infection-resistant coatings and hub-based maintenance scheduling for healthcare environments — zero operational disruption.",
    badge: "Commercial Calculator",
    path: "commercial",
  },
  {
    id: "industrial",
    label: "Industrial / Warehouse",
    sub: "Distribution, Manufacturing, Cold Storage",
    icon: <Factory className="w-8 h-8" />,
    desc: "Protective coatings, OSHA safety markings, and transit zone touch-up programs maintained on a recurring schedule.",
    badge: "Commercial Calculator",
    path: "commercial",
  },
  {
    id: "automotive",
    label: "Automotive",
    sub: "Dealerships, Service Centers, Car Washes",
    icon: <Car className="w-8 h-8" />,
    desc: "Specialty coatings for showroom floors, service bays, and lot structures with chemical-resistant maintenance systems.",
    badge: "Commercial Calculator",
    path: "commercial",
  },
  {
    id: "education",
    label: "Education",
    sub: "K-12, Universities, Daycare, Libraries",
    icon: <GraduationCap className="w-8 h-8" />,
    desc: "Low-VOC, durable systems for schools and universities — executed during breaks and weekends, zero disruption.",
    badge: "Commercial Calculator",
    path: "commercial",
  },
  {
    id: "retail",
    label: "Retail",
    sub: "Shopping Centers, Storefronts, Strip Malls",
    icon: <ShoppingCart className="w-8 h-8" />,
    desc: "Brand-consistent, customer-ready interiors and facades across high-traffic retail spaces. Phased repaints keep doors open.",
    badge: "Commercial Calculator",
    path: "commercial",
  },
  {
    id: "gyms-fitness",
    label: "Gyms & Fitness Centers",
    sub: "Boutique Studios, Big-Box Gyms, Rec Centers",
    icon: <Dumbbell className="w-8 h-8" />,
    desc: "High-moisture, high-traffic environments demand performance-grade coatings. Keep your facility looking sharp between membership cycles with scheduled hub repaints and corridor maintenance.",
    badge: "Commercial Calculator",
    path: "commercial",
  },
];

export default function SubscriptionPortal() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [, setLocation] = useLocation();

  const FACILITY_TO_SLUG: Record<string, string> = {
    "multi-family": "multifamily-apartment-painting-austin-tx",
    "office-corporate": "office-corporate-painting-austin-tx",
    "medical": "medical-healthcare-painting-austin-tx",
    "industrial": "industrial-warehouse-painting-austin-tx",
    "automotive": "automotive-dealership-painting-austin-tx",
    "education": "education-campus-painting-austin-tx",
    "retail": "retail-store-painting-austin-tx",
    "gyms-fitness": "gym-fitness-center-painting-austin-tx",
  };

  const handleSelect = (facility: typeof facilities[0]) => {
    sessionStorage.setItem("facilityType", facility.id);
    sessionStorage.setItem("facilityLabel", facility.label);
    const slug = FACILITY_TO_SLUG[facility.path] ?? FACILITY_TO_SLUG[facility.id];
    if (slug) {
      setLocation(`/subscriptions/${slug}`);
    } else if (facility.path === "multi-family") {
      setLocation(`/subscriptions/multifamily-apartment-painting-austin-tx`);
    } else {
      setLocation(`/subscription-lab?type=commercial&facility=${facility.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <section className="pt-32 pb-20 border-b border-border bg-card relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeInUp} className="mb-6">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Main Page
              </a>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">Subscription Portal</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-tight">
              Select Your <span className="text-primary">Facility Type.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-muted-foreground leading-relaxed">
              Choose the category that best describes your property. We'll open the right calculator to build your <strong className="text-foreground">custom subscription plan</strong>.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-border"
          >
            {facilities.map((facility) => (
              <motion.button
                key={facility.id}
                variants={fadeInUp}
                onClick={() => handleSelect(facility)}
                className="bg-card p-8 md:p-10 hover:bg-secondary/40 transition-colors group flex flex-col text-left relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300" />

                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 flex-shrink-0">
                    {facility.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border ${
                    facility.path === 'multi-family'
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-border text-muted-foreground'
                  }`}>
                    {facility.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1 tracking-tight">{facility.label}</h3>
                <p className="text-primary text-xs font-mono uppercase tracking-wider mb-4">{facility.sub}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">{facility.desc}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">Configure plan →</span>
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors flex-shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            ))}

            {/* Filler cell — logo + contact (fills empty 9th slot in 3-col grid) */}
            <motion.div variants={fadeInUp} className="bg-card p-8 md:p-10 flex flex-col justify-between border-l-0 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
              <div className="relative z-10 flex flex-col h-full">
                <img src="/logo.svg" alt="PaintLab" className="h-10 w-auto object-contain mb-6 opacity-90" />
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                  Not sure which plan fits? Our team will walk you through the right configuration for your property — no commitment required.
                </p>
                <div className="mt-auto space-y-3">
                  <a href="mailto:hello@paintlabpro.com?subject=PaintLab%20Subscription%20Inquiry"
                    className="flex items-center gap-3 w-full px-4 py-3 bg-primary text-background text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    hello@paintlabpro.com
                  </a>
                  <a href="tel:+15124843124"
                    className="flex items-center gap-3 w-full px-4 py-3 border border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    (512) 484-3124
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <p className="text-muted-foreground mb-2">Not sure which category fits your property?</p>
          <a
            href="mailto:hello@paintlabpro.com?subject=PaintLab%20Subscription%20Inquiry"
            className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            Talk to our team <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
