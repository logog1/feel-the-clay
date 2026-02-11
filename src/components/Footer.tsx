import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="py-6 px-6 text-center text-xs text-muted-foreground">
      <p>{t("footer.text")}</p>
    </footer>
  );
};

export default Footer;
