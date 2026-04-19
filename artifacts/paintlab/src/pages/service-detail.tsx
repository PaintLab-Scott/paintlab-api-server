import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const serviceData: Record<string, {
  title: string;
  location: string;
  tagline: string;
  image: string;
  overview: string;
  intro?: string;
  problem: string;
  solution: string;
  capabilities: string[];
  closing?: string;
}> = {
  "high-traffic-interior": {
    title: "High Traffic Interior Systems",
    location: "Austin & Central Texas",
    image: "/images/interior.png",
    tagline: "Durable Finishes Built for Occupied Commercial Spaces",
    overview: "Interior environments in commercial buildings fail fast under real-world use—tenant traffic, carts, cleaning chemicals, and constant contact. PaintLab interior systems are designed to preserve appearance, reduce repaint frequency, and maintain tenant satisfaction in active spaces. We prioritize execution in live environments with minimal disruption.",
    problem: "Standard finishes degrade rapidly under the demands of occupied commercial spaces—scuffing, staining, and chemical damage drives up repaint frequency and disrupts tenants.",
    solution: "Scuff-resistant, scrub-grade, long-lifecycle interior coating systems executed on night, weekend, and phased schedules to eliminate tenant disruption and reduce long-term maintenance costs.",
    capabilities: [
      "Scuff-resistant, high-durability interior coatings for corridors and common areas",
      "Washable, scrub-grade finishes designed for long lifecycle performance",
      "Antimicrobial and low/zero-VOC coating systems for occupied buildings",
      "Night, weekend, and phased execution schedules to eliminate tenant disruption",
      "Color-consistent maintenance systems for property managers and portfolios"
    ]
  },
  "exterior-building-coatings": {
    title: "Exterior Building Coatings",
    location: "Austin & Central Texas",
    image: "/images/exterior.png",
    tagline: "Long-Term Asset Protection Systems for Texas Commercial Properties",
    overview: "PaintLab exterior coating systems are engineered to extend building life, reduce maintenance cycles, and protect commercial assets from the extreme Texas climate—UV exposure, heat cycling, moisture intrusion, and structural movement.",
    intro: "We don't \"paint buildings.\" We install exterior protection systems designed for performance, durability, and long-term ROI.",
    problem: "UV exposure, heat cycling, moisture intrusion, and structural movement cause premature coating failure and accelerated building degradation in the Texas climate—costing owners in maintenance cycles and capital spend.",
    solution: "Engineered exterior protection systems—not surface paint—designed to extend building life, reduce maintenance frequency, and protect commercial asset value over time.",
    capabilities: [
      "UV-resistant exterior coating systems designed for Texas sun exposure",
      "Elastomeric coatings for crack-bridging and substrate movement",
      "Integrated waterproofing solutions to prevent moisture intrusion",
      "Stucco restoration and protective coating systems",
      "Tilt-wall concrete coatings for commercial and industrial buildings",
      "Metal substrate coatings for corrosion resistance and longevity"
    ]
  },
  "industrial-protective-coatings": {
    title: "Industrial & Protective Coatings",
    location: "Austin & Central Texas",
    image: "/images/epoxy.png",
    tagline: "Compliance-Driven Asset Protection for Critical Surfaces",
    overview: "Industrial environments demand more than paint—they require engineered protective systems that resist chemicals, abrasion, moisture, and heavy mechanical wear. PaintLab delivers industrial-grade coatings that protect infrastructure and support compliance standards.",
    problem: "Chemicals, abrasion, moisture, and heavy mechanical wear destroy standard coatings—creating safety risks, compliance failures, and costly infrastructure damage that compounds over time.",
    solution: "Industrial-grade protective coating systems engineered for the harshest environments, with OSHA-aligned execution and compliance-grade documentation at every step.",
    capabilities: [
      "Epoxy flooring systems for warehouses, mechanical rooms, and facilities",
      "Urethane topcoats for chemical and abrasion resistance",
      "OSHA-aligned safety floor markings and coatings",
      "Concrete sealing systems for dust control and surface protection",
      "Industrial floor restoration and resurfacing solutions"
    ]
  },
  "sealants-waterproofing": {
    title: "Sealants & Waterproofing Systems",
    location: "Austin & Central Texas",
    image: "/images/sealants.png",
    tagline: "Building Envelope Defense Against Moisture, Air, and Structural Movement",
    overview: "Water intrusion is one of the most expensive and recurring failures in commercial buildings. PaintLab sealant and waterproofing systems are designed to reinforce the building envelope, prevent long-term structural damage, and protect interior assets.",
    intro: "We treat sealing and waterproofing as a system—not a patch.",
    problem: "Water intrusion is one of the most expensive and recurring failures in commercial buildings—causing structural damage, mold liability, tenant disruption, and compounding repair costs.",
    solution: "System-level sealant and waterproofing designed to reinforce the full building envelope—not just address surface symptoms—protecting the asset and reducing long-term exposure.",
    capabilities: [
      "Expansion joint sealant systems for structural movement",
      "Crack repair and injection systems for concrete and masonry",
      "Moisture intrusion prevention across facades and substrates",
      "Air and water barrier reinforcement systems",
      "Window, joint, and facade perimeter sealing for full envelope protection"
    ]
  },
  "specialty-coating-services": {
    title: "Specialty Coating Services",
    location: "Austin & Central Texas",
    image: "/images/painters.png",
    tagline: "One Partner. No Coordination Headaches.",
    overview: "Commercial projects often fail at the coordination level—not the execution level. PaintLab eliminates that friction by offering integrated specialty services that support full-scope facility maintenance and tenant improvement workflows under one contractor.",
    problem: "Multiple contractors, scheduling conflicts, inconsistent quality, and delayed turnovers drain time, budget, and management bandwidth—turning routine projects into operational liabilities.",
    solution: "One integrated partner managing surface prep through final walkthrough—eliminating coordination gaps, scheduling conflicts, and quality inconsistencies across every project scope.",
    capabilities: [
      "Wallcovering installation and removal for commercial interiors",
      "Branded graphic and specialty finish applications",
      "Drywall repair, patching, and light carpentry support",
      "Pressure washing and soft washing for building exteriors",
      "Multi-family turn programs and ongoing maintenance painting contracts"
    ]
  }
};

