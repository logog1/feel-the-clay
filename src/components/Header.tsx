import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
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
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.workshops"), href: "#offers" },
    { label: t("nav.store"), href: "/store", isRoute: true },
    { label: t("nav.contact"), href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;
    const sectionIds = ["hero", "about", "offers", "contact"];
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-foreground/95 backdrop-blur-xl shadow-2xl shadow-foreground/10" : "bg-foreground/70 backdrop-blur-sm"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection("#hero"); }} className="flex items-center group">
            <img src={logo} alt="Terraria Logo" className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-cta/50 transition-all duration-300" />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href, (link as any).isRoute); }}
                className={`relative text-sm font-medium transition-colors pb-1.5 ${
                  isActive(link) ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
                {/* Animated underline - grows from left to right */}
                <span className={`absolute bottom-0 left-0 right-0 h-[2px] bg-cta rounded-full transition-transform duration-500 ease-out origin-left ${
                  isActive(link) ? "scale-x-100" : "scale-x-0"
                }`} />
              </a>
            ))}
            <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection("#booking"); }} className="bg-cta hover:bg-cta-hover text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-cta/30 hover:shadow-xl hover:shadow-cta/40 hover:scale-105 active:scale-95">
              {t("nav.book")}
            </a>
          </nav>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2 active:scale-90 transition-transform" aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {/* Mobile menu with slide animation */}
        <div className={`md:hidden overflow-hidden transition-all duration-400 ease-out ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <nav className="py-4 border-t border-white/10">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href, (link as any).isRoute); }}
                  className={`text-sm font-medium py-3 px-4 rounded-xl transition-all duration-300 ${
                    isActive(link)
                      ? "text-white bg-white/10 border-l-2 border-cta"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection("#booking"); }} className="bg-cta hover:bg-cta-hover text-white px-5 py-3 rounded-full text-sm font-bold transition-colors text-center mt-3 shadow-lg active:scale-95 transition-transform">
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
