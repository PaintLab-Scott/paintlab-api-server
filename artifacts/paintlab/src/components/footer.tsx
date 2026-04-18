import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-1.5 mb-4">
              <img src="/images/pl-icon.png" alt="PaintLab icon" className="w-14 h-14 object-contain" />
              <span className="text-primary font-black">PAINTLAB</span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6 text-sm leading-relaxed">
              Where commercial painting stops being a risk and becomes a controlled, high-performance outcome. Precision engineering meets professional trades.
            </p>
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-sm bg-secondary text-secondary-foreground text-xs font-semibold tracking-wider border border-border">
              AUSTIN, TX
            </div>
          </div>
          
          <div>
            <h4 className="text-foreground font-semibold mb-6 uppercase tracking-wider text-xs">Navigation</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors text-sm">About Us</a></li>
              <li><a href="#services" className="text-muted-foreground hover:text-primary transition-colors text-sm">Services</a></li>
              <li><a href="#sectors" className="text-muted-foreground hover:text-primary transition-colors text-sm">Sectors</a></li>
              <li><a href="#approach" className="text-muted-foreground hover:text-primary transition-colors text-sm">Our Approach</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-foreground font-semibold mb-6 uppercase tracking-wider text-xs">Contact</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li>1-800-PAINTLAB</li>
              <li>info@paintlab.com</li>
              <li>Austin, Texas</li>
              <li className="mt-4"><a href="#quote" className="text-primary font-semibold hover:underline">Request a Quote →</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PaintLab Commercial Systems. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
