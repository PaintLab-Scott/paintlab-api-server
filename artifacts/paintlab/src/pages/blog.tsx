import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp, Calendar, Tag } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
};

interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  preview: string;
  paragraphs: string[];
}

const posts: BlogPost[] = [
  {
    id: "repaint-bidding-broken",
    title: "Why Commercial Property Repaint Bidding Is Broken",
    date: "May 2025",
    category: "Operations",
    preview:
      "For decades, commercial property repainting has operated the same way: wait until surfaces look worn, request multiple bids, compare inconsistent scopes, negotiate pricing, hope the contractor shows up on time, and repeat the cycle again a few months later. For multifamily operators, commercial facility managers, HOA management companies, hospitality groups, and office property teams, the traditional repaint bidding process has quietly become one of the most inefficient and reactive operational patterns in commercial property management.",
    paragraphs: [
      "For decades, commercial property repainting has operated the same way: wait until surfaces look worn, request multiple bids, compare inconsistent scopes, negotiate pricing, hope the contractor shows up on time, and repeat the cycle again a few months later. For multifamily operators, commercial facility managers, HOA management companies, hospitality groups, and office property teams, the traditional repaint bidding process has quietly become one of the most inefficient and reactive operational patterns in commercial property management.",
      "The biggest issue is unpredictability. Pricing fluctuates from vendor to vendor, scopes are often vague, timelines shift, and repaint quality varies dramatically between contractors. Property managers are forced into constant vendor coordination, emergency touch-ups, rushed unit turns, and repetitive rebidding cycles that consume operational bandwidth. Meanwhile, deferred repaint maintenance slowly impacts resident experience, tenant perception, online reviews, leasing velocity, and long-term asset value — costs that rarely appear in a single line item but accumulate significantly over time.",
      "Traditional repaint bidding also creates budgeting problems at the portfolio level. Regional property managers and facilities leaders rarely have a reliable way to forecast repaint expenses across unit turns, common areas, amenities, hallways, clubhouses, offices, or exterior touch-ups. One property may overspend while another delays needed work entirely. The result is inconsistent property presentation, surprise CapEx events, and fragmented vendor relationships that make scaling a repaint program across a portfolio nearly impossible without adding significant internal overhead.",
      "That's why more commercial property leaders are beginning to explore proactive repaint maintenance planning instead of reactive bidding. Rather than constantly sourcing painters project by project, newer models focus on predictable repaint execution, recurring maintenance scheduling, standardized workmanship, and fixed-cost planning structures designed around operational needs. This approach helps reduce downtime, simplify budgeting, improve property appearance consistency, and free up internal teams to focus on higher-priority responsibilities.",
      "At PAINTLAB, we built our model specifically around solving these operational inefficiencies for multifamily communities, commercial offices, retail centers, hospitality properties, HOAs, and other commercial assets. Whether a property needs recurring touch-up maintenance, unit turn repaint support, amenity refreshes, or larger repaint projects, the goal is simple: create a more reliable, predictable, and scalable repaint process for modern property operations teams.",
      "If your team is still rebidding repaint work every few months, it may be time to evaluate whether a proactive repaint maintenance strategy could reduce costs, simplify operations, and improve long-term asset presentation. Start by identifying the areas of your property that require the most frequent repainting, reviewing how often emergency repaint work occurs, and calculating the hidden operational cost of reactive vendor management. Those patterns often reveal just how broken the traditional repaint bidding model really is — and how much upside exists in doing it differently.",
    ],
  },
];

export default function Blog() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Blog | PAINTLAB — Commercial Repaint Operations Insights";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Insights, strategies, and operational guidance for commercial property repaint management from the PAINTLAB team in Austin, Texas."
      );
    }
  }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-40 pb-24 border-b border-border">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden select-none">
          <img
            src="/images/pl-icon-new.png"
            alt=""
            aria-hidden
            className="opacity-[0.03] w-[600px] sm:w-[800px] max-w-none translate-x-32"
            style={{ mixBlendMode: "lighten" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

        <div className="relative container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">PAINTLAB Insights</span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6"
            >
              Repaint Operations.<br />
              <span className="text-primary">Done Differently.</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl"
            >
              Practical guidance on commercial repaint management, proactive maintenance planning, and building more predictable property operations.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── POSTS ─────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col gap-px bg-border"
          >
            {posts.map((post) => {
              const isOpen = !!expanded[post.id];
              return (
                <motion.article
                  key={post.id}
                  variants={fadeInUp}
                  className="bg-background"
                >
                  {/* Card header / collapsed view */}
                  <div className="bg-card border-b border-border">
                    <div className="p-8 md:p-10">
                      <div className="flex items-center gap-4 mb-5">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary">
                          <Tag className="w-3 h-3" />
                          {post.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                      </div>

                      <h2 className="text-xl md:text-2xl font-black tracking-tighter mb-4 leading-snug">
                        {post.title}
                      </h2>

                      <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-2xl">
                        {post.preview}
                      </p>

                      <button
                        type="button"
                        onClick={() => toggle(post.id)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
                        aria-expanded={isOpen}
                      >
                        {isOpen ? (
                          <>
                            Collapse <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Read Full Post <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Expanded full post */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1, transition: { duration: 0.38, ease: "easeOut" } }}
                          exit={{ height: 0, opacity: 0, transition: { duration: 0.28, ease: "easeIn" } }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 md:px-10 pb-10 border-t border-border/60 pt-8">
                            <div className="flex items-center gap-3 mb-8">
                              <div className="h-[1px] w-8 bg-primary" />
                              <span className="text-primary font-mono text-[10px] tracking-widest uppercase">Full Article</span>
                            </div>
                            <div className="prose-custom max-w-2xl space-y-5">
                              {post.paragraphs.map((para, i) => (
                                <p key={i} className="text-muted-foreground text-[15px] leading-relaxed">
                                  {para}
                                </p>
                              ))}
                            </div>
                            <div className="mt-10 pt-8 border-t border-border/60">
                              <a
                                href="/#quote"
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-background font-bold uppercase tracking-wider text-xs hover:bg-primary/90 transition-colors"
                              >
                                Start a Pilot Conversation <ArrowRight className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>

          {/* Coming soon placeholder */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-px bg-card border border-dashed border-border/60 p-10 text-center"
          >
            <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest mb-2">More Coming Soon</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              We publish practical insights on commercial repaint operations, maintenance planning, and property management strategy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-3 mb-6">
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-primary font-mono text-[10px] tracking-widest uppercase">Ready to Talk?</span>
              <div className="h-[1px] w-8 bg-primary" />
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-black tracking-tighter mb-4">
              Rethink Your Repaint Program.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-sm leading-relaxed mb-8">
              Start with a no-commitment pilot. We'll walk the property, define a scope, and show you what a modern repaint program looks like before you decide anything.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <a
                href="/#quote"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors"
              >
                Request a Quote <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
