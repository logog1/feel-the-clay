import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLanguage } from "@/i18n/LanguageContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { label: t("nav.home"), href: "#hero" },
    { label: t("nav.about"), href: "/about", isRoute: true },
    { label: t("nav.workshops"), href: "#offers" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;
    const sectionIds = ["hero", "offers", "contact"];
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(`#${id}`); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [location.pathname]);

  const isActive = (link: { href: string; isRoute?: boolean }) => {
    if (link.isRoute) return location.pathname === link.href;
    if (location.pathname !== "/") return false;
    return activeSection === link.href;
  };

  const scrollToSection = (href: string, isRoute?: boolean) => {
    setMobileMenuOpen(false);
    if (isRoute) { navigate(href); return; }
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => { document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }); }, 300);
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-foreground/95 backdrop-blur-md shadow-lg" : "bg-foreground/80 backdrop-blur-sm"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection("#hero"); }} className="flex items-center group">
            <img src={logo} alt="Terraria Logo" className="h-10 w-10 object-cover rounded-full ring-2 ring-primary-foreground/30 group-hover:ring-cta transition-all duration-300 group-hover:scale-110" />
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href, link.isRoute); }}
                className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-lg ${
                  isActive(link)
                    ? "text-cta"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                {link.label}
                {isActive(link) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-cta rounded-full" />
                )}
              </a>
            ))}
            <a
              href="/store"
              onClick={(e) => { e.preventDefault(); navigate("/store"); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-all duration-300 rounded-lg"
            >
              <ShoppingBag size={14} />
              {t("nav.store")}
            </a>
            <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection("#booking"); }} className="btn-ripple bg-cta text-primary-foreground px-6 py-2 rounded-lg text-sm font-semibold hover:bg-cta-hover hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ml-2">
              {t("nav.book")}
            </a>
          </nav>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-primary-foreground p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors" aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
          <nav className="py-4 border-t border-primary-foreground/10">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href, link.isRoute); }}
                  className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(link)
                      ? "text-cta bg-primary-foreground/5"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/store"
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate("/store"); }}
                className="flex items-center gap-3 py-3 px-4 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground rounded-lg"
              >
                <ShoppingBag size={16} />
                {t("nav.store")}
              </a>
              <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection("#booking"); }} className="btn-ripple bg-cta text-primary-foreground px-5 py-3 text-center rounded-lg text-sm font-semibold mt-2 hover:bg-cta-hover transition-all duration-300">
                {t("nav.book")}
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
