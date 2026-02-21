import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="py-8 px-5 text-center border-t border-border/30 space-y-2">
      <p className="text-xs text-muted-foreground">{t("footer.text")}</p>
      <Link to="/privacy" className="text-xs text-muted-foreground/60 hover:text-cta transition-colors">
        Privacy Policy
      </Link>
    </footer>
  );
};

export default Footer;
