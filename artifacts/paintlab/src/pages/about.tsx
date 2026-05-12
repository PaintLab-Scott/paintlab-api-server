import { useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { ShieldCheck, Repeat2, Users2, Target } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const pillars = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Stabilized Budgeting",
    desc: "Predictable, transparent pricing with no surprise escalations. PAINTLAB helps operators plan repaint budgets with confidence across recurring maintenance and project-based programs.",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Proactive Maintenance Planning",
    desc: "We help teams move from reactive repaint cycles to structured maintenance programs — reducing emergency spend, extending surface life, and keeping properties consistently presentable.",
  },
  {
    icon: <Repeat2 className="w-5 h-5" />,
    title: "Reliable Execution",
    desc: "Clearly defined scopes, disciplined crews, and accountability at every step. Quality and communication don't waver whether it's your first building or your fifteenth.",
  },
  {
    icon: <Users2 className="w-5 h-5" />,
    title: "Long-Term Partnership",
    desc: "We operate as embedded partners with a vested interest in long-term asset performance — not a vendor who shows up, paints, and disappears.",
  },
];

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-40 pb-24 sm:pb-32">
        {/* Premium photo — right side */}
        <div className="pointer-events-none absolute inset-0 select-none">
          <div className="absolute inset-y-0 right-0 w-[55%] hidden lg:block">
            <img
              src="/images/interior-premium.jpg"
              alt=""
              aria-hidden
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/40" />
          </div>
        </div>

        <div className="relative container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">About PAINTLAB</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6"
            >
              Built to Scale.<br />
              <span className="text-primary">Professionally Managed.</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl"
            >
              PAINTLAB was created to replace the fragmented, reactive repaint process with a professionally managed system built for modern commercial properties. We help operators stabilize budgeting, reduce vendor oversight, and maintain consistent property aesthetics through reliable execution, recurring maintenance solutions, and scalable repaint programs.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT WE FIX ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-4">
                <div className="h-[1px] w-8 bg-primary" />
                <span className="text-primary font-mono text-xs tracking-widest uppercase">The Problem</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-black tracking-tighter mb-6">
                The old model is<br />holding operators back.
              </motion.h2>
              <motion.div variants={stagger} className="space-y-4">
                {[
                  "Unpredictable repaint budgets that spike without warning",
                  "Reactive, one-off vendor relationships with no long-term accountability",
                  "Inconsistent workmanship that degrades asset presentation over time",
                  "Time lost to constant rebidding instead of proactive maintenance planning",
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeInUp} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-2" />
                    <p className="text-muted-foreground text-sm leading-relaxed">{item}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative"
            >
              <div className="border-l-2 border-primary/40 pl-8">
                <p className="text-xl sm:text-2xl font-bold tracking-tight leading-snug text-foreground mb-6">
                  "This isn't about painting walls. It's about creating a professionally managed system that helps operators stabilize budgets, reduce vendor friction, and maintain consistent asset presentation — at scale."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-primary" />
                  <div>
                    <p className="text-primary text-xs font-mono tracking-widest uppercase">Scott Gendelman</p>
                    <p className="text-muted-foreground text-[10px] font-mono tracking-wider uppercase mt-0.5">Founder &amp; Managing Director</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW WE'RE DIFFERENT ──────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mb-12"
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">Our Approach</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-black tracking-tighter">
              PAINTLAB is built for how operators actually work.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-border"
          >
            {pillars.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className={`p-6 sm:p-8 bg-card ${i < pillars.length - 1 ? "border-r border-border" : ""} group hover:bg-primary/5 transition-colors`}
              >
                <div className="w-9 h-9 bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-background transition-colors">
                  {p.icon}
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wider mb-3">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── LEADERSHIP ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mb-12"
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">Leadership</span>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Photo column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative"
            >
              {/* Decorative frame offset — sized to the photo */}
              <div className="absolute -top-3 -left-3 w-full h-full border border-primary/25 pointer-events-none" />

              {/* Cap width so we never upscale beyond the source resolution */}
              <div className="relative overflow-hidden max-w-sm bg-zinc-900">
                <img
                  src="/images/scott-gendelman.jpeg"
                  alt="Scott Gendelman — Founder, PAINTLAB"
                  className="w-full h-auto block"
                  style={{ filter: "contrast(1.05) saturate(0.85) brightness(0.95)" }}
                />
                {/* Subtle dark gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>

            {/* Bio column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="pt-2"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-black tracking-tighter mb-2">
                Scott Gendelman
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-primary font-mono text-xs tracking-widest uppercase mb-8">
                Founder &amp; Managing Director — Austin, TX
              </motion.p>

              <motion.div variants={stagger} className="space-y-5 text-muted-foreground text-sm leading-relaxed">
                <motion.p variants={fadeInUp}>
                  PAINTLAB was founded by Scott Gendelman, a commercial operator with over{" "}
                  <strong className="text-foreground">20 years of experience</strong> across
                  technology, business development, operations, and marketing.
                </motion.p>
                <motion.p variants={fadeInUp}>
                  Having lived in Austin for over 14 years, Scott understands firsthand how
                  competitive and fast-moving the commercial and multifamily real estate market
                  is—and the level of execution it demands. Property managers, asset owners, and
                  facilities leaders don't have room for inconsistency.
                </motion.p>
                <motion.p variants={fadeInUp}>
                  Throughout his career, he saw the same challenges repeat: unreliable vendors,
                  uneven quality, unclear pricing, and constant friction in execution.
                </motion.p>
                <motion.p variants={fadeInUp}>
                  PAINTLAB was built to solve that. By applying a{" "}
                  <strong className="text-foreground">systems-driven, operator-first mindset</strong>,
                  Scott set out to redefine how paint and coating systems are delivered—bringing
                  predictability, accountability, and long-term partnership to an industry that has
                  historically lacked all three.
                </motion.p>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-10 pt-8 border-t border-border">
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">Contact Scott directly</p>
                <a
                  href="mailto:scott@paintlabpro.com"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  scott@paintlabpro.com →
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA QUOTE ────────────────────────────────────────────────── */}
      <section className="relative py-24 bg-background overflow-hidden">
        {/* PL icon watermark, left side this time */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-start overflow-hidden select-none">
          <img
            src="/images/pl-icon-new.png"
            alt=""
            aria-hidden
            className="opacity-[0.04] w-[480px] sm:w-[600px] max-w-none -translate-x-16 sm:-translate-x-24"
            style={{ mixBlendMode: "lighten" }}
          />
        </div>

        <div className="relative container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-3 mb-8">
              <div className="h-[1px] w-10 bg-primary" />
              <img src="/images/pl-icon-new.png" alt="PL" className="h-5 w-auto opacity-70" style={{ mixBlendMode: "lighten" }} />
              <div className="h-[1px] w-10 bg-primary" />
            </motion.div>

            <motion.blockquote
              variants={fadeInUp}
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight text-foreground mb-10"
            >
              "If you're looking for a partner that engineers outcomes—not just applies paint—
              <span className="text-primary"> PAINTLAB is built for that.</span>"
            </motion.blockquote>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/#quote"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-background font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors"
              >
                Get a Quote
              </a>
              <a
                href="/subscription-portal"
                className="inline-flex items-center justify-center px-8 py-4 border border-primary/40 text-foreground font-bold uppercase tracking-widest text-xs hover:border-primary transition-colors"
              >
                View Maintenance Plans
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