export default function ServiceDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);
  const service = serviceData[slug];

  if (!service) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-6 md:px-12 py-40 text-center">
          <h1 className="text-4xl font-bold mb-4">Service not found.</h1>
          <Link href="/#services">
            <Button variant="outline" className="rounded-none mt-4">Back to Services</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* HEADER */}
      <section className="pt-32 pb-16 border-b border-border bg-card">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="mb-8">
              <Link href="/#services">
                <button className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Services
                </button>
              </Link>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 max-w-4xl">
              {service.title}
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg text-primary font-mono uppercase tracking-wider mb-10">
              {service.tagline}
            </motion.p>

            <motion.div variants={fadeInUp} className="w-full max-w-5xl">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-[320px] md:h-[420px] object-cover border border-border filter grayscale"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="py-20 border-b border-border bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="text-xl text-muted-foreground leading-relaxed mb-6"
            >
              {service.overview}
            </motion.p>
            {service.intro && (
              <motion.p
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="text-xl font-semibold text-foreground leading-relaxed"
              >
                {service.intro}
              </motion.p>
            )}
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="py-20 border-b border-border bg-card">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="bg-card p-10 md:p-14"
            >
              <p className="text-base font-bold uppercase tracking-widest text-destructive mb-4">The Problem</p>
              <p className="text-lg text-muted-foreground leading-relaxed">{service.problem}</p>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="bg-card p-10 md:p-14 border-l border-border"
            >
              <p className="text-base font-bold uppercase tracking-widest text-primary mb-4">PaintLab Solution</p>
              <p className="text-lg text-muted-foreground leading-relaxed">{service.solution}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="py-20 border-b border-border bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tighter">Core Systems & Capabilities</h2>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl"
          >
            {service.capabilities.map((cap, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex items-start gap-4 p-6 border border-border bg-card">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{cap}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="max-w-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground text-lg mb-8">Initiate a coating system assessment and receive a comprehensive specification and proposal for your facility.</p>
            <Link href="/#quote">
              <Button size="lg" className="rounded-none bg-primary text-background hover:bg-primary/90 font-semibold uppercase tracking-wider h-14 px-8">
                Request a System Assessment <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
