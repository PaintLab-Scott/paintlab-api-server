import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight, ShieldCheck, Factory, Target, Building2, PaintRoller,
  Droplets, Wrench, CalendarDays, Check, Shield, Zap, Clock, Users
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const services = [
  {
    slug: "high-traffic-interior",
    icon: <Building2 className="w-6 h-6" />,
    title: "High Traffic Interior Systems",
    tagline: "Durable Finishes Built for Occupied Commercial Spaces",
    desc: "Scuff-resistant, scrub-grade systems engineered for constant use, chemical exposure, and long-term lifecycle performance in active commercial environments."
  },
  {
    slug: "exterior-building-coatings",
    icon: <PaintRoller className="w-6 h-6" />,
    title: "Exterior Building Coatings",
    tagline: "Long-Term Asset Protection for Texas Commercial Properties",
    desc: "Engineered exterior protection systems designed to withstand UV exposure, heat cycling, moisture intrusion, and structural movement across the Texas climate."
  },
  {
    slug: "industrial-protective-coatings",
    icon: <Factory className="w-6 h-6" />,
    title: "Industrial & Protective Coatings",
    tagline: "Compliance-Driven Protection for Critical Surfaces",
    desc: "Industrial-grade systems that resist chemicals, abrasion, and mechanical wear—protecting infrastructure and supporting compliance standards."
  },
  {
    slug: "sealants-waterproofing",
    icon: <Droplets className="w-6 h-6" />,
    title: "Sealants & Waterproofing Systems",
    tagline: "Building Envelope Defense Against Moisture & Structural Movement",
    desc: "System-level sealant and waterproofing solutions that reinforce the full building envelope and prevent long-term structural damage."
  },
  {
    slug: "specialty-coating-services",
    icon: <Wrench className="w-6 h-6" />,
    title: "Specialty Coating Services",
    tagline: "One Partner. No Coordination Headaches.",
    desc: "Integrated specialty services—wallcovering, graphics, drywall, pressure washing, and maintenance programs—under a single, accountable contractor."
  }
];

const sectors = [
  {
    title: "Multi-Family Residential",
    sub: "Apartments, Condos, HOA Communities",
    int: "Low/Zero-VOC interior latex, acoustic coatings, washable hallway finishes",
    ext: "Elastomeric facade, weatherproof sealers, balcony deck systems"
  },
  {
    title: "Office Buildings",
    sub: "Office Space, Corporate Campuses, Co-Working",
    int: "Scuff-resistant acrylics, Low/Zero-VOC, dry erase & magnetic coatings, high-performance epoxies",
    ext: "Elastomeric coatings, weatherproof sealers, fluoropolymer/urethane coatings, anti-graffiti coatings, DTM acrylics"
  },
  {
    title: "Retail",
    sub: "Storefronts, Shopping Centers, Facades",
    int: "High-gloss interior finish coats, scuff-resistant acrylics, anti-graffiti coatings",
    ext: "UV-stable exterior facade finishes, anti-graffiti coatings"
  },
  {
    title: "Medical / Healthcare",
    sub: "Hospitals, Clinics, Urgent Care, Research Labs",
    int: "Anti-microbial epoxy, sealed wall systems, cleanroom-rated coatings",
    ext: "Anti-carbonation, chemical-resistant exterior finishes"
  },
  {
    title: "Warehouse & Distribution",
    sub: "Logistics Hubs, Fulfillment Centers, Cold Storage",
    int: "High-build epoxy floors, line-marking systems, racking-zone coatings",
    ext: "Anti-carbonation exterior shell, dock seal finishes, roof membranes"
  },
  {
    title: "Industrial / Manufacturing",
    sub: "Factories, Processing Plants, Power Facilities",
    int: "Heavy-duty epoxy armor, intumescent fire protection, chemical linings",
    ext: "Anti-corrosion exterior systems, high-temp coatings, structural steel finishes"
  },
  {
    title: "Education",
    sub: "K-12 Schools, Universities, Research Campuses",
    int: "Washable low-VOC interior paint, acoustic membrane for classrooms",
    ext: "Anti-graffiti exterior coat, durable masonry finishes"
  },
  {
    title: "Automotive",
    sub: "Dealerships, Service Bays, Body Shops",
    int: "Chemical-resistant polyurethane floors, oil-stop epoxy, bay line marking",
    ext: "UV-stable gloss finishes, weatherproof showroom facades"
  },
  {
    title: "Data Centers",
    sub: "Server Farms, Colocation Facilities, Tech Campuses",
    int: "ESD epoxy floors, anti-static wall coatings, raised floor finishes",
    ext: "Vapor-barrier exterior systems, reflective roof coatings"
  }
];

