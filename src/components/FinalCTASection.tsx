import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const FinalCTASection = () => {
  const { t } = useLanguage();
  return (
    <section id="cta" className="py-20 md:py-28 bg-sand-dark/30">
      <div className="container-narrow text-center">
        <div className="space-y-8">
          <h2 className="text-xl md:text-2xl font-light">{t("cta.title")}</h2>
          <div className="pt-2">
            <Button variant="cta" size="xl" asChild>
              <a href="#booking" onClick={(e) => { e.preventDefault(); document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" }); }}>{t("cta.reserve")}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
