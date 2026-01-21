import workshop1 from "@/assets/workshop-1.jpg";
import workshop3 from "@/assets/workshop-3.jpg";
import workshop4 from "@/assets/workshop-4.jpg";
import workshop5 from "@/assets/workshop-5.jpg";
import workshop6 from "@/assets/workshop-6.jpg";
import workshop8 from "@/assets/workshop-8.jpg";

const images = [
  { src: workshop1, alt: "Workshop participant shaping clay" },
  { src: workshop3, alt: "Group pottery session" },
  { src: workshop4, alt: "Creating pottery together" },
  { src: workshop5, alt: "Handbuilding clay pieces" },
  { src: workshop6, alt: "Coil building technique" },
  { src: workshop8, alt: "Happy workshop participants" },
];

const GallerySection = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-narrow">
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-medium text-center">
            Moments
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {images.map((image, index) => (
              <div 
                key={index}
                className="aspect-square overflow-hidden rounded-xl bg-sand-dark/20"
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