const projectTypes = [
  { id: "multifamily", label: "Multi-Family Residential" },
  { id: "office", label: "Office Buildings" },
  { id: "retail", label: "Retail" },
  { id: "hospitality", label: "Hospitality" },
  { id: "selfStorage", label: "Self Storage" },
  { id: "hoa", label: "HOA / Community Associations" },
  { id: "medical", label: "Medical / Healthcare" },
  { id: "warehouse", label: "Warehouse & Distribution" },
  { id: "industrial", label: "Industrial / Manufacturing" },
  { id: "education", label: "Education" },
  { id: "automotive", label: "Automotive" },
  { id: "datacenters", label: "Data Centers" },
];

const approachSteps = [
  {
    num: "01",
    title: "Relentlessly Easy to Work With",
    desc: "We deliver fast, thoughtful bids with clear scope, timelines, and requirements so you know exactly what to expect from the start. Communication is thoughtful, proactive, professional, and transparent—no chasing updates, no ambiguity, no surprises. We operate with one standard: a seamless, low-friction experience that earns trust and makes working together effortless from day one."
  },
  {
    num: "02",
    title: "Strategic Assessment & System Design",
    desc: "We don't just paint; we specify. We evaluate substrates, environmental conditions, and long-term performance goals to engineer the precise coating system required for your asset."
  },
  {
    num: "03",
    title: "Structured Planning & Controlled Execution",
    desc: "Execution without disruption. We align timelines with your operational needs, utilizing phased workflows and maintaining clear, documented communication throughout every phase."
  },
  {
    num: "04",
    title: "Quality Assurance & Long-Term Performance",
    desc: "Trust but verify. We validate every detail, conduct rigorous final inspections, and establish a long-term partnership backed by our 2-year guarantee on all work performed."
  }
];

const differentiators = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: "On-Time Execution. Zero Surprises.",
    desc: "Our disciplined, process-driven approach ensures projects are delivered on schedule, on budget, and with complete transparency from start to finish. Your satisfaction is our #1 priority—backed by a 2-year guarantee on all work."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Expert Team. Built for Partnership.",
    desc: "Experienced crews, standardized systems, and a partnership-first mindset—supporting your property or portfolio with consistent results you can rely on long-term."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Licensed, Insured & Compliant",
    desc: "Operate with confidence knowing every project is fully licensed, insured, and executed to strict safety and OSHA compliance standards—protecting your asset and minimizing risk."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Performance-Engineered Systems",
    desc: "We don't use off-the-shelf solutions. Our premium coating systems are engineered for durability, protection, and long-term performance in the demanding Central Texas climate."
  }
];

