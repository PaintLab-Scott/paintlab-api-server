import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/" || location === "";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const prefix = isHome ? "" : "/";

  const navLinks = [
    { name: "Services", href: `${prefix}#services` },
    { name: "Subscriptions", href: "/subscription-portal", isRoute: true },
    { name: "Sectors", href: `${prefix}#sectors` },
    { name: "Approach", href: `${prefix}#approach` },
    { name: "About", href: `${prefix}#about` },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${
        isScrolled ? "bg-background/95 backdrop-blur-md border-border py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/images/pl-logo.png" alt="PaintLab" className="h-14 w-auto object-contain" style={{ mixBlendMode: "lighten" }} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            )
          )}
          <Button asChild className="rounded-none bg-primary text-background hover:bg-primary/90 font-semibold uppercase tracking-wider text-xs px-6 py-5">
            <a href="mailto:hello@paintlabpro.com?subject=PaintLab%20Quote%20Request">Get a Quote</a>
          </Button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg p-6 flex flex-col gap-4">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            )
          )}
          <Button asChild className="rounded-none mt-4 bg-primary text-background w-full py-6">
            <a href="mailto:hello@paintlabpro.com?subject=PaintLab%20Quote%20Request" onClick={() => setMobileMenuOpen(false)}>Get a Quote</a>
          </Button>
        </div>
      )}
    </header>
  );
}
