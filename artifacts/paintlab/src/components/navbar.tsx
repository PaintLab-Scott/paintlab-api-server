import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { SignInButton, SignUpButton, useUser, useClerk } from "@clerk/react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/" || location === "";
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();

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
    { name: "About", href: "/about", isRoute: true },
  ];

  const initials = isSignedIn && user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim() || user.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "?"
    : "";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${
        isScrolled ? "bg-background/95 backdrop-blur-md border-border py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center">
          <img src="/images/pl-logo.png" alt="PaintLab" className="h-9 w-auto object-contain" style={{ mixBlendMode: "lighten" }} />
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

          {/* Auth section */}
          {isLoaded && (
            isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/member-portal" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-black">
                    {initials}
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider">My Portal</span>
                </Link>
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Sign In
                  </button>
                </SignInButton>
                <Button asChild className="rounded-none bg-primary text-background hover:bg-primary/90 font-semibold uppercase tracking-wider text-xs px-6 py-5">
                  <a href="/#quote">Get a Quote</a>
                </Button>
              </div>
            )
          )}
          {!isLoaded && (
            <Button asChild className="rounded-none bg-primary text-background hover:bg-primary/90 font-semibold uppercase tracking-wider text-xs px-6 py-5">
              <a href="/#quote">Get a Quote</a>
            </Button>
          )}
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

          {isLoaded && isSignedIn ? (
            <>
              <Link
                href="/member-portal"
                className="flex items-center gap-3 text-lg font-medium text-foreground py-2 border-b border-border/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-black">
                  {initials}
                </div>
                My Portal
              </Link>
              <button
                onClick={() => { signOut({ redirectUrl: "/" }); setMobileMenuOpen(false); }}
                className="text-left text-sm text-muted-foreground py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              {isLoaded && (
                <SignInButton mode="modal">
                  <button className="text-left text-lg font-medium text-foreground py-2 border-b border-border/50 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <User className="w-4 h-4" />
                    Sign In / Create Account
                  </button>
                </SignInButton>
              )}
            </>
          )}

          <Button asChild className="rounded-none mt-4 bg-primary text-background w-full py-6">
            <a href="/#quote" onClick={() => setMobileMenuOpen(false)}>Get a Quote</a>
          </Button>
        </div>
      )}
    </header>
  );
}
