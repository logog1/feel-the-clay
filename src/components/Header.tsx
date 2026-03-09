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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 border-b-[3px] border-foreground ${isScrolled ? "bg-foreground" : "bg-foreground/90"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection("#hero"); }} className="flex items-center group">
            <img src={logo} alt="Terraria Logo" className="h-10 w-10 object-cover border-2 border-primary-foreground group-hover:border-cta transition-colors" />
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href, link.isRoute); }}
                className={`mono-label px-4 py-2 transition-colors border-2 ${
                  isActive(link)
                    ? "text-foreground bg-primary-foreground border-primary-foreground"
                    : "text-primary-foreground/70 border-transparent hover:text-primary-foreground hover:border-primary-foreground/30"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/store"
              onClick={(e) => { e.preventDefault(); navigate("/store"); }}
              className="mono-label flex items-center gap-2 px-4 py-2 text-primary-foreground/70 border-2 border-transparent hover:border-primary-foreground/30 hover:text-primary-foreground transition-colors"
            >
              <ShoppingBag size={14} />
              {t("nav.store")}
            </a>
            <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection("#booking"); }} className="mono-label bg-cta text-primary-foreground px-6 py-2 border-2 border-cta hover:bg-cta-hover hover:border-cta-hover transition-colors ml-2">
              {t("nav.book")}
            </a>
          </nav>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-primary-foreground p-2" aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu — brutalist */}
        <div className={`md:hidden overflow-hidden transition-all duration-200 ${mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
          <nav className="py-4 border-t-2 border-primary-foreground/20">
            <div className="flex flex-col gap-0">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href, link.isRoute); }}
                  className={`mono-label py-4 px-4 border-b border-primary-foreground/10 transition-colors ${
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
                className="mono-label flex items-center gap-3 py-4 px-4 text-primary-foreground/70 border-b border-primary-foreground/10 hover:text-primary-foreground"
              >
                <ShoppingBag size={16} />
                {t("nav.store")}
              </a>
              <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection("#booking"); }} className="mono-label bg-cta text-primary-foreground px-5 py-4 text-center mt-3 border-2 border-cta hover:bg-cta-hover transition-colors">
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
