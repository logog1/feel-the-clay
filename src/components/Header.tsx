import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLanguage } from "@/i18n/LanguageContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { label: t("nav.home"), href: "#hero" },
    { label: t("nav.experience"), href: "#experience" },
    { label: t("nav.gallery"), href: "#gallery" },
    { label: t("nav.store"), href: "/store", isRoute: true },
    { label: t("nav.contact"), href: "#location" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-terracotta/80 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection("#hero"); }} className="flex items-center">
            <img src={logo} alt="Terraria Logo" className="h-10 w-10 rounded-full object-cover" />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); scrollToSection(link.href, (link as any).isRoute); }} className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {link.label}
              </a>
            ))}
            <a href="#cta" onClick={(e) => { e.preventDefault(); scrollToSection("#cta"); }} className="bg-cta hover:bg-cta/90 text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors">
              {t("nav.reserve")}
            </a>
          </nav>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2" aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); scrollToSection(link.href, (link as any).isRoute); }} className="text-white/80 hover:text-white transition-colors text-sm font-medium py-2">
                  {link.label}
                </a>
              ))}
              <a href="#cta" onClick={(e) => { e.preventDefault(); scrollToSection("#cta"); }} className="bg-cta hover:bg-cta/90 text-white px-5 py-3 rounded-md text-sm font-semibold transition-colors text-center mt-2">
                {t("nav.reserve")}
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