export default function Home() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleType = (id: string) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 pb-12 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent z-10" />
          <img
            src="/images/hero.png"
            alt="Large-scale commercial painting on an industrial building"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        <div className="container relative z-20 mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden" animate="visible" variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-[4.25rem] font-bold tracking-tighter mb-3 leading-[1.0]">
              Premium <strong className="text-primary">Commercial</strong><br />
              Repaint Systems.
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-muted-foreground mb-8 leading-[1.15] max-w-3xl">
              Your Property's Aesthetic on <span className="text-primary">Autopilot.</span>
            </motion.p>

            <motion.p variants={fadeInUp} className="text-sm md:text-base text-muted-foreground max-w-xl mb-10 leading-relaxed">
              Stop bidding. Start subscribing. Austin's 1st <strong className="text-foreground">fixed-cost painting utility</strong> for commercial assets. Flexible maintenance plan care or expert execution. Always reliable. Zero hassle.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row flex-wrap gap-4">
              <Button size="lg" className="rounded-none bg-primary text-background hover:bg-primary/90 font-semibold uppercase tracking-wider h-14 px-8" asChild>
                <Link href="/subscription-portal">Build Your Repaint Plan <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button size="lg" className="rounded-none bg-card border border-primary/40 text-foreground hover:border-primary hover:bg-secondary font-semibold uppercase tracking-wider h-14 px-8" asChild>
                <a href="#services">Explore Services</a>
              </Button>
              <Button size="lg" className="rounded-none bg-card border border-primary/40 text-foreground hover:border-primary hover:bg-secondary font-semibold uppercase tracking-wider h-14 px-8" asChild>
                <Link href="/facility-solutions">Facility Solutions <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SYSTEM VS SUBSCRIPTION SECTION */}
      <section id="about" className="py-0 bg-card border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left: The System */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="px-10 md:px-16 py-20 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-center"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-10 bg-border"></div>
              <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">The System</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2">Repaint Specialists.</h2>
            <p className="text-primary font-mono text-xs uppercase tracking-widest mb-6">Expert Commercial Repaints</p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              We specialize in high-durability refinishing for existing assets. No new construction—just <strong className="text-foreground">elite restoration and protection</strong> for commercial properties across Austin and Central Texas.
            </p>
            <div className="flex items-start gap-4 p-6 border border-primary/20 bg-primary/5">
              <ShieldCheck className="w-7 h-7 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-foreground font-bold mb-1">2-Year Guarantee on All Work</h4>
                <p className="text-muted-foreground text-sm">We stand behind every project with a 2-year guarantee—protecting your asset and your budget long after completion.</p>
              </div>
            </div>
          </motion.div>

          {/* Right: The Subscription */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            whileHover={{ scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }}
            className="px-10 md:px-16 py-20 bg-primary/5 flex flex-col justify-center relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-10 bg-primary"></div>
              <span className="text-primary font-mono text-xs tracking-widest uppercase">The Subscription</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2">The <span className="text-primary">PaintLab</span> Autopilot.</h2>
            <p className="text-primary font-mono text-xs uppercase tracking-widest mb-6">Managed Maintenance</p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Automated maintenance for <strong className="text-foreground">Multi-Family, Office/Corp, Retail, Hospitality, Industrial, Medical, Self-Storage, Senior Care, Education & Automotive</strong> assets. <strong className="text-foreground">One flat monthly fee.</strong>
            </p>
            <Link href="/subscription-portal">
              <Button size="lg" className="rounded-none bg-primary text-background hover:bg-primary/90 font-semibold uppercase tracking-wider h-12 px-8 w-fit">
                Explore Packages <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-24 bg-background border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-16 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Engineered <strong className="text-primary">Commercial</strong> Coating Systems</h2>
            <p className="text-xl text-muted-foreground">Purpose-built solutions for demanding <strong className="text-foreground">commercial</strong> environments across Austin and Central Texas.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-border">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="bg-card p-8 md:p-10 hover:bg-secondary/30 transition-colors group flex flex-col"
              >
                <div className="w-12 h-12 bg-background border border-border flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 min-h-[56px] flex items-start">{service.title}</h3>
                <p className="text-primary text-xs font-mono uppercase tracking-wider mb-4 leading-relaxed min-h-[32px]">{service.tagline}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-grow">{service.desc}</p>
                <Link href={`/services/${service.slug}`}>
                  <Button
                    className="rounded-none bg-primary text-background border border-primary hover:bg-background hover:text-foreground hover:border-border w-full font-semibold uppercase tracking-wider text-xs h-10 group/btn transition-colors"
                  >
                    View Details <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            ))}

            {/* 6th tile — Logo + Contact CTA */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="bg-card p-8 md:p-10 flex flex-col items-center justify-center gap-8 border-border"
            >
              <img src="/images/pl-logo.png" alt="PaintLab" className="h-11 w-auto object-contain" style={{ mixBlendMode: "lighten" }} />
              <a href="#quote">
                <Button className="rounded-none bg-transparent text-primary border border-primary hover:bg-primary hover:text-background font-semibold uppercase tracking-wider h-12 px-8 transition-colors">
                  Contact Us <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* APPROACH & DIFFERENCE SECTION */}
      <section id="approach" className="py-24 bg-background border-b border-border">
        <div className="container mx-auto px-6 md:px-12">

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-16 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-12 bg-primary"></div>
              <span className="text-primary font-mono text-xs tracking-widest uppercase">How We Work</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">The <span className="text-primary font-black">PAINTLAB</span> Approach & Difference.</h2>
          </motion.div>

          {/* 3 Process Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
            <div className="lg:col-span-4">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="sticky top-32">
                <p className="text-muted-foreground text-lg mb-8">
                  The result is a repeatable, predictable experience—projects delivered on time, on budget, and to the exacting standards you expect.
                </p>
                <img src="/images/painters.png" alt="Commercial painters at work in a large modern facility" className="w-full aspect-square object-cover border border-border filter grayscale" />
              </motion.div>
            </div>

            <div className="lg:col-span-8">
              <div className="space-y-12">
                {approachSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                    className="flex gap-6 md:gap-10 border-b border-border pb-12 last:border-0 last:pb-0"
                  >
                    <div className="text-4xl md:text-6xl font-black text-border select-none flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">{step.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* The Difference — 4 differentiator cards */}
          <div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-12 bg-primary"></div>
                <span className="text-primary font-mono text-xs tracking-widest uppercase">The Difference</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tighter">What sets <span className="text-primary font-black">PAINTLAB</span> apart.</h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-px bg-border">
              {differentiators.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                  className="bg-card p-8 flex flex-col"
                >
                  <div className="w-10 h-10 border border-primary text-primary flex items-center justify-center mb-6 flex-shrink-0">
                    {item.icon}
                  </div>
                  <h4 className="text-lg font-bold mb-4">{item.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTORS SECTION */}
      <section id="sectors" className="py-24 bg-card border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-16 flex flex-col md:flex-row md:items-end gap-6 md:gap-0 justify-between">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Sectors & Industries</h2>
              <p className="text-xl text-muted-foreground max-w-2xl">We deploy specific coating systems tailored to the operational realities of each <strong className="text-foreground">commercial</strong> sector.</p>
            </div>
            <div className="flex-shrink-0">
              <a href="#quote">
                <Button variant="outline" className="rounded-none border-primary text-primary bg-transparent hover:bg-primary hover:text-background font-semibold uppercase tracking-wider h-11 px-6 transition-colors">
                  Contact Us <ArrowRight className="ml-2 w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector, idx) => (
              <motion.div
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="border border-border bg-background flex flex-col overflow-hidden"
              >
                <div className="bg-primary px-6 py-5 h-[100px] flex flex-col justify-center">
                  <h3 className="text-[17.5px] font-black uppercase tracking-tight text-background leading-tight">{sector.title}</h3>
                  <p className="text-xs text-background/70 font-mono mt-1.5 leading-snug">{sector.sub}</p>
                </div>
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-1.5 border-b border-border pb-1">Interior</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{sector.int}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-1.5 border-b border-border pb-1">Exterior</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{sector.ext}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA SECTION */}
      <section id="quote" className="py-24 bg-card relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>

        <div className="container relative z-10 mx-auto px-6 md:px-12">
          <div className="max-w-5xl mx-auto bg-background border border-border grid grid-cols-1 md:grid-cols-5">
            <div className="md:col-span-2 p-10 md:p-12 bg-secondary/30 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">Command your outcome.</h2>
                <p className="text-muted-foreground mb-8">Initiate a coating system assessment and receive a comprehensive specification and proposal for your facility.</p>
              </div>

              <div className="flex justify-center py-6">
                <img src="/images/pl-icon-new.png" alt="PaintLab icon" className="w-48 h-48 object-contain opacity-90" style={{ mixBlendMode: "lighten" }} />
              </div>

              <div className="space-y-6 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Direct Line</p>
                  <a href="tel:+15124843124" className="font-mono text-foreground font-semibold hover:text-primary transition-colors">(512) 484-3124</a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Email</p>
                  <a href="mailto:hello@paintlabpro.com" className="font-mono text-foreground font-semibold hover:text-primary transition-colors">hello@paintlabpro.com</a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Headquarters</p>
                  <p className="font-mono text-foreground font-semibold">Austin, Texas</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 p-10 md:p-12">
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const name = fd.get("name") || "";
                const company = fd.get("company") || "";
                const email = fd.get("email") || "";
                const phone = fd.get("phone") || "";
                const date = fd.get("date") || "";
                const details = fd.get("details") || "";
                const types = selectedTypes.join(", ") || "Not specified";
                const body = encodeURIComponent(
                  `Hi PaintLab Team,\n\nI'd like to request a quote for a commercial painting project.\n\n` +
                  `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nPhone: ${phone}\n\n` +
                  `Project Type(s): ${types}\nTarget Start Date: ${date || "Not specified"}\n\nProject Details:\n${details}`
                );
                window.open(`mailto:hello@paintlabpro.com?subject=${encodeURIComponent("PaintLab Quote Request")}&body=${body}`, "_blank");
              }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
                    <Input name="name" placeholder="John Doe" className="rounded-none bg-background border-border focus-visible:ring-primary h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</label>
                    <Input name="company" placeholder="Acme Logistics" className="rounded-none bg-background border-border focus-visible:ring-primary h-12" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                    <Input name="email" type="email" placeholder="john@example.com" className="rounded-none bg-background border-border focus-visible:ring-primary h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</label>
                    <Input name="phone" type="tel" placeholder="(555) 123-4567" className="rounded-none bg-background border-border focus-visible:ring-primary h-12" />
                  </div>
                </div>

                {/* Multi-select Project Type */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Project Type <span className="normal-case font-normal">(select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border bg-background p-4">
                    {projectTypes.map((type) => {
                      const checked = selectedTypes.includes(type.id);
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => toggleType(type.id)}
                          className="flex items-center gap-3 group text-left w-full py-1"
                        >
                          <span className={`w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-colors ${checked ? "border-primary bg-primary" : "border-border bg-background"}`}>
                            {checked && <Check className="w-3 h-3 text-primary-foreground" />}
                          </span>
                          <span className={`text-sm transition-colors ${checked ? "text-foreground" : "text-muted-foreground"} group-hover:text-foreground`}>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Project Start Date */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Project Start Date <span className="normal-case font-normal text-muted-foreground">(if relevant)</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="w-full h-12 rounded-none bg-background border border-border text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Details</label>
                  <Textarea name="details" placeholder="Square footage, timeline, existing conditions..." className="rounded-none bg-background border-border focus-visible:ring-primary min-h-[120px] resize-none" />
                </div>

                <Button type="submit" className="w-full rounded-none bg-primary text-background hover:bg-primary/90 font-semibold uppercase tracking-wider h-14">
                  Send
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
