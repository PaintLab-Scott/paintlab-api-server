import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, Building2, Heart, ShoppingBag, Factory, Briefcase, Car, GraduationCap, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } }
};

const facilities = [
  {
    id: "multi-family",
    label: "Multi-Family Residential",
    sub: "Apartments, Condos, HOAs, Mixed-Use",
    icon: <Building2 className="w-8 h-8" />,
    desc: "Recurring interior & exterior programs for apartment communities, condo associations, and mixed-use developments. Protect curb appeal and reduce unit turn costs.",
    accent: "From common areas to unit turns—automated.",
  },
  {
    id: "medical",
    label: "Medical / Healthcare",
    sub: "Clinics, Hospitals, Dental, Urgent Care",
    icon: <Heart className="w-8 h-8" />,
    desc: "Infection-resistant coatings and scheduled maintenance for healthcare environments with zero operational disruption—night and weekend scheduling available.",
    accent: "Compliance-grade coatings. Zero downtime.",
  },
  {
    id: "retail-hospitality",
    label: "Retail / Hospitality",
    sub: "Hotels, Restaurants, Retail Centers, Spas",
    icon: <ShoppingBag className="w-8 h-8" />,
    desc: "Protect brand aesthetics across high-traffic spaces. Phased repaints that keep your doors open, your guests satisfied, and your property looking premium.",
    accent: "Brand-consistent. Guest-ready.",
  },
  {
    id: "industrial",
    label: "Industrial / Warehouse",
    sub: "Distribution, Manufacturing, Cold Storage",
    icon: <Factory className="w-8 h-8" />,
    desc: "Industrial-grade protective coatings, OSHA safety markings, and epoxy flooring systems maintained on a recurring schedule to protect critical infrastructure.",
    accent: "Safety markings. Protective systems. On schedule.",
  },
  {
    id: "office-corporate",
    label: "Office / Corporate",
    sub: "Class A, B&C Office, Tech Campuses",
    icon: <Briefcase className="w-8 h-8" />,
    desc: "Tenant-ready interiors and polished exteriors—maintained year-round so your property competes at the highest level without the capital planning headaches.",
    accent: "Tenant-ready. Always.",
  },
  {
    id: "automotive",
    label: "Automotive",
    sub: "Dealerships, Service Centers, Car Washes",
    icon: <Car className="w-8 h-8" />,
    desc: "Specialty coatings for showroom floors, service bays, and lot structures. Durable, chemical-resistant systems built for the demands of automotive environments.",
    accent: "Showroom-grade finishes. Service-bay tough.",
  },
  {
    id: "education",
    label: "Education",
    sub: "K-12, Universities, Daycare, Libraries",
    icon: <GraduationCap className="w-8 h-8" />,
    desc: "Low-VOC, durable interior systems for schools and universities—executed during breaks and weekends so students and faculty are never impacted.",
    accent: "Summer & break scheduling. Low-VOC systems.",
  },
];

export default function SubscriptionPortal() {
  const [, setLocation] = useLocation();

  const handleSelect = (id: string) => {
    sessionStorage.setItem("facilityType", id);
    setLocation(`/subscription-lab?type=${id}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* HEADER */}
      <section className="pt-32 pb-20 border-b border-border bg-card relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">Subscription Portal</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-tight">
              Select Your <span className="text-primary">Facility Type.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-muted-foreground leading-relaxed">
              Choose the category that best describes your property. We'll configure a <strong className="text-foreground">custom subscription plan</strong> built for your specific operational needs.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* FACILITY CARDS */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-border"
          >
            {facilities.map((facility) => (
              <motion.button
                key={facility.id}
                variants={fadeInUp}
                onClick={() => handleSelect(facility.id)}
                className="bg-card p-8 md:p-10 hover:bg-secondary/40 transition-colors group flex flex-col text-left relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300" />

                <div className="w-14 h-14 bg-background border border-border flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 flex-shrink-0">
                  {facility.icon}
                </div>

                <h3 className="text-xl font-bold mb-1 tracking-tight">{facility.label}</h3>
                <p className="text-primary text-xs font-mono uppercase tracking-wider mb-4">{facility.sub}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">{facility.desc}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground italic">{facility.accent}</span>
                  <div className="w-8 h-8 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors flex-shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <p className="text-muted-foreground mb-2">Not sure which category fits?</p>
          <a href="#quote" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
            Talk to our team <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
