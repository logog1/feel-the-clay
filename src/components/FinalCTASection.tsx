import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";

const FinalCTASection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBooking = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="cta" className="py-20 md:py-28 bg-sand-dark/30">
      <div className="container-narrow text-center">
        <div className="space-y-8">
          <h2 className="text-xl md:text-2xl font-light">{t("cta.title")}</h2>
          <div className="pt-2">
            <Button variant="cta" size="xl" onClick={handleBooking}>
              {t("cta.reserve")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
