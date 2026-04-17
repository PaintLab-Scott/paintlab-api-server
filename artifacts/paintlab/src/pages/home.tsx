import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, CheckCircle2, ShieldCheck, Factory, Target, Building2, PaintRoller, Droplets, HardHat } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Home() {
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
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-12 bg-primary"></div>
              <span className="text-primary font-mono text-sm tracking-widest uppercase font-semibold">Commercial Painting Systems</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[1.05]">
              Eliminate risk.<br />
              <span className="text-muted-foreground">Command performance.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              PaintLab is where commercial painting stops being a risk and becomes a controlled, predictable, high-performance outcome. Based in Austin, TX.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-semibold uppercase tracking-wider h-14 px-8" asChild>
                <a href="#quote">Get a System Assessment <ArrowRight className="ml-2 w-4 h-4" /></a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-none border-border hover:bg-secondary hover:text-secondary-foreground font-semibold uppercase tracking-wider h-14 px-8" asChild>
                <a href="#services">Explore Services</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT / TRUST SECTION */}
      <section id="about" className="py-24 bg-card border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">
                Precision coating engineering.
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-lg mb-6 leading-relaxed">
                We combine precision craftsmanship with a disciplined, systems-driven approach that delivers consistency, accountability, and total predictability from start to finish.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-lg mb-10 leading-relaxed">
                Every project is engineered, planned, and executed to eliminate disruption, protect your asset, and perform in demanding environments like Austin, Texas.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="p-6 border border-primary/30 bg-primary/5 flex items-start gap-4">
                <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-foreground font-bold text-lg mb-1">The 2-Year Guarantee</h4>
                  <p className="text-muted-foreground text-sm">We take our work—and your success—seriously, which is why we stand behind it with a 2-year guarantee on all work performed.</p>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="relative h-[600px] border border-border">
              <img src="/images/interior.png" alt="Commercial interior coatings" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-24 bg-background border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-16 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Engineered coating systems.</h2>
            <p className="text-xl text-muted-foreground">Purpose-built solutions for demanding environments.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            {[
              {
                title: "High Traffic Interior Systems",
                desc: "Scuff-resistant, highly washable, low-VOC systems designed for constant use and easy maintenance.",
                icon: <Building2 className="w-6 h-6" />
              },
              {
                title: "Exterior Building Coatings",
                desc: "Weatherproof, UV-stable elastomeric facades engineered to withstand intense heat and humidity.",
                icon: <PaintRoller className="w-6 h-6" />
              },
              {
                title: "Industrial & Protective Coatings",
                desc: "Heavy-duty epoxy floors, anti-corrosion systems, and chemical linings for harsh conditions.",
                icon: <Factory className="w-6 h-6" />
              },
              {
                title: "Sealants & Waterproofing Systems",
                desc: "Comprehensive moisture barriers, joint sealants, and deck coatings to protect structural integrity.",
                icon: <Droplets className="w-6 h-6" />
              }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="bg-card p-10 md:p-14 hover:bg-secondary/50 transition-colors group cursor-default"
              >
                <div className="w-12 h-12 bg-background border border-border flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS SECTION */}
      <section id="sectors" className="py-24 bg-card border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Sectors & Industries</h2>
            <p className="text-xl text-muted-foreground max-w-2xl">We deploy specific coating systems tailored to the operational realities of each sector.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
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
                title: "Retail, Hotels & Restaurants",
                sub: "Facades, Dining, Hospitality Venues",
                int: "High-gloss interior finish coats, scuff-grease-resistant kitchen wall systems",
                ext: "Anti-graffiti coatings, UV-stable exterior facade finishes"
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
            ].map((sector, idx) => (
              <motion.div 
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="border border-border bg-background p-6 flex flex-col group"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-1 text-primary group-hover:text-foreground transition-colors">{sector.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{sector.sub}</p>
                </div>
                
                <div className="mt-auto space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-1 border-b border-border pb-1">Interior</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{sector.int}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-1 border-b border-border pb-1">Exterior</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{sector.ext}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* APPROACH SECTION */}
      <section id="approach" className="py-24 bg-background border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="sticky top-32">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">The PaintLab Approach.</h2>
                <p className="text-muted-foreground text-lg mb-8">
                  The result is a repeatable, predictable experience—projects delivered on time, on budget, and to the exacting standards you expect.
                </p>
                <img src="/images/painters.png" alt="Commercial painters at work in a large modern facility" className="w-full aspect-square object-cover border border-border filter grayscale" />
              </motion.div>
            </div>
            
            <div className="lg:col-span-8">
              <div className="space-y-12">
                {[
                  {
                    num: "01",
                    title: "Strategic Assessment & System Design",
                    desc: "We don't just paint; we specify. We evaluate substrates, environmental conditions, and long-term performance goals to engineer the precise coating system required."
                  },
                  {
                    num: "02",
                    title: "Structured Planning & Controlled Execution",
                    desc: "Execution without disruption. We align timelines with your operational needs, utilizing phased workflows and maintaining clear, documented communication throughout."
                  },
                  {
                    num: "03",
                    title: "Quality Assurance & Long-Term Performance",
                    desc: "Trust but verify. We validate every detail, conduct rigorous final inspections, and establish a long-term partnership backed by our 2-year guarantee."
                  }
                ].map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                    className="flex gap-6 md:gap-10 border-b border-border pb-12 last:border-0 last:pb-0"
                  >
                    <div className="text-4xl md:text-6xl font-black text-border select-none">
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
        </div>
      </section>

      {/* WHY US SECTION */}
      <section className="py-24 bg-card border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {[
              { title: "White-Glove Management", desc: "A single point of contact. Total transparency and rigorous project oversight." },
              { title: "OSHA-Compliant", desc: "Safety is our baseline. Strict adherence to safety protocols to protect our team and your facility." },
              { title: "Austin-Engineered", desc: "Systems selected specifically to withstand Central Texas's intense UV, heat, and humidity." },
              { title: "On-Time, On-Budget", desc: "Repeatable, predictable outcomes. No surprises, no excuses, just execution." }
            ].map((feature, idx) => (
              <motion.div key={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <div className="w-10 h-10 border border-primary text-primary flex items-center justify-center mb-6">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA SECTION */}
      <section id="quote" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
        
        <div className="container relative z-10 mx-auto px-6 md:px-12">
          <div className="max-w-5xl mx-auto bg-card border border-border grid grid-cols-1 md:grid-cols-5">
            <div className="md:col-span-2 p-10 md:p-12 bg-secondary/30 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">Command your outcome.</h2>
                <p className="text-muted-foreground mb-8">Initiate a system assessment and receive a comprehensive specification and proposal for your facility.</p>
              </div>
              
              <div className="space-y-6 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Direct Line</p>
                  <p className="font-mono text-foreground font-semibold">1-800-PAINTLAB</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Email</p>
                  <p className="font-mono text-foreground font-semibold">systems@paintlab.com</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Headquarters</p>
                  <p className="font-mono text-foreground font-semibold">Austin, Texas</p>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-3 p-10 md:p-12">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
                    <Input placeholder="John Doe" className="rounded-none bg-background border-border focus-visible:ring-primary h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</label>
                    <Input placeholder="Acme Logistics" className="rounded-none bg-background border-border focus-visible:ring-primary h-12" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                    <Input type="email" placeholder="john@example.com" className="rounded-none bg-background border-border focus-visible:ring-primary h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</label>
                    <Input type="tel" placeholder="(555) 123-4567" className="rounded-none bg-background border-border focus-visible:ring-primary h-12" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Type</label>
                  <Select>
                    <SelectTrigger className="rounded-none bg-background border-border focus:ring-primary h-12">
                      <SelectValue placeholder="Select primary sector" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border">
                      <SelectItem value="multifamily">Multi-Family Residential</SelectItem>
                      <SelectItem value="office">Office Buildings</SelectItem>
                      <SelectItem value="retail">Retail, Hotels & Restaurants</SelectItem>
                      <SelectItem value="medical">Medical / Healthcare</SelectItem>
                      <SelectItem value="warehouse">Warehouse & Distribution</SelectItem>
                      <SelectItem value="industrial">Industrial / Manufacturing</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="datacenters">Data Centers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Details</label>
                  <Textarea placeholder="Square footage, timeline, existing conditions..." className="rounded-none bg-background border-border focus-visible:ring-primary min-h-[120px] resize-none" />
                </div>
                
                <Button type="submit" className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-semibold uppercase tracking-wider h-14">
                  Request System Assessment
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
