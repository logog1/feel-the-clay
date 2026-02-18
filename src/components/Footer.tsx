import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="py-8 px-5 text-center border-t border-border/30">
      <p className="text-xs text-muted-foreground">{t("footer.text")}</p>
    </footer>
  );
};

export default Footer;
