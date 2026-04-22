import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Phone, MessageSquare, Send, FileText, Building2, LogOut, CheckCircle2, Trash2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

interface SavedDraft {
  id: string;
  savedAt: string;
  facilityLabel: string;
  tierLabel: string;
  monthlyPrice: number;
  propertyName: string;
}

export default function MemberPortal() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "", allowText: false, message: "" });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("paintlab_drafts");
    if (raw) {
      try { setDrafts(JSON.parse(raw)); } catch {}
    }
  }, []);

  const deleteDraft = (id: string) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("paintlab_drafts", JSON.stringify(updated));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(
      `Hi PaintLab,\n\nMESSAGE FROM MEMBER PORTAL\n\n` +
      `Name: ${contactForm.name}\nPhone: ${contactForm.phone}\nEmail: ${contactForm.email}\n` +
      `OK to text: ${contactForm.allowText ? "Yes" : "No"}\n\nMessage:\n${contactForm.message}`
    );
    window.open(`mailto:hello@paintlabpro.com?subject=${encodeURIComponent("PaintLab Member Inquiry")}&body=${body}`, "_blank");
    setContactSent(true);
  };

  const smsBody = encodeURIComponent(`Hi PaintLab team, I'm reaching out from my member portal.`);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Member";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 border-b border-border bg-card">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">Member Portal</span>
            </motion.div>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <motion.div variants={fadeInUp}>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Welcome back, {firstName}.</h1>
                <p className="text-muted-foreground mt-1 text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
              </motion.div>
              <motion.button
                variants={fadeInUp}
                onClick={() => signOut({ redirectUrl: "/" })}
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors border border-border px-4 py-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Saved Drafts */}
      <section className="py-12 border-b border-border bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Saved Plan Configurations</h2>
            </div>
            <p className="text-muted-foreground text-sm">Your subscription draft forms are saved here. Continue configuring or send any draft to our team.</p>
          </motion.div>

          {drafts.length === 0 ? (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="border border-dashed border-border p-12 flex flex-col items-center justify-center text-center gap-4"
            >
              <Building2 className="w-10 h-10 text-muted-foreground/40" />
              <div>
                <p className="font-semibold text-foreground">No saved drafts yet</p>
                <p className="text-muted-foreground text-sm mt-1">Configure a subscription plan and save it to review here.</p>
              </div>
              <Link href="/subscription-portal">
                <button className="mt-2 px-6 py-3 bg-primary text-background font-bold uppercase tracking-wider text-xs hover:bg-primary/90 transition-colors">
                  Start a Configuration
                </button>
              </Link>
            </motion.div>
          ) : (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {drafts.map(draft => (
                <motion.div key={draft.id} variants={fadeInUp} className="border border-border bg-card p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-foreground">{draft.propertyName || "Untitled Property"}</p>
                      <p className="text-xs text-muted-foreground">{draft.facilityLabel}</p>
                    </div>
                    <button onClick={() => deleteDraft(draft.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Selected Tier</p>
                    <p className="text-sm font-semibold">{draft.tierLabel || "Not selected"}</p>
                  </div>
                  {draft.monthlyPrice > 0 && (
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Est. monthly</span>
                      <span className="text-primary font-bold">${draft.monthlyPrice.toLocaleString()}/mo</span>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground/50 mt-3">Saved {new Date(draft.savedAt).toLocaleDateString()}</p>
                </motion.div>
              ))}
              <motion.div variants={fadeInUp} className="border border-dashed border-border p-6 flex flex-col items-center justify-center text-center gap-3">
                <Building2 className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Add another property</p>
                <Link href="/subscription-portal">
                  <button className="px-4 py-2 border border-primary text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors">
                    + New Configuration
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-card border-b border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl">
            {/* Left: contact info */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-primary font-mono text-xs tracking-widest uppercase">Talk to Us</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-bold tracking-tighter mb-4">
                Reach Your PaintLab Team.
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-sm mb-8 leading-relaxed">
                Have a question about your subscription, want to adjust scope, or need to schedule a service? We're available Mon–Fri 8am–6pm CT, and always on for emergencies.
              </motion.p>
              <motion.div variants={stagger} className="space-y-3 mb-8">
                <motion.div variants={fadeInUp} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <a href="tel:+15124843124" className="hover:text-primary transition-colors">(512) 484-3124</a>
                </motion.div>
                <motion.div variants={fadeInUp} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <Send className="w-4 h-4 text-primary" />
                  </div>
                  <a href="mailto:hello@paintlabpro.com" className="hover:text-primary transition-colors">hello@paintlabpro.com</a>
                </motion.div>
              </motion.div>
              <motion.div variants={stagger} className="grid grid-cols-2 gap-3">
                <motion.a
                  variants={fadeInUp}
                  href="tel:+15124843124"
                  className="flex items-center justify-center gap-2 h-14 border-[3px] border-black bg-primary text-black hover:bg-primary/90 transition-colors"
                  style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.8rem", boxShadow: "3px 3px 0px #000000" }}
                >
                  <Phone className="w-4 h-4" />
                  CALL
                </motion.a>
                <motion.a
                  variants={fadeInUp}
                  href={`sms:+15124843124?body=${smsBody}`}
                  className="flex items-center justify-center gap-2 h-14 border-[3px] border-black bg-primary text-black hover:bg-primary/90 transition-colors"
                  style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.8rem", boxShadow: "3px 3px 0px #000000" }}
                >
                  <MessageSquare className="w-4 h-4" />
                  TEXT
                </motion.a>
              </motion.div>
              <p className="text-xs text-muted-foreground mt-3">Mon–Fri 8am–6pm CT · Emergency dispatch available</p>
            </motion.div>

            {/* Right: contact form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              {contactSent ? (
                <div className="border border-primary bg-primary/5 p-10 text-center h-full flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Message sent.</h3>
                  <p className="text-muted-foreground text-sm">Your email client opened with your message. We'll be in touch soon.</p>
                  <button onClick={() => setContactSent(false)} className="mt-6 text-sm text-primary hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 border border-border bg-background p-8">
                  <h3 className="font-bold text-lg tracking-tight mb-2">Send a Message</h3>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Full Name</label>
                    <input
                      required
                      type="text"
                      value={contactForm.name}
                      onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Jane Smith"
                      defaultValue={user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : ""}
                      className="w-full h-11 bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Phone Number</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={contactForm.phone}
                      onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="(512) 000-0000"
                      className="w-full h-11 bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Email Address</label>
                    <input
                      required
                      type="email"
                      value={contactForm.email}
                      onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="jane@example.com"
                      defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""}
                      className="w-full h-11 bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactForm.allowText}
                      onChange={e => setContactForm(p => ({ ...p, allowText: e.target.checked }))}
                      className="mt-0.5 accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-muted-foreground leading-tight">I authorize PaintLab to respond via text message to the phone number provided.</span>
                  </label>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Message</label>
                    <textarea
                      required
                      value={contactForm.message}
                      onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="How can we help you today?"
                      rows={4}
                      className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-12 bg-primary text-background font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
