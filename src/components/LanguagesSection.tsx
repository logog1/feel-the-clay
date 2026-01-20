import { Globe } from "lucide-react";

const LanguagesSection = () => {
  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="flex items-center justify-center gap-4 text-foreground/80">
          <Globe className="w-5 h-5 text-cta" />
          <p className="text-lg">
            We speak <span className="font-medium">Arabic</span> and <span className="font-medium">English</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LanguagesSection;
