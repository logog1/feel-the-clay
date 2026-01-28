import workshop2 from "@/assets/workshop-2.jpg";
import workshop7 from "@/assets/workshop-7.jpg";
import workshopTools from "@/assets/workshop-tools.jpg";

const ImageShowcase = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="container-narrow">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="aspect-square rounded-2xl overflow-hidden">
            <img 
              src={workshop2} 
              alt="Pottery workshop in action" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden">
            <img 
              src={workshopTools} 
              alt="Traditional pottery tools" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden">
            <img 
              src={workshop7} 
              alt="Handmade pottery creations" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageShowcase;
