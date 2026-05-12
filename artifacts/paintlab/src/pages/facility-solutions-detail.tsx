import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  Building2, Briefcase, ShoppingBag, Factory, Building,
  Utensils, Heart, Package, Home, GraduationCap, Activity,
  ArrowRight, ChevronRight, AlertCircle, CheckCircle2,
  Users, Target, Repeat2, Shield
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

interface FacilityConfig {
  slug: string;
  label: string;
  seoTitle: string;
  seoDesc: string;
  tag: string;
  heroHeadline: string;
  heroSub: string;
  primaryCta: string;
  painPoints: string[];
  positioningDesc: string;
  supportAreas: string[];
  decisionMakers: { role: string; desc: string }[];
  pilotHeadline: string;
  outcomes: string[];
  finalCtaHeadline: string;
  finalCta: string;
  calculatorUrl: string;
  icon: React.ReactNode;
}

const CONFIGS: FacilityConfig[] = [
  {
    slug: "multifamily-repaint-pilot",
    label: "Multifamily Residential",
    seoTitle: "Multifamily Repaint Support Austin | PAINTLAB",
    seoDesc: "PAINTLAB helps Austin multifamily property managers, regional property managers, and maintenance leaders simplify repaint execution across unit turns, common areas, amenities, and pilot property repaint programs.",
    tag: "Multifamily · Apartments · HOAs",
    heroHeadline: "Multifamily Repaint Support Built for Regional Property & Maintenance Leaders",
    heroSub: "PAINTLAB helps multifamily teams simplify repaint execution across unit turns, common areas, amenities, and ongoing property maintenance with more predictable budgeting and a low-risk pilot-first approach before scaling.",
    primaryCta: "Start the Pilot Conversation",
    painPoints: [
      "Unit turns delayed by painter availability",
      "Onsite teams stretched thin during peak season",
      "Inconsistent workmanship across properties",
      "Too much vendor chasing and follow-up",
      "Common areas and amenities becoming reactive maintenance items",
      "Regional leaders lacking visibility into repaint execution quality",
    ],
    positioningDesc: "PAINTLAB is designed as a repaint operations partner for multifamily teams that need dependable execution, professional communication, cleaner scopes, and flexible support across recurring maintenance and project-based repaint needs.",
    supportAreas: ["Unit turns", "Common areas", "Leasing offices", "Clubhouses", "Amenities", "Corridors", "Stairwells", "Exterior repaint projects", "Monthly, quarterly, bi-annual, and one-off repaint support"],
    decisionMakers: [
      { role: "Regional Property Managers", desc: "Portfolio-level visibility and standardized execution across sites." },
      { role: "Maintenance Supervisors", desc: "Reliable vendor support that reduces coordination burden." },
      { role: "Property Managers", desc: "Faster unit turns and consistent workmanship on every job." },
      { role: "Ownership / Asset Leaders", desc: "Predictable costs and a scalable repaint operations model." },
    ],
    pilotHeadline: "Start With One Property. Prove the Value. Then Decide What Scales.",
    outcomes: ["Faster repaint readiness", "Less vendor chasing", "More predictable execution", "Cleaner communication", "Professional crews", "Standardized workmanship", "Flexible support model", "Scalable partnership path"],
    finalCtaHeadline: "Test PAINTLAB on One Property Before Scaling the Relationship.",
    finalCta: "Start the Pilot Conversation",
    calculatorUrl: "/subscription-lab?facility=multi-family",
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    slug: "office-cre-repaint-support",
    label: "Office / Corporate / CRE",
    seoTitle: "Office & CRE Repaint Support Austin | PAINTLAB",
    seoDesc: "PAINTLAB provides responsive office and commercial real estate repaint support for property managers and building teams in Austin and Central Texas.",
    tag: "Office · Corporate · CRE",
    heroHeadline: "Office & CRE Repaint Support Built Around Tenant Experience",
    heroSub: "PAINTLAB helps building teams and property managers deliver clean, consistent presentation across lobbies, tenant suites, corridors, and shared areas — on schedule, without disrupting tenants.",
    primaryCta: "Start With a Building or Tenant Space Pilot",
    painPoints: [
      "Tenant spaces need fast refreshes before move-in",
      "Lobbies and shared areas show wear quickly",
      "Building teams juggle too many small vendor issues",
      "Repaint work disrupts tenants when poorly scheduled",
      "Spec suites and common areas need consistent presentation",
      "Property teams need responsive project support",
    ],
    positioningDesc: "PAINTLAB operates as a dependable repaint partner for office and CRE teams. We scope clearly, schedule around tenant activity, and deliver consistent workmanship across lobbies, suites, corridors, and common areas.",
    supportAreas: ["Lobbies", "Corridors", "Tenant suites", "Spec suites", "Conference rooms", "Shared workspaces", "Parking areas", "Doors, trim, walls, and touch-ups"],
    decisionMakers: [
      { role: "Property Managers", desc: "Responsive vendor support that handles project and maintenance repaint needs." },
      { role: "Facilities Teams", desc: "Consistent workmanship with zero disruption to building operations." },
      { role: "Asset Managers", desc: "Predictable costs and professional execution that protects asset value." },
      { role: "Leasing Teams", desc: "Fast suite turnovers and presentation-ready common areas." },
    ],
    pilotHeadline: "Start With One Building or Tenant Space. Prove the Model.",
    outcomes: ["Faster tenant space readiness", "Cleaner building presentation", "Less vendor coordination", "Professional execution", "Schedulable around tenants", "Predictable project costs", "Responsive communication", "Scalable to portfolio"],
    finalCtaHeadline: "Start With One Building or Suite. Expand From There.",
    finalCta: "Start With a Building or Tenant Space Pilot",
    calculatorUrl: "/subscription-lab?facility=office",
    icon: <Briefcase className="w-6 h-6" />,
  },
  {
    slug: "retail-repaint-support",
    label: "Retail / Shopping Centers",
    seoTitle: "Retail Repaint Support Austin | PAINTLAB",
    seoDesc: "PAINTLAB delivers fast, low-disruption retail repaint support for storefronts, shopping centers, and customer-facing spaces across Austin and Central Texas.",
    tag: "Retail · Shopping Centers · Storefronts",
    heroHeadline: "Retail Repaint Support Built Around Customer-Facing Spaces",
    heroSub: "PAINTLAB helps retail property managers and operators keep storefronts, common areas, and customer-facing surfaces clean and presentation-ready — with minimal business disruption.",
    primaryCta: "Start With a Storefront or Center Pilot",
    painPoints: [
      "Customer-facing surfaces affect brand perception",
      "Storefronts and common areas wear down quickly",
      "Repaint work must avoid business disruption",
      "Property managers need responsive vendor support",
      "Shopping centers need consistent presentation",
      "Small repaint issues become visible fast",
    ],
    positioningDesc: "PAINTLAB supports retail operators and property managers with repaint execution that is fast, clean, and built around business hours. We scope clearly, work around traffic, and deliver results that protect brand presentation.",
    supportAreas: ["Storefronts", "Tenant facades", "Common area corridors", "Entry points", "Parking structures", "Feature walls", "Exterior walls", "Touch-up programs"],
    decisionMakers: [
      { role: "Property Managers", desc: "Responsive vendor coordination for maintenance and project repaint needs." },
      { role: "Operations Leaders", desc: "Scheduled execution that works around business hours and foot traffic." },
      { role: "Asset Managers", desc: "Consistent presentation that protects long-term tenant and investor value." },
      { role: "Brand & Facilities Teams", desc: "Clean, consistent color matching and workmanship across locations." },
    ],
    pilotHeadline: "Start With One Storefront or Center. Prove the Execution.",
    outcomes: ["Clean customer-facing presentation", "Minimal business disruption", "Faster project completion", "Consistent workmanship", "Responsive scheduling", "Brand-accurate color matching", "Low-risk pilot model", "Scalable to portfolio"],
    finalCtaHeadline: "Start With One Location. Expand With Confidence.",
    finalCta: "Start With a Storefront or Center Pilot",
    calculatorUrl: "/subscription-lab?facility=retail",
    icon: <ShoppingBag className="w-6 h-6" />,
  },
  {
    slug: "industrial-warehouse-repaint-support",
    label: "Industrial / Warehouse",
    seoTitle: "Industrial & Warehouse Repaint Support Austin | PAINTLAB",
    seoDesc: "PAINTLAB provides coordinated industrial and warehouse repaint support for facilities teams in Austin and Central Texas — without disrupting operations.",
    tag: "Industrial · Warehouse · Distribution",
    heroHeadline: "Industrial & Warehouse Repaint Support Without Operational Disruption",
    heroSub: "PAINTLAB helps facilities and operations teams maintain large industrial environments — safety markings, high-use surfaces, and common areas — without stopping production.",
    primaryCta: "Start With a Defined Facility Scope",
    painPoints: [
      "Operations cannot stop for repaint work",
      "High-use areas wear quickly in active facilities",
      "Safety markings and surfaces need consistent upkeep",
      "Large spaces require coordinated execution",
      "Facility teams need reliable scheduling",
      "Appearance still matters for staff, vendors, and visitors",
    ],
    positioningDesc: "PAINTLAB provides industrial-caliber repaint execution for warehouses, distribution centers, and manufacturing facilities. We coordinate around shift schedules, zone work clearly, and deliver reliable results in complex operational environments.",
    supportAreas: ["Warehouse floors", "Safety markings", "Loading docks", "Break rooms and offices", "Exterior facades", "High-bay interiors", "Maintenance corridors", "Visitor and staff areas"],
    decisionMakers: [
      { role: "Facilities Managers", desc: "Dependable execution that fits into shift schedules and facility calendars." },
      { role: "Operations Leaders", desc: "Repaint work that doesn't slow production or require facility shutdowns." },
      { role: "Safety Teams", desc: "Safety marking maintenance and surface programs that stay current." },
      { role: "Property / Asset Leaders", desc: "Predictable costs and consistent facility presentation for investors and clients." },
    ],
    pilotHeadline: "Define One Zone or Area. Prove the Execution.",
    outcomes: ["Zero operational shutdown required", "Safety markings maintained", "Reliable scheduling", "Professional crews", "Large-format execution capability", "Predictable costs", "Flexible scope model", "Scalable to multi-site"],
    finalCtaHeadline: "Start With a Defined Facility Scope. Expand From There.",
    finalCta: "Start With a Defined Facility Scope",
    calculatorUrl: "/subscription-lab?facility=industrial",
    icon: <Factory className="w-6 h-6" />,
  },
  {
    slug: "hospitality-repaint-support",
    label: "Hospitality",
    seoTitle: "Hospitality Repaint Support Austin | PAINTLAB",
    seoDesc: "PAINTLAB supports hotels, resorts, and hospitality properties with guest-facing repaint execution that fits around occupancy in Austin and Central Texas.",
    tag: "Hotels · Resorts · Extended Stay",
    heroHeadline: "Hospitality Repaint Support Built Around Guest Experience",
    heroSub: "PAINTLAB helps hotel operators and facilities teams maintain guest-facing spaces — rooms, corridors, lobbies, and amenities — with professional execution that fits around occupancy schedules.",
    primaryCta: "Start With a Guest-Facing Pilot Area",
    painPoints: [
      "Guest-facing wear impacts reviews and perception",
      "Rooms, corridors, and amenities need fast refreshes",
      "Maintenance teams are stretched thin",
      "Scheduling must work around occupancy",
      "Quality must match brand standards",
      "Small paint issues become noticeable to guests quickly",
    ],
    positioningDesc: "PAINTLAB partners with hospitality operators to deliver repaint execution that is scheduled around occupancy, matched to brand standards, and executed with the professionalism that guest-facing environments demand.",
    supportAreas: ["Guest corridors", "Room refreshes", "Lobbies and reception", "Amenity spaces", "Pool areas", "Restaurant and dining areas", "Exterior facades", "Back-of-house areas"],
    decisionMakers: [
      { role: "General Managers", desc: "Clean, on-schedule repaint execution without guest disruption." },
      { role: "Facilities Teams", desc: "Dependable vendor support for ongoing repaint maintenance programs." },
      { role: "Brand Standards Teams", desc: "Color-accurate, specification-driven workmanship across all areas." },
      { role: "Ownership / Asset Leaders", desc: "Predictable maintenance costs that protect long-term property value." },
    ],
    pilotHeadline: "Start With One Floor or Area. Prove the Execution.",
    outcomes: ["Guest-facing presentation protected", "Occupancy-sensitive scheduling", "Brand-accurate workmanship", "Responsive vendor communication", "Minimal disruption to operations", "Professional crews", "Predictable maintenance costs", "Scalable to full property"],
    finalCtaHeadline: "Start With One Guest-Facing Area. Expand the Program.",
    finalCta: "Start With a Guest-Facing Pilot Area",
    calculatorUrl: "/subscription-lab?facility=hospitality",
    icon: <Building className="w-6 h-6" />,
  },
  {
    slug: "restaurant-repaint-support",
    label: "Restaurants",
    seoTitle: "Restaurant Repaint Support Austin | PAINTLAB",
    seoDesc: "PAINTLAB delivers dependable restaurant repaint support for dining rooms, back-of-house areas, exteriors, and brand-critical surfaces across Austin and Central Texas.",
    tag: "Dining · Fast Casual · Multi-Location",
    heroHeadline: "Restaurant Repaint Support Built Around Brand, Cleanliness & Guest Experience",
    heroSub: "PAINTLAB helps restaurant operators refresh dining rooms, back-of-house areas, exteriors, and brand-critical surfaces — with after-hours scheduling that protects service operations.",
    primaryCta: "Start With a Restaurant Refresh Pilot",
    painPoints: [
      "Dining room wear impacts guest perception",
      "Repaint work must avoid service disruption",
      "Brand colors and presentation matter consistently",
      "Back-of-house areas take heavy abuse",
      "Small touch-ups become visible quickly in dining spaces",
      "Operators need dependable after-hours support",
    ],
    positioningDesc: "PAINTLAB supports restaurant operators and multi-unit teams with repaint execution that respects service schedules, matches brand standards, and delivers clean, professional results in dining environments.",
    supportAreas: ["Dining room walls", "Exterior facades", "Back-of-house areas", "Entry points", "Bar and service areas", "Restrooms", "Outdoor dining spaces", "Touch-up programs"],
    decisionMakers: [
      { role: "Restaurant Operators", desc: "After-hours execution that keeps service operations uninterrupted." },
      { role: "Facilities Teams", desc: "Dependable repaint vendor that understands restaurant scheduling constraints." },
      { role: "Brand & Marketing Teams", desc: "Color-accurate workmanship that protects brand visual standards." },
      { role: "Multi-Unit Owners", desc: "Consistent execution and predictable costs across multiple locations." },
    ],
    pilotHeadline: "Start With One Location. Prove the Execution Model.",
    outcomes: ["Zero service disruption", "After-hours scheduling", "Brand-accurate color work", "Clean dining environments", "Responsive communication", "Professional crews", "Predictable costs", "Scalable to multi-location"],
    finalCtaHeadline: "Start With One Restaurant. Expand to the Portfolio.",
    finalCta: "Start With a Restaurant Refresh Pilot",
    calculatorUrl: "/subscription-portal",
    icon: <Utensils className="w-6 h-6" />,
  },
  {
    slug: "senior-living-repaint-support",
    label: "Senior Living",
    seoTitle: "Senior Living Repaint Support Austin | PAINTLAB",
    seoDesc: "PAINTLAB delivers professional, low-disruption repaint support for senior living communities across Austin and Central Texas — with scheduling sensitivity and resident-focused execution.",
    tag: "Assisted Living · Memory Care · Independent",
    heroHeadline: "Senior Living Repaint Support With Clean, Professional Execution",
    heroSub: "PAINTLAB helps senior living operators maintain shared spaces, corridors, activity rooms, and dining areas with repaint execution that respects residents, protects cleanliness, and fits facility schedules.",
    primaryCta: "Start With a Low-Disruption Pilot Area",
    painPoints: [
      "Resident comfort must be protected at every stage",
      "Shared spaces need consistent upkeep to maintain quality",
      "Crews must be professional, respectful, and low-disruption",
      "Scheduling requires sensitivity to resident routines",
      "Maintenance teams often need supplemental repaint support",
      "Cleanliness and communication matter more than usual",
    ],
    positioningDesc: "PAINTLAB understands the standard required in senior living environments. We bring professional crews, clear scheduling, and clean execution to corridors, activity rooms, dining areas, and resident-facing spaces.",
    supportAreas: ["Resident corridors", "Dining areas", "Activity and common rooms", "Memory care wings", "Assisted living units", "Outdoor courtyards", "Entry lobbies", "Staff areas"],
    decisionMakers: [
      { role: "Executive Directors", desc: "Professional repaint execution that reflects the community's standard of care." },
      { role: "Facilities Managers", desc: "Dependable vendor support with scheduling built around resident life." },
      { role: "Ownership / REIT Leaders", desc: "Consistent presentation and predictable costs across portfolio properties." },
      { role: "Regional Managers", desc: "Standardized workmanship and reliable communication across communities." },
    ],
    pilotHeadline: "Start With One Low-Disruption Area. Prove the Standard.",
    outcomes: ["Resident-sensitive scheduling", "Professional crew conduct", "Clean execution with minimal odor", "Consistent workmanship", "Responsive vendor communication", "Predictable maintenance costs", "Low-disruption model", "Scalable to portfolio"],
    finalCtaHeadline: "Start With One Community Area. Expand From There.",
    finalCta: "Start With a Low-Disruption Pilot Area",
    calculatorUrl: "/subscription-lab?facility=senior-living",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    slug: "self-storage-repaint-support",
    label: "Self Storage",
    seoTitle: "Self Storage Repaint Support Austin | PAINTLAB",
    seoDesc: "PAINTLAB provides self storage repaint support for curb appeal, corridors, roll-up doors, offices, and customer-facing areas across Austin and Central Texas.",
    tag: "Climate-Controlled · Drive-Up · Multi-Site",
    heroHeadline: "Self Storage Repaint Support That Protects Curb Appeal",
    heroSub: "PAINTLAB helps self storage operators refresh roll-up doors, corridors, office areas, and exterior facades — with execution that keeps facilities looking professional and customer-ready.",
    primaryCta: "Start With One Facility Pilot",
    painPoints: [
      "Curb appeal directly influences customer trust and conversion",
      "Roll-up doors and corridors show wear from constant use",
      "Offices and customer areas need clean, professional presentation",
      "Facility teams need low-disruption repaint support",
      "Multi-site operators need consistent execution across locations",
      "Deferred repainting makes properties feel dated fast",
    ],
    positioningDesc: "PAINTLAB supports self storage operators with repaint execution designed for operational continuity — exterior refreshes, corridor programs, door repaints, and office area maintenance that keeps facilities looking sharp.",
    supportAreas: ["Exterior facades", "Roll-up doors", "Interior corridors", "Office and rental areas", "Elevator lobbies", "Customer restrooms", "Signage surrounds", "Gate and entry areas"],
    decisionMakers: [
      { role: "Facility Managers", desc: "Dependable repaint support that fits around facility operations and customer access." },
      { role: "Regional Operators", desc: "Consistent execution and predictable costs across multiple storage locations." },
      { role: "Ownership / Investment Leaders", desc: "Curb appeal maintenance that protects occupancy rates and asset value." },
      { role: "Operations Teams", desc: "Low-disruption scheduling that keeps the facility open and operational." },
    ],
    pilotHeadline: "Start With One Facility. Prove the Execution.",
    outcomes: ["Improved curb appeal", "Consistent corridor presentation", "Door and surface freshness", "Low-disruption scheduling", "Professional workmanship", "Responsive communication", "Predictable maintenance costs", "Scalable to multi-site"],
    finalCtaHeadline: "Start With One Storage Facility. Expand the Program.",
    finalCta: "Start With One Facility Pilot",
    calculatorUrl: "/subscription-lab?facility=self-storage",
    icon: <Package className="w-6 h-6" />,
  },
  {
    slug: "hoa-community-repaint-support",
    label: "HOA / Community Associations",
    seoTitle: "HOA & Community Repaint Support Austin | PAINTLAB",
    seoDesc: "PAINTLAB delivers HOA and community association repaint support for clubhouses, amenity centers, shared structures, and community assets across Austin and Central Texas.",
    tag: "HOA · Community Associations · Condos",
    heroHeadline: "HOA & Community Repaint Support for Shared Property Assets",
    heroSub: "PAINTLAB helps HOA boards, community managers, and property teams maintain clubhouses, amenity centers, gates, and shared structures with repaint execution that is easy to approve, budget, and deliver.",
    primaryCta: "Start With a Community Asset Review",
    painPoints: [
      "Board approvals require clear scopes and transparent pricing",
      "Community assets need consistent presentation to protect values",
      "Common areas wear over time and become deferred maintenance",
      "Vendor reliability directly affects resident satisfaction",
      "Managers need professional communication for board reporting",
      "Repaint projects must be easy to explain and approve",
    ],
    positioningDesc: "PAINTLAB provides HOA and community association teams with clearly scoped repaint proposals, professional execution, and the communication quality that board members and community managers expect.",
    supportAreas: ["Clubhouses", "Amenity centers", "Pool areas", "Mailbox areas", "Walking paths and structures", "Entry gates and signage", "Parking areas", "Shared building exteriors"],
    decisionMakers: [
      { role: "Community Managers", desc: "Dependable vendor with professional communication for board reporting." },
      { role: "HOA Board Members", desc: "Transparent scopes and pricing that are easy to present and approve." },
      { role: "Property Management Companies", desc: "Consistent execution across multiple communities under management." },
      { role: "Ownership / Asset Leaders", desc: "Predictable repaint costs that protect community asset value." },
    ],
    pilotHeadline: "Start With a Defined Community Asset. Prove the Execution.",
    outcomes: ["Board-ready scopes and pricing", "Professional workmanship", "Responsive communication", "Consistent community presentation", "Predictable costs", "Clean, low-disruption execution", "Easy to renew and expand", "Scalable to portfolio communities"],
    finalCtaHeadline: "Start With One Community Asset. Build From There.",
    finalCta: "Start With a Community Asset Review",
    calculatorUrl: "/subscription-lab?facility=hoa",
    icon: <Home className="w-6 h-6" />,
  },
  {
    slug: "education-facility-repaint-support",
    label: "Education / Schools",
    seoTitle: "Education Facility Repaint Support Austin | PAINTLAB",
    seoDesc: "PAINTLAB provides education facility repaint support for K-12 schools, universities, and campuses in Austin and Central Texas — scheduled around academic calendars.",
    tag: "K-12 · Universities · Daycare · Libraries",
    heroHeadline: "Education Facility Repaint Support Built Around Academic Schedules",
    heroSub: "PAINTLAB helps facilities teams at schools, universities, and education campuses refresh high-use interiors and exteriors during summer, winter break, and scheduled maintenance windows.",
    primaryCta: "Start With a Campus Scope Review",
    painPoints: [
      "All repaint work must fit around school schedules and academic calendars",
      "High-traffic areas like corridors and classrooms wear quickly",
      "Cleanliness and crew professionalism are non-negotiable",
      "Summer and break windows require reliable, fast execution",
      "Facility teams often need supplemental repaint support",
      "Repaint projects need clear planning and scoping in advance",
    ],
    positioningDesc: "PAINTLAB helps education facilities plan, scope, and execute repaint programs around academic calendars. We work fast in summer and break windows, maintain the professionalism campuses require, and deliver clean results in high-use environments.",
    supportAreas: ["Classrooms", "Corridors", "Gymnasiums", "Cafeterias", "Administrative offices", "Exterior facades", "Athletic facilities", "Library and common areas"],
    decisionMakers: [
      { role: "Facilities Directors", desc: "Dependable execution that fits school schedules and delivers results on time." },
      { role: "Operations Teams", desc: "Clear scoping and planning that works around the academic calendar." },
      { role: "Administration Leaders", desc: "Professional workmanship that reflects the campus standard." },
      { role: "District Facilities Managers", desc: "Consistent execution and predictable costs across multiple campuses." },
    ],
    pilotHeadline: "Start With One Building or Area. Prove the Execution Window.",
    outcomes: ["Calendar-aligned execution", "Fast completion in break windows", "Professional crew conduct", "High-traffic surface durability", "Consistent workmanship", "Responsive communication", "Predictable costs", "Scalable to full campus"],
    finalCtaHeadline: "Start With a Summer or Break Window Pilot.",
    finalCta: "Start With a Campus Scope Review",
    calculatorUrl: "/subscription-lab?facility=education",
    icon: <GraduationCap className="w-6 h-6" />,
  },
  {
    slug: "healthcare-facility-repaint-support",
    label: "Healthcare",
    seoTitle: "Healthcare Facility Repaint Support Austin | PAINTLAB",
    seoDesc: "PAINTLAB provides professional, low-disruption repaint support for clinics, hospitals, and healthcare facilities in Austin and Central Texas.",
    tag: "Clinics · Hospitals · Dental · Senior Care",
    heroHeadline: "Healthcare Facility Repaint Support for Professional, Patient-Facing Environments",
    heroSub: "PAINTLAB helps healthcare facilities maintain clean, professional presentation in patient-facing and staff-facing areas — with scheduling that minimizes disruption and crews that meet the healthcare standard.",
    primaryCta: "Start With a Low-Disruption Pilot Scope",
    painPoints: [
      "Patient-facing spaces must look clean and cared for at all times",
      "Scheduling must minimize disruption to patient flow",
      "Crews must be professional, respectful, and healthcare-appropriate",
      "High-use areas show wear quickly in active clinical environments",
      "Facility teams need dependable, responsive support",
      "Presentation quality directly affects patient confidence",
    ],
    positioningDesc: "PAINTLAB supports healthcare facilities with repaint execution designed around patient environments — low-odor finishes, off-hours scheduling, professional crew conduct, and clean results in clinical and administrative spaces.",
    supportAreas: ["Patient corridors", "Waiting areas", "Exam rooms", "Administrative offices", "Staff areas", "Exterior facades", "Elevator lobbies", "Restroom areas"],
    decisionMakers: [
      { role: "Facilities Directors", desc: "Dependable repaint support with scheduling built around patient operations." },
      { role: "Operations Teams", desc: "Zero-disruption execution that protects clinical workflow." },
      { role: "Administration Leaders", desc: "Professional presentation that reflects the healthcare organization's standard." },
      { role: "Property / Asset Managers", desc: "Predictable maintenance costs across facility portfolios." },
    ],
    pilotHeadline: "Start With a Low-Disruption Scope. Prove the Standard.",
    outcomes: ["Patient-sensitive scheduling", "Low-odor, healthcare-appropriate finishes", "Professional crew conduct", "Zero workflow disruption", "Clean, consistent workmanship", "Responsive communication", "Predictable costs", "Scalable to full facility"],
    finalCtaHeadline: "Start With a Low-Disruption Pilot Scope.",
    finalCta: "Start With a Low-Disruption Pilot Scope",
    calculatorUrl: "/subscription-lab?facility=healthcare",
    icon: <Activity className="w-6 h-6" />,
  },
];

