import { forwardRef } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { Mail, Instagram } from "lucide-react";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { t } = useLanguage();

  const scrollToSection = (href: string) => {
    if (window.location.pathname !== "/") {
      window.location.href = `/${href}`;
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer ref={ref} className="py-10 px-5 border-t border-border/30">
      <div className="max-w-5xl mx-auto">
        {/* Links grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium text-foreground text-xs uppercase tracking-wider mb-3">Navigate</h3>
            <a href="/" className="block text-muted-foreground hover:text-cta transition-colors">Home</a>
            <button onClick={() => scrollToSection("#offers")} className="block text-muted-foreground hover:text-cta transition-colors text-left">
              Workshops
            </button>
            <Link to="/store" className="block text-muted-foreground hover:text-cta transition-colors">Products</Link>
            <Link to="/blog" className="block text-muted-foreground hover:text-cta transition-colors">Blog</Link>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-foreground text-xs uppercase tracking-wider mb-3">Contact</h3>
            <a href="mailto:hello@terrariaworkshops.com" className="flex items-center gap-1.5 text-muted-foreground hover:text-cta transition-colors">
              <Mail size={12} /> Email
            </a>
            <a href="https://wa.me/message/SBUBJACPVCNGM1" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-cta transition-colors">
              WhatsApp
            </a>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-foreground text-xs uppercase tracking-wider mb-3">Legal</h3>
            <Link to="/legal" className="block text-muted-foreground hover:text-cta transition-colors">Legal Notice</Link>
            <Link to="/privacy" className="block text-muted-foreground hover:text-cta transition-colors">Privacy Policy</Link>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-foreground text-xs uppercase tracking-wider mb-3">Follow us</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">Tétouan, Morocco</p>
            <a
              href="https://www.instagram.com/terraria_workshops"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:scale-105 hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
            >
              <Instagram size={14} />
              @terraria_workshops
            </a>
            <a
              href="https://www.tiktok.com/@terraria_workshops"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-foreground/90 transition-all hover:scale-105 hover:shadow-md"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17v-3.45a4.85 4.85 0 01-4.85-1.56V6.69h4.85z"/>
              </svg>
              @terraria_workshops
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground">{t("footer.text")}</p>
        </div>
      </div>
    </footer>
  );
});
Footer.displayName = "Footer";

export default Footer;
