import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();

  const scrollToSection = (href: string) => {
    if (window.location.pathname !== "/") {
      window.location.href = `/${href}`;
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="py-10 px-5 border-t border-border/30">
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
            <h3 className="font-medium text-foreground text-xs uppercase tracking-wider mb-3">Location</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">Tétouan, Morocco</p>
            <a href="https://www.instagram.com/terraria.workshops" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-cta transition-colors">
              Instagram
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
};

export default Footer;