// Hero photos keyed by facility slug
const DETAIL_HERO_IMAGES: Record<string, string> = {
  "multifamily-repaint-pilot":           "/images/facilities/multifamily.jpg",
  "office-cre-repaint-support":          "/images/facilities/office-corporate.jpg",
  "retail-repaint-support":              "/images/facilities/retail.jpg",
  "industrial-warehouse-repaint-support":"/images/facilities/industrial.jpg",
  "hospitality-repaint-support":         "/images/facilities/hospitality.jpg",
  "restaurant-repaint-support":          "/images/facilities/restaurant.jpg",
  "senior-living-repaint-support":       "/images/facilities/senior-living.jpg",
  "self-storage-repaint-support":        "/images/facilities/self-storage.jpg",
  "hoa-community-repaint-support":       "/images/facilities/hoa.jpg",
  "education-facility-repaint-support":  "/images/facilities/education.jpg",
  "healthcare-facility-repaint-support": "/images/facilities/medical-healthcare.jpg",
};

export default function FacilitySolutionsDetail() {
  const params = useParams<{ slug: string }>();
  const config = CONFIGS.find((c) => c.slug === params.slug);
  const detailHeroImage = config ? (DETAIL_HERO_IMAGES[config.slug] ?? null) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (config) {
      document.title = config.seoTitle;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", config.seoDesc);
    }
  }, [config]);

  if (!config) {
    return (
      <div className="bg-background text-foreground min-h-screen">
        <Navbar />
        <div className="pt-40 pb-24 container mx-auto px-6 md:px-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Facility type not found.</h1>
          <Link href="/facility-solutions" className="text-primary hover:underline">← Back to Facility Solutions</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-40 pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

        <div className="relative container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16 xl:gap-24">

            {/* Text column */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="flex-1 min-w-0">
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-2">
                <Link href="/facility-solutions" className="text-muted-foreground text-xs font-mono uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
                  ← Facility Solutions
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6 mt-4">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-primary font-mono text-xs tracking-widest uppercase">{config.tag}</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl md:text-[3.25rem] font-black tracking-tighter leading-tight mb-6"
              >
                {config.heroHeadline}
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mb-10"
              >
                {config.heroSub}
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#pain-points"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors"
                >
                  Scroll Down for Details
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="mailto:hello@paintlabpro.com?subject=Pilot%20Conversation%20Request"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-border text-foreground font-semibold uppercase tracking-wider text-sm hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                >
                  Request a Pilot Conversation
                  <ChevronRight className="w-4 h-4" />
                </a>
              </motion.div>
            </motion.div>

            {/* Facility photo — right column, desktop only */}
            {detailHeroImage && (
              <motion.div
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.3 }}
                className="hidden lg:block flex-shrink-0 w-[400px] xl:w-[480px] mt-10 lg:mt-0"
              >
                <div className="relative h-[320px] xl:h-[380px] overflow-hidden border border-border/20">
                  <img
                    src={detailHeroImage}
                    alt={config.label}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center gap-2">
                    <div className="h-[1px] flex-1 bg-primary/30" />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-foreground/40">{config.label}</span>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ──────────────────────────────────────────────────── */}
      <section id="pain-points" className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">The Challenge</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
              What Gets in the Way of<br />
              <span className="text-primary">Reliable Repaint Execution</span>
            </motion.h2>

            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
              {config.painPoints.map((point) => (
                <motion.div key={point} variants={fadeInUp} className="bg-card p-6 flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{point}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PAINTLAB POSITIONING ─────────────────────────────────────────── */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-4">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-primary font-mono text-xs tracking-widest uppercase">The PAINTLAB Approach</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-black tracking-tighter mb-6">
                A Repaint Partner<br />
                <span className="text-primary">Built for Operators</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-base leading-relaxed mb-8">
                {config.positioningDesc}
              </motion.p>

              <motion.div variants={stagger} className="space-y-4">
                {[
                  { icon: <Target className="w-4 h-4" />, title: "Predictable Budgeting", desc: "Fixed-scope pricing with no surprises at closeout. PAINTLAB helps operators plan and stabilize repaint budgets across recurring maintenance and one-off projects." },
                  { icon: <Repeat2 className="w-4 h-4" />, title: "Proactive Maintenance Planning", desc: "We help teams move from reactive repaint cycles to structured maintenance programs — reducing emergency spend and keeping properties consistently presentation-ready." },
                  { icon: <Shield className="w-4 h-4" />, title: "Low-Risk Pilot Model", desc: "Start on one property or area before committing to a broader program or portfolio relationship. Prove value first, then scale." },
                ].map((item) => (
                  <motion.div key={item.title} variants={fadeInUp} className="flex items-start gap-4 p-4 border border-border bg-card">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-1">{item.title}</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
                <div className="h-[1px] w-10 bg-border" />
                <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">Areas We Support</span>
              </motion.div>
              <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
                {config.supportAreas.map((area) => (
                  <motion.div key={area} variants={fadeInUp} className="bg-card p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{area}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PILOT MODULE ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">The Pilot Path</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
              {config.pilotHeadline}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-base mb-10 max-w-2xl">
              The pilot model is designed for operational leaders who want to validate a repaint partner before committing a full portfolio or program. One site. Real scope. Proven execution.
            </motion.p>

            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-10">
              {config.decisionMakers.map((dm) => (
                <motion.div key={dm.role} variants={fadeInUp} className="bg-card p-6">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm mb-2 tracking-tight">{dm.role}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{dm.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <a
                href="mailto:hello@paintlabpro.com?subject=Pilot%20Interest%20-%20PAINTLAB"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors"
              >
                Explore a Pilot
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── OUTCOMES ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">What You Get</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
              Outcomes That Matter<br />
              <span className="text-primary">to Operations Leaders</span>
            </motion.h2>

            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
              {config.outcomes.map((outcome) => (
                <motion.div key={outcome} variants={fadeInUp} className="bg-card p-6 flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-foreground">{outcome}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CALCULATOR CTA (SECONDARY) ───────────────────────────────────── */}
      <section className="py-14 bg-card border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-2xl"
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-8 bg-border" />
              <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">Optional Planning Tool</span>
            </motion.div>
            <motion.h3 variants={fadeInUp} className="text-xl font-bold tracking-tight mb-2">
              Want to Preview Maintenance Plan Scenarios?
            </motion.h3>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-sm leading-relaxed mb-5">
              If your team wants to explore how recurring repaint support could be structured, use the PAINTLAB planning calculator for this facility type before starting a pilot conversation.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <a
                href={config.calculatorUrl}
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
              >
                Build Your Repaint Plan
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-3 mb-6">
              <div className="h-[1px] w-10 bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">Next Step</span>
              <div className="h-[1px] w-10 bg-primary" />
            </motion.div>

            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-6 max-w-3xl mx-auto">
              {config.finalCtaHeadline}
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
              No commitment required. We'll define the scope, walk the property, and show you what a professional repaint program looks like before you decide anything.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex justify-center">
              <a
                href="mailto:hello@paintlabpro.com?subject=Pilot%20Interest%20-%20PAINTLAB"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background font-bold uppercase tracking-wider text-xs hover:bg-primary/90 transition-colors"
              >
                Email Our Team
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-muted-foreground text-sm mt-8">
              Or call/text us directly:{" "}
              <a href="tel:+15124843124" className="text-primary hover:underline font-semibold">(512) 484-3124</a>
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
